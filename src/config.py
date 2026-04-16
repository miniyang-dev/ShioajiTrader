"""
Configuration management for ShioajiTrader
"""
import os
from pathlib import Path
from typing import List


class Settings:
    """Application settings loaded from environment variables"""
    
    # Application
    APP_NAME: str = "ShioajiTrader"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = os.getenv("DEBUG", "false").lower() == "true"
    
    # Server
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8080"))
    
    # Data paths
    DATA_PATH: Path = Path(os.getenv("DATA_PATH", "/app/src.data"))
    FRONTEND_PATH: Path = Path(os.getenv("FRONTEND_PATH", "/app/wwwroot"))
    
    # JWT
    JWT_SECRET: str = os.getenv("JWT_SECRET", os.urandom(32).hex())
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = int(os.getenv("JWT_EXPIRATION_HOURS", "24"))
    
    # Rate limiting
    RATE_LIMIT_REQUESTS: int = int(os.getenv("RATE_LIMIT_REQUESTS", "100"))
    RATE_LIMIT_WINDOW: int = int(os.getenv("RATE_LIMIT_WINDOW", "60"))
    
    # CORS - restrict in production
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",  # Vue dev server
        "http://localhost:8080",  # Local development
    ]
    
    # Shioaji API
    SHIOAJI_API_KEY: str = os.getenv("SJ_API_KEY", "")
    SHIOAJI_API_SECRET: str = os.getenv("SJ_API_SECRET", "")
    SHIOAJI_SIMULATION: bool = os.getenv("SJ_SIMULATION", "true").lower() == "true"
    
    # Logging
    LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
    
    def ensure_directories(self):
        """Ensure required directories exist"""
        self.DATA_PATH.mkdir(parents=True, exist_ok=True)
        self.FRONTEND_PATH.mkdir(parents=True, exist_ok=True)
    
    @classmethod
    def get_instance(cls) -> "Settings":
        """Get singleton instance"""
        if not hasattr(cls, "_instance"):
            cls._instance = cls()
            cls._instance.ensure_directories()
        return cls._instance


# Global settings instance
settings = Settings.get_instance()
