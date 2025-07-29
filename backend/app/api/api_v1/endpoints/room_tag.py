from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List

from app.db.session import get_db
from app.models.room_tag import RoomTag

router = APIRouter()

@router.get("/room_tag/")
def read_room_tags(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    room_id: int = Query(None),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách room tags.
    """
    try:
        print(f"Getting room tags with skip={skip}, limit={limit}")
        
        query = select(RoomTag)
        if room_id:
            query = query.where(RoomTag.room_id == room_id)
            
        room_tags = db.exec(query.offset(skip).limit(limit)).all()
        print(f"Found {len(room_tags)} room tags")
        
        result = []
        for tag in room_tags:
            result.append({
                "id": tag.id,
                "room_id": tag.room_id,
                "tag": tag.tag
            })
        return result
    except Exception as e:
        print(f"Error in read_room_tags: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/room_tag/{id}")
def read_room_tag(id: int, db: Session = Depends(get_db)):
    """
    Lấy room tag theo ID.
    """
    try:
        room_tag = db.exec(select(RoomTag).where(RoomTag.id == id)).first()
        if not room_tag:
            raise HTTPException(status_code=404, detail="RoomTag not found")
        
        return {
            "id": room_tag.id,
            "room_id": room_tag.room_id,
            "tag": room_tag.tag
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in read_room_tag: {e}")
        raise HTTPException(status_code=500, detail=str(e))
