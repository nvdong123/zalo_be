from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
import shutil
import os
from datetime import datetime
import uuid

router = APIRouter()

# Ensure upload directory exists
UPLOAD_DIR = "uploads/rooms"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload/room/{room_id}/image")
async def upload_room_image(room_id: int, file: UploadFile = File(...)):
    """Upload image for a specific room"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Generate unique filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        unique_filename = f"room_{room_id}_{uuid.uuid4().hex[:8]}.{file_extension}"
        file_path = os.path.join(UPLOAD_DIR, unique_filename)
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Return URL (adjust base URL as needed)
        file_url = f"/uploads/rooms/{unique_filename}"
        
        return JSONResponse({
            "success": True,
            "url": file_url,
            "filename": unique_filename,
            "room_id": room_id
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.get("/test/room/images")
async def test_room_images():
    """Test endpoint to return sample room images"""
    return {
        "success": True,
        "images": [
            "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=300&fit=crop",
            "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400&h=300&fit=crop"
        ]
    }
