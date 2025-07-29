from fastapi import APIRouter, Depends, HTTPException, status, Form, Query
from sqlmodel import Session, select, func
from typing import List
from app.db.session import get_db
from app.schemas.user import UserCreate, UserRead, UserUpdate, UserListResponse
from app.crud.crud_user import create_user, get_user_by_email, authenticate_user, get_user, update_user, delete_user, get_users
from app.models.user import User

router = APIRouter()

@router.get("/users", response_model=UserListResponse)
def read_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    email: str = Query(None),
    full_name: str = Query(None),
    is_active: bool = Query(None),
    is_superuser: bool = Query(None),
    db: Session = Depends(get_db)
):
    """Get list of users with optional filters"""
    try:
        # Get all users first
        users = get_users(db, skip=skip, limit=limit)
        
        # Apply filters if provided
        if email:
            users = [u for u in users if email.lower() in u.email.lower()]
        if full_name:
            users = [u for u in users if full_name.lower() in (u.full_name or "").lower()]
        if is_active is not None:
            users = [u for u in users if u.is_active == is_active]
        if is_superuser is not None:
            users = [u for u in users if u.is_superuser == is_superuser]
        
        return {
            "data": users,
            "total": len(users)
        }
    except Exception as e:
        print(f"Error in read_users: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/stats")
def get_user_stats(db: Session = Depends(get_db)):
    """Get user statistics"""
    try:
        # Count total users
        total_users = db.exec(select(func.count(User.id))).first()
        
        # Count active users
        active_users = db.exec(select(func.count(User.id)).where(User.is_active == True)).first()
        
        # Count inactive users
        inactive_users = db.exec(select(func.count(User.id)).where(User.is_active == False)).first()
        
        # Count admin users
        admin_users = db.exec(select(func.count(User.id)).where(User.is_superuser == True)).first()
        
        return {
            "data": {
                "total": total_users or 0,
                "active": active_users or 0,
                "inactive": inactive_users or 0,
                "admins": admin_users or 0,
                "users": (total_users or 0) - (admin_users or 0)
            }
        }
    except Exception as e:
        print(f"Error getting user stats: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/user/menu")
def get_user_menu(current_user_email: str = Query(...), db: Session = Depends(get_db)):
    """Get user menu based on role and permissions"""
    try:
        # Get user by email to check role
        user = get_user_by_email(db, current_user_email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if user.is_superuser:
            # Admin menu - full access
            return {
                "menu": [
                    {
                        "key": "dashboard",
                        "title": "Dashboard",
                        "icon": "dashboard",
                        "path": "/dashboard"
                    },
                    {
                        "key": "merchant",
                        "title": "Quản lý Merchant",
                        "icon": "shop",
                        "path": "/merchant"
                    },
                    {
                        "key": "user",
                        "title": "Quản lý User",
                        "icon": "user",
                        "path": "/user"
                    },
                    {
                        "key": "ui-components",
                        "title": "UI Components",
                        "icon": "setting",
                        "children": [
                            {
                                "key": "button-name",
                                "title": "Button Name",
                                "path": "/button-name"
                            },
                            {
                                "key": "cover-share-popup", 
                                "title": "Cover Share Popup",
                                "path": "/cover-share-popup"
                            },
                            {
                                "key": "oa",
                                "title": "OA",
                                "path": "/oa"
                            }
                        ]
                    }
                ]
            }
        else:
            # Merchant menu - limited access (no UI Components)
            return {
                "menu": [
                    {
                        "key": "dashboard",
                        "title": "Dashboard", 
                        "icon": "dashboard",
                        "path": "/dashboard"
                    },
                    {
                        "key": "menu-system",
                        "title": "Menu System",
                        "icon": "menu",
                        "children": [
                            {
                                "key": "menu-category",
                                "title": "Menu Category",
                                "path": "/menu-category"
                            },
                            {
                                "key": "menu-product",
                                "title": "Menu Product", 
                                "path": "/menu-product"
                            },
                            {
                                "key": "menu-topping",
                                "title": "Menu Topping",
                                "path": "/menu-topping"
                            }
                        ]
                    },
                    {
                        "key": "order-system",
                        "title": "Order System",
                        "icon": "shopping-cart",
                        "children": [
                            {
                                "key": "orders",
                                "title": "Orders",
                                "path": "/orders"
                            },
                            {
                                "key": "order-item",
                                "title": "Order Items",
                                "path": "/order-item"
                            },
                            {
                                "key": "order-item-topping",
                                "title": "Order Item Topping",
                                "path": "/order-item-topping"
                            }
                        ]
                    },
                    {
                        "key": "room-system",
                        "title": "Room Management",
                        "icon": "home",
                        "children": [
                            {
                                "key": "room",
                                "title": "Rooms",
                                "path": "/room"
                            },
                            {
                                "key": "room-character",
                                "title": "Room Character",
                                "path": "/room-character"
                            },
                            {
                                "key": "room-image",
                                "title": "Room Images",
                                "path": "/room-image"
                            },
                            {
                                "key": "room-tag",
                                "title": "Room Tags",
                                "path": "/room-tag"
                            },
                            {
                                "key": "room-utility",
                                "title": "Room Utilities", 
                                "path": "/room-utility"
                            }
                        ]
                    },
                    {
                        "key": "promotion-system",
                        "title": "Promotion System",
                        "icon": "gift",
                        "children": [
                            {
                                "key": "promotion",
                                "title": "Promotions",
                                "path": "/promotion"
                            },
                            {
                                "key": "promotion-suggest",
                                "title": "Promotion Suggest",
                                "path": "/promotion-suggest"
                            }
                        ]
                    },
                    {
                        "key": "service-system",
                        "title": "Service System",
                        "icon": "star",
                        "children": [
                            {
                                "key": "service",
                                "title": "Services",
                                "path": "/service"
                            },
                            {
                                "key": "service-benefit",
                                "title": "Service Benefits",
                                "path": "/service-benefit"
                            },
                            {
                                "key": "service-image",
                                "title": "Service Images",
                                "path": "/service-image"
                            }
                        ]
                    }
                ]
            }
            
    except Exception as e:
        print(f"Error getting user menu: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/users/signup", response_model=UserRead)
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    user = get_user_by_email(db, user_in.email)
    if user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return create_user(db, user_in)

@router.post("/users", response_model=UserRead)
@router.post("/users/", response_model=UserRead)
def create_user_endpoint(user_in: UserCreate, db: Session = Depends(get_db)):
    """Create a new user"""
    try:
        # Check if user already exists
        existing_user = get_user_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create the user
        return create_user(db, user_in)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/users/{user_id}", response_model=UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.put("/users/{user_id}", response_model=UserRead)
def update_user_view(user_id: int, obj_in: UserUpdate, db: Session = Depends(get_db)):
    db_obj = get_user(db, user_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="User not found")
    return update_user(db, db_obj, obj_in)

@router.delete("/users/{user_id}")
def delete_user_view(user_id: int, db: Session = Depends(get_db)):
    delete_user(db, user_id)
    return {"ok": True}

@router.patch("/users/{user_id}/status")
def toggle_user_status(user_id: int, is_active: bool, db: Session = Depends(get_db)):
    """Toggle user active status"""
    try:
        user = get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        user.is_active = is_active
        db.add(user)
        db.commit()
        db.refresh(user)
        
        return {"ok": True, "message": f"User {'activated' if is_active else 'deactivated'} successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error toggling user status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/users/{user_id}/password")
def change_user_password(user_id: int, password_data: dict, db: Session = Depends(get_db)):
    """Change user password"""
    try:
        user = get_user(db, user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_password = password_data.get("password")
        if not new_password:
            raise HTTPException(status_code=400, detail="Password is required")
        
        from app.crud.crud_user import get_password_hash
        user.hashed_password = get_password_hash(new_password)
        db.add(user)
        db.commit()
        
        return {"ok": True, "message": "Password changed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error changing password: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login/access-token")
def login(
    email: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    """Authenticate user with database credentials"""
    try:
        user = authenticate_user(db, email, password)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, 
                detail="Incorrect email or password"
            )
        
        # Generate JWT token (simplified implementation)
        import base64, time
        token = base64.b64encode(f"{user.id}:{user.email}:{int(time.time())}".encode()).decode()
        
        return {
            "token": token,
            "username": user.email,
            "role": "admin" if getattr(user, "is_superuser", False) else "user"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/logout")
def logout():
    """Logout user (token invalidation handled on client side)"""
    return {"message": "Logged out successfully"}
