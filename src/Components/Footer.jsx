import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer-section">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h5 className="footer-title">Celestial</h5>
            <p className="footer-text">
              Exploring the infinite possibilities of the universe
            </p>
          </div>
          <div>
            <h5 className="footer-title">Navigation</h5>
            <ul className="footer-links">
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/apod">Today&apos;s APOD</Link>
              </li>
              <li>
                <Link to="/gallery">Gallery</Link>
              </li>
              <li>
                <Link to="/about">About</Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="footer-title">Resources</h5>
            <ul className="footer-links">
              <li>
                <a
                  href="https://apod.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NASA APOD
                </a>
              </li>
              <li>
                <a
                  href="https://www.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NASA.gov
                </a>
              </li>
              <li>
                <a
                  href="https://api.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  NASA API
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="footer-title">Give us a star here</h5>
            <ul className="footer-links">
              <li>
                <a
                  href="https://github.com/Balance312/Celestial-the-Nasa-based-astronomy-website"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  GitHub repo
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center">
          <p className="text-muted mb-0">
            &copy; 2026 Celestial. All rights reserved. Powered by NASA APOD
            API.
          </p>
        </div>
      </div>
    </footer>
  );
}
