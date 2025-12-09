import os
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from api.sheets import router as sheets_router
from typing import List
import asyncio
import json

app = FastAPI(title="Business OS Agent API")


# WebSocket Connection Manager for real-time logs
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                # Connection might be closed, will be removed on disconnect
                pass

    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_json(message)


manager = ConnectionManager()

# Configure CORS
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Allow Frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(sheets_router)
from api.drive import router as drive_router
app.include_router(drive_router)
from api.agents import router as agents_router
app.include_router(agents_router)
from api.scripts import router as scripts_router
app.include_router(scripts_router)
from api.logs import router as logs_router
app.include_router(logs_router)


# WebSocket endpoint for real-time logs
@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Send welcome message
        await manager.send_personal_message({
            "type": "connected",
            "message": "Connected to real-time logs",
            "timestamp": asyncio.get_event_loop().time()
        }, websocket)

        # Keep connection alive and listen for messages
        while True:
            data = await websocket.receive_text()
            # Echo back or handle commands if needed
            # For now, just keep the connection alive

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"WebSocket disconnected")


# Utility function to emit logs to all connected clients
async def emit_log(log_entry: dict):
    """
    Emit a log entry to all connected WebSocket clients.
    Can be called from anywhere in the application.

    Example:
        await emit_log({
            "timestamp": "2024-12-08 15:30:45",
            "level": "INFO",
            "message": "🚀 Script started",
            "emoji": "🚀",
            "source": "websocket"
        })
    """
    await manager.broadcast(log_entry)


@app.get("/")
async def root():
    return {"message": "Business OS Brain is Online", "status": "active"}


@app.get("/health")
async def health_check():
    return {"status": "ok"}
