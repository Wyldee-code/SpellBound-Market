import { NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { thunkLogout } from "../../redux/session";
import ProfileButton from "./ProfileButton";
import { useShoppingCart } from "../../context/ShoppingCart";
import "./Navigation.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

function Navigation() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.session.user);
  const { cart, setCart } = useShoppingCart();

  const totalQuantity = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const clearCartOnLogout = async () => {
    try {
      await fetch("/api/cart/clear", {
        method: "DELETE",
        credentials: "include",
      });
      setCart([]);
    } catch (err) {
      console.error("Error clearing cart on logout:", err);
    }
  };

  const logout = async (e) => {
    e.preventDefault();
    await clearCartOnLogout();
    await dispatch(thunkLogout());
  };

  const capitalize = (str) => str?.charAt(0).toUpperCase() + str?.slice(1);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Left Section */}
        <div className="navbar-left">
          <NavLink to="/" className="logo-link">
            <img src="/spellbound-logo.png" alt="Spellbound Market" className="logo" />
          </NavLink>
          <h1 className="site-title">🔮 Spellbound Market</h1>
        </div>

        {/* Middle Section (Optional for Search/Navigation) */}
        <div className="navbar-middle">
          <div className="search-bar">
            <input type="text" placeholder="Search crystals, art, magic..." />
            <i className="fa fa-search"></i>
          </div>
        </div>

        {/* Right Section */}
        <div className="navbar-right">
          <NavLink to="/cart" className="cart-button">
            <i className="fa-solid fa-cart-shopping"></i>
            {totalQuantity > 0 && <span className="cart-count-badge">{totalQuantity}</span>}
          </NavLink>

          {user ? (
            <>
              <span className="welcome-user">Welcome, {capitalize(user.username)}</span>
              <NavLink to="/dashboard" className="dashboard-link">Dashboard</NavLink>
              <button className="logout-btn" onClick={logout}>Log Out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">Log In</NavLink>
              <NavLink to="/signup" className="signup-button">Sign Up</NavLink>
            </>
          )}

          <ProfileButton />
        </div>
      </div>
    </nav>
  );
}

export default Navigation;
