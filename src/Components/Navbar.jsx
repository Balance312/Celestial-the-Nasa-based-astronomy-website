import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

function Navbar({ favoritesCount }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const prevLocationRef = useRef(location);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (prevLocationRef.current !== location) {
      setIsMenuOpen(false);
      prevLocationRef.current = location;
    }
  }, [location]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      navigate(`/gallery?q=${encodeURIComponent(trimmed)}`);
      setSearchQuery('');
      searchInputRef.current?.blur();
    }
  };

  const navLinks = [
    { to: "/", label: "Home", end: true },
    { to: "/apod", label: "APOD" },
    { to: "/gallery", label: "Gallery" },
    { to: "/epic", label: "EPIC" },
    { to: "/profile", label: "My Collection", badge: favoritesCount },
    { to: "/about", label: "About" },
  ];

  return (
    <nav className="navbar-background">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-6">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-3 no-underline">
          <svg
            width="36"
            height="36"
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            {/* Outer orbit ring */}
            <ellipse
              cx="18"
              cy="18"
              rx="16"
              ry="6"
              transform="rotate(-25 18 18)"
              stroke="var(--color-cyan-glow)"
              strokeWidth="1.5"
              fill="none"
              opacity="0.6"
            />
            {/* Planet body */}
            <circle
              cx="18"
              cy="18"
              r="7"
              fill="var(--color-cyan-glow)"
              opacity="0.15"
            />
            <circle
              cx="18"
              cy="18"
              r="7"
              stroke="var(--color-cyan-glow)"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Planet highlight */}
            <circle
              cx="16"
              cy="16"
              r="2"
              fill="var(--color-cyan-glow)"
              opacity="0.4"
            />
            {/* Star dot */}
            <circle
              cx="28"
              cy="10"
              r="1.5"
              fill="var(--color-gold)"
              opacity="0.8"
            />
          </svg>
          <h1 className="Celestial m-0 text-lg">CELESTIAL</h1>
        </NavLink>

        {/* Search Bar — desktop only */}
        <form
          onSubmit={handleSearchSubmit}
          className={`relative mx-4 hidden transition-all duration-300 lg:block ${
            isSearchFocused ? 'w-80' : 'w-56'
          }`}
        >
          <svg
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            placeholder="Search NASA database..."
            className="w-full rounded-lg border border-border-glow bg-space-700 py-2 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-cyan-glow focus:outline-none"
          />
        </form>

        {/* Mobile menu toggle */}
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

        {/* Nav links + mobile search */}
        <div
          id="navbarSupportedContent"
          className={`mobile-nav-panel ${isMenuOpen ? "open" : ""}`}
        >
          {/* Mobile search — visible in mobile menu */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative mb-3 lg:hidden"
          >
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search NASA database..."
              className="w-full rounded-lg border border-border-glow bg-space-700 py-2.5 pl-10 pr-4 text-sm text-text-primary placeholder-text-muted focus:border-cyan-glow focus:outline-none"
            />
          </form>

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
      </div>
    </nav>
  );
}

export default Navbar;
