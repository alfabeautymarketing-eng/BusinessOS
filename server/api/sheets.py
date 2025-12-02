from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from services.google_service import google_service

router = APIRouter(prefix="/api/sheets", tags=["sheets"])

class SheetRequest(BaseModel):
    spreadsheet_id: str

@router.get("/{spreadsheet_id}/metadata")
async def get_spreadsheet_metadata(spreadsheet_id: str):
    try:
        data = google_service.get_spreadsheet_metadata(spreadsheet_id)
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{spreadsheet_id}/headers")
async def get_sheet_headers(spreadsheet_id: str, sheet_name: str):
    try:
        headers = google_service.get_sheet_headers(spreadsheet_id, sheet_name)
        return headers
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
