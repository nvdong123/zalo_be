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
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:3000", 
        "http://localhost:5173", 
        "http://localhost:8000",
        "http://localhost:8889",
        "http://localhost:8890"
    ]

    PROJECT_NAME: str = "Zalo Mini App"
    
    # Database Configuration - SQLite for testing
    USE_SQLITE: bool = True  # Set to True for SQLite testing
    SQLITE_DB_PATH: str = "test_local.db"
    
    # Remote MySQL database (original)
    MYSQL_SERVER: str = "157.66.81.101"
    MYSQL_USER: str = "bookingservicesiovn_zalominidb"
    MYSQL_PASSWORD: str = "9XSZpTTBkA"
    MYSQL_DB: str = "bookingservicesiovn_zalominidb"
    DATABASE_URI: Optional[str] = None

    @model_validator(mode="before")
    @classmethod  
    def assemble_db_connection(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        if values.get("DATABASE_URI"):
            return values
        
        # Use SQLite for local testing
        if values.get("USE_SQLITE", True):
            sqlite_path = values.get("SQLITE_DB_PATH", "test_local.db")
            values["DATABASE_URI"] = f"sqlite:///{sqlite_path}"
            print(f"🔧 Using SQLite database: {sqlite_path}")
        else:
            # Use remote MySQL
            mysql_uri = f"mysql+pymysql://{values.get('MYSQL_USER')}:{values.get('MYSQL_PASSWORD')}@{values.get('MYSQL_SERVER')}/{values.get('MYSQL_DB')}"
            values["DATABASE_URI"] = mysql_uri
            print(f"🔧 Using MySQL database: {values.get('MYSQL_SERVER')}")
            
        return values

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()
