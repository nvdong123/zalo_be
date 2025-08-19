import os
import sys
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext
from pydantic import BaseModel

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config_mysql_local import settings

# Password context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Pydantic models
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str
    user: dict

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# Set up CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
engine = create_engine(settings.DATABASE_URI)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password using bcrypt"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm=settings.ALGORITHM
    )
    return encoded_jwt

@app.get("/")
def read_root():
    return {"message": "Hotel SaaS Backend API", "database": "MySQL Local"}

@app.get("/health")
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint"""
    try:
        # Test database connection
        result = db.execute("SELECT 1")
        return {
            "status": "healthy",
            "database": "connected",
            "message": "Backend is running with MySQL"
        }
    except Exception as e:
        return {
            "status": "unhealthy", 
            "database": "disconnected",
            "error": str(e)
        }

@app.post("/api/v1/auth/login", response_model=LoginResponse)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    """
    OAuth2 compatible token login with real MySQL data
    """
    try:
        # Query user from MySQL
        result = db.execute(
            "SELECT id, username, email, hashed_password, full_name, role, status, tenant_id FROM tbl_admin_users WHERE username = %s",
            (form_data.username,)
        )
        user = result.fetchone()
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Verify password
        if not verify_password(form_data.password, user[3]):  # hashed_password
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect username or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Create tokens
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user[0])}, expires_delta=access_token_expires
        )
        
        refresh_token = create_access_token(
            data={"sub": str(user[0]), "type": "refresh"}, 
            expires_delta=timedelta(days=30)
        )
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": {
                "id": user[0],
                "username": user[1],
                "email": user[2],
                "full_name": user[4] if user[4] else user[1],
                "role": user[5],
                "tenant_id": user[7] if user[7] else None,
                "is_active": user[6] == 'active',
                "created_at": datetime.now().isoformat(),
                "updated_at": datetime.now().isoformat(),
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Login error: {str(e)}"
        )

# API endpoints for rooms
@app.get("/api/v1/rooms/")
def get_rooms(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get rooms list"""
    try:
        result = db.execute(
            "SELECT * FROM tbl_rooms LIMIT %s OFFSET %s",
            (limit, skip)
        )
        rooms = []
        for row in result.fetchall():
            rooms.append({
                "id": row[0],
                "tenant_id": row[1],
                "name": row[2],
                "room_type": row[3],
                "price_per_night": float(row[4]),
                "capacity": row[5],
                "description": row[6],
                "amenities": row[7],
                "status": row[8],
                "created_at": row[9].isoformat() if row[9] else None,
                "updated_at": row[10].isoformat() if row[10] else None,
            })
        return {"data": rooms, "total": len(rooms)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# API endpoints for promotions
@app.get("/api/v1/promotions/")
def get_promotions(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get promotions list"""
    try:
        result = db.execute(
            "SELECT * FROM tbl_promotions LIMIT %s OFFSET %s",
            (limit, skip)
        )
        promotions = []
        for row in result.fetchall():
            promotions.append({
                "id": row[0],
                "tenant_id": row[1],
                "title": row[2],
                "description": row[3],
                "discount_percentage": float(row[4]) if row[4] else None,
                "discount_amount": float(row[5]) if row[5] else None,
                "min_nights": row[6],
                "start_date": row[7].isoformat() if row[7] else None,
                "end_date": row[8].isoformat() if row[8] else None,
                "promo_code": row[9],
                "status": row[10],
                "created_at": row[11].isoformat() if row[11] else None,
                "updated_at": row[12].isoformat() if row[12] else None,
            })
        return {"data": promotions, "total": len(promotions)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting Hotel SaaS Backend with MySQL...")
    uvicorn.run(app, host="0.0.0.0", port=8001)
