import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCookie } from "../../utils/csrf";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [owned, setOwned] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Fetch user's products
    fetch("/api/products/my-products", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => setOwned(data.products || []))
      .catch((err) => {
        console.error("Failed to load owned products:", err);
        setOwned([]);
      });

    // Fetch favorited products
    fetch("/api/favorites", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setFavorites(data);
        } else {
          console.error("Unexpected favorites response:", data);
          setFavorites([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load favorites:", err);
        setFavorites([]);
      });
  }, []);

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

  return (
    <div className="dashboard-page">
      <h2>Your Products</h2>
      {owned.length === 0 ? (
        <p>You haven’t added any products yet.</p>
      ) : (
        <div className="product-grid">{owned.map((p) => renderCard(p, true))}</div>
      )}

      <h2>Favorited Products</h2>
      {favorites.length === 0 ? (
        <p>You haven’t favorited any products yet.</p>
      ) : (
        <div className="product-grid">{favorites.map((p) => renderCard(p))}</div>
      )}
    </div>
  );
}
