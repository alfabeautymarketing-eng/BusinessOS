import os
from google.oauth2 import service_account
from googleapiclient.discovery import build
from dotenv import load_dotenv

load_dotenv()

SCOPES = [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/script.projects',
    'https://www.googleapis.com/auth/script.external_request',
    'https://www.googleapis.com/auth/script.scriptapp',
    'https://www.googleapis.com/auth/script.container.ui',
    'https://www.googleapis.com/auth/script.storage',
    'https://www.googleapis.com/auth/documents',
    'https://www.googleapis.com/auth/userinfo.email'
]

class GoogleService:
    def __init__(self):
        self.creds = None
        self._initialized = False

    def _authenticate(self):
        if self._initialized:
            return

        creds_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if not creds_path:
            print("WARNING: GOOGLE_APPLICATION_CREDENTIALS not set. Google Services will be unavailable.")
            return

        if not os.path.exists(creds_path):
            print(f"WARNING: Credentials file not found at {creds_path}. Google Services will be unavailable.")
            return

        try:
            self.creds = service_account.Credentials.from_service_account_file(
                creds_path, scopes=SCOPES
            )
            self._initialized = True
            print("✅ Google Services initialized successfully")
        except Exception as e:
            print(f"WARNING: Failed to initialize Google Services: {e}")

    def _ensure_authenticated(self):
        if not self._initialized:
            self._authenticate()
        if not self._initialized:
            raise Exception("Google Services are not available. Please configure GOOGLE_APPLICATION_CREDENTIALS.")

    def get_sheets_service(self):
        self._ensure_authenticated()
        return build('sheets', 'v4', credentials=self.creds)

    def get_drive_service(self):
        self._ensure_authenticated()
        return build('drive', 'v3', credentials=self.creds)

    def get_script_service(self):
        self._ensure_authenticated()
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


    def append_row(self, spreadsheet_id: str, range_name: str, values: list):
        """
        Appends a row of values to the specified sheet.
        """
        service = self.get_sheets_service()
        body = {
            'values': [values]
        }
        result = service.spreadsheets().values().append(
            spreadsheetId=spreadsheet_id, range=range_name,
            valueInputOption='USER_ENTERED', body=body
        ).execute()
        return result

    def update_cell(self, spreadsheet_id: str, range_name: str, value):
        """
        Updates a specific cell or range with a value.
        """
        service = self.get_sheets_service()
        body = {
            'values': [[value]]
        }
        result = service.spreadsheets().values().update(
            spreadsheetId=spreadsheet_id, range=range_name,
            valueInputOption='USER_ENTERED', body=body
        ).execute()
        return result

    def run_script_function(self, script_id: str, function_name: str, parameters=None):
        """
        Executes a Google Apps Script function via the Execution API.
        """
        service = self.get_script_service()
        body = {"function": function_name, "devMode": True}
        if parameters is not None:
            body["parameters"] = parameters

        result = service.scripts().run(scriptId=script_id, body=body).execute()

        # Normalize error handling to raise Python exceptions with a friendly message
        if "error" in result:
            error_info = result.get("error", {})
            details = error_info.get("details", [])
            message = error_info.get("message", "Script execution failed")
            if details and isinstance(details[0], dict):
                message = details[0].get("errorMessage", message)
            raise Exception(message)

        return result.get("response", {})

# Создание синглтона для импорта в других модулях
google_service = GoogleService()
