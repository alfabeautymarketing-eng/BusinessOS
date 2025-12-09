from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import os
from datetime import datetime

from services.google_service import google_service

router = APIRouter(prefix="/api/logs", tags=["logs"])


@router.get("/server")
async def get_server_logs(
    tail: int = Query(100, description="Number of last lines to return"),
    log_file: Optional[str] = Query(None, description="Specific log file name")
):
    """
    Get logs from server log files.
    Returns the last N lines from the log file.
    """
    try:
        # Default log directory (can be configured via environment variable)
        log_dir = os.getenv('LOG_DIR', '/var/log/businessos/')

        # If no specific file requested, use default
        if not log_file:
            log_file = 'app.log'

        log_path = os.path.join(log_dir, log_file)

        # Check if file exists
        if not os.path.exists(log_path):
            # Fallback: try to read from stdout/stderr (for development)
            return {
                "status": "success",
                "logs": [],
                "message": f"Log file not found: {log_path}",
                "source": "server-files"
            }

        # Read last N lines
        with open(log_path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            last_lines = lines[-tail:] if len(lines) > tail else lines

        # Parse log lines into structured format
        parsed_logs = []
        for line in last_lines:
            parsed_logs.append(parse_log_line(line.strip()))

        return {
            "status": "success",
            "logs": parsed_logs,
            "count": len(parsed_logs),
            "source": "server-files"
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read server logs: {str(e)}")


@router.get("/sheets/{spreadsheet_id}")
async def get_sheets_logs(
    spreadsheet_id: str,
    sheet: str = Query("Журнал синхро", description="Name of the log sheet"),
    tail: int = Query(100, description="Number of last rows to return")
):
    """
    Get logs from a Google Sheets log sheet (e.g., "Журнал синхро").
    Returns the last N rows.
    """
    try:
        service = google_service.get_sheets_service()

        # Read all data from the sheet
        range_name = f"'{sheet}'!A:E"  # Assuming columns: timestamp, level, message, function, details
        result = service.spreadsheets().values().get(
            spreadsheetId=spreadsheet_id,
            range=range_name
        ).execute()

        values = result.get('values', [])

        if not values:
            return {
                "status": "success",
                "logs": [],
                "message": f"No logs found in sheet '{sheet}'",
                "source": "google-sheets"
            }

        # Skip header row and get last N rows
        data_rows = values[1:] if len(values) > 1 else []
        last_rows = data_rows[-tail:] if len(data_rows) > tail else data_rows

        # Parse into structured format
        parsed_logs = []
        for row in last_rows:
            # Ensure row has at least 3 columns
            while len(row) < 5:
                row.append('')

            parsed_logs.append({
                "timestamp": row[0] if len(row) > 0 else '',
                "level": row[1] if len(row) > 1 else 'INFO',
                "message": row[2] if len(row) > 2 else '',
                "function": row[3] if len(row) > 3 else '',
                "details": row[4] if len(row) > 4 else '',
                "emoji": extract_emoji(row[2] if len(row) > 2 else ''),
                "source": "google-sheets"
            })

        return {
            "status": "success",
            "logs": parsed_logs,
            "count": len(parsed_logs),
            "source": "google-sheets",
            "sheet": sheet
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read Google Sheets logs: {str(e)}")


def parse_log_line(line: str) -> dict:
    """
    Parse a single log line into structured format.
    Attempts to extract: timestamp, level, message
    """
    # Try to parse common formats:
    # [2024-12-08 14:30:45] INFO: Message
    # 2024-12-08 14:30:45 - INFO - Message

    import re

    # Pattern 1: [timestamp] LEVEL: message
    pattern1 = r'\[([^\]]+)\]\s*(\w+):\s*(.+)'
    match = re.match(pattern1, line)
    if match:
        return {
            "timestamp": match.group(1),
            "level": match.group(2),
            "message": match.group(3),
            "emoji": extract_emoji(match.group(3)),
            "source": "server-files"
        }

    # Pattern 2: timestamp - LEVEL - message
    pattern2 = r'(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*-\s*(\w+)\s*-\s*(.+)'
    match = re.match(pattern2, line)
    if match:
        return {
            "timestamp": match.group(1),
            "level": match.group(2),
            "message": match.group(3),
            "emoji": extract_emoji(match.group(3)),
            "source": "server-files"
        }

    # Fallback: return as-is
    return {
        "timestamp": datetime.now().isoformat(),
        "level": "INFO",
        "message": line,
        "emoji": extract_emoji(line),
        "source": "server-files"
    }


def extract_emoji(text: str) -> str:
    """
    Extract the first emoji from a text string.
    """
    import re

    # Common emoji patterns used in logs
    emojis = ['🚀', '⏳', '📥', '✅', '✏️', '⚠️', '❌', '🏁', '🐛', '🔄', '📤', '🗑️', '➕']

    for emoji in emojis:
        if emoji in text:
            return emoji

    # Try to find any emoji using regex
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # emoticons
        "\U0001F300-\U0001F5FF"  # symbols & pictographs
        "\U0001F680-\U0001F6FF"  # transport & map symbols
        "\U0001F1E0-\U0001F1FF"  # flags
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+", flags=re.UNICODE
    )

    match = emoji_pattern.search(text)
    if match:
        return match.group()

    return ''
