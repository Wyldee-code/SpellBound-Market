from flask import Blueprint, request
from app.models import User, db
from app.forms import LoginForm, SignUpForm
from flask_login import current_user, login_user, logout_user
import traceback
from sqlalchemy import text  # ✅ Needed for raw SQL execution

auth_routes = Blueprint('auth', __name__)

@auth_routes.route('/')
def authenticate():
    """Authenticates a user."""
    if current_user.is_authenticated:
        return current_user.to_dict()
    return {'errors': {'message': 'Unauthorized'}}, 401

@auth_routes.route('/login', methods=['POST'])
def login():
    """Logs a user in"""
    form = LoginForm()
    form['csrf_token'].data = request.cookies.get('csrf_token')  # ✅ Get CSRF from cookie

    data = request.get_json()  # ✅ Get JSON from request
    form.email.data = data.get('email')
    form.password.data = data.get('password')

    print("🔐 Attempting login with:", data)

    if form.validate_on_submit():
        user = User.query.filter(User.email == form.email.data).first()
        if not user:
            print("❌ No user found with that email.")
            return {"errors": ["Invalid credentials."]}, 401

        login_user(user)
        print("✅ Login success:", user.email)
        return user.to_dict()

    print("❌ Validation failed:", form.errors)
    return {"errors": form.errors}, 401

@auth_routes.route('/logout', methods=['POST'])
def logout():
    """Logs a user out"""
    logout_user()
    return {'message': 'User logged out'}

@auth_routes.route('/signup', methods=['POST'])
def sign_up():
    """Creates a new user and logs them in"""
    try:
        form = SignUpForm()
        csrf_token = request.cookies.get("csrf_token")
        form['csrf_token'].data = csrf_token

        print("📝 Signup request:")
        print("📥 Request JSON:", request.json)
        print("🔒 CSRF token:", csrf_token)

        if form.validate_on_submit():
            user = User(
                username=form.data['username'],
                email=form.data['email'],
                password=form.data['password']
            )
            db.session.add(user)
            db.session.commit()
            login_user(user)
            print("✅ Signup successful:", user.email)
            return user.to_dict()

        print("❌ Signup form errors:", form.errors)
        return {"errors": form.errors}, 401

    except Exception as e:
        print("🔥 Exception during signup:", str(e))
        traceback.print_exc()
        return {"errors": ["Server error. Please try again."]}, 500

@auth_routes.route('/unauthorized')
def unauthorized():
    """Returns unauthorized response for unauthenticated access"""
    return {'errors': {'message': 'Unauthorized'}}, 401

# 🚨 TEMPORARY ROUTE TO DELETE GHOST MIGRATION ON RENDER
@auth_routes.route('/force-wipe-alembic', methods=['GET'])
def wipe_ghost_revision():
    """
    Nukes ghost alembic_version entries (used to fix Render migrations).
    DELETE ME after first successful deploy.
    """
    try:
        db.session.execute(text("DELETE FROM alembic_version"))
        db.session.commit()
        print("✅ Successfully wiped alembic ghost revision on Render")
        return {"message": "✅ Alembic ghost revision wiped"}, 200
    except Exception as e:
        db.session.rollback()
        print("🔥 Failed to wipe alembic version:", str(e))
        return {"error": str(e)}, 500
