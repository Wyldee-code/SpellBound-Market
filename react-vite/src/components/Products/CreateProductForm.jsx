import { useState } from "react";
import { getCookie } from "../../utils/csrf";
import { useNavigate } from "react-router-dom";
import "./CreateProductForm.css";

const productCategories = [
  "jewelry",
  "crystals",
  "art",
  "clothing",
  "home_decor",
  "spiritual_tools",
];

export default function CreateProductForm() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [type, setType] = useState(productCategories[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [useDefaultImage, setUseDefaultImage] = useState(false);
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const DEFAULT_IMAGE_PATH = "/SpellBound Market Place Holder.png";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    setSuccess(false);

    const csrfToken = getCookie("csrf_token");
    const formData = new FormData();

    formData.append("name", name);
    formData.append("type", type);
    formData.append("price", parseFloat(price));
    formData.append("description", description);

    if (useDefaultImage) {
      // Server will handle default internally — skip file
    } else if (imageFile) {
      formData.append("image", imageFile);
    }

    try {
      const res = await fetch("/api/products/create", {
        method: "POST",
        headers: {
          "X-CSRF-Token": csrfToken,
        },
        credentials: "include",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Backend validation failed:", data.errors || data);
        setErrors(data.errors || ["Failed to create product"]);
        return;
      }

      setSuccess(true);
      setErrors([]);
      setName("");
      setType(productCategories[0]);
      setPrice("");
      setDescription("");
      setImageFile(null);
      setUseDefaultImage(false);
      navigate(`/products/${data.id}`);
    } catch (err) {
      console.error("Error creating product:", err);
      setErrors(["An unexpected error occurred."]);
    }
  };

  const handleUseDefault = () => {
    setUseDefaultImage(true);
    setImageFile(null);
  };

  return (
    <div className="create-product-page">
      <form onSubmit={handleSubmit} className="product-form" encType="multipart/form-data">
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
          Category:
          <select value={type} onChange={(e) => setType(e.target.value)} required>
            {productCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
              </option>
            ))}
          </select>
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
          Upload Image:
          <input
            type="file"
            accept="image/*"
            disabled={useDefaultImage}
            onChange={(e) => {
              setImageFile(e.target.files[0]);
              setUseDefaultImage(false);
            }}
          />
          {useDefaultImage && (
            <p style={{ fontSize: "0.9rem", color: "#555", marginTop: "4px" }}>
              Using: <code>{DEFAULT_IMAGE_PATH}</code>
            </p>
          )}
        </label>

        <button
          type="button"
          className="use-default-image-btn"
          onClick={handleUseDefault}
          style={{ marginBottom: "10px" }}
        >
          Use Default Image
        </button>

        <button type="submit" className="submit-btn">
          Create Product
        </button>
      </form>
    </div>
  );
}
