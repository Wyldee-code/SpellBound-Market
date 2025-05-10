from flask import Blueprint, request
from app.models import db, CartItem, Product
from flask_login import login_required, current_user

cart_routes = Blueprint('cart', __name__)

# ✅ Get all cart items for the current user
@cart_routes.route('', methods=['GET'])
@login_required
def get_cart_items():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    return {
        "cart_items": [item.to_dict(include_product=True) for item in cart_items]
    }

# ✅ Add an item to the cart or increment quantity
@cart_routes.route('', methods=['POST'])
@login_required
def add_cart_item():
    data = request.get_json()

    if not data.get("product_id"):
        return {"error": "Missing product_id"}, 400

    product = Product.query.get(data["product_id"])
    if not product:
        return {"error": "Product not found"}, 404

    quantity = int(data.get("quantity", 1))
    if quantity < 1:
        return {"error": "Quantity must be at least 1"}, 400

    existing_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=product.id
    ).first()

    if existing_item:
        existing_item.quantity += quantity
    else:
        existing_item = CartItem(
            user_id=current_user.id,
            product_id=product.id,
            quantity=quantity
        )
        db.session.add(existing_item)

    db.session.commit()
    return existing_item.to_dict(include_product=True), 200

# ✅ Update quantity for a cart item
@cart_routes.route('/<int:cart_item_id>', methods=['POST'])
@login_required
def update_cart_item(cart_item_id):
    cart_item = CartItem.query.get_or_404(cart_item_id)

    if cart_item.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    quantity = int(data.get("quantity", 0))

    if quantity < 1:
        return {"error": "Quantity must be at least 1"}, 400

    cart_item.quantity = quantity
    db.session.commit()

    return cart_item.to_dict(include_product=True), 200

# ✅ Remove a specific item
@cart_routes.route('/<int:cart_item_id>', methods=['DELETE'])
@login_required
def delete_cart_item(cart_item_id):
    cart_item = CartItem.query.get_or_404(cart_item_id)

    if cart_item.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    db.session.delete(cart_item)
    db.session.commit()

    return {"message": "Item removed from cart"}, 200

# ✅ Clear the cart
@cart_routes.route('/clear', methods=['DELETE'])
@login_required
def clear_cart():
    CartItem.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return {"message": "Cart cleared"}, 200

# ✅ Checkout the cart
@cart_routes.route('/checkout', methods=['POST'])
@login_required
def checkout_cart():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()

    if not cart_items:
        return {"error": "Cart is already empty"}, 400

    for item in cart_items:
        db.session.delete(item)
    db.session.commit()

    return {"message": "Checkout successful"}, 200
