import { useNavigate } from "react-router-dom";
import { useShoppingCart } from "../../../context/ShoppingCart";
import "./ProductCard.css";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItemToCart } = useShoppingCart();

  const handleCardClick = () => {
    navigate(`/products/${product.id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation(); // 🛑 Prevent navigating on button click
    addItemToCart({
      menu_item: {
        id: product.id,
        name: product.name,
        price: product.price,
        restaurantId: 1, // or map accordingly if your structure differs
      },
      quantity: 1,
    });
  };

  return (
    <div className="product-card" onClick={handleCardClick}>
      <img
        src={product.image_url || "/default-image.png"}
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
