"""
ShioajiTrader - Python FastAPI Backend
"""
import os
import json
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from api.auth import router as auth_router
from api.stocks import router as stocks_router
from api.orders import router as orders_router
from services.shioaji_service import ShioajiService

# Data directory
DATA_PATH = Path(os.getenv("DATA_PATH", "/app/src.data"))
DATA_PATH.mkdir(parents=True, exist_ok=True)

# Global shioaji service instance
shioaji_service: ShioajiService = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    global shioaji_service
    
    # Startup: Initialize Shioaji service
    shioaji_service = ShioajiService(
        api_key=os.getenv("SJ_API_KEY"),
        api_secret=os.getenv("SJ_API_SECRET"),
        simulation=os.getenv("SJ_SIMULATION", "true").lower() == "true"
    )
    
    # Store in app state for access in routes
    app.state.shioaji = shioaji_service
    
    yield
    
    # Shutdown: cleanup if needed
    pass

# Create FastAPI app
app = FastAPI(
    title="ShioajiTrader API",
    description="Taiwan Stock Trading API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(stocks_router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])

# Static files - serve Vue frontend
frontend_path = Path("/app/wwwroot")
if frontend_path.exists():
    # Mount at / with html=True for SPA fallback
    # All non-API routes will fall back to index.html
    app.mount("/", StaticFiles(directory=str(frontend_path), html=True), name="frontend")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2026-04-15T00:00:00Z"}

# Make app.state accessible to routes
def get_shioaji() -> ShioajiService:
    return shioaji_service
