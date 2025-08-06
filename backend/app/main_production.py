"""
Production FastAPI application using existing MySQL setup
"""
import os
import sys
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Add current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import configuration based on environment
if os.getenv("APP_ENV") == "production":
    from core.config_production import get_db, health_check, test_connection
    print("🚀 Running in PRODUCTION mode with existing MySQL")
else:
    from core.config import get_db
    print("🔧 Running in DEVELOPMENT mode")

# Import your existing API routes - using same approach as main.py
try:
    from api.api_v1.endpoints import (
        rooms, services, tenants, vouchers, 
        booking_requests, customer_vouchers, customers,
        facilities, facility_features, games, hotel_brands, promotions, room_stays,
        service_bookings, admin_users, room_amenities, room_features
    )
    api_modules_loaded = True
    print("✅ API modules loaded successfully")
except ImportError as e:
    print(f"⚠️  Some API routes not found: {e}")
    api_modules_loaded = False

# Create FastAPI application
app = FastAPI(
    title="Hotel Management System",
    description="Hotel booking and management API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://bookingservices.io.vn",
        "https://www.bookingservices.io.vn",
        "http://localhost:3000",  # For development
        "http://127.0.0.1:3000"   # For development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add your API routes if available
if api_modules_loaded:
    try:
        app.include_router(admin_users.router, prefix="/api/v1", tags=["Admin Users"])
        app.include_router(rooms.router, prefix="/api/v1", tags=["Rooms"])
        app.include_router(room_amenities.router, prefix="/api/v1", tags=["Room Amenities"])
        app.include_router(room_features.router, prefix="/api/v1", tags=["Room Features"])
        app.include_router(services.router, prefix="/api/v1", tags=["Services"])
        app.include_router(tenants.router, prefix="/api/v1", tags=["Tenants"])
        app.include_router(vouchers.router, prefix="/api/v1", tags=["Vouchers"])
        app.include_router(booking_requests.router, prefix="/api/v1", tags=["Booking Requests"])
        app.include_router(customer_vouchers.router, prefix="/api/v1", tags=["Customer Vouchers"])
        app.include_router(customers.router, prefix="/api/v1", tags=["Customers"])
        app.include_router(facilities.router, prefix="/api/v1", tags=["Facilities"])
        app.include_router(facility_features.router, prefix="/api/v1", tags=["Facility Features"])
        app.include_router(games.router, prefix="/api/v1", tags=["Games"])
        app.include_router(hotel_brands.router, prefix="/api/v1", tags=["Hotel Brands"])
        app.include_router(promotions.router, prefix="/api/v1", tags=["Promotions"]) 
        app.include_router(room_stays.router, prefix="/api/v1", tags=["Room Stays"])
        app.include_router(service_bookings.router, prefix="/api/v1", tags=["Service Bookings"])
        print("✅ All API routers included")
    except Exception as e:
        print(f"⚠️  Error including some routers: {e}")
else:
    print("⚠️  Running with basic endpoints only")

# Health check endpoint
@app.get("/health")
async def health_check_endpoint():
    """Health check for monitoring"""
    if os.getenv("APP_ENV") == "production":
        return health_check()
    else:
        return {"status": "healthy", "mode": "development"}

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Hotel Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health",
        "environment": os.getenv("APP_ENV", "development")
    }

# Database test endpoint
@app.get("/test-db")
async def test_database():
    """Test database connection"""
    if os.getenv("APP_ENV") == "production":
        if test_connection():
            return {"status": "success", "message": "Database connection successful"}
        else:
            raise HTTPException(status_code=500, detail="Database connection failed")
    else:
        return {"status": "info", "message": "Database test only available in production"}

# Startup event
@app.on_event("startup")
async def startup_event():
    """Application startup"""
    print("🚀 Hotel Management System starting...")
    
    if os.getenv("APP_ENV") == "production":
        print("🔍 Testing database connection...")
        if test_connection():
            print("✅ Database connection successful")
        else:
            print("❌ Database connection failed!")
            # Don't exit, let the app start for debugging
    
    print("✅ Application startup complete")

# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Application shutdown"""
    print("🛑 Hotel Management System shutting down...")

if __name__ == "__main__":
    import uvicorn
    
    # Get configuration from environment
    host = os.getenv("HOST", "127.0.0.1")
    port = int(os.getenv("PORT", 8000))
    
    print(f"🌟 Starting server at http://{host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    
    uvicorn.run(
        "main_production:app",
        host=host,
        port=port,
        reload=False,  # No reload in production
        workers=1,     # Single worker for testing, increase for production
        log_level="info"
    )
