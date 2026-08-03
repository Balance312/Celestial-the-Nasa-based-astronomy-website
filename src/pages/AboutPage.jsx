function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-hero about-hero">
        <div className="hero-content">
          <h1 className="page-title">About Celestial</h1>
          <p className="page-subtitle">Open-source NASA imagery explorer</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12">
        <section className="about-section mb-12">
          <div className="mx-auto max-w-3xl">
            <p className="section-text mb-4">
              Celestial is an open-source web application designed to bring NASA's daily astronomy imagery and satellite data into a clean, modern interface.
            </p>
            <p className="section-text">
              Instead of navigating complex government databases, Celestial gives space enthusiasts, students, and researchers a fast, distraction-free way to explore the universe in real time.
            </p>
          </div>
        </section>

        <section className="about-section mb-12">
          <h2 className="section-title mb-12 text-center">Core Features</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="about-card">
              <div className="card-icon">🔭</div>
              <h3>Astronomy Picture of the Day</h3>
              <p className="section-text">
                Browse NASA's daily featured imagery spanning over 30 years, complete with official descriptions and high-resolution downloads.
              </p>
            </div>
            <div className="about-card">
              <div className="card-icon">🌠</div>
              <h3>Cosmic Gallery</h3>
              <p className="section-text">
                Explore curated collections of deep-space photos captured by the Hubble and James Webb Space Telescopes.
              </p>
            </div>
            <div className="about-card">
              <div className="card-icon">🌍</div>
              <h3>EPIC Earth View</h3>
              <p className="section-text">
                View real-time, full-disc images of Earth taken by NASA's DSCOVR satellite from one million miles away.
              </p>
            </div>
            <div className="about-card">
              <div className="card-icon">💾</div>
              <h3>Personal Space Collection</h3>
              <p className="section-text">
                Save your favorite cosmic discoveries locally to build your own custom gallery.
              </p>
            </div>
          </div>
        </section>

        <section className="about-section mb-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title mb-6 text-center">Powered by Official NASA APIs</h2>
            <div className="info-box">
              <p className="section-text mb-4">
                Celestial connects directly to NASA's Open Data Portal to deliver verified space imagery and scientific data:
              </p>
              <div className="tech-list">
                <div className="tech-item">APOD API — Daily imagery, historical archives, and scientific metadata</div>
                <div className="tech-item">EPIC API — Imagery and orientation data from the Earth Polychromatic Imaging Camera</div>
                <div className="tech-item">NASA Image and Video Library — Global media search across historical space missions</div>
              </div>
              <p className="mt-6 text-center">
                <a href="https://api.nasa.gov/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                  Explore NASA APIs →
                </a>
              </p>
            </div>
          </div>
        </section>

        <section className="about-section mb-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title mb-6 text-center">Built for Speed & Accessibility</h2>
            <div className="info-box">
              <p className="section-text mb-4">
                Celestial was created to demonstrate how open scientific data can be paired with clean frontend architecture.
              </p>
              <div className="tech-list">
                <div className="tech-item">Tech Stack — React, Vite, and Tailwind CSS</div>
                <div className="tech-item">Performance — Optimized for fast image loading, caching, and responsive design across all screen sizes</div>
                <div className="tech-item">Accessibility — Designed with high contrast standards and keyboard navigation in mind</div>
              </div>
            </div>
          </div>
        </section>

        <section className="about-section py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="section-title mb-6 text-center">Open Source & Data Attribution</h2>
            <div className="info-box">
              <p className="section-text">
                All imagery and descriptive content are provided courtesy of NASA, the Jet Propulsion Laboratory (JPL), and partner scientific institutions. Celestial is an independent, non-commercial open-source project.
              </p>
              <div className="mt-6 text-center">
                <a
                  href="https://github.com/Balance312/Celestial-the-Nasa-based-astronomy-website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  View on GitHub →
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
