from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import os
import uuid
from pathlib import Path
import shutil
from app.db.session_mysql import get_db
from app.crud.crud_merchant import get_merchant, update_merchant
from app.crud.crud_service import get_service, update_service
from app.crud.crud_room import get_room, update_room
from app.crud.crud_menu_product import get_menu_product, update_menu_product
from app.crud.crud_oa import get_oa, update_oa
from app.schemas.merchant import MerchantUpdate
from app.schemas.service import ServiceUpdate
from app.schemas.room import RoomUpdate
from app.schemas.menu_product import MenuProductUpdate
from app.schemas.oa import OAUpdate

router = APIRouter()

# Configure upload directory
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed file extensions
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def save_upload_file(upload_file: UploadFile, destination: Path) -> None:
    """Save uploaded file to destination"""
    try:
        with destination.open("wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)
    finally:
        upload_file.file.close()

def validate_image_file(file: UploadFile) -> None:
    """Validate uploaded image file"""
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file selected")
    
    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400, 
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Check file size (5MB limit)
    if hasattr(file, 'size') and file.size and file.size > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File size too large. Maximum 5MB allowed")

def generate_unique_filename(original_filename: str, folder: str) -> str:
    """Generate unique filename with UUID"""
    file_ext = Path(original_filename).suffix.lower()
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    return f"{folder}/{unique_filename}"

# Merchant upload endpoints
@router.post("/merchant/{merchant_id}/upload-logo")
async def upload_merchant_logo(
    merchant_id: int,
    logo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload merchant logo"""
    try:
        # Validate file
        validate_image_file(logo)
        
        # Check if merchant exists
        merchant = get_merchant(db, merchant_id)
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        # Generate unique filename
        filename = generate_unique_filename(logo.filename, "merchants/logos")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(logo, file_path)
        
        # Update merchant with new logo URL
        logo_url = f"/uploads/{filename}"
        update_data = MerchantUpdate(logo_url=logo_url)
        updated_merchant = update_merchant(db, merchant, update_data)
        
        return {"url": logo_url, "message": "Logo uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading logo: {str(e)}")

@router.post("/merchant/{merchant_id}/upload-cover")
async def upload_merchant_cover(
    merchant_id: int,
    cover: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload merchant cover image"""
    try:
        # Validate file
        validate_image_file(cover)
        
        # Check if merchant exists
        merchant = get_merchant(db, merchant_id)
        if not merchant:
            raise HTTPException(status_code=404, detail="Merchant not found")
        
        # Generate unique filename
        filename = generate_unique_filename(cover.filename, "merchants/covers")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(cover, file_path)
        
        # Update merchant with new cover URL
        cover_url = f"/uploads/{filename}"
        update_data = MerchantUpdate(cover_url=cover_url)
        updated_merchant = update_merchant(db, merchant, update_data)
        
        return {"url": cover_url, "message": "Cover uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading cover: {str(e)}")

# Service upload endpoints
@router.post("/service/{service_id}/upload-thumbnail")
async def upload_service_thumbnail(
    service_id: int,
    thumbnail: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload service thumbnail"""
    try:
        # Validate file
        validate_image_file(thumbnail)
        
        # Check if service exists
        service = get_service(db, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Generate unique filename
        filename = generate_unique_filename(thumbnail.filename, "services/thumbnails")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(thumbnail, file_path)
        
        # Update service with new thumbnail URL
        thumbnail_url = f"/uploads/{filename}"
        update_data = ServiceUpdate(thumbnail=thumbnail_url)
        updated_service = update_service(db, service, update_data)
        
        return {"url": thumbnail_url, "message": "Thumbnail uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading thumbnail: {str(e)}")

@router.post("/service/{service_id}/upload-image")
async def upload_service_image(
    service_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload service image"""
    try:
        # Validate file
        validate_image_file(image)
        
        # Check if service exists
        service = get_service(db, service_id)
        if not service:
            raise HTTPException(status_code=404, detail="Service not found")
        
        # Generate unique filename
        filename = generate_unique_filename(image.filename, "services/images")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(image, file_path)
        
        # Return image URL (can be stored in service_image table)
        image_url = f"/uploads/{filename}"
        
        return {"url": image_url, "message": "Image uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")

# Room upload endpoints
@router.post("/room/{room_id}/upload-image")
async def upload_room_image(
    room_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload room image"""
    try:
        # Validate file
        validate_image_file(image)
        
        # Check if room exists
        room = get_room(db, room_id)
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Generate unique filename
        filename = generate_unique_filename(image.filename, "rooms/images")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(image, file_path)
        
        # Return image URL (can be stored in room_image table)
        image_url = f"/uploads/{filename}"
        
        return {"url": image_url, "message": "Room image uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading room image: {str(e)}")

# Menu Product upload endpoints
@router.post("/menu-product/{product_id}/upload-image")
async def upload_menu_product_image(
    product_id: int,
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload menu product image"""
    try:
        # Validate file
        validate_image_file(image)
        
        # Check if product exists
        product = get_menu_product(db, product_id)
        if not product:
            raise HTTPException(status_code=404, detail="Menu product not found")
        
        # Generate unique filename
        filename = generate_unique_filename(image.filename, "menu-products/images")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(image, file_path)
        
        # Update product with new image URL
        image_url = f"/uploads/{filename}"
        update_data = MenuProductUpdate(image_url=image_url)
        updated_product = update_menu_product(db, product, update_data)
        
        return {"url": image_url, "message": "Product image uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading product image: {str(e)}")

# OA upload endpoints
@router.post("/oa/{oa_id}/upload-avatar")
async def upload_oa_avatar(
    oa_id: int,
    avatar: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload OA avatar"""
    try:
        # Validate file
        validate_image_file(avatar)
        
        # Check if OA exists
        oa = get_oa(db, oa_id)
        if not oa:
            raise HTTPException(status_code=404, detail="OA not found")
        
        # Generate unique filename
        filename = generate_unique_filename(avatar.filename, "oa/avatars")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(avatar, file_path)
        
        # Update OA with new avatar URL
        avatar_url = f"/uploads/{filename}"
        update_data = OAUpdate(avatar_url=avatar_url)
        updated_oa = update_oa(db, oa, update_data)
        
        return {"url": avatar_url, "message": "Avatar uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading avatar: {str(e)}")

@router.post("/oa/{oa_id}/upload-cover")
async def upload_oa_cover(
    oa_id: int,
    cover: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """Upload OA cover image"""
    try:
        # Validate file
        validate_image_file(cover)
        
        # Check if OA exists
        oa = get_oa(db, oa_id)
        if not oa:
            raise HTTPException(status_code=404, detail="OA not found")
        
        # Generate unique filename
        filename = generate_unique_filename(cover.filename, "oa/covers")
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(cover, file_path)
        
        # Update OA with new cover URL
        cover_url = f"/uploads/{filename}"
        update_data = OAUpdate(cover_url=cover_url)
        updated_oa = update_oa(db, oa, update_data)
        
        return {"url": cover_url, "message": "Cover uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading cover: {str(e)}")

# General upload endpoint
@router.post("/upload/image")
async def upload_general_image(
    file: UploadFile = File(...),
    folder: str = Form("general")
):
    """Upload general image file"""
    try:
        # Validate file
        validate_image_file(file)
        
        # Generate unique filename
        filename = generate_unique_filename(file.filename, folder)
        file_path = UPLOAD_DIR / filename
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Save file
        save_upload_file(file, file_path)
        
        image_url = f"/uploads/{filename}"
        return {"url": image_url, "message": "Image uploaded successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error uploading image: {str(e)}")
