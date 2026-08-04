import { useEffect, useState, useCallback, useMemo, useTransition, useRef } from 'react';
import { getEpicLatest, getEpicByDate, getEpicImageUrl } from '../utils/nasaApi.js';
import { getNasaApiKey } from '../utils/apiConfig.js';
import { getDefaultDate } from '../constants/apod.js';

function EpicPage() {
  const [epicData, setEpicData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [isPlaying, setIsPlaying] = useState(false);

  const playIntervalRef = useRef(null);
  const currentIndexRef = useRef(0);
  const epicDataRef = useRef(epicData);
  const [, startTransition] = useTransition();
  const errorTimerRef = useRef(null);

  const clearErrorTimer = useCallback(() => {
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearErrorTimer();
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [clearErrorTimer]);

  const fetchEpicData = useCallback(async (date, signal) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = getNasaApiKey();
      if (!apiKey) {
        throw new Error('NASA API key is not configured.');
      }

      const addDaysToDate = (dateStr, days) => {
        const parts = dateStr.split('-');
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        d.setDate(d.getDate() + days);
        return d.getFullYear() + '-' +
               String(d.getMonth() + 1).padStart(2, '0') + '-' +
               String(d.getDate()).padStart(2, '0');
      };

      const minDate = '2015-06-13';
      let currentDate = date;
      let foundData = false;
      let daysSearched = 0;
      const maxDaysToSearch = 7;

      while (!foundData && currentDate >= minDate && daysSearched < maxDaysToSearch) {
        if (signal?.aborted) return;
        try {
          const data = await getEpicByDate(apiKey, currentDate, { signal, preferCache: true });

          if (data && data.length > 0) {
            setEpicData(data);
            setSelectedImage(data[0]);
            foundData = true;

            if (daysSearched > 0) {
              const formattedCurrentDate = new Date(currentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              setError(`No photos available for that date. Showing photos from ${formattedCurrentDate} instead.`);
              clearErrorTimer();
              errorTimerRef.current = setTimeout(() => setError(null), 5000);
            }

            return;
          }
        } catch (err) {
          if (err.name === 'AbortError') throw err;
        }

        currentDate = addDaysToDate(currentDate, -1);
        daysSearched++;
      }

      if (!foundData) {
        try {
          const data = await getEpicLatest(apiKey, { signal, preferCache: true });
          if (data && data.length > 0) {
            setEpicData(data);
            setSelectedImage(data[0]);
            const formattedLatestDate = new Date(data[0].date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            setError(`Couldn't find photos near that date. Showing latest available from ${formattedLatestDate}.`);
            clearErrorTimer();
            errorTimerRef.current = setTimeout(() => setError(null), 5000);
            return;
          }
        } catch (err) {
          if (err.name === 'AbortError') throw err;
        }
      }

      throw new Error('No EPIC data available. Please try a different date.');
    } catch (err) {
      if (err.name === 'AbortError') return;

      let errorMessage = 'Failed to load EPIC data';
      if (err.message.includes('503')) {
        errorMessage = 'NASA API temporarily unavailable. Please try again later.';
      } else if (err.message.includes('502')) {
        errorMessage = 'Bad gateway error from NASA API. Please try again in a few moments.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      } else if (err.message.includes('No EPIC data available')) {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('Error fetching EPIC data:', err);
    } finally {
      setLoading(false);
    }
  }, [clearErrorTimer]);

  const handleDateChange = useCallback((e) => {
    const newDate = e.target.value;
    startTransition(() => {
      setSelectedDate(newDate);
      setIsPlaying(false);
    });
  }, []);

  const handleImageSelect = useCallback((image) => {
    startTransition(() => {
      setSelectedImage(image);
    });
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchEpicData(selectedDate, controller.signal);
    return () => controller.abort();
  }, [selectedDate, fetchEpicData]);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const addDaysToDateString = useCallback((dateStr, days) => {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    date.setDate(date.getDate() + days);
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0');
  }, []);

  const goToPreviousDay = useCallback(() => {
    const newDateStr = addDaysToDateString(selectedDate, -1);
    if (newDateStr >= '2015-06-13') {
      startTransition(() => {
        setSelectedDate(newDateStr);
        setError(null);
        setIsPlaying(false);
      });
    }
  }, [selectedDate, addDaysToDateString]);

  const goToNextDay = useCallback(() => {
    const newDateStr = addDaysToDateString(selectedDate, 1);
    if (newDateStr <= todayStr) {
      startTransition(() => {
        setSelectedDate(newDateStr);
        setError(null);
        setIsPlaying(false);
      });
    }
  }, [selectedDate, addDaysToDateString, todayStr]);

  const goToToday = useCallback(() => {
    startTransition(() => {
      setSelectedDate(todayStr);
      setError(null);
      setIsPlaying(false);
    });
  }, [todayStr]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying(prev => !prev);
  }, []);

  useEffect(() => {
    epicDataRef.current = epicData;
  }, [epicData]);

  useEffect(() => {
    if (selectedImage && epicData.length > 0) {
      const idx = epicData.findIndex(img => img.image === selectedImage.image);
      if (idx >= 0) currentIndexRef.current = idx;
    }
  }, [selectedImage, epicData]);

  useEffect(() => {
    if (isPlaying && epicData.length > 1) {
      playIntervalRef.current = setInterval(() => {
        const data = epicDataRef.current;
        currentIndexRef.current = (currentIndexRef.current + 1) % data.length;
        setSelectedImage(data[currentIndexRef.current]);
      }, 2000);
    } else if (playIntervalRef.current) {
      clearInterval(playIntervalRef.current);
    }
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, epicData]);

  const apiKey = useMemo(() => getNasaApiKey(), []);

  const selectedImageUrl = useMemo(() => {
    if (!selectedImage) return '';
    return getEpicImageUrl(selectedImage.date, selectedImage, apiKey);
  }, [selectedImage, apiKey]);

  const formattedDate = useMemo(() => {
    if (!selectedImage) return '';
    return new Date(selectedImage.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedImage]);

  const currentTimeIndex = useMemo(() => {
    if (!selectedImage || !epicData.length) return 0;
    return epicData.findIndex(img => img.image === selectedImage.image);
  }, [selectedImage, epicData]);

  const handleTimelineChange = useCallback((e) => {
    const index = parseInt(e.target.value, 10);
    if (epicData[index]) {
      startTransition(() => {
        setSelectedImage(epicData[index]);
      });
    }
  }, [epicData]);

  return (
    <div className="min-h-screen">
      {/* Hero Header */}
      <div
        className="page-hero page-hero-image"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1400&q=80)' }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <h1 className="page-title m-0 text-4xl font-bold md:text-5xl">
            EPIC — Earth Polychromatic Imaging Camera
          </h1>
          <p className="mt-3 text-lg text-text-secondary">
            View Earth from NASA&apos;s DSCOVR satellite at the L1 Lagrange Point
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Date Navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <button
            className="btn btn-secondary btn-sm"
            onClick={goToPreviousDay}
            disabled={selectedDate <= '2015-06-13'}
          >
            <i className="bi bi-chevron-left"></i> Previous
          </button>

          <div className="relative flex flex-col items-center">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="input-field px-3 py-1.5 text-sm"
              min="2015-06-13"
              max={todayStr}
            />
            <span className="meta-label mt-1">Select Date</span>
          </div>

          <button className="btn btn-primary btn-sm" onClick={goToToday}>
            Today
          </button>

          <button
            className="btn btn-secondary btn-sm"
            onClick={goToNextDay}
            disabled={selectedDate >= todayStr}
          >
            Next <i className="bi bi-chevron-right"></i>
          </button>
        </div>

        {/* Info Banner */}
        <div className="epic-info-banner mb-8">
          <i className="bi bi-info-circle-fill mt-0.5 shrink-0"></i>
          <div className="text-sm">
            <strong>EPIC Satellite:</strong> NASA&apos;s DSCOVR satellite captures Earth imagery from 1 million miles away at the L1 Lagrange Point, providing unique perspectives of our entire planet&apos;s sunlit side.
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 rounded-lg border border-gold-dim bg-gold-subtle p-4">
            <div className="mb-1 text-sm font-bold text-gold">
              <i className="bi bi-exclamation-triangle-fill mr-2"></i>
              Notice
            </div>
            <p className="m-0 text-sm text-gold-light">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && epicData.length === 0 && (
          <div className="spinner-container">
            <div className="loading-spinner h-14 w-14" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="loading-text">Retrieving Earth imagery...</p>
          </div>
        )}

        {/* Main Content: Image + Sidebar */}
        {!loading && epicData.length > 0 && selectedImage && (
          <div className="epic-main-container mb-12">
            {/* Left: Large Earth Image */}
            <div className="epic-image-display">
              <img
                src={selectedImageUrl}
                alt="Earth from EPIC"
                className="epic-image"
                onError={(e) => {
                  if (!e.target.src.includes('api_key')) {
                    e.target.src = getEpicImageUrl(selectedImage.date, selectedImage, getNasaApiKey());
                  }
                }}
              />
            </div>

            {/* Right: Metadata Sidebar */}
            <div className="epic-details">
              <h2 className="epic-title mb-1 text-2xl font-bold">
                <i className="bi bi-globe mr-2 text-cyan-glow"></i>
                Earth from EPIC
              </h2>
              <p className="epic-subtitle mb-6 text-sm">
                DSCOVR Satellite — L1 Lagrange Point
              </p>

              {/* Coordinates */}
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-glow">
                  <i className="bi bi-geo-alt mr-1"></i> Coordinates
                </h3>
                <div className="space-y-2">
                  {selectedImage.lunar_j2000_x != null && (
                    <div className="stat-card flex items-center justify-between p-3">
                      <span className="meta-label">Position</span>
                      <span className="meta-value text-sm">Available</span>
                    </div>
                  )}
                  <div className="stat-card flex items-center justify-between p-3">
                    <span className="meta-label">Date</span>
                    <span className="meta-value text-sm">{formattedDate}</span>
                  </div>
                  <div className="stat-card flex items-center justify-between p-3">
                    <span className="meta-label">Capture Time</span>
                    <span className="meta-value text-sm">{selectedImage.time} UTC</span>
                  </div>
                </div>
              </div>

              {/* Distances */}
              <div className="mb-6">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-glow">
                  <i className="bi bi-rulers mr-1"></i> Distances
                </h3>
                <div className="space-y-2">
                  <div className="stat-card flex items-center justify-between p-3">
                    <span className="meta-label">Satellite Distance</span>
                    <span className="meta-value text-sm">~1,000,000 mi</span>
                  </div>
                  <div className="stat-card flex items-center justify-between p-3">
                    <span className="meta-label">L1 Lagrange Point</span>
                    <span className="meta-value text-sm">1.5M km from Earth</span>
                  </div>
                </div>
              </div>

              {/* Instrument */}
              <div>
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-cyan-glow">
                  <i className="bi bi-camera mr-1"></i> Instrument
                </h3>
                <div className="stat-card p-3">
                  <div className="meta-label mb-1">EPIC Camera</div>
                  <p className="m-0 text-sm leading-relaxed text-text-secondary">
                    Captures images in 10 different wavelengths, enabling scientists to study atmospheric and surface properties of Earth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Timeline Slider + Play/Pause */}
        {!loading && epicData.length > 1 && (
          <div className="mb-8 rounded-lg border border-border-glow bg-surface-card p-6 backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="m-0 text-sm font-bold uppercase tracking-widest text-cyan-glow">
                <i className="bi bi-clock-history mr-2"></i>
                Timeline — {epicData.length} captures
              </h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-text-muted">
                  {currentTimeIndex + 1} / {epicData.length}
                </span>
                <button
                  className="btn btn-sm btn-secondary"
                  onClick={togglePlayPause}
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'}`}></i>
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={epicData.length - 1}
              value={currentTimeIndex}
              onChange={handleTimelineChange}
              className="w-full accent-cyan-glow"
              style={{
                height: '28px',
                background: `linear-gradient(to right, var(--color-cyan-glow) ${(currentTimeIndex / (epicData.length - 1)) * 100}%, var(--color-space-600)) ${(currentTimeIndex / (epicData.length - 1)) * 100}%`,
                borderRadius: '4px',
                outline: 'none',
                cursor: 'pointer',
              }}
            />
            <div className="mt-2 flex justify-between text-xs text-text-muted">
              <span>{epicData[0]?.time}</span>
              <span>{epicData[epicData.length - 1]?.time}</span>
            </div>
          </div>
        )}

        {/* Thumbnail Gallery */}
        {!loading && epicData.length > 0 && (
          <div className="epic-gallery-section">
            <div className="gallery-header mb-6">
              <h3 className="epic-gallery-title text-xl font-bold">
                <i className="bi bi-images mr-2 text-cyan-glow"></i>
                Available Images — {new Date(selectedDate).toLocaleDateString()}
              </h3>
              <p className="gallery-subtitle mt-1 text-sm">
                Click to view different captures from this day
              </p>
            </div>
            <div className="epic-thumbnail-grid">
              {epicData.map((image, index) => (
                <button
                  key={index}
                  className={`epic-thumbnail-btn group ${
                    selectedImage?.image === image.image ? 'active' : ''
                  }`}
                  onClick={() => handleImageSelect(image)}
                  title={`${image.time}`}
                >
                  <img
                    src={getEpicImageUrl(image.date, image, apiKey)}
                    alt={`EPIC ${image.time}`}
                    className="epic-thumbnail transition-transform duration-300 group-hover:scale-105"
                    onError={(e) => {
                      e.target.style.backgroundColor = '#1a2332';
                    }}
                  />
                  <span className="epic-thumbnail-time">{image.time}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && epicData.length === 0 && !error && (
          <div className="epic-empty-state">
            <div className="epic-empty-icon">
              <i className="bi bi-globe-americas text-cyan-glow"></i>
            </div>
            <strong className="text-lg text-text-bright">
              No Earth imagery available
            </strong>
            <p className="epic-empty-text mt-2 max-w-md">
              We couldn&apos;t find EPIC imagery for the dates you searched.
              EPIC data is available from June 13, 2015 onwards.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EpicPage;
