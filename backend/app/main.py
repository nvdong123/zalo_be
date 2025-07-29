from fastapi import FastAPI, Form, HTTPException
from fastapi.staticfiles import StaticFiles
from app.api.api_v1.endpoints import (
    button_name, cover_share_popup, menu_product, menu_topping, merchant, oa, orders,
    order_item, order_item_topping, promotion, promotion_suggest, room,
    room_character, room_image, room_tag, room_utility, service, service_benefit,
    service_image, user, menu_category, upload, ui_settings
)
from app.db.session import engine
from app.core.config import settings
from sqlmodel import SQLModel
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Zalo Mini App Backend API",
    version="1.0.0"
)

# Cấu hình CORS từ settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if settings.BACKEND_CORS_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    # Database đã có sẵn bảng, không cần create_all()
    print("🚀 FastAPI application started!")
    print(f"📊 Connected to database: {settings.MYSQL_DB}")
    pass

@app.get("/")
def read_root():
    return {"message": "Hello World", "status": "OK"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": "2025-07-18"}

app.include_router(menu_category.router, prefix="/api/v1", tags=["Menu Category"])
app.include_router(button_name.router, prefix="/api/v1", tags=["Button Name"])
app.include_router(cover_share_popup.router, prefix="/api/v1", tags=["Cover Share Popup"])
app.include_router(menu_product.router, prefix="/api/v1", tags=["Menu Product"])
app.include_router(menu_topping.router, prefix="/api/v1", tags=["Menu Topping"])
app.include_router(merchant.router, prefix="/api/v1", tags=["Merchant"])
app.include_router(oa.router, prefix="/api/v1", tags=["OA"])
app.include_router(orders.router, prefix="/api/v1", tags=["Orders"])
app.include_router(order_item.router, prefix="/api/v1", tags=["Order Item"])
app.include_router(order_item_topping.router, prefix="/api/v1", tags=["Order Item Topping"])
app.include_router(promotion.router, prefix="/api/v1", tags=["Promotion"])
app.include_router(promotion_suggest.router, prefix="/api/v1", tags=["Promotion Suggest"])
app.include_router(room.router, prefix="/api/v1", tags=["Room"])
app.include_router(room_character.router, prefix="/api/v1", tags=["Room Character"])
app.include_router(room_image.router, prefix="/api/v1", tags=["Room Image"])
app.include_router(room_tag.router, prefix="/api/v1", tags=["Room Tag"])
app.include_router(room_utility.router, prefix="/api/v1", tags=["Room Utility"])
app.include_router(service.router, prefix="/api/v1", tags=["Service"])
app.include_router(service_benefit.router, prefix="/api/v1", tags=["Service Benefit"])
app.include_router(service_image.router, prefix="/api/v1", tags=["Service Image"])
app.include_router(user.router, prefix="/api/v1", tags=["User"])
app.include_router(upload.router, prefix="/api/v1", tags=["Upload"])
app.include_router(ui_settings.router, prefix="/api/v1/ui-settings", tags=["UI Settings"])

# Mount static files for serving uploaded images
uploads_dir = "uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
