"""
Stocks Router - Stock quote and tracking endpoints
"""
import os
import json
import asyncio
import logging
from pathlib import Path
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from typing import List, Optional

from models.schemas import (
    Stock, AddStockRequest, QuoteResponse, StockListResponse,
    KbarResponse
)

# Logger setup
logger = logging.getLogger(__name__)

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
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse stocks file: {e}")
        return []
    except IOError as e:
        logger.error(f"Failed to read stocks file: {e}")
        return []


def save_stocks(stocks: List[dict]) -> None:
    """Save stocks to JSON file"""
    ensure_data_dir()
    try:
        STOCKS_FILE.write_text(json.dumps(stocks, indent=2, ensure_ascii=False))
    except IOError as e:
        logger.error(f"Failed to write stocks file: {e}")
        raise HTTPException(status_code=500, detail="Failed to save stock data")


def validate_stock_code(code: str) -> bool:
    """Validate Taiwan stock code format"""
    if not code:
        return False
    if not code.isdigit():
        return False
    # Taiwan stock codes: 4 digits (common) or 6 digits (ETF)
    if len(code) not in (4, 6):
        return False
    # First digit should not be 0 for common stocks
    if len(code) == 4 and code[0] == '0':
        return False
    return True


@router.get("/{code}", response_model=QuoteResponse)
async def get_quote(code: str, request: Request):
    """
    Get stock quote
    """
    if not code:
        return QuoteResponse(success=False, message="股票代碼不得為空", code=400)
    
    # Validate stock code format
    if not validate_stock_code(code):
        return QuoteResponse(success=False, message="無效的股票代碼格式", code=400)
    
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
        logger.error(f"Failed to get quote for {code}: {e}")
        return QuoteResponse(success=False, message=f"查詢失敗: {str(e)}", code=500)


@router.get("/{code}/kbars")
async def get_kbars(code: str, request: Request, days: int = 30):
    """
    Get historical K-bar data
    """
    if not code:
        return {"success": False, "message": "股票代碼不得為空", "code": 400}
    
    if not validate_stock_code(code):
        return {"success": False, "message": "無效的股票代碼格式", "code": 400}
    
    shioaji = request.app.state.shioaji
    
    try:
        kbars = shioaji.get_kbars(code.upper(), days)
        return {"success": True, "data": kbars, "message": "查詢成功"}
    except Exception as e:
        logger.error(f"Failed to get kbars for {code}: {e}")
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
        logger.error(f"Failed to get tracked stocks: {e}")
        return StockListResponse(success=False, data=[], message=f"查詢失敗: {str(e)}", code=500)


@router.post("")
async def add_stock(request_data: AddStockRequest):
    """
    Add stock to tracking list
    """
    stock_code = request_data.code
    
    if not stock_code:
        return {"success": False, "message": "股票代碼不得為空", "code": 400}
    
    if not validate_stock_code(stock_code):
        return {"success": False, "message": "無效的股票代碼格式", "code": 400}
    
    try:
        stocks = load_stocks()
        
        # Check if already exists
        for s in stocks:
            if s["code"].upper() == stock_code.upper():
                return {"success": False, "message": f"股票 {stock_code} 已在追蹤清單中", "code": 409}
        
        new_stock = {
            "code": stock_code.upper(),
            "name": request_data.name or stock_code.upper(),
            "currentPrice": 0,
            "change": 0,
            "changePercent": 0,
            "volume": 0
        }
        
        stocks.append(new_stock)
        save_stocks(stocks)
        logger.info(f"Added stock to tracking: {stock_code}")
        
        return {"success": True, "data": new_stock, "message": "已加入追蹤", "code": 201}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to add stock {stock_code}: {e}")
        return {"success": False, "message": f"新增失敗: {str(e)}", "code": 500}


@router.delete("/{code}")
async def remove_stock(code: str):
    """
    Remove stock from tracking list
    """
    if not validate_stock_code(code):
        return {"success": False, "message": "無效的股票代碼格式", "code": 400}
    
    try:
        stocks = load_stocks()
        original_len = len(stocks)
        stocks = [s for s in stocks if s["code"].upper() != code.upper()]
        
        if len(stocks) == original_len:
            return {"success": False, "message": f"股票 {code} 不在追蹤清單中", "code": 404}
        
        save_stocks(stocks)
        logger.info(f"Removed stock from tracking: {code}")
        return {"success": True, "message": "已從追蹤清單移除"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to remove stock {code}: {e}")
        return {"success": False, "message": f"移除失敗: {str(e)}", "code": 500}


@router.get("/{code}/stream")
async def stream_quote(code: str, request: Request):
    """
    SSE stream for real-time stock quotes
    """
    if not validate_stock_code(code):
        raise HTTPException(status_code=400, detail="Invalid stock code format")
    
    async def event_generator():
        shioaji = request.app.state.shioaji
        try:
            async for tick in shioaji.subscribe_ticks([code.upper()]):
                if tick:
                    yield f"data: {json.dumps(tick)}\n\n"
        except asyncio.CancelledError:
            logger.info(f"SSE stream cancelled for {code}")
        except Exception as e:
            logger.error(f"SSE error for {code}: {e}")
        finally:
            logger.info(f"SSE stream closed for {code}")
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )
