"""
Main API router that includes all endpoint routers
"""

from fastapi import APIRouter

from app.api.api_v1.endpoints import (
    tenants,
    admin_users,
    rooms,
    customers,
    booking_requests,
    promotions,
    vouchers,
    services,
    facilities,
    experiences,
    hotel_brands,
    auth,
    facility_images,
    facility_videos,
    facility_vr360s,
    room_images,
    room_videos,
    room_vr360s
)

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(admin_users.router, prefix="/api/v1", tags=["admin-users"])
api_router.include_router(tenants.router, prefix="/api/v1/tenants", tags=["tenants"])
api_router.include_router(rooms.router, prefix="/api/v1/rooms", tags=["rooms"])
api_router.include_router(customers.router, prefix="/api/v1/customers", tags=["customers"])
api_router.include_router(booking_requests.router, prefix="/api/v1/booking-requests", tags=["booking-requests"])
api_router.include_router(promotions.router, prefix="/api/v1/promotions", tags=["promotions"])
api_router.include_router(vouchers.router, prefix="/api/v1/vouchers", tags=["vouchers"])
api_router.include_router(services.router, prefix="/api/v1/services", tags=["services"])
api_router.include_router(facilities.router, prefix="/api/v1/facilities", tags=["facilities"])
api_router.include_router(experiences.router, prefix="/api/v1/experiences", tags=["experiences"])
api_router.include_router(hotel_brands.router, prefix="/api/v1/hotel-brands", tags=["hotel-brands"])

# Authentication endpoints
api_router.include_router(auth.router, prefix="/api/v1/auth", tags=["authentication"])

# Media endpoints
api_router.include_router(facility_images.router, prefix="/api/v1/media", tags=["facility-images"])
api_router.include_router(facility_videos.router, prefix="/api/v1/media", tags=["facility-videos"])
api_router.include_router(facility_vr360s.router, prefix="/api/v1/media", tags=["facility-vr360s"])
api_router.include_router(room_images.router, prefix="/api/v1/media", tags=["room-images"])
api_router.include_router(room_videos.router, prefix="/api/v1/media", tags=["room-videos"])
api_router.include_router(room_vr360s.router, prefix="/api/v1/media", tags=["room-vr360s"])
