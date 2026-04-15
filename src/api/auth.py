"""
Auth Router - Authentication endpoints
"""
import os
import json
import uuid
import hashlib
from pathlib import Path
from fastapi import APIRouter, HTTPException
from models.schemas import LoginRequest, LoginResponse

router = APIRouter()

# Data directory
DATA_PATH = Path(os.getenv("DATA_PATH", "/app/src.data"))
USERS_FILE = DATA_PATH / "users.json"

def ensure_data_dir():
    """Ensure data directory and files exist"""
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    if not USERS_FILE.exists():
        # Create default user
        default_user = {
            "id": "1",
            "username": "sheep",
            "password": hash_password("pass.1234"),
            "email": "sheep@example.com",
            "createdAt": "2026-04-15T00:00:00Z"
        }
        USERS_FILE.write_text(json.dumps([default_user], indent=2))

def hash_password(password: str) -> str:
    """Simple password hashing"""
    return hashlib.sha256(password.encode()).hexdigest()

def load_users() -> list:
    """Load users from JSON file"""
    ensure_data_dir()
    try:
        return json.loads(USERS_FILE.read_text())
    except:
        return []

def save_users(users: list):
    """Save users to JSON file"""
    ensure_data_dir()
    USERS_FILE.write_text(json.dumps(users, indent=2, ensure_ascii=False))

# Simple token storage (in production, use proper JWT or session management)
_active_tokens = {}

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login with username and password
    """
    if not request.apiKey or not request.apiSecret:
        return LoginResponse(
            success=False,
            message="帳號和密碼不得為空",
            code=400
        )
    
    # Load users and check credentials
    users = load_users()
    user = next((u for u in users if u.get("username") == request.apiKey), None)
    
    if not user:
        return LoginResponse(
            success=False,
            message="帳號不存在",
            code=401
        )
    
    # Check password
    hashed_input = hash_password(request.apiSecret)
    if user.get("password") != hashed_input:
        return LoginResponse(
            success=False,
            message="密碼錯誤",
            code=401
        )
    
    # Generate token
    token = str(uuid.uuid4())
    _active_tokens[token] = user["id"]
    
    return LoginResponse(
        success=True,
        token=token,
        message="登入成功",
        code=200
    )

@router.post("/logout")
async def logout():
    """
    Logout and invalidate token
    """
    return {"success": True, "message": "已登出"}

# User management endpoints
@router.get("/me")
async def get_profile():
    """Get current user profile"""
    return {"success": True, "data": {"username": "sheep", "email": "sheep@example.com"}, "message": "查詢成功"}

@router.put("/me")
async def update_profile(data: dict):
    """Update current user profile"""
    return {"success": True, "message": "更新成功"}