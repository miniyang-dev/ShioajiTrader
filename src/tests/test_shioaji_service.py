"""
Tests for ShioajiService
"""
import pytest
import asyncio


class TestShioajiService:
    """Test ShioajiService"""

    def test_init(self):
        """Test service initialization"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(
            api_key="test_key",
            api_secret="test_secret",
            simulation=True
        )
        
        assert service.api_key == "test_key"
        assert service.api_secret == "test_secret"
        assert service.simulation is True
        assert service._connected is False

    def test_init_without_credentials(self):
        """Test service initialization without credentials"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        
        assert service.api_key is None
        assert service.api_secret is None
        assert service.simulation is True

    def test_connect_simulation_mode(self):
        """Test connection in simulation mode"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        result = service.connect()
        
        assert result is True
        assert service._connected is True

    def test_get_quote_returns_dict(self):
        """Test that get_quote returns a dictionary"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        quote = service.get_quote("2330")
        
        assert isinstance(quote, dict)
        assert "code" in quote
        assert "name" in quote
        assert "currentPrice" in quote
        assert "change" in quote
        assert "changePercent" in quote
        assert "volume" in quote

    def test_get_quote_code_format(self):
        """Test that quote code is preserved"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        quote = service.get_quote("2330")
        
        assert quote["code"] == "2330"

    def test_get_kbars_returns_dict(self):
        """Test that get_kbars returns a dictionary"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        kbars = service.get_kbars("2330", days=30)
        
        assert isinstance(kbars, dict)
        assert "code" in kbars
        assert "kbars" in kbars

    def test_get_kbars_returns_list(self):
        """Test that get_kbars returns a list of kbars"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        kbars = service.get_kbars("2330", days=30)
        
        assert isinstance(kbars["kbars"], list)

    def test_get_kbars_respects_days_limit(self):
        """Test that get_kbars respects the days parameter"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        # Should limit to 90 even if days > 90
        kbars = service.get_kbars("2330", days=200)
        
        assert len(kbars["kbars"]) <= 90

    def test_get_kbars_has_required_fields(self):
        """Test that each kbar has required fields"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        kbars = service.get_kbars("2330", days=30)
        
        if len(kbars["kbars"]) > 0:
            first_kbar = kbars["kbars"][0]
            assert "date" in first_kbar
            assert "open" in first_kbar
            assert "high" in first_kbar
            assert "low" in first_kbar
            assert "close" in first_kbar
            assert "volume" in first_kbar

    def test_place_order_returns_dict(self):
        """Test that place_order returns a dictionary"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        result = service.place_order(
            stock_code="2330",
            stock_name="台積電",
            side="Buy",
            order_type="Market",
            quantity=1,
            price=0
        )
        
        assert isinstance(result, dict)
        assert "id" in result
        assert "status" in result
        assert "message" in result

    def test_place_order_id_format(self):
        """Test that order id is generated"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        result = service.place_order(
            stock_code="2330",
            stock_name="台積電",
            side="Buy",
            order_type="Market",
            quantity=1
        )
        
        # In simulation mode, should return mock id
        assert result["id"] is not None
        assert len(result["id"]) > 0


class TestShioajiServiceAsync:
    """Test async methods of ShioajiService"""

    @pytest.mark.asyncio
    async def test_subscribe_ticks_returns_generator(self):
        """Test that subscribe_ticks returns an async generator"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        result = service.subscribe_ticks(["2330"])
        
        # Should be an async generator
        assert asyncio.iscoroutine(result) or hasattr(result, '__aiter__')

    @pytest.mark.asyncio
    async def test_subscribe_ticks_yields_data(self):
        """Test that subscribe_ticks yields tick data"""
        from services.shioaji_service import ShioajiService
        
        service = ShioajiService(simulation=True)
        service.connect()
        
        # Get the async generator
        ticks_generator = service.subscribe_ticks(["2330"])
        
        # Get the first tick
        try:
            tick = await ticks_generator.__anext__()
            assert isinstance(tick, dict)
            assert "code" in tick
            assert "price" in tick
        except StopAsyncIteration:
            pass  # Generator ended, which is ok for demo
