from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.google_service import google_service
from config.projects import PROJECT_SCRIPT_IDS, DEFAULT_SCRIPT_ID

router = APIRouter(prefix="/api/scripts", tags=["scripts"])


class ScriptRunRequest(BaseModel):
    project_id: str
    function_name: str
    parameters: list | dict | None = None


@router.post("/run")
async def run_script(request: ScriptRunRequest):
    """
    Execute a Google Apps Script function for the selected project.
    """
    project_key = request.project_id.lower()
    script_id = PROJECT_SCRIPT_IDS.get(project_key, DEFAULT_SCRIPT_ID)

    if not script_id:
        raise HTTPException(status_code=404, detail="Script not configured for this project")

    try:
        result = google_service.run_script_function(script_id, request.function_name, request.parameters)
        return {"status": "success", "result": result, "message": "Function executed"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Script execution failed: {str(e)}")
