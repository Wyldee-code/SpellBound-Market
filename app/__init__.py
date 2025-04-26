# app/__init__.py

import os
from flask import Flask, request, redirect
from flask_cors import CORS
from flask_migrate import Migrate, upgrade
from flask_wtf.csrf import generate_csrf
from flask_login import LoginManager
from .models import db, User
from .api.user_routes import user_routes
from .api.auth_routes import auth_routes
from .api.favorite_routes import favorite_routes
from .api.image_routes import image_routes
from .api.cart_routes import cart_routes
from .api.review_routes import review_routes
from .api.product_routes import product_routes
from .seeds import seed_commands
from .config import Config

def run_migrations_and_seed(app):
    if os.environ.get("RUN_MIGRATIONS") == "true":
        print("🛠️ Running database migrations and checking seeds...")

        with app.app_context():
            try:
                upgrade()

                demo_user = User.query.filter_by(email="demo@aa.io").first()
                if demo_user:
                    print("✅ Demo user already exists. Skipping seeding.")
                    return

                print("🌱 Seeding base data (users, products, reviews, favorites)...")
                from app.seeds import seed_users, seed_products, seed_reviews, seed_favorites
                seed_users()
                seed_products()
                seed_reviews()
                seed_favorites()
                print("✅ Seeding complete!")

            except Exception as e:
                print(f"❌ Migration/seed error: {e}")

def create_app():
    print("🔮 Creating Spellbound Market app...")

    app = Flask(__name__, static_folder='../react-vite/dist', static_url_path='/')
    app.config.from_object(Config)

    login = LoginManager(app)
    login.login_view = 'auth.unauthorized'

    @login.user_loader
    def load_user(id):
        return User.query.get(int(id))

    app.cli.add_command(seed_commands)

    db.init_app(app)
    Migrate(app, db)
    CORS(app, supports_credentials=True)

    # Register blueprints
    app.register_blueprint(user_routes, url_prefix='/api/users')
    app.register_blueprint(auth_routes, url_prefix='/api/auth')
    app.register_blueprint(product_routes, url_prefix='/api/products')
    app.register_blueprint(favorite_routes, url_prefix='/api/favorites')
    app.register_blueprint(image_routes, url_prefix='/api/images')
    app.register_blueprint(cart_routes, url_prefix='/api/cart')
    app.register_blueprint(review_routes, url_prefix='/api/reviews')

    # Redirect HTTP -> HTTPS in production
    @app.before_request
    def https_redirect():
        if os.environ.get('FLASK_ENV') == 'production' and request.headers.get('X-Forwarded-Proto') == 'http':
            url = request.url.replace('http://', 'https://', 1)
            return redirect(url, code=301)

    # CSRF Protection
    @app.after_request
    def inject_csrf_token(response):
        response.set_cookie(
            'csrf_token',
            generate_csrf(),
            secure=os.environ.get('FLASK_ENV') == 'production',
            samesite='Strict' if os.environ.get('FLASK_ENV') == 'production' else None,
            httponly=False
        )
        return response

    # API Routes
    @app.route("/api/csrf/restore")
    def restore_csrf():
        return {"message": "CSRF cookie set"}

    @app.route("/api/docs")
    def api_docs():
        acceptable_methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
        return {
            rule.rule: [
                [method for method in rule.methods if method in acceptable_methods],
                app.view_functions[rule.endpoint].__doc__
            ]
            for rule in app.url_map.iter_rules()
            if rule.endpoint != 'static'
        }

    # Serve React Frontend
    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_react(path):
        if path == 'favicon.ico':
            return app.send_from_directory('public', 'favicon.ico')
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def not_found(e):
        return app.send_static_file('index.html')

    # Run auto-migrations + seeding if requested
    run_migrations_and_seed(app)

    print("✅ Spellbound Market Flask app ready!")
    return app
