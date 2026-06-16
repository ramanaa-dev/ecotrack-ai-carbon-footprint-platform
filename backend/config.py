import os
from datetime import timedelta

class Config:
    # Use DATABASE_URL from environment if available, replacing postgres:// with postgresql:// if needed for SQLAlchemy compatibility
    DATABASE_URL = os.environ.get("DATABASE_URL")
    if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URI = DATABASE_URL or "sqlite:///ecotrack.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "ecotrack-ai-super-secret-key-123456")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)
    
    # In production, we'd set a secret key for flask sessions if needed
    SECRET_KEY = os.environ.get("SECRET_KEY", "flask-session-secret-key-7890")
