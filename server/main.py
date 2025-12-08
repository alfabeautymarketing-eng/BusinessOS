import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.sheets import router as sheets_router

app = FastAPI(title="Business OS Agent API")

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

@app.get("/")
async def root():
    return {"message": "Business OS Brain is Online", "status": "active"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
