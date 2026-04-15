"""
Orders Router - Order management endpoints
"""
import os
import json
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime
from typing import Optional
from models.schemas import (
    Order, PlaceOrderRequest, PlaceLimitOrderRequest,
    OrderResponse, OrderListResponse, OrderStatistics,
    OrderSide, OrderType, OrderStatus
)

router = APIRouter()

# Data directory
DATA_PATH = Path(os.getenv("DATA_PATH", "/app/src.data"))
ORDERS_FILE = DATA_PATH / "orders.json"

def ensure_data_dir():
    """Ensure data directory and files exist"""
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    if not ORDERS_FILE.exists():
        ORDERS_FILE.write_text("[]")

def load_orders() -> list:
    """Load orders from JSON file"""
    ensure_data_dir()
    try:
        return json.loads(ORDERS_FILE.read_text())
    except:
        return []

def save_orders(orders: list):
    """Save orders to JSON file"""
    ensure_data_dir()
    ORDERS_FILE.write_text(json.dumps(orders, indent=2, ensure_ascii=False))

def is_valid_stock_code(code: str) -> bool:
    """Validate Taiwan stock code format (4 digits)"""
    return bool(code and len(code) == 4 and code.isdigit())

@router.get("", response_model=OrderListResponse)
async def get_orders(status: Optional[str] = None):
    """
    Get list of orders, optionally filtered by status
    """
    try:
        orders = load_orders()
        
        if status:
            orders = [o for o in orders if o.get("status") == status]
        
        # Sort by createdAt descending
        orders.sort(key=lambda x: x.get("createdAt", ""), reverse=True)
        
        return OrderListResponse(
            success=True,
            data=[Order(**o) for o in orders],
            message="查詢成功"
        )
    except Exception as e:
        return OrderListResponse(success=False, data=[], message=f"查詢失敗: {str(e)}", code=500)

@router.get("/today")
async def get_today_statistics():
    """
    Get today's order statistics
    """
    try:
        orders = load_orders()
        today = datetime.utcnow().date().isoformat()
        
        today_orders = [o for o in orders if o.get("createdAt", "").startswith(today)]
        
        stats = {
            "totalCount": len(today_orders),
            "buyCount": len([o for o in today_orders if o.get("side") == "Buy"]),
            "sellCount": len([o for o in today_orders if o.get("side") == "Sell"]),
            "pendingCount": len([o for o in today_orders if o.get("status") == "Pending"]),
            "submittedCount": len([o for o in today_orders if o.get("status") == "Submitted"]),
            "filledCount": len([o for o in today_orders if o.get("status") == "Filled"]),
            "cancelledCount": len([o for o in today_orders if o.get("status") == "Cancelled"]),
            "totalBuyAmount": sum(
                o.get("price", 0) * o.get("quantity", 0)
                for o in today_orders
                if o.get("side") == "Buy" and o.get("status") == "Filled"
            ),
            "totalSellAmount": sum(
                o.get("price", 0) * o.get("quantity", 0)
                for o in today_orders
                if o.get("side") == "Sell" and o.get("status") == "Filled"
            )
        }
        
        return {"success": True, "data": stats, "message": "查詢成功"}
    except Exception as e:
        return {"success": False, "message": f"查詢失敗: {str(e)}", "code": 500}

@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: str):
    """
    Get specific order by ID
    """
    try:
        orders = load_orders()
        order = next((o for o in orders if o.get("id") == order_id), None)
        
        if not order:
            return OrderResponse(success=False, message="找不到委託單", code=404)
        
        return OrderResponse(success=True, data=Order(**order), message="查詢成功")
    except Exception as e:
        return OrderResponse(success=False, message=f"查詢失敗: {str(e)}", code=500)

@router.post("/market", response_model=OrderResponse)
async def place_market_order(request: PlaceOrderRequest, req: Request):
    """
    Place a market order
    """
    if not request.stockCode:
        return OrderResponse(success=False, message="股票代碼不得為空", code=400)
    
    if request.quantity <= 0:
        return OrderResponse(success=False, message="數量必須大於0", code=400)
    
    if not is_valid_stock_code(request.stockCode):
        return OrderResponse(success=False, message="股票代碼格式不正確", code=400)
    
    try:
        # Create order
        order_id = f"ord_{datetime.utcnow().timestamp()}"
        order = {
            "id": order_id,
            "stockCode": request.stockCode.upper(),
            "stockName": request.stockName or request.stockCode.upper(),
            "side": request.side.value,
            "type": "Market",
            "quantity": request.quantity,
            "price": 0,
            "status": "Pending",
            "createdAt": datetime.utcnow().isoformat(),
            "message": None
        }
        
        # Try to place order via Shioaji
        try:
            shioaji = req.app.state.shioaji
            result = shioaji.place_order(
                stock_code=order["stockCode"],
                stock_name=order["stockName"],
                side=order["side"],
                order_type=order["type"],
                quantity=order["quantity"],
                price=0
            )
            order["status"] = result.get("status", "Submitted")
            order["message"] = result.get("message")
        except Exception as e:
            order["status"] = "Pending"
            order["message"] = f"模擬下單（Shioaji 未連接）"
        
        # Save order
        orders = load_orders()
        orders.append(order)
        save_orders(orders)
        
        return OrderResponse(
            success=True,
            data=Order(**order),
            message="下單成功" if order["status"] == "Submitted" else "下單已記錄（待執行）",
            code=201
        )
    except Exception as e:
        return OrderResponse(success=False, message=f"下單失敗: {str(e)}", code=500)

@router.post("/limit", response_model=OrderResponse)
async def place_limit_order(request: PlaceLimitOrderRequest, req: Request):
    """
    Place a limit order
    """
    if not request.stockCode:
        return OrderResponse(success=False, message="股票代碼不得為空", code=400)
    
    if request.quantity <= 0:
        return OrderResponse(success=False, message="數量必須大於0", code=400)
    
    if request.price <= 0:
        return OrderResponse(success=False, message="價格必須大於0", code=400)
    
    if not is_valid_stock_code(request.stockCode):
        return OrderResponse(success=False, message="股票代碼格式不正確", code=400)
    
    try:
        order_id = f"ord_{datetime.utcnow().timestamp()}"
        order = {
            "id": order_id,
            "stockCode": request.stockCode.upper(),
            "stockName": request.stockName or request.stockCode.upper(),
            "side": request.side.value,
            "type": "Limit",
            "quantity": request.quantity,
            "price": request.price,
            "status": "Pending",
            "createdAt": datetime.utcnow().isoformat(),
            "message": None
        }
        
        # Try to place order via Shioaji
        try:
            shioaji = req.app.state.shioaji
            result = shioaji.place_order(
                stock_code=order["stockCode"],
                stock_name=order["stockName"],
                side=order["side"],
                order_type=order["type"],
                quantity=order["quantity"],
                price=order["price"]
            )
            order["status"] = result.get("status", "Submitted")
            order["message"] = result.get("message")
        except Exception as e:
            order["status"] = "Pending"
            order["message"] = f"模擬下單（Shioaji 未連接）"
        
        # Save order
        orders = load_orders()
        orders.append(order)
        save_orders(orders)
        
        return OrderResponse(
            success=True,
            data=Order(**order),
            message="下單成功" if order["status"] == "Submitted" else "下單已記錄（待執行）",
            code=201
        )
    except Exception as e:
        return OrderResponse(success=False, message=f"下單失敗: {str(e)}", code=500)

@router.post("/{order_id}/cancel", response_model=OrderResponse)
async def cancel_order(order_id: str):
    """
    Cancel an order
    """
    try:
        orders = load_orders()
        order = next((o for o in orders if o.get("id") == order_id), None)
        
        if not order:
            return OrderResponse(success=False, message="找不到委託單", code=404)
        
        if order.get("status") not in ["Pending", "Submitted"]:
            return OrderResponse(success=False, message="此委託無法取消", code=400)
        
        order["status"] = "Cancelled"
        order["updatedAt"] = datetime.utcnow().isoformat()
        
        # Update in list
        orders = [o for o in orders if o.get("id") != order_id]
        orders.append(order)
        save_orders(orders)
        
        return OrderResponse(success=True, data=Order(**order), message="委託已取消")
    except Exception as e:
        return OrderResponse(success=False, message=f"取消失敗: {str(e)}", code=500)
