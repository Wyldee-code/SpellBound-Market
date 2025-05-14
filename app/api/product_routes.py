from flask import Blueprint, request, jsonify
from ..models import db, Product
from ..models.cart_item import CartItem
from flask_login import login_required, current_user
import datetime

product_routes = Blueprint('products', __name__)

DEFAULT_IMAGE_URL = "/SpellBound Market Place Holder.png"

# ✅ GET all products
@product_routes.route('/')
def get_all_products():
    products = Product.query.all()
    return {"products": [p.to_dict() for p in products]}

# ✅ GET one product by ID
@product_routes.route('/<int:id>', methods=['GET'])
def get_product(id):
    product = Product.query.get(id)
    if not product:
        return {"error": "Product not found"}, 404
    return product.to_dict()

# ✅ CREATE a new product
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
        image_url = DEFAULT_IMAGE_URL  # Replace with real image upload logic

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

# ✅ UPDATE a product (supports POST override via _method)
@product_routes.route('/<int:id>', methods=['PUT', 'POST'])
@login_required
def update_product(id):
    product = Product.query.get(id)
    if not product:
        return {"error": "Product not found"}, 404
    if product.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    if request.method == 'POST' and request.form.get("_method") != "PUT":
        return {"error": "Invalid method override"}, 405

    if request.content_type.startswith("multipart/form-data"):
        name = request.form.get("name")
        price = request.form.get("price")
        description = request.form.get("description")
        image_file = request.files.get("image")
        image_url = request.form.get("image_url")

        if name:
            product.name = name
        if price:
            product.price = float(price)
        if description:
            product.description = description

        if image_file:
            product.image_url = DEFAULT_IMAGE_URL  # Replace with real image upload logic
        elif image_url:
            product.image_url = image_url
        else:
            product.image_url = DEFAULT_IMAGE_URL

        product.updated_at = datetime.datetime.utcnow()
        db.session.commit()
        return product.to_dict()
    else:
        return {"error": "Unsupported content type. Use multipart/form-data."}, 400

# ✅ DELETE a product (and related cart items) — FIXED
@product_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
    if product.user_id != current_user.id:
        return jsonify({"error": "Unauthorized"}), 403

    try:
        CartItem.query.filter_by(product_id=product.id).delete()
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Successfully deleted product", "id": id}), 200
    except Exception as e:
        print("❌ Error during delete:", e)
        db.session.rollback()
        return jsonify({"error": "Server error during product deletion"}), 500

# ✅ Get current user's products
@product_routes.route('/my-products')
@login_required
def get_my_products():
    my_products = Product.query.filter_by(user_id=current_user.id).all()
    return {"products": [p.to_dict() for p in my_products]}
