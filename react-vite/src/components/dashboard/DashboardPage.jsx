import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getCookie } from "../../utils/csrf";
import { fetchFavorites } from "../../redux/favorites";
import "./DashboardPage.css";

export default function DashboardPage() {
  const dispatch = useDispatch();
  const { user, loaded } = useSelector((state) => state.session);
  const { items: favorites, loading: favLoading, error: favError } = useSelector(
    (state) => state.favorites
  );
  const [owned, setOwned] = useState([]);

  useEffect(() => {
    if (!loaded || !user) return;

    fetch("/api/products/my-products", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOwned(data.products || []))
      .catch((err) => {
        console.error("Failed to load owned products:", err);
        setOwned([]);
      });

    dispatch(fetchFavorites());
  }, [loaded, user, dispatch]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    const res = await fetch(`/api/products/${id}/delete`, {
      method: "DELETE",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": getCookie("csrf_token"),
      },
    });

    if (res.ok) {
      setOwned((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const renderCard = (p, showActions = false) => (
    <div key={p.id} className="product-card">
      <img src={p.imageUrl || "/placeholder.jpg"} alt={p.name} />
      <div className="product-info">
        <h3>{p.name}</h3>
        <p>${p.price?.toFixed(2)}</p>
        <p className="tags">{p.type}</p>
        {showActions && (
          <div className="product-actions">
            <Link to={`/products/${p.id}/edit`}>
              <button className="edit-btn">Edit</button>
            </Link>
            <button className="delete-btn" onClick={() => handleDelete(p.id)}>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (!loaded) return <div>Loading dashboard...</div>;

  const favoriteList = Object.values(favorites || {});

  return (
    <div className="dashboard-page">
      <h2>Your Products</h2>
      {owned.length === 0 ? (
        <p>You haven’t added any products yet.</p>
      ) : (
        <div className="product-grid">{owned.map((p) => renderCard(p, true))}</div>
      )}

      <h2>Favorited Products</h2>
      {favLoading ? (
        <p>Loading favorites...</p>
      ) : favError ? (
        <p className="error">{favError}</p>
      ) : favoriteList.length === 0 ? (
        <p>You haven’t favorited any products yet.</p>
      ) : (
        <div className="product-grid">{favoriteList.map((p) => renderCard(p))}</div>
      )}
    </div>
  );
}
