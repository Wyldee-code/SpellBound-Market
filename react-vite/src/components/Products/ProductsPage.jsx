import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsThunk } from "../../redux/product";
import { useShoppingCart } from "../../context/ShoppingCart";
import "./ProductsPage.css";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.session.user);
  const products = useSelector((state) =>
    Object.values(state.product?.allProducts || {}) // ✅ Matches your Redux state key
  );
  const { addToCart } = useShoppingCart();

  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    dispatch(getAllProductsThunk());

    fetch("/api/favorites", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setFavorites(data.map((fav) => fav.product_id)));
  }, [dispatch]);

  const toggleFavorite = async (id) => {
    const csrfToken = getCookie("csrf_token");

    const res = await fetch(`/api/favorites/${id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
    });

    if (res.ok) {
      const updated = await res.json();
      setFavorites(updated.map((fav) => fav.product_id));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRF-Token": getCookie("csrf_token"),
      },
    });
    if (res.ok) {
      dispatch(getAllProductsThunk());
    }
  };

  return (
    <div className="products-page">
      <div className="products-header">
        <h2>Shop Our Magical Items ✨</h2>
        {user && (
          <button className="create-product-btn" onClick={() => navigate("/products/new")}>
            Add New Product
          </button>
        )}
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <div
            key={product.id}
            className="product-card"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            <img
              src={product.imageUrl || "/SpellBound Market Place Holder.png"} // 
              alt={product.name}
              className="product-img"
            />
            <div className="product-info">
              <h3>{product.name}</h3>
              <p className="price">${product.price?.toFixed(2)}</p>

              <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                <button className="add-to-cart-btn" onClick={() => addToCart(product)}>
                  Add to Cart
                </button>

                {user && (
                  <span
                    className={`favorite-icon ${favorites.includes(product.id) ? "filled" : ""}`}
                    onClick={() => toggleFavorite(product.id)}
                  >
                    ♥
                  </span>
                )}
              </div>

              {user && user.id === product.user_id && (
                <div className="product-owner-actions">
                  <button
                    onClick={() => navigate(`/products/${product.id}/edit`)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(product.id);
                    }}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
