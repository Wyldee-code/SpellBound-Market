import { useNavigate } from "react-router-dom";
import { useShoppingCart } from "../../../context/ShoppingCart";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart(); // ✅ assuming you're using this in context

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // 🛑 Prevent navigating on button click
    addToCart(product); // ✅ just use product directly
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <img
        src={product.imageUrl || "/default-image.png"} // ✅ camelCase for consistency
        alt={product.name}
        className="product-card-img"
      />
      <div className="product-card-info">
        <h3>{product.name}</h3>
        <p className="product-price">${product.price?.toFixed(2)}</p>
        <div className="product-card-buttons">
          <button className="add-to-cart-mini" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
