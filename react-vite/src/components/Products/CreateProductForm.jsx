import { useState } from "react";
import { getCookie } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import "./CreateProductForm.css";

export default function CreateProductForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const defaultImageUrl = "/SpellBound Market Place Holder.png";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    const csrfToken = getCookie("csrf_token");

    const res = await fetch("/api/products/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        description,
        price,
        image_url: imageUrl || defaultImageUrl, // ✅ Fallback to default
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setSuccess(true);
      navigate(`/products/${data.id}`);
    } else {
      const errorData = await res.json();
      setErrors([errorData.message || "Failed to create product"]);
    }
  };

  const handleUseDefaultImage = () => {
    setImageUrl(defaultImageUrl);
  };

  return (
    <div className="create-product-page">
      <form onSubmit={handleSubmit} className="product-form">
        <h2>Create a New Product</h2>

        {success && <p className="success-msg">✅ Product created successfully!</p>}
        {errors.length > 0 && (
          <ul className="error-list">
            {errors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        )}

        <label>
          Name:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Product name"
          />
        </label>

        <label>
          Description:
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            placeholder="Product description"
          />
        </label>

        <label>
          Price:
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            placeholder="Price in USD"
          />
        </label>

        <label>
          Image URL:
          <input
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="https://example.com/image.jpg"
          />
        </label>

        <button type="button" onClick={handleUseDefaultImage} style={{ marginBottom: "10px" }}>
          Use Default Image
        </button>

        <button type="submit">Create Product</button>
      </form>
    </div>
  );
}
