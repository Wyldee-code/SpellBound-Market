// src/redux/reviews.js

import { getCookie } from "../utils/csrf";

// Action Types
const LOAD_REVIEWS = 'reviews/LOAD_REVIEWS';
const CREATE_REVIEW = 'reviews/CREATE_REVIEW';
const UPDATE_REVIEW = 'reviews/UPDATE_REVIEW';
const DELETE_REVIEW = 'reviews/DELETE_REVIEW';

// Action Creators
const loadReviews = (reviews) => ({
  type: LOAD_REVIEWS,
  reviews,
});

const createReview = (review) => ({
  type: CREATE_REVIEW,
  review,
});

const updateReview = (review) => ({
  type: UPDATE_REVIEW,
  review,
});

const deleteReview = (reviewId) => ({
  type: DELETE_REVIEW,
  reviewId,
});

// Thunks

export const getReviewsForProductThunk = (productId) => async (dispatch) => {
  try {
    const res = await fetch(`/api/reviews/${productId}`);
    if (res.ok) {
      const data = await res.json();
      dispatch(loadReviews(data)); // ✅ fixed: directly use array
    }
  } catch (error) {
    console.error("Failed to load reviews:", error);
  }
};

export const thunkCreateReview = (reviewData) => async (dispatch) => {
  try {
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(reviewData),
    });

    const data = await res.json();

    if (res.ok) {
      dispatch(createReview(data));
      return null;
    } else {
      return data.errors || ["Failed to create review"];
    }
  } catch (err) {
    console.error("Error creating review:", err);
    return ["An unexpected error occurred"];
  }
};

export const updateReviewThunk = (reviewId, updateData) => async (dispatch) => {
  const csrfToken = getCookie("csrf_token");

  try {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(updateData),
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(updateReview(data));
      return null;
    } else {
      const errorData = await res.json();
      return errorData.errors || ["Failed to update review"];
    }
  } catch (error) {
    console.error("Error updating review:", error);
    return ["Server error. Please try again."];
  }
};

export const deleteReviewThunk = (reviewId) => async (dispatch) => {
  const csrfToken = getCookie("csrf_token");

  try {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "DELETE",
      headers: {
        "X-CSRF-Token": csrfToken,
      },
      credentials: "include",
    });

    if (res.ok) {
      dispatch(deleteReview(reviewId));
    }
  } catch (error) {
    console.error("Error deleting review:", error);
  }
};

// Reducer
const initialState = {
  reviews: {},
};

export default function reviewsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_REVIEWS: {
      const newState = { reviews: {} };
      action.reviews.forEach((review) => {
        newState.reviews[review.id] = review;
      });
      return newState;
    }
    case CREATE_REVIEW:
    case UPDATE_REVIEW:
      return {
        ...state,
        reviews: {
          ...state.reviews,
          [action.review.id]: action.review,
        },
      };
    case DELETE_REVIEW: {
      const newState = {
        ...state,
        reviews: { ...state.reviews },
      };
      delete newState.reviews[action.reviewId];
      return newState;
    }
    default:
      return state;
  }
}

// Selectors
export const selectAllReviews = (state) => Object.values(state.reviews.reviews);
export const selectReviewsByProduct = (state, productId) =>
  Object.values(state.reviews.reviews).filter(
    (review) => review.product_id === productId
  );
