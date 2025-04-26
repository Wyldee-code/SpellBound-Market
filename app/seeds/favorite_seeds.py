from app.models import db, Favorite
from sqlalchemy.sql import text
import os

environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

def seed_favorites():
    favorites = [
        Favorite(user_id=1, product_id=1),
        Favorite(user_id=2, product_id=1),
    ]
    db.session.add_all(favorites)
    db.session.commit()

def undo_favorites():
    if environment == "production":
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.favorites RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM favorites"))
    db.session.commit()
