import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import './Footer.css';

export default function Footer() {
  const sessionUser = useSelector(state => state.session.user);

  return (
    <div id="footer">
      <div id="footer-col-1">
        <Link to="/">
          <div id="footer-logo-text">Spellbound Market</div>
        </Link>
      </div>

      <div className="footer-right">
        <div id="footer-col">
          <div className="footer-right-header">Features</div>
          <div className="footer-list">
            <Link to="/products"><div>Products</div></Link>
            <Link to="/dashboard"><div>Dashboard</div></Link>
          </div>
        </div>

        <div id="footer-col">
          <div className="footer-right-header">Creator</div>
          <div className="footer-list">
            <div className="footer-name">
              <div>Wyldeliz Santos</div>
              <div className="footer-links">
                <a
                  href="https://www.linkedin.com/in/wyldeliz/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa-brands fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div id="footer-copyright">
        © 2025 Spellbound Market
      </div>
    </div>
  );
}
