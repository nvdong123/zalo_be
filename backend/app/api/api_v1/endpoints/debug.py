from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class SimpleTestModel(BaseModel):
    name: str
    message: Optional[str] = None

@router.get("/debug/health")
def debug_health():
    """Simple GET test - should always work"""
    return {"status": "ok", "method": "GET", "message": "Debug API is working"}

@router.post("/debug/test")
def debug_post(data: SimpleTestModel):
    """Simple POST test without any dependencies"""
    return {
        "status": "success",
        "method": "POST", 
        "received": {
            "name": data.name,
            "message": data.message
        },
        "message": "POST method is working without issues!"
    }

@router.put("/debug/test/{item_id}")
def debug_put(item_id: int, data: SimpleTestModel):
    """Simple PUT test without any dependencies"""
    return {
        "status": "success",
        "method": "PUT",
        "item_id": item_id,
        "received": {
            "name": data.name,
            "message": data.message  
        },
        "message": f"PUT method is working for item {item_id}!"
    }

@router.delete("/debug/test/{item_id}")
def debug_delete(item_id: int):
    """Simple DELETE test without any dependencies"""
    return {
        "status": "success",
        "method": "DELETE",
        "item_id": item_id,
        "message": f"DELETE method is working for item {item_id}!"
    }

@router.patch("/debug/test/{item_id}")
def debug_patch(item_id: int, data: dict):
    """Simple PATCH test without any dependencies"""
    return {
        "status": "success", 
        "method": "PATCH",
        "item_id": item_id,
        "received": data,
        "message": f"PATCH method is working for item {item_id}!"
    }
