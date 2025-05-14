// src/components/ProductCards/ProductCardOwner.jsx

import { useNavigate } from "react-router-dom";
import { useShoppingCart } from "../../../context/ShoppingCart";
import { useSelector } from "react-redux";
import "./ProductCardOwner.css";

export default function ProductCardOwner({ product, onDelete }) {
  const navigate = useNavigate();
  const { cart, addToCart } = useShoppingCart();
  const sessionUser = useSelector((state) => state.session.user);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart({
      menu_item: {
        id: product.id,
        name: product.name,
        price: product.price,
      },
      quantity: 1,
    });
  };

  const inCart = cart.some((item) => item.menu_item?.id === product.id);

  return (
    <div className="product-card">
      {/* ✅ Only image and title are clickable */}
      <img
        src={product.image_url || "/product-placeholder.jpg"}
        alt={product.name}
        className="product-img"
        onClick={() => navigate(`/products/${product.id}`)}
        style={{ cursor: "pointer" }}
      />

      <div className="product-info">
        <h3
          onClick={() => navigate(`/products/${product.id}`)}
          style={{ cursor: "pointer" }}
        >
          {product.name}
        </h3>
        <p className="price">${product.price?.toFixed(2)}</p>

        <div className="card-buttons">
          <button
            className={`add-to-cart-btn ${inCart ? "in-cart" : ""}`}
            onClick={handleAddToCart}
          >
            {inCart ? "In Cart" : "Add to Cart"}
          </button>

          {sessionUser?.id === product.user_id && (
            <div className="owner-buttons">
              <button
                className="edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/products/${product.id}/edit`);
                }}
              >
                Edit
              </button>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(product.id);
                }}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
