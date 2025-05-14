import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getAllProductsThunk } from "../../redux/product";
import { fetchFavorites, toggleFavorite } from "../../redux/favorites";
import { useShoppingCart } from "../../context/ShoppingCart";
import "./ProductsPage.css";

export default function ProductsPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addToCart } = useShoppingCart();

  const { user, loaded } = useSelector((state) => state.session);
  const products = useSelector((state) =>
    Object.values(state.product?.allProducts || {})
  );
  const { items: favorites, loading: favLoading, error: favError } = useSelector(
    (state) => state.favorites
  );

  const [favoriteMessage, setFavoriteMessage] = useState("");

  useEffect(() => {
    dispatch(getAllProductsThunk());
    if (loaded && user) dispatch(fetchFavorites());
  }, [dispatch, loaded, user]);

  const handleFavorite = async (productId) => {
    await dispatch(toggleFavorite(productId));
    const wasFav = !!favorites[productId];
    setFavoriteMessage(wasFav ? "Removed from favorites 💔" : "Added to favorites 💖");
    setTimeout(() => setFavoriteMessage(""), 2000);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const res = await fetch(`/api/products/${id}/delete`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "X-CSRF-Token": document.cookie
          .split("; ")
          .find((row) => row.startsWith("csrf_token"))
          ?.split("=")[1],
      },
    });
    if (res.ok) {
      dispatch(getAllProductsThunk());
    }
  };

  if (!loaded) return <div>Loading products...</div>;

  const favoriteList = Object.values(favorites || {});

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

      {favoriteMessage && <div className="favorite-toast">{favoriteMessage}</div>}

      <div className="product-grid">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <img
              src={product.imageUrl || "/SpellBound Market Place Holder.png"}
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

              <div className="product-actions" onClick={(e) => e.stopPropagation()}>
                <button
                  className="add-to-cart-btn"
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    })
                  }
                >
                  Add to Cart
                </button>

                {user && (
                  <span
                    className={`favorite-icon ${favorites[product.id] ? "filled" : ""}`}
                    onClick={() => handleFavorite(product.id)}
                  >
                    ♥
                  </span>
                )}
              </div>

              {user && user.id === product.user_id && (
                <div className="product-owner-actions" onClick={(e) => e.stopPropagation()}>
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

      <div className="favorites-section">
        <h2>Favorited Products</h2>
        {favLoading ? (
          <p>Loading favorites...</p>
        ) : favError ? (
          <p className="error">{favError}</p>
        ) : favoriteList.length === 0 ? (
          <p>You haven’t favorited any products yet.</p>
        ) : (
          <div className="product-grid">
            {favoriteList.map((product) => (
              <div
                key={product.id}
                className="product-card"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <img
                  src={product.imageUrl || "/SpellBound Market Place Holder.png"}
                  alt={product.name}
                  className="product-img"
                />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p className="price">${product.price?.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
