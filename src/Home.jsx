import "./home.css"
import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { getTodayApod } from "./utils/nasaApi.js"

function Home() {
  const [todayAPOD, setTodayAPOD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTodayAPOD = async () => {
      try {
        const apiKey = import.meta.env.VITE_NASA_API_KEY;
        if (!apiKey) return;

        const data = await getTodayApod(apiKey, {
          signal: controller.signal,
          preferCache: true,
        });
        setTodayAPOD(data);
      } catch (err) {
        if (err.name === 'AbortError') {
          return;
        }

        console.error('Error fetching APOD:', err);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchTodayAPOD();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="stars"></div>
        <div className="container-fluid h-100">
          <div className="row h-100 align-items-center justify-content-center">
            <div className="col-lg-8 col-md-10 hero-content text-center d-flex flex-column justify-content-center align-items-center">
              <h1 className="hero-title">Celestial</h1>
              <p className="hero-subtitle">Explore the universe, one image at a time</p>
              <p className="hero-description">Discover NASA's daily astronomy images and dive into the wonders of the cosmos</p>
              <div className="hero-buttons">
                <Link to="/apod" className="btn btn-primary btn-lg btn-glow mt-4 me-3">
                  Today's Picture
                </Link>
                <Link to="/gallery" className="btn btn-outline-light btn-lg mt-4">
                  Browse Gallery
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Today's APOD Preview */}
      {todayAPOD && !loading && (
        <section className="apod-preview-section py-5">
          <div className="container">
            <h2 className="section-title text-center mb-5">Today's Cosmic Wonder</h2>
            <div className="row">
              <div className="col-lg-6 mb-4">
                {todayAPOD.media_type === 'image' ? (
                  <img src={todayAPOD.url} alt={todayAPOD.title} className="preview-image" />
                ) : (
                  <div className="preview-video-placeholder">
                    🎬 Video
                  </div>
                )}
              </div>
              <div className="col-lg-6 d-flex flex-column justify-content-center">
                <h3 className="preview-title">{todayAPOD.title}</h3>
                <p className="preview-date">📅 {todayAPOD.date}</p>
                <p className="preview-text">{todayAPOD.explanation.substring(0, 250)}...</p>
                <Link to="/apod" className="btn btn-primary mt-4 align-self-start">
                  View Full Image →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="features-section py-5" id="features">
        <div className="container">
          <h2 className="section-title text-center mb-5">Why Choose Celestial?</h2>
          <div className="row g-4">
            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">🔭</div>
                <h3 className="feature-title">Daily Updates</h3>
                <p className="feature-text">Access NASA's Astronomy Picture of the Day with daily updates featuring stunning cosmic imagery.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">📚</div>
                <h3 className="feature-title">Learn More</h3>
                <p className="feature-text">Each image comes with detailed explanations from professional astronomers about cosmic phenomena.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">🌌</div>
                <h3 className="feature-title">Explore Gallery</h3>
                <p className="feature-text">Browse through thousands of past images and videos in our growing cosmic gallery collection.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3 className="feature-title">Fast & Responsive</h3>
                <p className="feature-text">Lightning-fast loading times optimized for all devices with a beautiful, modern interface.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">🚀</div>
                <h3 className="feature-title">NASA Official Data</h3>
                <p className="feature-text">All content sourced directly from NASA's official Astronomy Picture of the Day archive.</p>
              </div>
            </div>
            <div className="col-lg-4 col-md-6">
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3 className="feature-title">Beautiful Design</h3>
                <p className="feature-text">Experience stunning visual design with a cosmic purple theme and smooth animations.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section py-5">
        <div className="container">
          <div className="row text-center">
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">20+</div>
                <div className="stat-label">Years of APOD</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">7000+</div>
                <div className="stat-label">Images & Videos</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">∞</div>
                <div className="stat-label">Cosmic Wonders</div>
              </div>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <div className="stat-card">
                <div className="stat-number">🌍</div>
                <div className="stat-label">For Everyone</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h2 className="cta-title">Start Your Cosmic Journey</h2>
              <p className="cta-subtitle">Explore the wonders of the universe and expand your perspective on what's out there</p>
            </div>
            <div className="col-lg-4 text-center">
              <Link to="/gallery" className="btn btn-primary btn-lg btn-glow">
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section">
        <div className="container">
          <div className="row py-5">
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="footer-title">Celestial</h5>
              <p className="footer-text">Exploring the infinite possibilities of the universe</p>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="footer-title">Navigation</h5>
              <ul className="footer-links">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/apod">Today's APOD</Link></li>
                <li><Link to="/gallery">Gallery</Link></li>
                <li><Link to="/about">About</Link></li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="footer-title">Resources</h5>
              <ul className="footer-links">
                <li><a href="https://apod.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA APOD</a></li>
                <li><a href="https://www.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA.gov</a></li>
                <li><a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer">NASA API</a></li>
              </ul>
            </div>
            <div className="col-lg-3 col-md-6 mb-4">
              <h5 className="footer-title">Connect</h5>
              <ul className="footer-links">
                <li><a href="#">Twitter</a></li>
                <li><a href="#">Facebook</a></li>
                <li><a href="#">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-top border-secondary py-4 text-center">
            <p className="text-muted mb-0">&copy; 2026 Celestial. All rights reserved. Powered by NASA APOD API.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
export default Home;
