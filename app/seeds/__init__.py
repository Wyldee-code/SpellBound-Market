from flask.cli import AppGroup
from app.models import db
from sqlalchemy.sql import text
import os

# ✅ Import updated seeders
from .users import seed_users, undo_users
from .product_seeds import seed_products, undo_products
from .favorite_seeds import seed_favorites, undo_favorites
from .review_seeds import seed_reviews, undo_reviews  # Optional if file exists

# Environment setup
environment = os.getenv("FLASK_ENV")
SCHEMA = os.environ.get("SCHEMA")

# CLI group for seeding via terminal
seed_commands = AppGroup('seed')

@seed_commands.command('all')
def seed():
    print("⚙️ Running full seed...")

    if environment == 'production':
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.favorites RESTART IDENTITY CASCADE;"))
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.reviews RESTART IDENTITY CASCADE;"))
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.products RESTART IDENTITY CASCADE;"))
        db.session.execute(text(f"TRUNCATE table {SCHEMA}.users RESTART IDENTITY CASCADE;"))
        db.session.commit()

    undo_favorites()
    undo_reviews()
    undo_products()
    undo_users()

    seed_users()
    seed_products()
    seed_reviews()
    seed_favorites()

    print("✅ Database seeded.")

@seed_commands.command('undo')
def undo():
    print("🔁 Reverting seed...")
    undo_favorites()
    undo_reviews()
    undo_products()
    undo_users()
    print("✅ Seed undo complete.")
