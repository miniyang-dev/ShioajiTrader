"""
Users Router - User profile management endpoints
"""
import os
import json
import uuid
import hashlib
from datetime import datetime
from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi import APIRouter, HTTPException

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
            "name": "Sheep User",
            "phone": "",
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

def verify_token(token: str) -> dict:
    """Verify token and return user"""
    tokens_file = DATA_PATH / "tokens.json"
    if tokens_file.exists():
        tokens = json.loads(tokens_file.read_text())
        user_id = tokens.get(token)
        if user_id:
            users = load_users()
            user = next((u for u in users if u.get("id") == user_id), None)
            return user
    return None

@router.get("/me")
async def get_profile():
    """
    Get current user profile
    """
    ensure_data_dir()
    users = load_users()
    if users:
        user = users[0]
        # Don't return password
        return {
            "success": True,
            "data": {
                "id": user.get("id"),
                "username": user.get("username"),
                "email": user.get("email"),
                "name": user.get("name", ""),
                "phone": user.get("phone", ""),
                "createdAt": user.get("createdAt")
            },
            "message": "查詢成功"
        }
    return {"success": False, "message": "找不到使用者", "code": 404}

@router.put("/me")
async def update_profile(data: dict):
    """
    Update current user profile
    """
    ensure_data_dir()
    users = load_users()
    
    if not users:
        return {"success": False, "message": "找不到使用者", "code": 404}
    
    user = users[0]
    
    # Update fields
    if "email" in data:
        user["email"] = data["email"]
    if "name" in data:
        user["name"] = data["name"]
    if "phone" in data:
        user["phone"] = data["phone"]
    
    # If password change is requested
    if "newPassword" in data and data["newPassword"]:
        if "currentPassword" not in data:
            return {"success": False, "message": "請輸入舊密碼", "code": 400}
        
        # Verify old password
        if hash_password(data["currentPassword"]) != user.get("password"):
            return {"success": False, "message": "舊密碼錯誤", "code": 401}
        
        # Update password
        user["password"] = hash_password(data["newPassword"])
    
    save_users(users)
    
    return {
        "success": True,
        "data": {
            "id": user.get("id"),
            "username": user.get("username"),
            "email": user.get("email"),
            "name": user.get("name", ""),
            "phone": user.get("phone", "")
        },
        "message": "更新成功"
    }

@router.get("/")
async def get_users():
    """
    Get all users (admin only - simplified for demo)
    """
    ensure_data_dir()
    users = load_users()
    # Don't return passwords
    safe_users = [{
        "id": u.get("id"),
        "username": u.get("username"),
        "email": u.get("email"),
        "name": u.get("name", ""),
        "createdAt": u.get("createdAt")
    } for u in users]
    
    return {"success": True, "data": safe_users, "message": "查詢成功"}

@router.post("/")
async def create_user(data: dict):
    """
    Create new user (admin only - simplified for demo)
    """
    if not data.get("username") or not data.get("password"):
        return {"success": False, "message": "帳號和密碼不得為空", "code": 400}
    
    users = load_users()
    
    # Check if username exists
    if any(u.get("username") == data["username"] for u in users):
        return {"success": False, "message": "帳號已存在", "code": 409}
    
    new_user = {
        "id": str(uuid.uuid4()),
        "username": data["username"],
        "password": hash_password(data["password"]),
        "email": data.get("email", ""),
        "name": data.get("name", ""),
        "phone": data.get("phone", ""),
        "createdAt": datetime.now().isoformat()
    }
    
    users.append(new_user)
    save_users(users)
    
    return {
        "success": True,
        "data": {
            "id": new_user["id"],
            "username": new_user["username"],
            "email": new_user["email"],
            "name": new_user["name"]
        },
        "message": "建立成功"
    }
