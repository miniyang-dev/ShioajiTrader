"""
Standardized API response models
"""
from typing import Any, Generic, TypeVar, Optional, List
from pydantic import BaseModel

T = TypeVar("T")


class ApiResponse(BaseModel, Generic[T]):
    """Standard API response wrapper"""
    success: bool
    data: Optional[T] = None
    message: str = ""
    code: int = 200


class ApiError(BaseModel):
    """Standard API error response"""
    success: bool = False
    message: str
    code: int = 500
    detail: Optional[str] = None


class PaginatedResponse(BaseModel, Generic[T]):
    """Paginated response wrapper"""
    success: bool = True
    data: List[T]
    total: int
    page: int
    page_size: int
    message: str = ""


# Shorthand aliases for common patterns
SuccessResponse = ApiResponse[None]
ListResponse = ApiResponse[List[Any]]
