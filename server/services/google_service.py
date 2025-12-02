import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/script.projects'
]

class GoogleService:
    def __init__(self):
        self.creds = None
        self._authenticate()
        
    def _authenticate(self):
        creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if not creds_path or not os.path.exists(creds_path):
            raise Exception("Credentials file not found. Please check GOOGLE_APPLICATION_CREDENTIALS in .env")
            
        self.creds = service_account.Credentials.from_service_account_file(
            creds_path, scopes=SCOPES
        )

    def get_sheets_service(self):
        return build('sheets', 'v4', credentials=self.creds)

    def get_drive_service(self):
        return build('drive', 'v3', credentials=self.creds)

    def get_script_service(self):
        return build('script', 'v1', credentials=self.creds)

    def get_spreadsheet_metadata(self, spreadsheet_id: str):
        """
        Fetches the title and sheet names/ids from a spreadsheet.
        This is used to render the 'Smart Overlay'.
        """
        service = self.get_sheets_service()
        spreadsheet = service.spreadsheets().get(spreadsheetId=spreadsheet_id).execute()
        
        sheets = []
        for sheet in spreadsheet.get('sheets', []):
            props = sheet['properties']
            
            # Get headers for the first row (A1:Z1) to show as chips
            sheet_id = props['sheetId']
            sheet_title = props['title']
            
            # Optimization: Only fetch headers for the first sheet or on demand
            # For now, let's just return basic metadata
            sheets.append({
                'id': sheet_id,
                'title': sheet_title,
                'index': props['index']
            })
            
        return {
            'id': spreadsheet['spreadsheetId'],
            'title': spreadsheet['properties']['title'],
            'sheets': sheets
        }

    def get_sheet_headers(self, spreadsheet_id: str, sheet_name: str):
        """
        Fetches the first row of a specific sheet to display as column chips.
        """
        service = self.get_sheets_service()
        range_name = f"'{sheet_name}'!A1:Z1"
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id, range=range_name
        ).execute()
        
        headers = result.get('values', [])
        if not headers:
            return []
            
        # Format as list of objects with letter index (A, B, C...)
        formatted_headers = []
        for idx, header in enumerate(headers[0]):
            letter = self._get_column_letter(idx + 1)
            formatted_headers.append({
                'id': f"col-{letter}",
                'name': header,
                'letter': letter,
                'index': idx
            })
            
        return formatted_headers

    def _get_column_letter(self, n):
        string = ""
        while n > 0:
            n, remainder = divmod(n - 1, 26)
            string = chr(65 + remainder) + string
        return string

    def update_script_content(self, script_id: str, code: str):
        """
        Updates the content of a Google Apps Script project.
        Equivalent to 'clasp push'.
        """
        service = self.get_script_service()

        # 1. Get current content to preserve manifest
        current_content = service.projects().getContent(scriptId=script_id).execute()
        files = current_content.get('files', [])

        # 2. Find manifest (appsscript.json)
        manifest = next((f for f in files if f['name'] == 'appsscript'), None)

        # 3. Prepare new file list
        new_files = []
        if manifest:
            new_files.append(manifest)
        else:
            # Default manifest if missing
            new_files.append({
                'name': 'appsscript',
                'type': 'JSON',
                'source': '{"timeZone":"Etc/GMT","dependencies":{},"exceptionLogging":"STACKDRIVER","runtimeVersion":"V8"}'
            })

        # 4. Add our new code file
        new_files.append({
            'name': 'Code',
            'type': 'SERVER_JS',
            'source': code
        })

        # 5. Update project
        request = {'files': new_files}
        service.projects().updateContent(scriptId=script_id, body=request).execute()
        return True


# Создание синглтона для импорта в других модулях
google_service = GoogleService()
