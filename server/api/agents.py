from fastapi import APIRouter, HTTPException, Body
from pydantic import BaseModel
import os
import requests
import json
from services.google_service import google_service

router = APIRouter(prefix="/api/agents", tags=["agents"])

class AgentTask(BaseModel):
    prompt: str
    spreadsheet_id: str
    sheet_name: str
    context: dict = {}

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key={GEMINI_API_KEY}"

@router.post("/chat")
async def chat_agent(task: AgentTask):
    """
    Direct Action Agent:
    1. Analyzes the user's prompt to determine intent (ADD_ROW, UPDATE_CELL, QUESTION, etc.).
    2. Executes the action directly via Google Sheets API.
    3. Returns a natural language response.
    """
    try:
        # 1. Intent Recognition with Gemini
        system_prompt = f"""
        You are an AI Action Agent for Google Sheets.
        Your goal is to understand the user's request and output a JSON object representing the action to take.
        
        Context:
        - Spreadsheet ID: {task.spreadsheet_id}
        - Active Sheet: {task.sheet_name}
        
        Supported Actions:
        1. ADD_ROW: Append data to the sheet.
           Params: "values" (list of strings/numbers)
        2. UPDATE_CELL: Change a specific cell.
           Params: "cell" (e.g., "A1"), "value" (string/number)
        3. ANSWER: Just answer a question or acknowledge.
           Params: "text" (your response)
        
        User Request: "{task.prompt}"
        
        Output Format (JSON ONLY):
        {{
            "action": "ADD_ROW" | "UPDATE_CELL" | "ANSWER",
            "params": {{ ... }},
            "response_text": "A short, friendly confirmation message for the user."
        }}
        """
        
        payload = {
            "contents": [{"parts": [{"text": system_prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }
        
        response = requests.post(GEMINI_URL, json=payload)
        response.raise_for_status()
        
        generated_text = response.json()['candidates'][0]['content']['parts'][0]['text']
        action_plan = json.loads(generated_text)
        
        action = action_plan.get("action")
        params = action_plan.get("params", {})
        response_text = action_plan.get("response_text", "Done.")
        
        # 2. Execute Action
        if action == "ADD_ROW":
            values = params.get("values", [])
            if values:
                google_service.append_row(task.spreadsheet_id, task.sheet_name, values)
                
        elif action == "UPDATE_CELL":
            cell = params.get("cell")
            value = params.get("value")
            if cell and value is not None:
                # Construct range (e.g., "Sheet1!A1")
                range_name = f"{task.sheet_name}!{cell}"
                google_service.update_cell(task.spreadsheet_id, range_name, value)
                
        # 3. Return Response
        return {
            "status": "success",
            "message": response_text,
            "action_taken": action
        }
        
    except Exception as e:
        print(f"Agent Error: {e}")
        return {
            "status": "error", 
            "message": f"I encountered an error: {str(e)}",
            "action_taken": "ERROR"
        }
