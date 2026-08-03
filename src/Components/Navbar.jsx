import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import ThemeToggle from "./ThemeToggle.jsx";

function Navbar({ favoritesCount, theme, toggleTheme }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const prevLocationRef = useRef(location);

  useEffect(() => {
    if (prevLocationRef.current !== location) {
      setIsMenuOpen(false);
      prevLocationRef.current = location;
    }
  }, [location]);

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/apod", label: "Today's APOD" },
    { to: "/gallery", label: "Gallery" },
    { to: "/epic", label: "Earth EPIC" },
    { to: "/profile", label: "My Space Collection", badge: favoritesCount },
    { to: "/about", label: "About" },
  ];

  return (
    <nav className="navbar-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        <NavLink to="/" className="no-underline">
          <h1 className="Celestial">Celestial</h1>
        </NavLink>

        <button
          type="button"
          className="navbar-toggler"
          aria-controls="navbarSupportedContent"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        </button>

        <div
          id="navbarSupportedContent"
          className={`mobile-nav-panel ${isMenuOpen ? "open" : ""}`}
        >
          <ul className="flex flex-col lg:flex-row lg:items-center lg:gap-1">
            {navLinks.map(({ to, label, end, badge }) => (
              <li key={to} className="mobile-nav-item">
                <NavLink
                  to={to}
                  end={end}
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                  {badge !== undefined && (
                    <span className="collection-badge ml-2">{badge}</span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
      </div>
    </nav>
  );
}

export default Navbar;
