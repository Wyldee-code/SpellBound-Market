// src/redux/product.js

// Action Types
const LOAD_PRODUCTS = "products/LOAD_PRODUCTS";
const SET_SINGLE_PRODUCT = "products/SET_SINGLE_PRODUCT";

// Action Creators
const loadProducts = (products) => ({
  type: LOAD_PRODUCTS,
  products,
});

const setSingleProduct = (product) => ({
  type: SET_SINGLE_PRODUCT,
  product,
});

// Thunks
export const getAllProductsThunk = () => async (dispatch) => {
  try {
    const res = await fetch("/api/products");
    if (res.ok) {
      const data = await res.json();
      dispatch(loadProducts(data.products));
    } else {
      const err = await res.json();
      console.error("❌ Failed to load products:", err);
    }
  } catch (error) {
    console.error("❌ Error fetching products:", error);
  }
};

export const getSingleProductThunk = (id) => async (dispatch) => {
  try {
    const res = await fetch(`/api/products/${id}`);
    if (res.ok) {
      const data = await res.json();
      dispatch(setSingleProduct(data));
    } else {
      const err = await res.json();
      console.error("❌ Failed to fetch single product:", err);
    }
  } catch (error) {
    console.error("❌ Error fetching single product:", error);
  }
};

// Reducer
const initialState = {
  allProducts: {},
  singleProduct: null,
};

export default function productReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_PRODUCTS: {
      const allProducts = {};
      action.products.forEach((product) => {
        allProducts[product.id] = product;
      });
      return { ...state, allProducts };
    }
    case SET_SINGLE_PRODUCT:
      return { ...state, singleProduct: action.product };
    default:
      return state;
  }
}
