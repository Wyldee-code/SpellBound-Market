# backend/api/image_routes.py

from flask import Blueprint, request, jsonify
import uuid

image_routes = Blueprint('images', __name__)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@image_routes.route('/upload', methods=['POST'])
def upload_image():
    if "image" not in request.files:
        return jsonify({"errors": ["Image file is required."]}), 400

    image = request.files["image"]

    if not allowed_file(image.filename):
        return jsonify({"errors": ["File type not allowed."]}), 400

    # Simulate upload (mock URL)
    filename = f"{uuid.uuid4().hex}_{image.filename}"
    image_url = f"https://spellbound-market.s3.amazonaws.com/{filename}"

    return jsonify({"url": image_url})
