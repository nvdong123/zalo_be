from fastapi import APIRouter

router = APIRouter()

@router.get("/room-amenities")
async def get_room_amenities():
    return {"message": "Room Amenities endpoint"}
