import { Link } from "react-router-dom"
import { useState, useEffect } from "react"
import { getTodayApod } from "../utils/nasaApi.js"
import { getNasaApiKey } from "../utils/apiConfig.js"

function Home() {
  const [todayAPOD, setTodayAPOD] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    const fetchTodayAPOD = async () => {
      try {
        const apiKey = getNasaApiKey();

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
      <section className="hero-section">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center justify-center px-4 py-16">
          <div className="hero-content flex w-full max-w-3xl flex-col items-center justify-center text-center">
            <h1 className="hero-title">Celestial</h1>
            <p className="hero-subtitle">Explore the universe, one image at a time</p>
            <p className="hero-description">Discover NASA's daily astronomy images and dive into the wonders of the cosmos</p>
            <div className="hero-buttons">
              <Link to="/apod" className="btn btn-primary btn-lg btn-glow mt-4">
                Today's Picture
              </Link>
              <Link to="/gallery" className="btn btn-outline-light btn-lg mt-4">
                Browse Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {todayAPOD && !loading && (
        <section className="apod-preview-section py-12">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="section-title mb-12 text-center">Today's Cosmic Wonder</h2>
            <div className="grid items-center gap-8 lg:grid-cols-2">
              <div>
                {todayAPOD.media_type === 'image' ? (
                  <img
                    src={todayAPOD.url}
                    alt={todayAPOD.title}
                    className="preview-image"
                    loading="eager"
                    decoding="async"
                    width="100%"
                    height="auto"
                  />
                ) : (
                  <div className="preview-video-placeholder">
                    🎬 Video
                  </div>
                )}
              </div>
              <div className="flex flex-col justify-center">
                <h3 className="preview-title">{todayAPOD.title}</h3>
                <p className="preview-date">📅 {todayAPOD.date}</p>
                <p className="preview-text">{todayAPOD.explanation.substring(0, 250)}...</p>
                <Link to="/apod" className="btn btn-primary mt-4 self-start">
                  View Full Image →
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="features-section py-12" id="features">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="section-title mb-12 text-center">Why Choose Celestial?</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: '🔭', title: 'Daily Updates', text: "Access NASA's Astronomy Picture of the Day with daily updates featuring stunning cosmic imagery." },
              { icon: '📚', title: 'Learn More', text: 'Each image comes with detailed explanations from professional astronomers about cosmic phenomena.' },
              { icon: '🌌', title: 'Explore Gallery', text: 'Browse through thousands of past images and videos in our growing cosmic gallery collection.' },
              { icon: '📅', title: 'Historical Archive', text: "Access over 30 years of NASA's Astronomy Picture of the Day archive and explore cosmic imagery from any date." },
              { icon: '🚀', title: 'NASA Official Data', text: "All content sourced directly from NASA's official Astronomy Picture of the Day archive." },
              { icon: '✨', title: 'Beautiful Design', text: 'Experience stunning visual design with a cosmic theme and smooth animations.' },
            ].map((feature) => (
              <div key={feature.title} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-text">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="stats-section py-12">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: '20+', label: 'Years of APOD' },
              { number: '7000+', label: 'Images & Videos' },
              { number: '∞', label: 'Cosmic Wonders' },
              { number: '🌍', label: 'For Everyone' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="cta-title">Start Your Cosmic Journey</h2>
              <p className="cta-subtitle">Explore the wonders of the universe and expand your perspective on what's out there</p>
            </div>
            <div className="text-center lg:col-span-4">
              <Link to="/gallery" className="btn btn-primary btn-lg btn-glow">
                Explore Now
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
