import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./CreateProductForm.css"; // ♻️ Reuse styles

export default function EditProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm({
            name: data.name || "",
            description: data.description || "",
            price: data.price || "",
            image_url: data.image_url || "",
          });
        } else {
          setError("Failed to load product.");
        }
      } catch (err) {
        console.error("❌ Error loading product:", err);
        setError("Failed to load product.");
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        navigate(`/products/${id}`);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update product.");
      }
    } catch (err) {
      console.error("❌ Error updating product:", err);
      setError("Failed to update product.");
    }
  };

  return (
    <div className="create-product-page">
      <form className="product-form" onSubmit={handleSubmit}>
        <h2>Edit Product</h2>

        {error && <p className="error-list">{error}</p>}

        <label>
          Name
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </label>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            required
          />
        </label>

        <label>
          Price
          <input
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
        </label>

        <label>
          Image URL
          <input
            type="text"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
        </label>

        <button type="submit">Update Product</button>
      </form>
    </div>
  );
}
