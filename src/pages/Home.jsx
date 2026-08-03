import { Link } from "react-router-dom"
import { useState, useEffect, useCallback } from "react"
import { getTodayApod, getEpicLatest, getEpicImageUrl } from "../utils/nasaApi.js"
import { getNasaApiKey } from "../utils/apiConfig.js"

const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&q=80",
    title: "Explore the Universe",
    subtitle: "Real-time Data from NASA's APIs",
  },
  {
    image: "https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1200&q=80",
    title: "Deep Space Wonders",
    subtitle: "Captured by Hubble & James Webb",
  },
  {
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80",
    title: "Our Home Planet",
    subtitle: "View Earth from Space in Real-time",
  },
]

const MARS_ROVER_HIGHLIGHTS = [
  {
    name: "Perseverance: Delta Front",
    date: "Dec 11, 2024",
    image: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=400&q=80",
  },
  {
    name: "Curiosity: Gale Crater Panorama",
    date: "Oct 15, 2024",
    image: "https://images.unsplash.com/photo-1614313913007-2b4ae8ce32d6?w=400&q=80",
  },
  {
    name: "Ingenuity: Flight 72",
    date: "Sep 12, 2024",
    image: "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=400&q=80",
  },
]

function Home() {
  const [todayAPOD, setTodayAPOD] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [epicImage, setEpicImage] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      try {
        const apiKey = getNasaApiKey();
        const [apodData, epicData] = await Promise.all([
          getTodayApod(apiKey, { signal: controller.signal, preferCache: true }),
          getEpicLatest(apiKey, { signal: controller.signal, preferCache: true }),
        ]);
        setTodayAPOD(apodData);
        if (epicData && epicData.length > 0) {
          setEpicImage(epicData[0]);
        }
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error fetching data:', err);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 6000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  return (
    <div className="min-h-screen">
      {/* Hero Carousel */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {HERO_SLIDES.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={slide.image}
              alt={slide.title}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-space-900/90 via-space-900/60 to-transparent" />
          </div>
        ))}

        {/* Hero Content */}
        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto max-w-7xl px-4 lg:px-6">
            <div className="max-w-2xl">
              <h1 className="hero-title mb-4 text-5xl font-bold md:text-6xl">
                {HERO_SLIDES[currentSlide].title}
              </h1>
              <p className="mb-8 text-xl text-text-secondary md:text-2xl">
                {HERO_SLIDES[currentSlide].subtitle}
              </p>
              <Link
                to="/apod"
                className="btn btn-primary btn-lg inline-flex items-center"
              >
                Discover More
              </Link>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border-glow bg-space-800/60 text-text-bright backdrop-blur-sm transition-all hover:bg-space-700 hover:border-cyan-glow"
          aria-label="Previous slide"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-border-glow bg-space-800/60 text-text-bright backdrop-blur-sm transition-all hover:bg-space-700 hover:border-cyan-glow"
          aria-label="Next slide"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Dot Indicators */}
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
          {HERO_SLIDES.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "w-8 bg-cyan-glow"
                  : "w-2 bg-text-muted hover:bg-text-secondary"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Decorative circuit lines */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-glow/30 to-transparent" />
      </section>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* APOD + EPIC Preview Grid */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* APOD Preview */}
              <div className="card p-4">
                <h2 className="mb-4 font-display text-lg font-bold text-cyan-glow">
                  Astronomy Picture of the Day (APOD)
                </h2>
                {todayAPOD && !loading ? (
                  <>
                    {todayAPOD.media_type === 'image' ? (
                      <img
                        src={todayAPOD.url}
                        alt={todayAPOD.title}
                        className="mb-3 w-full rounded-lg object-cover"
                        style={{ aspectRatio: '16/10' }}
                        loading="eager"
                      />
                    ) : (
                      <div className="mb-3 flex w-full items-center justify-center rounded-lg bg-space-700" style={{ aspectRatio: '16/10' }}>
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}
                    <h3 className="mb-1 text-sm font-bold text-text-bright">{todayAPOD.title}</h3>
                    <p className="mb-2 text-xs text-text-muted line-clamp-2">{todayAPOD.explanation?.substring(0, 100)}...</p>
                    <Link to="/apod" className="text-xs font-semibold text-cyan-glow hover:text-gold">
                      View Full Image ↗
                    </Link>
                  </>
                ) : (
                  <div className="flex aspect-[16/10] items-center justify-center rounded-lg bg-space-700">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-glow border-t-transparent" />
                  </div>
                )}
              </div>

              {/* EPIC Preview */}
              <div className="card p-4">
                <h2 className="mb-4 font-display text-lg font-bold text-cyan-glow">
                  Live Earth from EPIC
                </h2>
                <div className="mb-3 flex aspect-[16/10] w-full items-center justify-center overflow-hidden rounded-lg bg-space-900">
                  {epicImage ? (
                    <img
                      src={getEpicImageUrl(epicImage.date, epicImage, getNasaApiKey())}
                      alt="Earth from EPIC"
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-glow border-t-transparent" />
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  UTC: {epicImage?.date ? new Date(epicImage.date).toISOString().replace('T', ' ').substring(0, 19) : '--:--:--'}
                </p>
                <Link to="/epic" className="mt-2 inline-block text-xs font-semibold text-cyan-glow hover:text-gold">
                  View Full Image ↗
                </Link>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="lg:col-span-4">
            {/* Live Resolution Gallery */}
            <div className="card mb-6 p-4">
              <h3 className="mb-4 font-display text-sm font-bold text-gold">
                Live Resolution Gallery
              </h3>
              <div className="mb-3 rounded-lg bg-space-700 p-3">
                <p className="text-xs text-text-muted">Live Earth from EPIC</p>
                <p className="mt-1 text-[10px] text-text-muted">
                  Date: {epicImage?.date ? epicImage.date.split('T')[0] : new Date().toISOString().split('T')[0]}
                </p>
                <p className="text-[10px] text-text-muted">Instrument: EPIC Camera</p>
                <p className="text-[10px] text-text-muted">Source: DSCOVR Satellite</p>
                <p className="text-[10px] text-text-muted">Distance: ~1,000,000 mi</p>
                <p className="mt-2 text-[10px] text-text-muted">
                  {epicImage?.time || '--:--:--'} UTC
                </p>
              </div>
              <Link to="/epic" className="text-xs font-semibold text-cyan-glow hover:text-gold">
                View Full Image ↗
              </Link>
            </div>

            {/* Recent Mars Rover Highlights */}
            <div className="card p-4">
              <h3 className="mb-4 font-display text-sm font-bold text-gold">
                Recent Mars Rover Highlights
              </h3>
              <div className="space-y-3">
                {MARS_ROVER_HIGHLIGHTS.map((rover) => (
                  <div key={rover.name} className="flex gap-3 rounded-lg bg-space-700 p-2">
                    <img
                      src={rover.image}
                      alt={rover.name}
                      className="h-16 w-16 flex-shrink-0 rounded object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-bold text-text-bright">{rover.name}</p>
                      <p className="text-[10px] text-text-muted">{rover.date}</p>
                      <button className="mt-1 text-[10px] font-semibold text-cyan-glow hover:text-gold">
                        View Details →
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative circuit border */}
      <div className="h-px bg-gradient-to-r from-transparent via-cyan-glow/20 to-transparent" />

      {/* Stats Section */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 text-center sm:grid-cols-2 lg:grid-cols-4">
            {[
              { number: '20+', label: 'Years of APOD' },
              { number: '7000+', label: 'Images & Videos' },
              { number: '∞', label: 'Cosmic Wonders' },
              { number: '🌍', label: 'For Everyone' },
            ].map((stat) => (
              <div key={stat.label} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label mt-1 text-xs font-semibold uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid items-center gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <h2 className="cta-title">Start Your Cosmic Journey</h2>
              <p className="cta-subtitle">Explore the wonders of the universe and expand your perspective on what&apos;s out there</p>
            </div>
            <div className="text-center lg:col-span-4">
              <Link to="/gallery" className="btn btn-primary btn-lg">
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
