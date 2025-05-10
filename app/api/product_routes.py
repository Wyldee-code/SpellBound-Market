from flask import Blueprint, request, jsonify
from ..models import db, Product
from ..models.cart_item import CartItem  # ✅ import CartItem model
from flask_login import login_required, current_user
import datetime

product_routes = Blueprint('products', __name__)

DEFAULT_IMAGE_URL = "/SpellBound Market Place Holder.png"

@product_routes.route('/')
def get_all_products():
    products = Product.query.all()
    return {"products": [p.to_dict() for p in products]}

@product_routes.route('/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if not product:
        return {"error": "Product not found"}, 404
    return product.to_dict()

@product_routes.route('/create', methods=['POST'])
@login_required
def create_product():
    name = request.form.get("name")
    type = request.form.get("type")
    price = request.form.get("price")
    description = request.form.get("description")
    use_default = request.form.get("useDefault")
    image = request.files.get("image")

    errors = {}
    if not name:
        errors["name"] = ["Name is required."]
    if not type:
        errors["type"] = ["Type is required."]
    if not price or not price.replace('.', '', 1).isdigit():
        errors["price"] = ["Valid price is required."]

    if errors:
        return {"errors": errors}, 400

    image_url = DEFAULT_IMAGE_URL
    if image and not use_default:
        image_url = DEFAULT_IMAGE_URL  # skip image saving in production

    new_product = Product(
        name=name,
        type=type,
        price=float(price),
        description=description,
        image_url=image_url,
        user_id=current_user.id,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )

    db.session.add(new_product)
    db.session.commit()
    return new_product.to_dict(), 201

@product_routes.route('/<int:id>/update', methods=['PUT'])
@login_required
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return {"error": "Product not found"}, 404
    if product.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    name = request.form.get("name")
    type = request.form.get("type")
    price = request.form.get("price")
    description = request.form.get("description")
    image = request.files.get("image")

    if name: product.name = name
    if type: product.type = type
    if price: product.price = float(price)
    if description: product.description = description
    if image:
        product.image_url = DEFAULT_IMAGE_URL

    product.updated_at = datetime.datetime.utcnow()
    db.session.commit()
    return product.to_dict()

@product_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return {"error": "Product not found"}, 404
    if product.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    try:
        # ✅ Delete related cart items first
        CartItem.query.filter_by(product_id=product.id).delete()

        db.session.delete(product)
        db.session.commit()
        return {"message": "Successfully deleted product", "id": id}
    except Exception as e:
        print("❌ Error during delete:", e)
        db.session.rollback()
        return {"error": "Server error during product deletion"}, 500

@product_routes.route('/my-products')
@login_required
def get_my_products():
    my_products = Product.query.filter_by(user_id=current_user.id).all()
    return {"products": [p.to_dict() for p in my_products]}
