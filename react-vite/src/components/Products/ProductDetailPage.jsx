import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  thunkCreateReview,
  getReviewsForProductThunk,
  deleteReviewThunk,
  updateReviewThunk,
  selectReviewsByProduct,
} from "../../redux/reviews";
import { useShoppingCart } from "../../context/ShoppingCart";
import "./ProductDetailPage.css";

export default function ProductDetailPage() {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { addToCart } = useShoppingCart();
  const sessionUser = useSelector((state) => state.session.user);

  const [product, setProduct] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [errors, setErrors] = useState([]);
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const [quantity, setQuantity] = useState(1); // ⬅️ NEW

  const reviews = useSelector((state) =>
    selectReviewsByProduct(state, parseInt(productId))
  );

  const userAlreadyReviewed = reviews.some(
    (r) => r.user_id === sessionUser?.id
  );

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => setProduct(data));
  }, [productId]);

  useEffect(() => {
    if (productId) dispatch(getReviewsForProductThunk(parseInt(productId)));
  }, [productId, dispatch]);

  const handleAddToCart = () => {
    if (!product || quantity < 1) return;
    addToCart(product, quantity); // ⬅️ updated to include quantity
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!rating || !comment.trim()) {
      setErrors(["Please provide a rating and comment."]);
      return;
    }

    const reviewData = {
      comment,
      rating,
      product_id: product.id,
    };

    const result = await dispatch(thunkCreateReview(reviewData));
    if (result) {
      setErrors(Array.isArray(result) ? result : [result]);
    } else {
      setRating(0);
      setComment("");
      dispatch(getReviewsForProductThunk(product.id));
    }
  };

  const handleEditReview = (review) => {
    setEditingReviewId(review.id);
    setEditRating(review.rating);
    setEditComment(review.comment);
  };

  const handleUpdateReview = async () => {
    if (!editRating || !editComment.trim()) {
      setErrors(["Please update both rating and comment."]);
      return;
    }

    const result = await dispatch(
      updateReviewThunk(editingReviewId, {
        rating: editRating,
        comment: editComment,
      })
    );

    if (result) {
      setErrors(Array.isArray(result) ? result : [result]);
    } else {
      setEditingReviewId(null);
      dispatch(getReviewsForProductThunk(product.id));
    }
  };

  const handleDeleteReview = async (reviewId) => {
    await dispatch(deleteReviewThunk(reviewId));
    dispatch(getReviewsForProductThunk(product.id));
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="product-detail-page">
      <div className="product-header">
        <img
          src={product.imageUrl || "/placeholder.jpg"}
          alt={product.name}
          className="product-image"
        />
        <div className="product-info">
          <h1>{product.name}</h1>
          <p className="product-price">${product.price?.toFixed(2)}</p>
          <p>{product.description}</p>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              style={{
                width: "60px",
                padding: "5px",
                borderRadius: "5px",
                border: "1px solid #ccc",
              }}
            />
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              Add {quantity > 1 ? `${quantity} to Cart` : "to Cart"}
            </button>
          </div>
        </div>
      </div>

      <div className="reviews-section">
        <h2>Reviews</h2>

        {sessionUser && !userAlreadyReviewed && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <div className="stars-select">
              {[1, 2, 3, 4, 5].map((num) => (
                <label key={num} className="star-label">
                  <input
                    type="radio"
                    value={num}
                    checked={rating === num}
                    onChange={() => setRating(num)}
                    style={{ display: "none" }}
                  />
                  <span
                    style={{
                      color: num <= rating ? "#FFD700" : "#ccc",
                      fontSize: "1.5rem",
                      cursor: "pointer",
                    }}
                  >
                    ★
                  </span>
                </label>
              ))}
            </div>
            <textarea
              placeholder="Leave your thoughts..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
            {errors.length > 0 && (
              <div className="form-errors">
                {errors.map((err, i) => (
                  <p key={i}>{err}</p>
                ))}
              </div>
            )}
            <button type="submit" className="submit-review-btn">
              Submit Review
            </button>
          </form>
        )}

        {sessionUser && userAlreadyReviewed && (
          <p>You have already reviewed this product.</p>
        )}

        <div className="review-list">
          {reviews.map((review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <strong>{review?.user?.username}</strong> —{" "}
                {Array(review.rating).fill("⭐").join("")}
              </div>

              {editingReviewId === review.id ? (
                <>
                  <textarea
                    value={editComment}
                    onChange={(e) => setEditComment(e.target.value)}
                  />
                  <div className="stars-select">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <label key={num} className="star-label">
                        <input
                          type="radio"
                          value={num}
                          checked={editRating === num}
                          onChange={() => setEditRating(num)}
                          style={{ display: "none" }}
                        />
                        <span
                          style={{
                            color: num <= editRating ? "#FFD700" : "#ccc",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                          }}
                        >
                          ★
                        </span>
                      </label>
                    ))}
                  </div>
                  <button onClick={handleUpdateReview}>Save</button>
                  <button onClick={() => setEditingReviewId(null)}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <p>{review.comment}</p>
                  {sessionUser?.id === review.user_id && (
                    <div className="review-actions">
                      <button onClick={() => handleEditReview(review)}>
                        Edit
                      </button>
                      <button onClick={() => handleDeleteReview(review.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
