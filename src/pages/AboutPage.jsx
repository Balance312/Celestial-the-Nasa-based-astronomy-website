import '../pages/pages.css';

function AboutPage() {
  return (
    <div className="about-page">
      <div className="page-hero about-hero">
        <div className="hero-content">
          <h1 className="page-title">About Celestial</h1>
          <p className="page-subtitle">Your gateway to the infinite cosmos – where wonder meets discovery</p>
        </div>
      </div>

      <div className="container py-5">
        {/* Mission Section */}
        <section className="about-section mb-5">
          <div className="row align-items-center">
            <div className="col-lg-6 mb-4">
              <h2 className="section-title">Our Mission</h2>
              <p className="section-text">
                We're obsessed with one thing: bringing the mind-bending beauty of the universe right to your screen.
                Celestial transforms how you experience space – from breathtaking cosmic phenomena to mind-expanding
                astronomical knowledge that reminds you how small (yet significant) we really are.
              </p>
              <p className="section-text">
                Powered by NASA's legendary Astronomy Picture of the Day archive, we make cutting-edge space exploration
                feel personal, intimate, and absolutely awe-inspiring. Every day brings a new cosmic story waiting to be discovered.
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
                <h3>Daily Cosmic Treasures</h3>
                <p>
                  A fresh astronomical masterpiece lands on your screen every single day. Galaxies, nebulae, and cosmic events that'll make your jaw drop.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="about-card">
                <div className="card-icon">🌠</div>
                <h3>Stunning Gallery</h3>
                <p>
                  Journey through 7000+ images of the universe's most jaw-dropping moments. From star birth to black holes – it's all here.
                </p>
              </div>
            </div>
            <div className="col-md-4">
              <div className="about-card">
                <div className="card-icon">🚀</div>
                <h3>Expand Your Mind</h3>
                <p>
                  Expert insights on every image. Learn what you're looking at, why it matters, and what it tells us about reality itself.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Section */}
        <section className="about-section mb-5">
          <div className="row align-items-center">
            <div className="col-lg-6 order-lg-2 mb-4">
              <h2 className="section-title">Cutting-Edge Tech</h2>
              <p className="section-text">
                We built Celestial on a foundation of modern, blazing-fast technology to deliver the silkiest experience.
                Your cosmic journey deserves a platform that keeps up with your curiosity.
              </p>
              <div className="tech-list">
                <div className="tech-item">⚛️ React – Responsive, interactive experiences</div>
                <div className="tech-item">⚡ Vite – Lightning-speed performance</div>
                <div className="tech-item">🎨 Bootstrap – Beautiful, adaptive design</div>
                <div className="tech-item">🚀 NASA API – Real-time cosmic data</div>
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
                <div className="stat-number">29+</div>
                <div className="stat-label">Years Running</div>
              </div>
            </div>
            <div className="col-md-3 col-sm-6">
              <div className="stat-box">
                <div className="stat-number">10K+</div>
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
                <div className="stat-label">Totally Free</div>
              </div>
            </div>
          </div>
        </section>

        {/* About NASA Section */}
        <section className="about-section py-5 nasa-info">
          <div className="row">
            <div className="col-lg-8 offset-lg-2">
              <h2 className="section-title text-center mb-4">Powered by NASA</h2>
              <div className="info-box">
                <h4>The Legendary APOD Archive</h4>
                <p>
                  Since 1995, NASA's Astronomy Picture of the Day (APOD) has been humanity's daily dose of cosmic wonder.
                  Curated by professional astronomers from NASA's Goddard Space Flight Center and Michigan Tech, each image
                  comes with expert explanations that transform you from observer to astronomer.
                </p>
                <p>
                  We tap into this incredible vault of 10,000+ images and videos – from distant galaxies and nebulae to
                  planetary close-ups and stellar phenomena. It's basically having the universe's greatest hits delivered to you daily.
                </p>
                <p className="text-center mt-4">
                  <a href="https://apod.nasa.gov/" target="_blank" rel="noopener noreferrer" className="btn btn-outline-light">
                    Explore the Original APOD →
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
                  <a
                    href="https://github.com/Balance312"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-lg"
                  >
                    Contact Us
                  </a>
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
