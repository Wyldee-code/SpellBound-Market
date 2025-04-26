✨Spellbound Market✨

A mystical handmade goods marketplace inspired by Etsy. Built with Flask, React, and PostgreSQL.

🗄️Database Schema

Entities:
Users: id, username, email, hashed_password, first_name, last_name

Products: id, user_id, name, description, price, image_url

CartItems: id, user_id, product_id, quantity

Favorites: id, user_id, product_id

Reviews: id, user_id, product_id, content, stars

Orders: id, user_id, total_price, created_at

🔐Authentication

Get Current User
GET /api/auth/
Returns the logged-in user or null.

Log In

POST /api/auth/login
Requires: { email, password }
Errors:

json
Copy
Edit
{ "message": "The provided credentials were invalid" }
Sign Up
POST /api/auth/signup
Requires: { username, email, password, first_name, last_name }

Log Out

POST /api/auth/logout

🛍️ Products

Get All Products
GET /api/products
Public route.

Create New Product

POST /api/products
Auth required
Body: { name, description, price, image_url }

Edit Product

PUT /api/products/:id
Auth + owner required

Delete Product

DELETE /api/products/:id
Auth + owner required

🛒 Cart
View Cart
GET /api/cart

Add/Update Item

POST /api/cart
Body: { product_id, quantity }

Update Quantity

POST /api/cart/:cart_item_id
Body: { quantity }

Delete Item
DELETE /api/cart/:cart_item_id

Clear Cart
DELETE /api/cart/clear

Checkout
POST /api/cart/checkout
Creates an order and clears the cart.

💖 Favorites

Toggle Favorite
POST /api/favorites/:product_id
Adds/removes a product from favorites.

Get All Favorites

GET /api/favorites
Returns a list of the user's favorited products.

✍️ Reviews

Get Reviews for Product
GET /api/products/:id/reviews

Create Review

POST /api/reviews/:product_id
Body: { content, stars }

Edit Review

PUT /api/reviews/:review_id

Delete Review

DELETE /api/reviews/:review_id

🔍 Bonus Features
🔎 Product Search
GET /api/products/search?query=...

📦 Past Orders & Reorder
GET /api/orders
Returns a list of past orders.

POST /api/orders/:order_id/reorder
Re-adds previous items to the cart.
