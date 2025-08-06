from fastapi import APIRouter

router = APIRouter()

@router.get("/room-features")
async def get_room_features():
    return {"message": "Room Features endpoint"}
