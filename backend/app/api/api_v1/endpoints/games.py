from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.deps import get_db
from app.crud.crud_games import game
from app.schemas.games import GameCreate, GameRead, GameUpdate

router = APIRouter()

@router.get("/games", response_model=List[GameRead])
def read_games(
    tenant_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all games for a tenant"""
    return game.get_multi(db=db, tenant_id=tenant_id, skip=skip, limit=limit)

@router.post("/games", response_model=GameRead)
def create_game(
    *,
    tenant_id: int,
    obj_in: GameCreate,
    db: Session = Depends(get_db)
):
    """Create new game"""
    return game.create(db=db, obj_in=obj_in, tenant_id=tenant_id)

@router.get("/games/{item_id}", response_model=GameRead)
def read_game(
    *,
    item_id: int,
    tenant_id: int,
    db: Session = Depends(get_db)
):
    """Get game by ID"""
    obj = game.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Game not found")
    return obj

@router.put("/games/{item_id}", response_model=GameRead)
def update_game(
    *,
    item_id: int,
    tenant_id: int,
    obj_in: GameUpdate,
    db: Session = Depends(get_db)
):
    """Update game"""
    obj = game.get(db=db, id=item_id, tenant_id=tenant_id)
    if not obj:
        raise HTTPException(status_code=404, detail="Game not found")
    return game.update(db=db, db_obj=obj, obj_in=obj_in)

@router.delete("/games/{item_id}")
def delete_game(
    *,
    item_id: int,
    tenant_id: int,
    deleted_by: str = None,
    db: Session = Depends(get_db)
):
    """Delete game"""
    obj = game.remove(db=db, id=item_id, tenant_id=tenant_id, deleted_by=deleted_by)
    if not obj:
        raise HTTPException(status_code=404, detail="Game not found")
    return {"message": "Game deleted successfully"}
