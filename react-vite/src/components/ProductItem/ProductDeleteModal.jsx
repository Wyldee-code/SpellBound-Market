import { useNavigate } from "react-router-dom";
import { deleteProductThunk } from "../../../redux/product";
import { useDispatch } from "react-redux";
import "./ProductDeleteModal.css";

export default function ProductDeleteModal({ productId, onClose }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleDelete = async () => {
    const result = await dispatch(deleteProductThunk(productId));
    if (!result?.errors) {
      navigate("/products");
      if (onClose) onClose();
    } else {
      console.error(result.errors || "Failed to delete product.");
    }
  };

  return (
    <div className="delete-modal-container">
      <h3>Are you sure you want to delete this product?</h3>
      <div className="delete-modal-buttons">
        <button onClick={handleDelete} className="confirm-delete">
          Yes, Delete
        </button>
        <button onClick={onClose} className="cancel-delete">
          Cancel
        </button>
      </div>
    </div>
  );
}
