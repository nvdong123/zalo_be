from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db, get_current_admin_user, verify_tenant_permission
from app.crud.crud_games import game
from app.schemas.games import GameCreate, GameRead, GameUpdate, GameCreateRequest, GameUpdateRequest
from app.models.models import TblAdminUsers

router = APIRouter()

@router.get("/games", response_model=List[GameRead])
def read_games(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get all games for a tenant"""
    verify_tenant_permission(tenant_id, current_user)
    return game.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/games", response_model=GameRead)
def create_game(
    *,
    tenant_id: int,
    obj_in: GameCreateRequest,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Create new game"""
    verify_tenant_permission(tenant_id, current_user)
    
    # Convert GameCreateRequest to GameCreate with tenant_id
    game_data = obj_in.dict()
    game_data['tenant_id'] = tenant_id
    game_data['created_by'] = current_user.username
    game_create = GameCreate(**game_data)
    
    return game.create(db=db, obj_in=game_create, tenant_id=tenant_id)

@router.get("/games/{item_id}", response_model=GameRead)
def read_game(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Get game by ID"""
    verify_tenant_permission(tenant_id, current_user)
    obj = game.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Game not found")
    return obj

@router.put("/games/{item_id}", response_model=GameRead)
def update_game(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: GameUpdateRequest,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Update game"""
    verify_tenant_permission(tenant_id, current_user)
    obj = game.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Game not found")
    
    # Convert GameUpdateRequest to GameUpdate with updated_by
    game_data = obj_in.dict(exclude_unset=True)
    game_data['updated_by'] = current_user.username
    game_update = GameUpdate(**game_data)
    
    return game.update(db=db, db_obj=obj, obj_in=game_update)

@router.delete("/games/{item_id}")
def delete_game(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db),
    current_user: TblAdminUsers = Depends(get_current_admin_user)
):
    """Delete game"""
    verify_tenant_permission(tenant_id, current_user)
    obj = game.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=current_user.username)
    if not obj:
        raise HTTPException(status_code=404, detail="Game not found")
    return {"message": "Game deleted successfully"}
