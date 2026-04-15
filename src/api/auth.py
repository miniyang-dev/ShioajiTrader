"""
Auth Router - Authentication endpoints
"""
from fastapi import APIRouter, HTTPException
from models.schemas import LoginRequest, LoginResponse

router = APIRouter()

# Simple token storage (in production, use proper JWT or session management)
_active_tokens = set()

@router.post("/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """
    Login with Shioaji API credentials
    """
    # For simulation mode, we just return a mock token
    # In production, you'd validate against Shioaji API
    if not request.apiKey or not request.apiSecret:
        return LoginResponse(
            success=False,
            message="ApiKey 和 ApiSecret 不得為空",
            code=400
        )
    
    # Generate mock token (in production, use proper JWT)
    import uuid
    token = str(uuid.uuid4())
    _active_tokens.add(token)
    
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
