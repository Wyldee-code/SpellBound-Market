from flask import Blueprint, request
from app.models import db, CartItem
from flask_login import login_required, current_user

cart_routes = Blueprint('cart', __name__)

# ✅ View all cart items
@cart_routes.route('', methods=['GET'])
@login_required
def get_cart_items():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    return {"cart_items": [item.to_dict() for item in cart_items]}

# ✅ Add or update (increment) an item in the cart
@cart_routes.route('', methods=['POST'])
@login_required
def add_cart_item():
    data = request.get_json()

    existing_item = CartItem.query.filter_by(
        user_id=current_user.id,
        product_id=data['product_id']
    ).first()

    if existing_item:
        existing_item.quantity += data.get('quantity', 1)
    else:
        existing_item = CartItem(
            user_id=current_user.id,
            product_id=data['product_id'],
            quantity=data.get('quantity', 1)
        )
        db.session.add(existing_item)

    db.session.commit()
    return existing_item.to_dict(), 200

# ✅ Update the quantity of a specific cart item
@cart_routes.route('/<int:cart_item_id>', methods=['POST'])
@login_required
def update_cart_item(cart_item_id):
    cart_item = CartItem.query.get_or_404(cart_item_id)

    if cart_item.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    data = request.get_json()
    new_quantity = data.get('quantity')

    if new_quantity is None or int(new_quantity) < 1:
        return {"error": "Quantity must be at least 1."}, 400

    cart_item.quantity = int(new_quantity)
    db.session.commit()
    return cart_item.to_dict(), 200

# ✅ Delete a specific item from the cart
@cart_routes.route('/<int:cart_item_id>', methods=['DELETE'])
@login_required
def delete_cart_item(cart_item_id):
    cart_item = CartItem.query.get_or_404(cart_item_id)

    if cart_item.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    db.session.delete(cart_item)
    db.session.commit()
    return {"message": "Cart item deleted successfully"}, 200

# ✅ Checkout (complete purchase and clear cart)
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

# ✅ Clear entire cart without performing a checkout
@cart_routes.route('/clear', methods=['DELETE'])
@login_required
def clear_cart():
    CartItem.query.filter_by(user_id=current_user.id).delete()
    db.session.commit()
    return {"message": "Cart cleared successfully"}, 200
