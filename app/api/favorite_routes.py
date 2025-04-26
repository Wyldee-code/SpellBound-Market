from flask import Blueprint, jsonify
from flask_login import login_required, current_user
from app.models import db, Favorite, Product

favorite_routes = Blueprint('favorites', __name__)

# ✅ Get all favorited products for the current user
@favorite_routes.route('/', methods=['GET'])
@login_required
def get_favorites():
    favorites = Favorite.query.filter_by(user_id=current_user.id).all()
    product_ids = [f.product_id for f in favorites]
    products = Product.query.filter(Product.id.in_(product_ids)).all()
    return jsonify([p.to_dict() for p in products])

# ✅ Toggle favorite/unfavorite for a product
@favorite_routes.route('/<int:product_id>', methods=['POST'])
@login_required
def toggle_favorite(product_id):
    favorite = Favorite.query.filter_by(user_id=current_user.id, product_id=product_id).first()
    if favorite:
        db.session.delete(favorite)
        db.session.commit()
        return {"message": "Removed from favorites", "favorite": None}
    else:
        new_fav = Favorite(user_id=current_user.id, product_id=product_id)
        db.session.add(new_fav)
        db.session.commit()
        return {"message": "Added to favorites", "favorite": new_fav.to_dict()}, 201
