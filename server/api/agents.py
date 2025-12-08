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
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={GEMINI_API_KEY}"

@router.post("/chat")
async def chat_agent(task: AgentTask):
    """
    Direct Action Agent:
    1. Reads current sheet data
    2. Analyzes the user's prompt to determine intent (ADD_ROW, UPDATE_CELL, QUESTION, etc.).
    3. Executes the action directly via Google Sheets API.
    4. Returns a natural language response.
    """
    try:
        # 1. Read current sheet data to provide context
        sheet_data = []
        try:
            sheet_data = google_service.read_sheet(task.spreadsheet_id, task.sheet_name)
        except Exception as e:
            print(f"Warning: Could not read sheet data: {e}")

        # Convert sheet data to readable format
        sheet_context = ""
        if sheet_data and len(sheet_data) > 0:
            # Get headers (first row)
            headers = sheet_data[0] if len(sheet_data) > 0 else []
            # Get first 20 rows of data
            data_rows = sheet_data[1:21] if len(sheet_data) > 1 else []

            sheet_context = f"\nSheet Data (first 20 rows):\n"
            sheet_context += f"Headers: {', '.join(headers)}\n"
            for idx, row in enumerate(data_rows, start=2):
                # Pad row to match headers length
                padded_row = row + [''] * (len(headers) - len(row))
                sheet_context += f"Row {idx}: {padded_row}\n"

        # 2. Intent Recognition with Gemini
        system_prompt = f"""
        You are an AI Action Agent for Google Sheets.
        Your goal is to understand the user's request and output a JSON object representing the action to take.

        Context:
        - Spreadsheet ID: {task.spreadsheet_id}
        - Active Sheet: {task.sheet_name}
        {sheet_context}

        Supported Actions:
        1. ADD_ROW: Append data to the sheet.
           Params: "values" (list of strings/numbers)
        2. UPDATE_CELL: Change a specific cell.
           Params: "cell" (e.g., "G2"), "value" (string/number)
        3. ANSWER: Answer a question using the sheet data or acknowledge.
           Params: "text" (your response with specific data from the sheet)

        User Request: "{task.prompt}"

        Important:
        - For questions about data, use ANSWER action and include specific information from the sheet
        - For UPDATE_CELL, use exact cell reference like "G2" for column G row 2
        - Answer in Russian language

        Output Format (JSON ONLY):
        {{
            "action": "ADD_ROW" | "UPDATE_CELL" | "ANSWER",
            "params": {{ ... }},
            "response_text": "A short, friendly confirmation message for the user in Russian."
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
