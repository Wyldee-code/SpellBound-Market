import { getCookie } from "../utils/csrf";

// Action Types
const SET_FAVORITES = "favorites/SET_FAVORITES";
const SET_LOADING = "favorites/SET_LOADING";
const SET_ERROR = "favorites/SET_ERROR";

// Action Creators
const setFavorites = (favorites) => ({
  type: SET_FAVORITES,
  favorites,
});

const setLoading = (isLoading) => ({
  type: SET_LOADING,
  isLoading,
});

const setError = (error) => ({
  type: SET_ERROR,
  error,
});

// Thunks
export const fetchFavorites = () => async (dispatch) => {
  dispatch(setLoading(true));
  dispatch(setError(null));
  try {
    const res = await fetch("/api/favorites", {
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      dispatch(setFavorites(data));
    } else {
      const errData = await res.json();
      dispatch(setError(errData.message || "Failed to fetch favorites"));
    }
  } catch (err) {
    dispatch(setError("An unexpected error occurred."));
  } finally {
    dispatch(setLoading(false));
  }
};

export const toggleFavorite = (productId) => async (dispatch) => {
  const csrfToken = getCookie("csrf_token");

  const res = await fetch(`/api/favorites/${productId}`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-Token": csrfToken,
    },
  });

  if (res.ok) {
    dispatch(fetchFavorites());
  } else {
    console.error("Failed to toggle favorite", res.status);
  }
};

// Initial State
const initialState = {
  items: {},      // key: productId, value: product object
  loading: false,
  error: null,
};

// Reducer
const favoritesReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_FAVORITES:
      const items = {};
      action.favorites.forEach((product) => {
        items[product.id] = product;
      });
      return { ...state, items, error: null };
    case SET_LOADING:
      return { ...state, loading: action.isLoading };
    case SET_ERROR:
      return { ...state, error: action.error };
    default:
      return state;
  }
};

export default favoritesReducer;
