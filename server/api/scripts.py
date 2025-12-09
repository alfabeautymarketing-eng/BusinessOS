from typing import Union, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.google_service import google_service
from config.projects import PROJECT_SCRIPT_IDS, DEFAULT_SCRIPT_ID

router = APIRouter(prefix="/api/scripts", tags=["scripts"])


class ScriptRunRequest(BaseModel):
    project_id: str
    function_name: str
    parameters: Optional[Union[list, dict]] = None


@router.post("/run")
async def run_script(request: ScriptRunRequest):
    """
    Execute a Google Apps Script function for the selected project.
    """
    project_key = request.project_id.lower()
    script_id = PROJECT_SCRIPT_IDS.get(project_key, DEFAULT_SCRIPT_ID)
    
    print(f"🔧 Script execution request:")
    print(f"   Project: {project_key}")
    print(f"   Script ID: {script_id}")
    print(f"   Function: {request.function_name}")
    print(f"   Parameters: {request.parameters}")

    if not script_id:
        raise HTTPException(status_code=404, detail="Script not configured for this project")

    try:
        result = google_service.run_script_function(script_id, request.function_name, request.parameters)
        print(f"✅ Script executed successfully: {result}")
        return {"status": "success", "result": result, "message": "Function executed"}
    except Exception as e:
        print(f"❌ Script execution error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Script execution failed: {str(e)}")


@router.get("/sheets/{spreadsheet_id}/sheet-name")
async def get_sheet_name(spreadsheet_id: str, sheet_id: int = 0):
    """
    Get the name of a specific sheet by its ID within a spreadsheet.
    Used for context detection in iframes.
    """
    try:
        metadata = google_service.get_spreadsheet_metadata(spreadsheet_id)

        # Find the sheet with matching sheetId
        for sheet in metadata.get('sheets', []):
            if sheet['id'] == sheet_id:
                return {
                    "status": "success",
                    "sheet_name": sheet['title'],
                    "sheet_id": sheet_id,
                    "spreadsheet_id": spreadsheet_id
                }

        # Если лист не найден, вернуть первый лист по умолчанию
        if metadata.get('sheets'):
            first_sheet = metadata['sheets'][0]
            return {
                "status": "success",
                "sheet_name": first_sheet['title'],
                "sheet_id": first_sheet['id'],
                "spreadsheet_id": spreadsheet_id,
                "fallback": True
            }

        raise HTTPException(status_code=404, detail=f"Sheet with ID {sheet_id} not found in spreadsheet")

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error getting sheet name: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get sheet name: {str(e)}")
