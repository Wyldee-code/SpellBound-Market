from flask import Blueprint, request, send_from_directory
from ..models import db, Product
from flask_login import login_required, current_user
from werkzeug.utils import secure_filename
import datetime
import os

product_routes = Blueprint('products', __name__)

UPLOAD_FOLDER = "public"
DEFAULT_IMAGE_URL = "/public/SpellBound Market Place Holder.png"

# ✅ Serve static files from public folder
@product_routes.route('/public/<path:filename>')
def serve_public_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

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
    image = request.files.get("image")

    errors = {}

    if not name:
        errors["name"] = ["Name is required."]
    if not type:
        errors["type"] = ["Type is required."]
    if not price or not price.replace('.', '', 1).isdigit():
        errors["price"] = ["Valid price is required."]

    image_url = DEFAULT_IMAGE_URL

    if image:
        filename = secure_filename(image.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        image.save(filepath)
        image_url = f"/public/{filename}"

    if errors:
        return {"errors": errors}, 400

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

# ✅ UPDATE a product
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
        filename = secure_filename(image.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        os.makedirs(UPLOAD_FOLDER, exist_ok=True)
        image.save(filepath)
        product.image_url = f"/public/{filename}"

    product.updated_at = datetime.datetime.utcnow()

    db.session.commit()
    return product.to_dict()

# ✅ DELETE a product
@product_routes.route('/<int:id>/delete', methods=['DELETE'])
@login_required
def delete_product(id):
    product = Product.query.get(id)
    if not product:
        return {"error": "Product not found"}, 404
    if product.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    db.session.delete(product)
    db.session.commit()
    return {"message": "Successfully deleted product", "id": id}

# ✅ Get current user's products
@product_routes.route('/my-products')
@login_required
def get_my_products():
    my_products = Product.query.filter_by(user_id=current_user.id).all()
    return {"products": [p.to_dict() for p in my_products]}
