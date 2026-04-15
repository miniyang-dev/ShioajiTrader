"""
pytest configuration and fixtures
"""
import os
import sys
import tempfile
import shutil
from pathlib import Path

import pytest

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Set test environment before importing app
os.environ["DATA_PATH"] = tempfile.mkdtemp()
os.environ["SJ_SIMULATION"] = "true"


@pytest.fixture
def temp_data_dir():
    """Create a temporary data directory for tests"""
    temp_dir = tempfile.mkdtemp()
    original_data_path = os.environ.get("DATA_PATH")
    os.environ["DATA_PATH"] = temp_dir
    yield temp_dir
    # Cleanup
    shutil.rmtree(temp_dir, ignore_errors=True)
    if original_data_path:
        os.environ["DATA_PATH"] = original_data_path


@pytest.fixture
def client(temp_data_dir):
    """Create a test client for the FastAPI app"""
    from fastapi.testclient import TestClient
    from main import app
    
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def auth_token(client):
    """Get an authentication token"""
    response = client.post(
        "/api/auth/login",
        json={"apiKey": "sheep", "apiSecret": "pass.1234"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    return data["token"]
