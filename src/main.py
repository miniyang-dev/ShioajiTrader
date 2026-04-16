"""
ShioajiTrader - Python FastAPI Backend
"""
import os
import time
import logging
from collections import defaultdict
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from config import settings
from middleware import (
    validation_exception_handler,
    http_exception_handler,
    generic_exception_handler
)
from api.auth import router as auth_router
from api.stocks import router as stocks_router
from api.orders import router as orders_router
from api.users import router as users_router
from services.shioaji_service import ShioajiService

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Rate limiting storage
rate_limit_storage: dict[str, list] = defaultdict(list)


async def rate_limit_middleware(request: Request, call_next):
    """Rate limiting middleware"""
    if request.url.path == "/health":
        return await call_next(request)
    
    client_ip = request.client.host if request.client else "unknown"
    current_time = time.time()
    
    # Clean old requests
    rate_limit_storage[client_ip] = [
        t for t in rate_limit_storage[client_ip]
        if current_time - t < settings.RATE_LIMIT_WINDOW
    ]
    
    # Check rate limit
    if len(rate_limit_storage[client_ip]) >= settings.RATE_LIMIT_REQUESTS:
        logger.warning(f"Rate limit exceeded for {client_ip}")
        return JSONResponse(
            status_code=429,
            content={
                "success": False,
                "message": "Too many requests. Please try again later.",
                "code": 429
            }
        )
    
    rate_limit_storage[client_ip].append(current_time)
    return await call_next(request)


# Global shioaji service instance
shioaji_service: ShioajiService = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown"""
    global shioaji_service
    
    logger.info("Starting ShioajiTrader...")
    
    # Initialize Shioaji service
    shioaji_service = ShioajiService(
        api_key=settings.SHIOAJI_API_KEY,
        api_secret=settings.SHIOAJI_API_SECRET,
        simulation=settings.SHIOAJI_SIMULATION
    )
    
    app.state.shioaji = shioaji_service
    logger.info("Shioaji service initialized")
    
    yield
    
    logger.info("Shutting down ShioajiTrader...")
    # Cleanup if needed


# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Taiwan Stock Trading API",
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# Register exception handlers
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
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


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "timestamp": "2026-04-16T00:00:00Z"
    }


# Static files - serve Vue frontend assets
if settings.FRONTEND_PATH.exists():
    app.mount("/assets", StaticFiles(directory=str(settings.FRONTEND_PATH / "assets")), name="assets")


# SPA fallback - serve index.html for all non-API routes
@app.get("/{path:path}", include_in_schema=False)
async def serve_spa(path: str):
    """Serve Vue SPA for all non-API routes"""
    if path.startswith("api/"):
        return JSONResponse(
            status_code=404,
            content={"success": False, "message": "Not Found", "code": 404}
        )
    
    index_path = settings.FRONTEND_PATH / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse(
        status_code=404,
        content={"success": False, "message": "Not Found", "code": 404}
    )


@app.get("/", include_in_schema=False)
async def serve_index():
    """Serve Vue index.html"""
    index_path = settings.FRONTEND_PATH / "index.html"
    if index_path.exists():
        return FileResponse(str(index_path))
    return JSONResponse(
        status_code=404,
        content={"success": False, "message": "Not Found", "code": 404}
    )


def get_shioaji() -> ShioajiService:
    """Get shioaji service instance"""
    return shioaji_service
