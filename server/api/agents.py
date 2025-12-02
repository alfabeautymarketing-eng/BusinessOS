from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import os
import requests
from services.google_service import google_service

router = APIRouter(prefix="/api/agents", tags=["agents"])

class AgentTask(BaseModel):
    prompt: str
    spreadsheet_id: str
    sheet_name: str
    context: dict = {}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}"

@router.post("/execute")
async def execute_agent_task(task: AgentTask):
    """
    1. Receives a natural language task.
    2. Uses Gemini to generate Google Apps Script code.
    3. Pushes the code to the Google Sheet's bound script project.
    """
    try:
        # 1. Generate Code with Gemini
        system_prompt = f"""
        You are an expert Google Apps Script developer.
        Your task is to write a script for a Google Sheet.
        
        Context:
        - Spreadsheet ID: {task.spreadsheet_id}
        - Active Sheet: {task.sheet_name}
        - Column Context: {task.context}
        
        User Request: "{task.prompt}"
        
        Requirements:
        - Write ONLY the JavaScript/Google Apps Script code.
        - Do not include markdown formatting (```javascript).
        - The code must be a complete function or set of functions.
        - If the user asks for a trigger (e.g., "when I edit"), include the trigger installation logic in a 'setupTriggers' function.
        """
        
        payload = {
            "contents": [{"parts": [{"text": system_prompt}]}]
        }
        
        response = requests.post(GEMINI_URL, json=payload)
        response.raise_for_status()
        
        generated_text = response.json()['candidates'][0]['content']['parts'][0]['text']
        
        # Clean up code (remove markdown if Gemini ignores instructions)
        clean_code = generated_text.replace("```javascript", "").replace("```", "").strip()
        
        # 2. Deploy Code (Simulated for now, real implementation needs Script API 'updateContent')
        # In a real scenario, we would:
        # a) Find the Script Project bound to the Sheet (or create one)
        # b) Use script.projects().updateContent() to push the code
        
        # For prototype, we'll just return the code to the UI
        return {
            "status": "success",
            "generated_code": clean_code,
            "message": "Code generated successfully. Ready to deploy."
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class DeployRequest(BaseModel):
    script_id: str
    code: str

@router.post("/deploy")
async def deploy_script(request: DeployRequest):
    try:
        google_service.update_script_content(request.script_id, request.code)
        return {"status": "success", "message": "Script deployed successfully to Google Sheets."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
