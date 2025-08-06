from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.crud.base import CRUDBase
from app.models.models import TblGames
from app.schemas.games import GameCreate, GameUpdate


class CRUDGame(CRUDBase[TblGames, GameCreate, GameUpdate]):
    def get_by_name(
        self, 
        db: Session, 
        *, 
        game_name: str,
        tenant_id: int
    ) -> Optional[TblGames]:
        """Get game by name"""
        return db.query(TblGames).filter(
            and_(
                TblGames.game_name == game_name,
                TblGames.tenant_id == tenant_id,
                TblGames.deleted == 0
            )
        ).first()

    def get_by_category(
        self,
        db: Session,
        *,
        category: str,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblGames]:
        """Get games by category"""
        return db.query(TblGames).filter(
            and_(
                TblGames.category == category,
                TblGames.tenant_id == tenant_id,
                TblGames.deleted == 0
            )
        ).offset(skip).limit(limit).all()

    def get_active_games(
        self,
        db: Session,
        *,
        tenant_id: int,
        skip: int = 0,
        limit: int = 100
    ) -> List[TblGames]:
        """Get active games"""
        return db.query(TblGames).filter(
            and_(
                TblGames.is_active == True,
                TblGames.tenant_id == tenant_id,
                TblGames.deleted == 0
            )
        ).offset(skip).limit(limit).all()


game = CRUDGame(TblGames)
