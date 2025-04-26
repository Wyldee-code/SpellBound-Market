import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useShoppingCart } from "../../context/ShoppingCart";
import "./ShoppingCart.css";

export default function ShoppingCart() {
  const navigate = useNavigate();
  const ulRef = useRef();
  const { cart, setCart, removeItem } = useShoppingCart();

  const [showMenu, setShowMenu] = useState(false);
  const [total, setTotal] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    calculateTotal();
  }, [cart]);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (!showMenu) return;

    const closeMenu = (e) => {
      if (!ulRef.current) return;
      if (!ulRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("click", closeMenu);
    return () => document.removeEventListener("click", closeMenu);
  }, [showMenu]);

  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", { credentials: "include" });
      const data = await res.json();
      if (res.ok) {
        setCart(data.cart_items);
        setIsLoaded(true);
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  const calculateTotal = () => {
    let newTotal = 0;
    cart.forEach((item) => {
      newTotal += (item.menu_item?.price || 0) * item.quantity;
    });
    setTotal(newTotal);
  };

  const toggleCart = () => setShowMenu(!showMenu);

  const handleCheckout = () => {
    navigate("/cart");
    setShowMenu(false);
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    try {
      await fetch(`/api/cart/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      fetchCart();
    } catch (err) {
      console.error("Error deleting item:", err);
    }
  };

  const ulClassName = "cart-dropdown" + (showMenu ? "" : " hidden");

  return (
    <>
      <button className="shopping-cart" onClick={toggleCart}>
        <i className="fa-solid fa-cart-shopping"></i>
        <div>Cart ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)})</div>
      </button>

      {showMenu && (
        <div className={ulClassName} ref={ulRef}>
          {isLoaded && cart.length ? (
            <>
              <div className="cart-contents">
                <button onClick={() => setShowMenu(false)} className="close-cart">
                  <i className="fa-solid fa-x"></i>
                </button>
                <div className="cart-title">Your Cart</div>

                <div className="cart-item-list">
                  {cart.map((item, idx) => (
                    <div className="item-entry" key={idx}>
                      <div>{item.quantity}× {item.menu_item?.name}</div>
                      <div className="item-entry-right">
                        <div>${(item.menu_item?.price * item.quantity).toFixed(2)}</div>
                        <button
                          className="item-entry-delete"
                          onClick={(e) => handleDeleteItem(e, item.id)}
                        >
                          <i className="fa-regular fa-trash-can"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-total">
                  <div>Subtotal</div>
                  <div>${total.toFixed(2)}</div>
                </div>
              </div>

              <div className="cart-buttons">
                <button className="cart-checkout" onClick={handleCheckout}>
                  Go to Checkout
                </button>
              </div>
            </>
          ) : (
            <div className="empty-cart-contents">
              <button onClick={() => setShowMenu(false)}>
                <i className="fa-solid fa-x"></i>
              </button>
              <div className="empty-cart">
                <img src="/emptycart.png" alt="Empty cart" />
                <p className="empty-cart-text">Your cart is empty!</p>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
