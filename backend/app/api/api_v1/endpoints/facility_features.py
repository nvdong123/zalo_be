from fastapi import APIRouter

router = APIRouter()

@router.get("/facility-features")
async def get_facility_features():
    return {"message": "Facility Features endpoint"}
