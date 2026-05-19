import "./navbar.css";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Navbar({ favoritesCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const prevLocationRef = useRef(location);

  // Close menu when navigation occurs
  useEffect(() => {
    if (prevLocationRef.current !== location) {
      setIsMenuOpen(false);
      prevLocationRef.current = location;
    }
  }, [location]);

  const handleToggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <div>
      <nav className="navbar navbar-expand-lg navbar-background" data-bs-theme="dark">
        <div className="container-fluid">
          <NavLink className="navbar-brand font-weight-bold" to="/">
            <h1 className="Celestial">Celestial</h1>
          </NavLink>
          <button
            className="navbar-toggler"
            type="button"
            aria-controls="navbarSupportedContent"
            aria-expanded={isMenuOpen}
            aria-label="Toggle navigation"
            onClick={handleToggleMenu}
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className={`collapse navbar-collapse ${isMenuOpen ? "show" : ""}`}
            id="navbarSupportedContent"
          >
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/" end onClick={handleMenuItemClick}>
                  Home
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/apod" onClick={handleMenuItemClick}>
                  Today's APOD
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/gallery" onClick={handleMenuItemClick}>
                  Gallery
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/epic" onClick={handleMenuItemClick}>
                  Earth EPIC
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/profile" onClick={handleMenuItemClick}>
                  My Space Collection
                  <span className="badge rounded-pill collection-badge ms-2">{favoritesCount}</span>
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/about" onClick={handleMenuItemClick}>
                  About
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
