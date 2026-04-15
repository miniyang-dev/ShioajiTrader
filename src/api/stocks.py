"""
Stocks Router - Stock quote and tracking endpoints
"""
import os
import json
import asyncio
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import List
from models.schemas import (
    Stock, AddStockRequest, QuoteResponse, StockListResponse,
    KbarResponse
)

router = APIRouter()

# Data directory
DATA_PATH = Path(os.getenv("DATA_PATH", "/app/src.data"))
STOCKS_FILE = DATA_PATH / "stocks.json"

def ensure_data_dir():
    """Ensure data directory and files exist"""
    DATA_PATH.mkdir(parents=True, exist_ok=True)
    if not STOCKS_FILE.exists():
        STOCKS_FILE.write_text("[]")

def load_stocks() -> List[dict]:
    """Load stocks from JSON file"""
    ensure_data_dir()
    try:
        return json.loads(STOCKS_FILE.read_text())
    except:
        return []

def save_stocks(stocks: List[dict]):
    """Save stocks to JSON file"""
    ensure_data_dir()
    STOCKS_FILE.write_text(json.dumps(stocks, indent=2, ensure_ascii=False))

@router.get("/{code}", response_model=QuoteResponse)
async def get_quote(code: str, request: Request):
    """
    Get stock quote
    """
    if not code:
        return QuoteResponse(success=False, message="股票代碼不得為空", code=400)
    
    # Get shioaji service from app state
    shioaji = request.app.state.shioaji
    
    try:
        quote = shioaji.get_quote(code.upper())
        return QuoteResponse(
            success=True,
            data=Stock(**quote),
            message="查詢成功"
        )
    except Exception as e:
        return QuoteResponse(success=False, message=f"查詢失敗: {str(e)}", code=500)

@router.get("/{code}/kbars")
async def get_kbars(code: str, request: Request, days: int = 30):
    """
    Get historical K-bar data
    """
    if not code:
        return {"success": False, "message": "股票代碼不得為空", "code": 400}
    
    shioaji = request.app.state.shioaji
    
    try:
        kbars = shioaji.get_kbars(code.upper(), days)
        return {"success": True, "data": kbars, "message": "查詢成功"}
    except Exception as e:
        return {"success": False, "message": f"查詢失敗: {str(e)}", "code": 500}

@router.get("", response_model=StockListResponse)
async def get_tracked_stocks():
    """
    Get list of tracked stocks
    """
    try:
        stocks = load_stocks()
        return StockListResponse(
            success=True,
            data=[Stock(**s) for s in stocks],
            message="查詢成功"
        )
    except Exception as e:
        return StockListResponse(success=False, data=[], message=f"查詢失敗: {str(e)}", code=500)

@router.post("")
async def add_stock(request: AddStockRequest):
    """
    Add stock to tracking list
    """
    if not request.code:
        return {"success": False, "message": "股票代碼不得為空", "code": 400}
    
    try:
        stocks = load_stocks()
        
        # Check if already exists
        for s in stocks:
            if s["code"].upper() == request.code.upper():
                return {"success": False, "message": f"股票 {request.code} 已在追蹤清單中", "code": 409}
        
        new_stock = {
            "code": request.code.upper(),
            "name": request.name or request.code.upper(),
            "currentPrice": 0,
            "change": 0,
            "changePercent": 0,
            "volume": 0
        }
        
        stocks.append(new_stock)
        save_stocks(stocks)
        
        return {"success": True, "data": new_stock, "message": "已加入追蹤", "code": 201}
    except Exception as e:
        return {"success": False, "message": f"新增失敗: {str(e)}", "code": 500}

@router.delete("/{code}")
async def remove_stock(code: str):
    """
    Remove stock from tracking list
    """
    try:
        stocks = load_stocks()
        original_len = len(stocks)
        stocks = [s for s in stocks if s["code"].upper() != code.upper()]
        
        if len(stocks) == original_len:
            return {"success": False, "message": f"股票 {code} 不在追蹤清單中", "code": 404}
        
        save_stocks(stocks)
        return {"success": True, "message": "已從追蹤清單移除"}
    except Exception as e:
        return {"success": False, "message": f"移除失敗: {str(e)}", "code": 500}

@router.get("/{code}/stream")
async def stream_quote(code: str, request: Request):
    """
    SSE stream for real-time stock quotes
    """
    async def event_generator():
        shioaji = request.app.state.shioaji
        
        try:
            async for tick in shioaji.subscribe_ticks([code.upper()]):
                if tick:
                    yield f"data: {json.dumps(tick)}\n\n"
        except Exception as e:
            print(f"SSE error: {e}")
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
