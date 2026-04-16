"""
ShioajiTrader - Python FastAPI Backend
"""
import os
import re
import time
import logging
from collections import defaultdict
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse

from api.auth import router as auth_router
from api.stocks import router as stocks_router
from api.orders import router as orders_router
from api.users import router as users_router
from services.shioaji_service import ShioajiService

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Data directory
DATA_PATH = Path(os.getenv("DATA_PATH", "/app/src.data"))
DATA_PATH.mkdir(parents=True, exist_ok=True)

# Rate limiting storage
rate_limit_storage = defaultdict(list)
RATE_LIMIT_REQUESTS = 100  # requests per window
RATE_LIMIT_WINDOW = 60  # seconds


async def rate_limit_middleware(request: Request, call_next):
    """Simple rate limiting middleware"""
    # Skip rate limiting for health checks
    if request.url.path == "/health":
        return await call_next(request)
    
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Clean old requests
    rate_limit_storage[client_ip] = [
        t for t in rate_limit_storage[client_ip]
        if current_time - t < RATE_LIMIT_WINDOW
    ]
    
    # Check rate limit
    if len(rate_limit_storage[client_ip]) >= RATE_LIMIT_REQUESTS:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Please try again later."}
        )
    
    # Add current request
    rate_limit_storage[client_ip].append(current_time)
    
    return await call_next(request)

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

# CORS middleware - restrict origins in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vue dev server
        "http://localhost:8080",  # Local development
        # Add your production domains here
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

# Rate limiting middleware
app.middleware("http")(rate_limit_middleware)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["Auth"])
app.include_router(stocks_router, prefix="/api/stocks", tags=["Stocks"])
app.include_router(orders_router, prefix="/api/orders", tags=["Orders"])
app.include_router(users_router, prefix="/api/users", tags=["Users"])

# Health check - must be BEFORE StaticFiles mount to avoid being caught
# Static files - serve Vue frontend assets
frontend_path = Path("/app/wwwroot")
if frontend_path.exists():
    # Mount /assets for static files (CSS, JS, images)
    app.mount("/assets", StaticFiles(directory=str(frontend_path / "assets")), name="assets")

# SPA fallback - serve index.html for all non-API routes
@app.get("/{path:path}", include_in_schema=False)
async def serve_spa(path: str):
    """Serve Vue SPA for all non-API routes"""
    # Skip API routes
    if path.startswith("api/"):
        return {"detail": "Not Found"}
    
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"detail": "Not Found"}

@app.get("/", include_in_schema=False)
async def serve_index():
    """Serve Vue index.html"""
    index_path = frontend_path / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return {"detail": "Not Found"}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": "2026-04-15T00:00:00Z"}

# Make app.state accessible to routes
def get_shioaji() -> ShioajiService:
    return shioaji_service
