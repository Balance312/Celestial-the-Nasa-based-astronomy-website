import '../pages/pages.css';

function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-hero about-hero">
        <div className="hero-content">
          <h1 className="page-title">About Celestial</h1>
          <p className="page-subtitle">Exploring the infinite cosmos</p>
        </div>
      </div>

      <div className="container py-5">
        {/* Mission Section */}
        <section className="about-section mb-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4">
              <h2 className="section-title">Our Mission</h2>
              <p className="section-text">
                Celestial is dedicated to bringing the wonders of the universe to everyone. Our mission is to
                make space exploration and astronomical knowledge accessible, inspiring, and engaging for all.
              </p>
              <p className="section-text">
                Through our collection of NASA's Astronomy Picture of the Day and other cosmic resources,
                we aim to spark curiosity about our place in the universe.
              </p>
            </div>
            <div className="col-lg-6">
              <div className="about-image-box">
                🌌 Universe Awaits
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="about-section mb-5">
          <h2 className="section-title text-center mb-5">What We Offer</h2>
          <div className="row g-4">
            <div className="col-md-4">
              <div className="about-card">
                <div className="card-icon">🔭</div>
                <h3>Daily APOD</h3>
                <p>
                  Discover a new astronomical image or video every single day from NASA's curated collection.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="about-card">
                <div className="card-icon">🌠</div>
                <h3>Cosmic Gallery</h3>
                <p>
                  Browse through a stunning collection of the universe's most spectacular moments and phenomena.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="about-card">
                <div className="card-icon">🚀</div>
                <h3>Space Knowledge</h3>
                <p>
                  Learn fascinating facts about space, astronomy, and the incredible cosmos we live in.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="about-section mb-5">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-2 mb-4">
              <h2 className="section-title">Built with Modern Tech</h2>
              <p className="section-text">
                Celestial is built using the latest web technologies to provide you with a fast, responsive,
                and beautiful experience.
              </p>
              <div className="tech-list">
                <div className="tech-item">⚛️ React - Modern UI library</div>
                <div className="tech-item">⚡ Vite - Lightning-fast build tool</div>
                <div className="tech-item">🎨 Bootstrap - Responsive design</div>
                <div className="tech-item">🚀 NASA API - Real space data</div>
              </div>
            </div>
            <div className="col-lg-6 order-lg-1">
              <div className="about-image-box">
                💻 Advanced Technology
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="about-section mb-5">
          <h2 className="section-title text-center mb-5">By The Numbers</h2>
          <div className="row g-4">
            <div className="col-md-3 col-sm-6">
              <div className="stat-box">
                <div className="stat-number">20+</div>
                <div className="stat-label">Years of APOD</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-box">
                <div className="stat-number">7000+</div>
                <div className="stat-label">Images & Videos</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-box">
                <div className="stat-number">∞</div>
                <div className="stat-label">Cosmic Wonders</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-box">
                <div className="stat-number">🌍</div>
                <div className="stat-label">For Everyone</div>
              </div>
            </div>
          </div>
        </section>

        {/* About NASA Section */}
        <section className="about-section py-5 nasa-info">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <h2 className="section-title text-center mb-4">About Our Data Source</h2>
              <div className="info-box">
                <h4>NASA's Astronomy Picture of the Day (APOD)</h4>
                <p>
                  APOD is a website provided by NASA's Goddard Space Flight Center and Michigan Technological University.
                  Each day, a different image or photograph of our fascinating universe is featured, along with a brief
                  explanation written by a professional astronomer.
                </p>
                <p>
                  The images cover a wide range of astronomical phenomena including galaxies, nebulae, planets, stars,
                  and more. APOD has been running since 1995 and provides an incredible archive of space photography
                  and space science information.
                </p>
                <p className="text-center mt-4">
                  <a href="https://apod.nasa.gov/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                    Visit NASA APOD →
                  </a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="about-section py-5">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <h2 className="section-title text-center mb-4">Get In Touch</h2>
              <div className="contact-box">
                <p className="text-center">
                  Have questions or feedback? We'd love to hear from you!
                </p>
                <div className="text-center mt-4">
                  <button className="btn btn-primary btn-lg">Contact Us</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
