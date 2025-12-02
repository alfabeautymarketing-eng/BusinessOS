from fastapi import APIRouter, HTTPException, Query
from services.google_service import google_service
from typing import Optional

router = APIRouter(prefix="/api/drive", tags=["drive"])

@router.get("/files")
async def list_files(
    folder_id: Optional[str] = None, 
    page_size: int = 20, 
    page_token: Optional[str] = None
):
    try:
        service = google_service.get_drive_service()
        
        # Default query: Not in trash
        q = "trashed = false"
        if folder_id:
            q += f" and '{folder_id}' in parents"
            
        results = service.files().list(
            q=q,
            pageSize=page_size,
            pageToken=page_token,
            fields="nextPageToken, files(id, name, mimeType, iconLink, webViewLink)"
        ).execute()
        
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
