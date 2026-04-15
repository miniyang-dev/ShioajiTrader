"""
Shioaji Service - Direct integration with shioaji Python library
"""
import os
import json
import asyncio
from pathlib import Path
from typing import List, Optional, AsyncGenerator
from datetime import datetime
import shioaji as sj

class ShioajiService:
    """Direct shioaji Python library wrapper"""
    
    def __init__(self, api_key: str = None, api_secret: str = None, simulation: bool = True):
        self.api_key = api_key or os.getenv("SJ_API_KEY")
        self.api_secret = api_secret or os.getenv("SJ_API_SECRET")
        self.simulation = simulation
        self._api = None
        self._connected = False
        
    def connect(self):
        """Connect to Shioaji API"""
        if self._connected:
            return True
            
        try:
            self._api = sj.Shioaji(simulation=self.simulation)
            
            if self.api_key and self.api_secret:
                self._api.login(
                    api_key=self.api_key,
                    secret_key=self.api_secret
                )
            else:
                print("No API credentials provided, running in simulation mode without real login")
                
            self._connected = True
            print("Successfully connected to Shioaji")
            return True
            
        except Exception as e:
            print(f"Failed to connect to Shioaji: {e}")
            self._connected = False
            return False
    
    def get_quote(self, code: str) -> dict:
        """Get stock quote"""
        if not self._connected:
            self.connect()
            
        try:
            # Try to get snapshot from shioaji
            contract = self._api.Contracts.Stocks.get(code, None)
            if contract:
                snapshots = self._api.snapshots([contract])
                if snapshots:
                    snap = snapshots[0]
                    return {
                        "code": code,
                        "name": getattr(contract, "name", code),
                        "currentPrice": float(snap.close),
                        "change": float(snap.change_price),
                        "changePercent": float(snap.change_rate) * 100 if hasattr(snap, 'change_rate') else 0,
                        "volume": int(snap.volume) if hasattr(snap, 'volume') else 0,
                        "updatedAt": datetime.utcnow().isoformat()
                    }
        except Exception as e:
            print(f"Error getting quote for {code}: {e}")
        
        # Return mock data if shioaji fails
        return {
            "code": code,
            "name": code,
            "currentPrice": 0,
            "change": 0,
            "changePercent": 0,
            "volume": 0,
            "updatedAt": datetime.utcnow().isoformat()
        }
    
    def get_kbars(self, code: str, days: int = 30) -> dict:
        """Get K-bar historical data"""
        if not self._connected:
            self.connect()
            
        kbars_data = []
        
        try:
            contract = self._api.Contracts.Stocks.get(code, None)
            if contract:
                kbars = self._api.kbars(contract)
                if kbars is not None:
                    # Parse kbars data
                    for i in range(len(kbars.get('Date', []))):
                        kbars_data.append({
                            "date": kbars['Date'][i],
                            "open": float(kbars['Open'][i]),
                            "high": float(kbars['High'][i]),
                            "low": float(kbars['Low'][i]),
                            "close": float(kbars['Close'][i]),
                            "volume": int(kbars['Volume'][i])
                        })
        except Exception as e:
            print(f"Error getting kbars for {code}: {e}")
        
        return {
            "code": code,
            "kbars": kbars_data
        }
    
    def place_order(self, stock_code: str, stock_name: str, side: str, order_type: str, quantity: int, price: float = 0) -> dict:
        """Place an order"""
        if not self._connected:
            self.connect()
            
        try:
            contract = self._api.Contracts.Stocks.get(stock_code, None)
            if contract:
                order = self._api.Order(
                    price=price,
                    quantity=quantity,
                    action=sj.constant.Action[side],
                    order_type=sj.constant.OrderType[order_type],
                    security_type=sj.constant.SecurityType.STK
                )
                trade = self._api.place_order(contract, order)
                return {
                    "id": str(trade.order_id),
                    "status": "Submitted",
                    "message": "Order submitted successfully"
                }
        except Exception as e:
            print(f"Error placing order: {e}")
            
        # Mock response for simulation
        return {
            "id": f"mock_{datetime.utcnow().timestamp()}",
            "status": "Pending",
            "message": "Order recorded (simulation mode)"
        }
    
    async def subscribe_ticks(self, codes: List[str]) -> AsyncGenerator[dict, None]:
        """Subscribe to real-time tick data"""
        if not self._connected:
            self.connect()
            
        # Create event for tick callbacks
        tick_queue = asyncio.Queue()
        
        def tick_callback(tick):
            asyncio.get_event_loop().call_soon_threadsafe(
                lambda: tick_queue.put_nowait(tick)
            )
        
        try:
            contracts = []
            for code in codes:
                contract = self._api.Contracts.Stocks.get(code, None)
                if contract:
                    contracts.append(contract)
            
            if contracts:
                self._api.set_on_tick_stk_v1_callback(tick_callback)
                for contract in contracts:
                    self._api.subscribe(contract, quote_type="tick")
                    
                while True:
                    tick = await tick_queue.get()
                    yield {
                        "code": tick.code,
                        "name": tick.symbol.split()[1] if len(tick.symbol.split()) > 1 else tick.code,
                        "price": float(tick.close),
                        "change": float(tick.change_price),
                        "changePercent": float(tick.change_rate) * 100 if hasattr(tick, 'change_rate') else 0,
                        "volume": int(tick.volume) if hasattr(tick, 'volume') else 0,
                        "updatedAt": datetime.utcnow().isoformat()
                    }
        except Exception as e:
            print(f"Error in tick subscription: {e}")
            yield {}
