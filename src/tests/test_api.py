"""
Tests for API endpoints
"""
import pytest


class TestAuthAPI:
    """Test authentication endpoints"""

    def test_login_success(self, client):
        """Test successful login"""
        response = client.post(
            "/api/auth/login",
            json={"apiKey": "sheep", "apiSecret": "pass.1234"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "token" in data
        assert data["message"] == "登入成功"

    def test_login_wrong_password(self, client):
        """Test login with wrong password"""
        response = client.post(
            "/api/auth/login",
            json={"apiKey": "sheep", "apiSecret": "wrongpassword"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["message"] == "密碼錯誤"

    def test_login_user_not_found(self, client):
        """Test login with non-existent user"""
        response = client.post(
            "/api/auth/login",
            json={"apiKey": "nonexistent", "apiSecret": "password"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["message"] == "帳號不存在"

    def test_login_empty_credentials(self, client):
        """Test login with empty credentials"""
        response = client.post(
            "/api/auth/login",
            json={"apiKey": "", "apiSecret": ""}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False

    def test_logout(self, client):
        """Test logout"""
        response = client.post("/api/auth/logout")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True


class TestUsersAPI:
    """Test user management endpoints"""

    def test_get_profile(self, client):
        """Test getting user profile"""
        response = client.get("/api/users/me")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "username" in data["data"]
        assert data["data"]["username"] == "sheep"

    def test_update_profile(self, client):
        """Test updating user profile"""
        response = client.put(
            "/api/users/me",
            json={"email": "newemail@test.com", "name": "New Name"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["email"] == "newemail@test.com"
        assert data["data"]["name"] == "New Name"

    def test_update_password(self, client):
        """Test changing password"""
        response = client.put(
            "/api/users/me",
            json={
                "currentPassword": "pass.1234",
                "newPassword": "newpass.1234"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_update_password_wrong_old(self, client):
        """Test changing password with wrong old password"""
        response = client.put(
            "/api/users/me",
            json={
                "currentPassword": "wrongpassword",
                "newPassword": "newpass.1234"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is False
        assert data["message"] == "舊密碼錯誤"


class TestStocksAPI:
    """Test stock endpoints"""

    def test_get_quote(self, client):
        """Test getting stock quote"""
        response = client.get("/api/stocks/2330")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "code" in data["data"]
        assert data["data"]["code"] == "2330"

    def test_get_quote_invalid_code(self, client):
        """Test getting quote with invalid stock code"""
        response = client.get("/api/stocks/INVALID")
        # Should return mock data even for invalid code
        assert response.status_code == 200

    def test_get_tracked_stocks(self, client):
        """Test getting tracked stocks list"""
        response = client.get("/api/stocks")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_add_stock(self, client):
        """Test adding a stock to tracking"""
        response = client.post(
            "/api/stocks",
            json={"code": "2317", "name": "鴻海"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["code"] == "2317"

    def test_remove_stock(self, client):
        """Test removing a stock from tracking"""
        # First add a stock
        client.post("/api/stocks", json={"code": "2409"})
        
        # Then remove it
        response = client.delete("/api/stocks/2409")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_get_kbars(self, client):
        """Test getting K-line data"""
        response = client.get("/api/stocks/2330/kbars?days=30")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "kbars" in data["data"]
        assert isinstance(data["data"]["kbars"], list)


class TestOrdersAPI:
    """Test order endpoints"""

    def test_get_orders(self, client):
        """Test getting orders list"""
        response = client.get("/api/orders")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert isinstance(data["data"], list)

    def test_place_market_order(self, client):
        """Test placing a market order"""
        response = client.post(
            "/api/orders/market",
            json={
                "stockCode": "2330",
                "stockName": "台積電",
                "side": "Buy",
                "quantity": 1
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["stockCode"] == "2330"
        assert data["data"]["quantity"] == 1

    def test_place_limit_order(self, client):
        """Test placing a limit order"""
        response = client.post(
            "/api/orders/limit",
            json={
                "stockCode": "2330",
                "stockName": "台積電",
                "side": "Sell",
                "quantity": 1,
                "price": 600.0
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert data["data"]["price"] == 600.0

    def test_place_order_invalid_quantity(self, client):
        """Test placing order with invalid quantity"""
        response = client.post(
            "/api/orders/market",
            json={
                "stockCode": "2330",
                "side": "Buy",
                "quantity": 0
            }
        )
        # Should return success=False since the code validates quantity
        data = response.json()
        assert data["success"] is False

    def test_get_today_statistics(self, client):
        """Test getting today's order statistics"""
        response = client.get("/api/orders/today")
        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True
        assert "totalCount" in data["data"]


class TestHealthAPI:
    """Test health check endpoint"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        # Health endpoint returns a dict, check if it exists
        assert "timestamp" in data or "status" in data
