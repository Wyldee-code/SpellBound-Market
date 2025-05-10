import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShoppingCart } from "../../../context/ShoppingCart";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();
  const [quantity, setQuantity] = useState(1);

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (quantity < 1) return;
    addToCart(product, quantity);
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <img
        src={product.imageUrl || "/SpellBound Market Place Holder.png"}
        alt={product.name}
        className="product-card-img"
      />
      <div className="product-card-info">
        <h3>{product.name}</h3>
        <p className="product-price">${product.price?.toFixed(2)}</p>

        <div className="product-card-buttons" onClick={(e) => e.stopPropagation()}>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="quantity-input"
          />
          <button className="add-to-cart-mini" onClick={handleAddToCart}>
            Add {quantity > 1 ? `${quantity} to Cart` : "to Cart"}
          </button>
        </div>
      </div>
    </div>
  );
}
