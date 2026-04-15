"""
Pydantic schemas for request/response models
"""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum
from datetime import datetime

# ===== Enums =====
class OrderSide(str, Enum):
    Buy = "Buy"
    Sell = "Sell"

class OrderType(str, Enum):
    Market = "Market"
    Limit = "Limit"

class OrderStatus(str, Enum):
    Pending = "Pending"
    Submitted = "Submitted"
    Filled = "Filled"
    Cancelled = "Cancelled"
    Rejected = "Rejected"

# ===== Auth =====
class LoginRequest(BaseModel):
    apiKey: str
    apiSecret: str

class LoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None
    message: str
    code: int = 200

# ===== Stocks =====
class Stock(BaseModel):
    code: str
    name: str
    currentPrice: float = 0
    change: float = 0
    changePercent: float = 0
    volume: int = 0
    updatedAt: Optional[datetime] = None

class AddStockRequest(BaseModel):
    code: str
    name: Optional[str] = None

class QuoteResponse(BaseModel):
    success: bool
    data: Optional[Stock] = None
    message: str
    code: int = 200

class StockListResponse(BaseModel):
    success: bool
    data: List[Stock] = []
    message: str
    code: int = 200

class KbarData(BaseModel):
    date: str
    open: float
    high: float
    low: float
    close: float
    volume: int

class KbarResponse(BaseModel):
    code: str
    kbars: List[KbarData]

# ===== Orders =====
class PlaceOrderRequest(BaseModel):
    stockCode: str
    stockName: Optional[str] = None
    side: OrderSide
    quantity: int

class PlaceLimitOrderRequest(BaseModel):
    stockCode: str
    stockName: Optional[str] = None
    side: OrderSide
    quantity: int
    price: float

class Order(BaseModel):
    id: str
    stockCode: str
    stockName: str
    side: OrderSide
    type: OrderType
    quantity: int
    price: float
    status: OrderStatus
    createdAt: datetime
    updatedAt: Optional[datetime] = None
    message: Optional[str] = None

class OrderStatistics(BaseModel):
    totalCount: int = 0
    buyCount: int = 0
    sellCount: int = 0
    pendingCount: int = 0
    submittedCount: int = 0
    filledCount: int = 0
    cancelledCount: int = 0
    totalBuyAmount: float = 0
    totalSellAmount: float = 0

class OrderResponse(BaseModel):
    success: bool
    data: Optional[Order] = None
    message: str
    code: int = 200

class OrderListResponse(BaseModel):
    success: bool
    data: List[Order] = []
    message: str
    code: int = 200

# ===== Generic =====
class ApiResponse(BaseModel):
    success: bool
    message: str
    code: int = 200

class ApiResponseT(BaseModel):
    success: bool
    data: dict = None
    message: str
    code: int = 200
