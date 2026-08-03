function AboutPage() {
  const features = [
    {
      icon: 'bi-camera-reels',
      title: 'Astronomy Picture of the Day',
      text: "Browse NASA's daily featured imagery spanning over 30 years, complete with official descriptions and high-resolution downloads.",
    },
    {
      icon: 'bi-grid-3x3-gap',
      title: 'Universal Space Gallery',
      text: 'Explore curated collections of deep-space photos captured by the Hubble and James Webb Space Telescopes.',
    },
    {
      icon: 'bi-globe-americas',
      title: 'EPIC Earth View',
      text: "View real-time, full-disc images of Earth taken by NASA's DSCOVR satellite from one million miles away.",
    },
    {
      icon: 'bi-bookmark-star',
      title: 'Personal Space Collection',
      text: 'Save your favorite cosmic discoveries locally to build your own custom gallery.',
    },
  ];

  const apis = [
    'APOD API — Daily imagery, historical archives, and scientific metadata',
    'EPIC API — Imagery and orientation data from the Earth Polychromatic Imaging Camera',
    'NASA Image and Video Library — Global media search across historical space missions',
  ];

  const techStack = [
    'Tech Stack — React, Vite, and Tailwind CSS',
    'Performance — Optimized for fast image loading, caching, and responsive design across all screen sizes',
    'Accessibility — Designed with high contrast standards and keyboard navigation in mind',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div
        className="page-hero page-hero-image"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?w=1400&q=80)' }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <h1 className="page-title m-0 text-4xl font-bold md:text-5xl">
            About Celestial
          </h1>
          <p className="mt-3 text-lg text-text-secondary">
            Open-source NASA imagery explorer
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Intro */}
        <section className="mb-16">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 text-base leading-relaxed text-text-secondary">
              Celestial is an open-source web application designed to bring NASA&apos;s
              daily astronomy imagery and satellite data into a clean, modern interface.
            </p>
            <p className="text-base leading-relaxed text-text-secondary">
              Instead of navigating complex government databases, Celestial gives space
              enthusiasts, students, and researchers a fast, distraction-free way to
              explore the universe in real time.
            </p>
          </div>
        </section>

        {/* Core Features */}
        <section className="mb-16">
          <h2 className="m-0 mb-12 text-center text-3xl font-bold tracking-wide text-text-bright">
            Core Features
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature) => (
              <div key={feature.title} className="card p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-subtle">
                  <i className={`bi ${feature.icon} text-xl text-cyan-glow`}></i>
                </div>
                <h3 className="m-0 mb-2 text-xl font-bold text-text-bright">
                  {feature.title}
                </h3>
                <p className="m-0 text-sm leading-relaxed text-text-secondary">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* NASA APIs */}
        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="m-0 mb-6 text-center text-3xl font-bold tracking-wide text-text-bright">
              Powered by Official NASA APIs
            </h2>
            <div className="card p-6">
              <p className="mb-4 text-base leading-relaxed text-text-secondary">
                Celestial connects directly to NASA&apos;s Open Data Portal to deliver
                verified space imagery and scientific data:
              </p>
              <div className="space-y-3">
                {apis.map((item) => (
                  <div key={item} className="stat-card px-4 py-3 text-sm text-text-primary">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6 text-center">
                <a
                  href="https://api.nasa.gov/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-secondary no-underline"
                >
                  Explore NASA APIs &rarr;
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack */}
        <section className="mb-16">
          <div className="mx-auto max-w-3xl">
            <h2 className="m-0 mb-6 text-center text-3xl font-bold tracking-wide text-text-bright">
              Built for Speed &amp; Accessibility
            </h2>
            <div className="card p-6">
              <p className="mb-4 text-base leading-relaxed text-text-secondary">
                Celestial was created to demonstrate how open scientific data can be
                paired with clean frontend architecture.
              </p>
              <div className="space-y-3">
                {techStack.map((item) => (
                  <div key={item} className="stat-card px-4 py-3 text-sm text-text-primary">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Open Source */}
        <section className="py-12">
          <div className="mx-auto max-w-3xl">
            <h2 className="m-0 mb-6 text-center text-3xl font-bold tracking-wide text-text-bright">
              Open Source &amp; Data Attribution
            </h2>
            <div className="card p-6">
              <p className="text-base leading-relaxed text-text-secondary">
                All imagery and descriptive content are provided courtesy of NASA, the
                Jet Propulsion Laboratory (JPL), and partner scientific institutions.
                Celestial is an independent, non-commercial open-source project.
              </p>
              <div className="mt-6 text-center">
                <a
                  href="https://github.com/Balance312/Celestial-the-Nasa-based-astronomy-website"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary no-underline"
                >
                  <i className="bi bi-github"></i>
                  View on GitHub &rarr;
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
