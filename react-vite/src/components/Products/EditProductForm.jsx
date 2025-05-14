import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useShoppingCart } from "../../context/ShoppingCart";
import "./EditProductForm.css";

export default function EditProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { removeFromCart } = useShoppingCart();

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    image_url: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.error) {
          setError(data.error);
        } else {
          setForm({
            name: data.name || "",
            description: data.description || "",
            price: data.price || "",
            image_url: data.image_url || "",
          });
        }
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("price", form.price);
    formData.append("_method", "PUT");

    if (imageFile) {
      formData.append("image", imageFile);
      formData.append("useDefault", "false");
    } else {
      formData.append("useDefault", "true");
    }

    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        navigate(`/products/${id}`);
      } else {
        setError(data.error || "Failed to update product.");
      }
    } catch (err) {
      setError("Failed to update product.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setForm((prev) => ({
        ...prev,
        image_url: URL.createObjectURL(file), // Preview
      }));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
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

      const data = await res.json();

      if (res.ok) {
        removeFromCart(parseInt(id));
        alert("✅ Product deleted successfully.");
        navigate("/dashboard");
      } else {
        setError(data.error || "Failed to delete product.");
      }
    } catch (err) {
      setError("Server error while deleting product.");
    }
  };

  return (
    <div className="edit-product-page">
      <form className="edit-product-form" onSubmit={handleSubmit}>
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
          Upload New Image
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </label>

        {form.image_url && (
          <img
            src={form.image_url}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: "200px",
              objectFit: "contain",
              borderRadius: "10px",
              marginTop: "10px",
            }}
          />
        )}

        <div className="edit-product-buttons">
          <button type="submit" className="save-btn">Update Product</button>
          <button
            type="button"
            className="back-button"
            onClick={() => navigate(-1)}
          >
            Cancel and Go Back
          </button>
          <button
            type="button"
            className="delete-btn"
            style={{
              backgroundColor: "#ff4d4d",
              color: "#fff",
              marginTop: "10px",
            }}
            onClick={handleDelete}
          >
            Delete Product
          </button>
        </div>
      </form>
    </div>
  );
}
