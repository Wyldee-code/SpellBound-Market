from flask import Blueprint, request
from app.models import User, db
from flask_login import current_user, login_user, logout_user
import traceback
from sqlalchemy import text

auth_routes = Blueprint('auth', __name__)

# ✅ Authenticate session
@auth_routes.route('/')
def authenticate():
    """Authenticates a user."""
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {'errors': {'message': 'Unauthorized'}}, 401

# ✅ Login with JSON (not FlaskForm anymore)
@auth_routes.route('/login', methods=['POST'])
def login():
    """Logs a user in."""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')

        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            print("❌ Invalid login attempt.")
            return {"errors": ["Invalid credentials."]}, 401

        login_user(user)
        print("✅ Login success:", user.email)
        return user.to_dict()

    except Exception as e:
        print("🔥 Login error:", str(e))
        traceback.print_exc()
        return {"errors": ["Server error. Please try again."]}, 500

# ✅ Logout
@auth_routes.route('/logout', methods=['POST'])
def logout():
    """Logs a user out."""
    logout_user()
    return {'message': 'User logged out'}

# ✅ Signup with JSON
@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """Creates a new user and logs them in."""
    try:
        data = request.get_json()
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')

        if not username or not email or not password:
            return {"errors": ["All fields are required."]}, 400

        existing_user = User.query.filter(
            (User.email == email) | (User.username == username)
        ).first()

        if existing_user:
            return {"errors": ["Email or Username already exists."]}, 400

        new_user = User(username=username, email=email, password=password)
        db.session.add(new_user)
        db.session.commit()

        login_user(new_user)
        print("✅ Signup successful:", new_user.email)
        return new_user.to_dict()

    except Exception as e:
        print("🔥 Signup error:", str(e))
        traceback.print_exc()
        return {"errors": ["Server error. Please try again."]}, 500

# ✅ Unauthorized fallback
@auth_routes.route('/unauthorized')
def unauthorized():
    """Returns unauthorized response for unauthenticated access."""
    return {'errors': {'message': 'Unauthorized'}}, 401

# 🚨 TEMP: Wipe ghost alembic migration on Render
@auth_routes.route('/force-wipe-alembic', methods=['GET'])
def wipe_ghost_revision():
    """Deletes ghost alembic_version entries. DELETE ME after deployment."""
    try:
        db.session.execute(text("DELETE FROM alembic_version"))
        db.session.commit()
        print("✅ Successfully wiped alembic ghost revision.")
        return {"message": "✅ Alembic ghost revision wiped"}, 200
    except Exception as e:
        db.session.rollback()
        print("🔥 Failed to wipe alembic version:", str(e))
        return {"error": str(e)}, 500

@auth_routes.route('/create-demo-user')
def create_demo_user():
    """Temporarily create a demo user if not exists."""
    existing = User.query.filter_by(email="demo@aa.io").first()
    if existing:
        return {"message": "Demo user already exists."}, 200

    demo_user = User(
        username="DemoUser",
        email="demo@aa.io",
        password="password"
    )
    db.session.add(demo_user)
    db.session.commit()
    return {"message": "✅ Demo user created successfully."}, 201
