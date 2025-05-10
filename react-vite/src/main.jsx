// src/main.jsx

import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider as ReduxProvider, useSelector } from "react-redux";
import { RouterProvider } from "react-router-dom";
import configureStore from "./redux/store";
import { router } from "./router";
import * as sessionActions from "./redux/session";
import { ShoppingCartProvider } from "./context/ShoppingCart";
import "./index.css";

const store = configureStore();

// Dev tools (only in development mode)
if (import.meta.env.MODE !== "production") {
  window.store = store;
  window.sessionActions = sessionActions;
}

// ✅ Inline CSRF restore
const restoreCSRF = async () => {
  try {
    await fetch("/api/csrf/restore", { credentials: "include" });
  } catch (err) {
    console.error("CSRF restore failed", err);
  }
};

// ✅ App wrapper that waits for session before rendering
function AppLoader() {
  const [isSessionReady, setIsSessionReady] = useState(false);

  useEffect(() => {
    const restore = async () => {
      await restoreCSRF();
      await store.dispatch(sessionActions.restoreUser());
      setIsSessionReady(true);
    };
    restore();
  }, []);

  if (!isSessionReady) return <div>Loading session...</div>;

  return (
    <ReduxProvider store={store}>
      <ShoppingCartProvider>
        <RouterProvider router={router} />
      </ShoppingCartProvider>
    </ReduxProvider>
  );
}

// ✅ Render App
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppLoader />
  </React.StrictMode>
);
