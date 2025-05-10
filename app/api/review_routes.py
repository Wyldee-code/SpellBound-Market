from flask import Blueprint, request, jsonify, abort
from flask_login import login_required, current_user
from app.models import db, Review, Product, User

# localhost:9000/api/review
review_routes = Blueprint('review', __name__)

# GET all reviews
@review_routes.route('/')
def get_reviews():
    all_reviews = Review.query.all()
    if not all_reviews:
        return {'errors': ['No reviews found']}, 404
    return jsonify([r.to_dict() for r in all_reviews])

# Add New Review
@review_routes.route('', methods=['POST'])
@login_required
def create_review():
    """
    Create a new review for a product

    Required fields in request body:
    - comment: str (max 255 characters)
    - rating: int (1–5)
    - product_id: int
    """
    if not current_user.is_authenticated:
        return {'errors': ['Authentication required']}, 401

    data = request.get_json()

    if not all(key in data for key in ['comment', 'rating', 'product_id']):
        return {'errors': 'Missing required fields'}, 400

    if not 1 <= data['rating'] <= 5:
        return {'errors': 'Rating must be between 1 and 5'}, 400

    product = Product.query.get(data['product_id'])
    if not product:
        return {'errors': 'Product not found'}, 404

    existing_review = Review.query.filter_by(
        product_id=data['product_id'],
        user_id=current_user.id
    ).first()

    if existing_review:
        return {'errors': 'You have already reviewed this product'}, 400

    review = Review(
        comment=data['comment'],
        rating=data['rating'],
        product_id=data['product_id'],
        user_id=current_user.id
    )

    try:
        db.session.add(review)
        db.session.commit()
        return review.to_dict(), 201
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400

# Get Reviews for a Product
@review_routes.route('/<int:product_id>', methods=['GET'])
def get_reviews_by_product(product_id):
    """
    Get all reviews for a specific product
    """
    product = Product.query.get(product_id)
    if not product:
        return {'errors': ['Product not found']}, 404

    reviews = Review.query.filter_by(product_id=product_id).all()

    reviews_dict = []
    for review in reviews:
        review_data = review.to_dict()
        user = User.query.get(review.user_id)
        if user:
            review_data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        reviews_dict.append(review_data)

    return jsonify(reviews_dict)

# Delete Review
@review_routes.route('/<int:review_id>', methods=['DELETE'])
@login_required
def delete_review(review_id):
    """
    Delete a review by ID
    """
    review = Review.query.get(review_id)

    if not review:
        return {'errors': ['Review not found']}, 404

    if review.user_id != current_user.id:
        return {'errors': ['Unauthorized']}, 403

    try:
        db.session.delete(review)
        db.session.commit()
        return {'message': 'Review deleted successfully'}, 200
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400

# Update Review
@review_routes.route('/<int:review_id>', methods=['PUT'])
@login_required
def update_review(review_id):
    """
    Update a review by ID
    """
    review = Review.query.get(review_id)

    if not review:
        return {'errors': ['Review not found']}, 404

    if review.user_id != current_user.id:
        return {'errors': ['Unauthorized']}, 403

    data = request.get_json()

    if not all(key in data for key in ['comment', 'rating']):
        return {'errors': 'Missing required fields'}, 400

    if not 1 <= data['rating'] <= 5:
        return {'errors': 'Rating must be between 1 and 5'}, 400

    try:
        review.comment = data['comment']
        review.rating = data['rating']
        db.session.commit()

        user = User.query.get(review.user_id)
        review_data = review.to_dict()
        if user:
            review_data['user'] = {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }

        return review_data, 200
    except Exception as e:
        db.session.rollback()
        return {'errors': [str(e)]}, 400
