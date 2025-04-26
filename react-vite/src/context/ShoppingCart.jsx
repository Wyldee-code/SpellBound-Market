import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ShoppingCartContext = createContext();

export function ShoppingCartProvider({ children }) {
  const user = useSelector((state) => state.session.user);
  const [cart, setCart] = useState([]);

  useEffect(() => {
    if (user?.id) {
      const savedCart = localStorage.getItem(`cart_${user.id}`);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart));
    }
  }, [cart, user?.id]);

  return (
    <ShoppingCartContext.Provider value={{ cart, setCart }}>
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
