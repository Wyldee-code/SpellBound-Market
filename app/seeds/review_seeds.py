from app.models import db, Review
from sqlalchemy.sql import text
import os

environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

def seed_reviews():
    reviews = [
        Review(
            comment="Absolutely love this amethyst! It's even more stunning in person.",
            rating=5,
            product_id=1,
            user_id=1
        ),
        Review(
            comment="Very cool wall hanging. It adds such a nice vibe to my room.",
            rating=4,
            product_id=2,
            user_id=2
        ),
        Review(
            comment="Was a bit smaller than I expected, but still beautiful!",
            rating=3,
            product_id=1,
            user_id=3
        )
    ]

    db.session.add_all(reviews)
    db.session.commit()

def undo_reviews():
    if environment == "production":
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.reviews RESTART IDENTITY CASCADE;"))
    else:
        db.session.execute(text("DELETE FROM reviews"))

    db.session.commit()
