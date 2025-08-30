"""
Script to create sample games data for development
Usage: python scripts/create_sample_games.py
"""
import sys
import os
from datetime import datetime, timezone

# Add app directory to Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session_local import SessionLocal
from app.models.models import TblGames
from sqlalchemy.orm import Session

def create_sample_games():
    """Create sample games for development"""
    db: Session = SessionLocal()
    
    try:
        # Sample games data  
        sample_games = [
            {
                "tenant_id": 1,
                "game_name": "Vòng quay may mắn",
                "configurations": {
                    "description": "Quay vòng để nhận phần thưởng hấp dẫn",
                    "game_type": "spin_wheel",
                    "reward_type": "discount",
                    "reward_value": 15.0,
                    "max_plays_per_day": 3
                },
                "status": "active",
                "created_by": "admin"
            },
            {
                "tenant_id": 1,
                "game_name": "Rút thăm trúng thưởng",
                "configurations": {
                    "description": "Rút thăm để nhận điểm thưởng và voucher",
                    "game_type": "lucky_draw",
                    "reward_type": "points",
                    "reward_value": 100.0,
                    "max_plays_per_day": 5
                },
                "status": "active",
                "created_by": "admin"
            },
            {
                "tenant_id": 1,
                "game_name": "Đố vui khách sạn",
                "configurations": {
                    "description": "Trả lời câu hỏi về khách sạn để nhận quà",
                    "game_type": "quiz",
                    "reward_type": "voucher",
                    "reward_value": 50000.0,
                    "max_plays_per_day": 2
                },
                "status": "active",
                "created_by": "admin"
            },
            {
                "tenant_id": 1,
                "game_name": "Cào thẻ bí ẩn",
                "configurations": {
                    "description": "Cào thẻ để khám phá phần thưởng bất ngờ",
                    "game_type": "scratch_card",
                    "reward_type": "free_service",
                    "reward_value": 200000.0,
                    "max_plays_per_day": 1
                },
                "status": "inactive",
                "created_by": "admin"
            },
            {
                "tenant_id": 1,
                "game_name": "Trò chơi ghi nhớ",
                "configurations": {
                    "description": "Test trí nhớ để nhận phần thưởng",
                    "game_type": "memory_game",
                    "reward_type": "discount",
                    "reward_value": 10.0,
                    "max_plays_per_day": 3
                },
                "status": "active",
                "created_by": "admin"
            }
        ]
        
        # Check if games already exist
        existing_count = db.query(TblGames).filter(TblGames.tenant_id == 1).count()
        if existing_count > 0:
            print(f"Sample games already exist for tenant 1 (count: {existing_count})")
            return
        
        # Create games
        for game_data in sample_games:
            game = TblGames(**game_data)
            db.add(game)
        
        db.commit()
        print(f"Created {len(sample_games)} sample games successfully!")
        
        # Display created games
        games = db.query(TblGames).filter(TblGames.tenant_id == 1).all()
        print("\nCreated games:")
        for game in games:
            config = game.configurations or {}
            game_type = config.get('game_type', 'N/A')
            reward_type = config.get('reward_type', 'N/A')
            reward_value = config.get('reward_value', 'N/A')
            print(f"- {game.game_name} ({game_type}) - {reward_type}: {reward_value}")
            
    except Exception as e:
        print(f"Error creating sample games: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_games()
