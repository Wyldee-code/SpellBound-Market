// src/router/index.jsx

import { createBrowserRouter } from "react-router-dom";
import Layout from "./Layout";
import LoginFormPage from "../components/LoginFormPage";
import SignupFormPage from "../components/SignupFormPage";
import ProductsPage from "../components/Products/ProductsPage"; // ✅ fixed
import ProductDetailPage from "../components/Products/ProductDetailPage";
import CreateProductForm from "../components/Products/CreateProductForm";
import EditProductForm from "../components/Products/EditProductForm";
import DashboardPage from "../components/dashboard/DashboardPage";
import CartPage from "../components/ShoppingCart/CartPage";

// Error fallback
const ErrorElement = () => (
  <div style={{ padding: "2rem", textAlign: "center" }}>
    <h1>Oops! Something went wrong 😬</h1>
    <p>Please try refreshing or going back to the homepage.</p>
  </div>
);

// Main Router
export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorElement />,
    children: [
      { path: "/", element: <ProductsPage /> },
      { path: "login", element: <LoginFormPage /> },
      { path: "signup", element: <SignupFormPage /> },

      // Products
      { path: "products", element: <ProductsPage /> },
      { path: "products/new", element: <CreateProductForm /> },
      { path: "products/:id/edit", element: <EditProductForm /> },
      { path: "products/:productId", element: <ProductDetailPage /> },

      // Other pages
      { path: "dashboard", element: <DashboardPage /> },
      { path: "cart", element: <CartPage /> },
    ],
  },
]);
