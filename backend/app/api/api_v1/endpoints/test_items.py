from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.deps import get_db
from app.crud.crud_test_items import crud_test_item
from app.schemas.test_items import TestItemCreate, TestItemUpdate, TestItemRead

router = APIRouter()

@router.get("/", response_model=List[TestItemRead])
def get_test_items(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of items to return"),
    status: str = Query("active", description="Filter by status"),
    search: str = Query(None, description="Search by name"),
    db: Session = Depends(get_db),
) -> Any:
    """
    Get test items for Zalo app - no authentication required
    """
    if search:
        items = crud_test_item.search_by_name(
            db, name=search, skip=skip, limit=limit
        )
    else:
        items = crud_test_item.get_multi_by_status(
            db, status=status, skip=skip, limit=limit
        )
    return items

@router.get("/{item_id}", response_model=TestItemRead)
def get_test_item(
    item_id: int,
    db: Session = Depends(get_db),
) -> Any:
    """
    Get a specific test item by ID
    """
    item = crud_test_item.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Test item not found")
    return item

@router.post("/", response_model=TestItemRead)
def create_test_item(
    *,
    db: Session = Depends(get_db),
    item_in: TestItemCreate,
) -> Any:
    """
    Create a new test item
    """
    item = crud_test_item.create(db=db, obj_in=item_in)
    return item

@router.put("/{item_id}", response_model=TestItemRead)
def update_test_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
    item_in: TestItemUpdate,
) -> Any:
    """
    Update a test item
    """
    item = crud_test_item.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Test item not found")
    
    item = crud_test_item.update(db=db, db_obj=item, obj_in=item_in)
    return item

@router.delete("/{item_id}")
def delete_test_item(
    *,
    db: Session = Depends(get_db),
    item_id: int,
) -> Any:
    """
    Delete a test item
    """
    item = crud_test_item.get(db=db, id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Test item not found")
    
    crud_test_item.remove(db=db, id=item_id)
    return {"message": "Test item deleted successfully"}
