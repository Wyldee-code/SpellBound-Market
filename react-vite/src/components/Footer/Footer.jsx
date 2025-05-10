import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Footer.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

export default function Footer() {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <footer className="footer">
      {/* Left Column: Logo & Tagline */}
      <div className="footer-left">
        <Link to="/" className="footer-logo-link">
          <div id="footer-logo-text">
            <span id="logo-eats-text">Spellbound</span> Market
          </div>
        </Link>
        <p className="footer-description">
          Your mystical marketplace for crystals, art, and spiritual tools.
        </p>
      </div>

      {/* Right Side: Links */}
      <div className="footer-links">
        {/* Features */}
        <div className="footer-list">
          <div className="footer-right-header">Features</div>
          <Link to="/products">Products</Link>
          {sessionUser && <Link to="/dashboard">Dashboard</Link>}
        </div>

        {/* Creator Info */}
        <div className="footer-list">
          <div className="footer-right-header">Creator</div>
          <div className="footer-name">
            <span>Wyldeliz Santos</span>
            <a
              href="https://www.linkedin.com/in/wyldeliz/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <i className="fa-brands fa-linkedin"></i>
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="footer-bottom">
        © 2025 Spellbound Market
      </div>
    </footer>
  );
}
