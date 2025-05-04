from app.models import db, Product
from sqlalchemy.sql import text
import datetime
import os

environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

def seed_products():
    products = [
        Product(
            name="Amethyst Crystal",
            type="crystals",
            price=14.99,
            description="A raw amethyst crystal for spiritual protection and peace.",
            image_url="/Amethyst.jpg",  # ✅ Exact match from /public folder
            user_id=1,
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now()
        ),
        Product(
            name="Moon Phase Wall Hanging",
            type="home_decor",
            price=29.99,
            description="Handmade brass wall art featuring the phases of the moon.",
            image_url="/moon phase wallhanging.png",  # ✅ Exact match
            user_id=2,
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now()
        )
    ]
    db.session.add_all(products)
    db.session.commit()

def undo_products():
    if environment == "production":
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.products RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM products"))
    db.session.commit()
