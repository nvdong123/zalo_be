import json
import secrets
from typing import Any, Dict, List, Optional, Union
from pydantic import AnyHttpUrl, EmailStr, HttpUrl, field_validator, model_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = secrets.token_urlsafe(32)
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 8  # 8 days
    
    SERVER_NAME: str = "Zalo Mini App Backend"
    SERVER_HOST: AnyHttpUrl = "http://localhost"
    
    # CORS Configuration
    BACKEND_CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://localhost:8000"]

    PROJECT_NAME: str = "Zalo Mini App"
    
    # Database Configuration
    USE_LOCAL_DB: bool = True  # Set to False for remote MySQL, True for local MySQL on VPS
    
    # Local SQLite database (for development/testing)
    LOCAL_DB_PATH: str = "local_test.db"
    
    # Remote MySQL database - UPDATED FOR LOCAL TESTING
    MYSQL_SERVER: str = "localhost"
    MYSQL_USER: str = "root"
    MYSQL_PASSWORD: str = "123456"
    MYSQL_DB: str = "bookingservicesiovn_zalominidb"
    DATABASE_URI: Optional[str] = None

    @model_validator(mode="before")
    @classmethod  
    def assemble_db_connection(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        if values.get("DATABASE_URI"):
            return values
        
        # Use local MySQL if enabled, otherwise use remote MySQL
        if values.get("USE_LOCAL_DB", True):
            # Local MySQL on VPS
            mysql_uri = f"mysql+pymysql://{values.get('MYSQL_USER')}:{values.get('MYSQL_PASSWORD')}@localhost/{values.get('MYSQL_DB')}"
            values["DATABASE_URI"] = mysql_uri
            print(f"🔧 Using local MySQL database: localhost")
        else:
            # Remote MySQL (original config)
            mysql_uri = f"mysql+pymysql://{values.get('MYSQL_USER')}:{values.get('MYSQL_PASSWORD')}@{values.get('MYSQL_SERVER')}/{values.get('MYSQL_DB')}"
            values["DATABASE_URI"] = mysql_uri
            print(f"🔧 Using remote MySQL database: {values.get('MYSQL_SERVER')}")
        
        return values

    # Email
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[EmailStr] = None
    EMAILS_FROM_NAME: Optional[str] = None

    # Users
    USERS_OPEN_REGISTRATION: bool = False
    EMAIL_RESET_TOKEN_EXPIRE_HOURS: int = 48
    EMAIL_TEMPLATES_DIR: str = "app/email-templates/build"
    EMAILS_ENABLED: bool = False

    # First superuser
    FIRST_SUPERUSER: EmailStr = "admin@example.com"
    FIRST_SUPERUSER_PASSWORD: str = "changethis"

    # Zalo Mini App
    ZALO_APP_ID: Optional[str] = None
    ZALO_APP_SECRET: Optional[str] = None
    
    # File Upload
    UPLOAD_DIR: str = "uploads"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_IMAGE_EXTENSIONS: List[str] = [".jpg", ".jpeg", ".png", ".gif", ".webp"]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
