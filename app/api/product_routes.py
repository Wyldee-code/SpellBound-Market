from flask import Blueprint, request
from ..models import db, Product
from ..forms import ProductForm
from flask_login import login_required, current_user
import datetime

product_routes = Blueprint('products', __name__)

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
    form = ProductForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    if form.validate_on_submit():
        product = Product(
            name=form.data['name'],
            type=form.data['type'],
            price=form.data['price'],
            description=form.data['description'],
            image_url=form.data['image_url'],
            user_id=current_user.id,
            created_at=datetime.datetime.now(),
            updated_at=datetime.datetime.now()
        )
        db.session.add(product)
        db.session.commit()
        return product.to_dict(), 201

    return {"errors": form.errors}, 400

# ✅ UPDATE a product
@product_routes.route('/<int:id>/update', methods=['PUT'])
@login_required
def update_product(id):
    form = ProductForm()
    form['csrf_token'].data = request.cookies['csrf_token']

    product = Product.query.get(id)
    if not product:
        return {"error": "Product not found"}, 404
    if product.user_id != current_user.id:
        return {"error": "Unauthorized"}, 403

    if form.validate_on_submit():
        product.name = form.data['name']
        product.type = form.data['type']
        product.price = form.data['price']
        product.description = form.data['description']
        product.image_url = form.data['image_url']
        product.updated_at = datetime.datetime.now()

        db.session.commit()
        return product.to_dict()

    return {"errors": form.errors}, 400

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
