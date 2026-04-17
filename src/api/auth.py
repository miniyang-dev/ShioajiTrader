"""
Auth Router - Authentication endpoints
"""
import os
import json
import uuid
import logging
from pathlib import Path
from datetime import datetime, timedelta
from typing import Optional

import bcrypt
from fastapi import APIRouter, HTTPException, Header
from jose import JWTError, jwt
from models.schemas import LoginRequest, LoginResponse

# Logger setup
logger = logging.getLogger(__name__)

router = APIRouter()

# JWT Configuration
JWT_SECRET = os.getenv("JWT_SECRET", os.urandom(32).hex())
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

# Data directory
DATA_PATH = Path(os.getenv("DATA_PATH", "/app/src.data"))
USERS_FILE = DATA_PATH / "users.json"

# Token storage with expiration
_active_tokens: dict[str, dict] = {}


def ensure_data_dir():
    """Ensure data directory and files exist"""
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    if not USERS_FILE.exists():
        # Create default user with bcrypt hashed password
        default_password = "pass.1234"
        hashed = hash_password(default_password)
        default_user = {
            "id": "1",
            "username": "Irene",
            "password": hashed,
            "email": "irene@example.com",
            "createdAt": "2026-04-15T00:00:00Z"
        }
        USERS_FILE.write_text(json.dumps([default_user], indent=2))


def hash_password(password: str) -> str:
    """Hash password with bcrypt"""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """Verify password against bcrypt hash"""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        logger.error(f"Password verification failed: {e}")
        return False


def create_access_token(user_id: str, username: str) -> str:
    """Create JWT access token"""
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        "sub": user_id,
        "username": username,
        "exp": expire,
        "iat": datetime.utcnow(),
        "jti": str(uuid.uuid4())
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    
    # Store token metadata
    _active_tokens[token] = {
        "user_id": user_id,
        "created_at": datetime.utcnow(),
        "expires_at": expire
    }
    
    return token


def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token and return payload if valid"""
    try:
        # Check if token exists in our active tokens
        if token not in _active_tokens:
            return None
        
        token_data = _active_tokens[token]
        
        # Check expiration
        if datetime.utcnow() > token_data["expires_at"]:
            del _active_tokens[token]
            return None
        
        # Decode and verify JWT
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
        
    except JWTError as e:
        logger.warning(f"JWT verification failed: {e}")
        return None
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return None


def cleanup_expired_tokens():
    """Remove expired tokens from storage"""
    now = datetime.utcnow()
    expired = [t for t, data in _active_tokens.items() if now > data["expires_at"]]
    for t in expired:
        del _active_tokens[t]
    if expired:
        logger.info(f"Cleaned up {len(expired)} expired tokens")


def load_users() -> list:
    """Load users from JSON file"""
    ensure_data_dir()
    try:
        return json.loads(USERS_FILE.read_text())
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse users file: {e}")
        return []
    except IOError as e:
        logger.error(f"Failed to read users file: {e}")
        return []


def save_users(users: list):
    """Save users to JSON file"""
    ensure_data_dir()
    try:
        USERS_FILE.write_text(json.dumps(users, indent=2, ensure_ascii=False))
    except IOError as e:
        logger.error(f"Failed to write users file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save user data")


async def get_current_user(authorization: str = Header(None)) -> dict:
    """Dependency to get current authenticated user"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    # Support "Bearer <token>" format
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    
    payload = verify_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return payload


@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login with username and password
    """
    # Cleanup expired tokens on each login
    cleanup_expired_tokens()
    
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
        logger.warning(f"Login attempt for non-existent user: {request.apiKey}")
        return LoginResponse(
            success=False,
            message="帳號不存在",
            code=401
        )
    
    # Verify password using bcrypt
    if not verify_password(request.apiSecret, user.get("password", "")):
        logger.warning(f"Failed login attempt for user: {request.apiKey}")
        return LoginResponse(
            success=False,
            message="密碼錯誤",
            code=401
        )
    
    # Generate JWT token
    token = create_access_token(user["id"], user["username"])
    logger.info(f"User logged in successfully: {request.apiKey}")
    
    return LoginResponse(
        success=True,
        token=token,
        message="登入成功",
        code=200
    )


@router.post("/logout")
async def logout(authorization: str = Header(None)):
    """
    Logout and invalidate token
    """
    if authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
            if token in _active_tokens:
                del _active_tokens[token]
                logger.info("Token invalidated")
    
    return {"success": True, "message": "已登出"}


# User management endpoints (protected)
@router.get("/me")
async def get_profile(current_user: dict = get_current_user):
    """Get current user profile"""
    return {
        "success": True,
        "data": {
            "username": current_user.get("username"),
            "user_id": current_user.get("sub")
        },
        "message": "查詢成功"
    }


@router.put("/me")
async def update_profile(data: dict, current_user: dict = get_current_user):
    """Update current user profile"""
    # TODO: Implement profile update logic
    return {"success": True, "message": "更新成功"}
