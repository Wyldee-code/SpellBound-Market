import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const ShoppingCartContext = createContext();

export function ShoppingCartProvider({ children }) {
  const user = useSelector((state) => state.session.user);
  const [cart, setCart] = useState([]);

  // 🔁 Load cart from backend when user logs in
  useEffect(() => {
    const fetchCart = async () => {
      if (!user?.id) return;
      try {
        const res = await fetch("/api/cart", {
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          setCart(data.cart_items || []);
        }
      } catch (err) {
        console.error("Error loading cart:", err);
      }
    };

    fetchCart();
  }, [user?.id]);

  // 🛒 Add product to cart
  const addToCart = async (product, quantity = 1) => {
    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          product_id: product.id,
          quantity,
        }),
      });

      if (res.ok) {
        // Optionally re-fetch the cart instead of relying on partial return
        const refreshed = await fetch("/api/cart", {
          credentials: "include",
        });
        const data = await refreshed.json();
        setCart(data.cart_items || []);
      } else {
        const errorData = await res.json();
        console.error("Failed to add to cart:", errorData);
      }
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  };

  // 🗑 Remove item from cart
  const removeItem = async (cartItemId) => {
    try {
      const res = await fetch(`/api/cart/${cartItemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (res.ok) {
        const refreshed = await fetch("/api/cart", {
          credentials: "include",
        });
        const data = await refreshed.json();
        setCart(data.cart_items || []);
      }
    } catch (err) {
      console.error("Remove item failed:", err);
    }
  };

  return (
    <ShoppingCartContext.Provider value={{ cart, setCart, addToCart, removeItem }}>
      {children}
    </ShoppingCartContext.Provider>
  );
}

export function useShoppingCart() {
  const context = useContext(ShoppingCartContext);
  if (!context) {
    throw new Error("useShoppingCart must be used within a ShoppingCartProvider");
  }
  return context;
}
