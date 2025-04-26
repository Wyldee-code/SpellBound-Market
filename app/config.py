import os

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key')  # ✅ fallback for local
    FLASK_RUN_PORT = os.environ.get('FLASK_RUN_PORT', 9000)
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ECHO = True  # Log SQL queries in dev
    DEBUG = os.environ.get("FLASK_ENV") != "production"  # Optional

    # ✅ Handle postgres:// → postgresql:// for Heroku/Render
    database_url = os.environ.get('DATABASE_URL', 'sqlite:///dev.db')
    SQLALCHEMY_DATABASE_URI = database_url.replace('postgres://', 'postgresql://')

    # ✅ Schema search_path for Render
    if os.getenv("FLASK_ENV") == "production":
        SCHEMA = os.environ.get("SCHEMA")
        SQLALCHEMY_ENGINE_OPTIONS = {
            "connect_args": {
                "options": f"-c search_path={SCHEMA},public"
            }
        }
