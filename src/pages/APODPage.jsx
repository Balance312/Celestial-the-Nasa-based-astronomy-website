import { useEffect, useState, useCallback, useTransition, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/pages.css';
import { getApodByDate } from '../utils/nasaApi.js';
import { downloadFile, sanitizeFilename } from '../utils/downloadHandler.js';
import { getNasaApiKey } from '../utils/apiConfig.js';
import { APOD_START_DATE, DATE_MESSAGES, API_ERROR_MESSAGES } from '../constants/apod.js';



function APODPage({ addToFavorites, removeFromFavorites, isFavorited }) {
  const navigate = useNavigate();
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPending, startTransition] = useTransition();
  
  // Default to today's date
  const getDefaultDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [isFullImageOpen, setIsFullImageOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Pre-memoize today's date to avoid recalculation
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Fetch APOD data - declared before useEffect
  const fetchAPOD = useCallback(async (date, signal) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = getNasaApiKey();
      const data = await getApodByDate(apiKey, date, { signal, preferCache: true });
      setApodData(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Failed to load APOD data';
      if (err.message.includes('503')) {
        errorMessage = API_ERROR_MESSAGES.UNAVAILABLE;
      } else if (err.message.includes('502')) {
        errorMessage = API_ERROR_MESSAGES.BAD_GATEWAY;
      } else if (err.message.includes('429')) {
        errorMessage = API_ERROR_MESSAGES.RATE_LIMIT;
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = API_ERROR_MESSAGES.NETWORK;
      }
      
      setError(errorMessage);
      console.error('Error fetching APOD:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchAPOD(selectedDate, controller.signal);

    return () => {
      controller.abort();
    };
  }, [selectedDate, fetchAPOD]);
  
  // Memoize formatted date for display
  const formattedDate = useMemo(() => {
    if (!apodData) return '';
    return new Date(apodData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [apodData]);

  // Helper function to add/subtract days from YYYY-MM-DD string
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
    
    if (newDateStr >= APOD_START_DATE) {
      startTransition(() => {
        setSelectedDate(newDateStr);
        setError(null);
      });
    } else {
      setError(DATE_MESSAGES.BEFORE_START);
    }
  }, [selectedDate, addDaysToDateString]);

  const goToNextDay = useCallback(() => {
    const newDateStr = addDaysToDateString(selectedDate, 1);
    
    if (newDateStr <= todayStr) {
      startTransition(() => {
        setSelectedDate(newDateStr);
        setError(null);
      });
    } else {
      setError(DATE_MESSAGES.FUTURE);
    }
  }, [selectedDate, addDaysToDateString, todayStr]);

  const goToToday = useCallback(() => {
    startTransition(() => {
      setSelectedDate(todayStr);
    });
  }, [todayStr]);

  const handleDateChange = useCallback((e) => {
    const newDate = e.target.value;
    
    if (newDate < APOD_START_DATE) {
      setError(DATE_MESSAGES.BEFORE_START);
      return;
    }
    
    if (newDate > todayStr) {
      setError(DATE_MESSAGES.FUTURE);
      return;
    }
    
    startTransition(() => {
      setError(null);
      setSelectedDate(newDate);
    });
  }, [todayStr]);

  const itemIsFavorited = apodData ? isFavorited(apodData) : false;
  const downloadImageUrl = apodData?.hdurl || apodData?.url || '';

  const handleFavoriteToggle = useCallback(() => {
    if (!apodData) {
      return;
    }

    startTransition(() => {
      if (itemIsFavorited) {
        removeFromFavorites(`${apodData.date}-${apodData.title}`);
      } else {
        addToFavorites(apodData);
      }
    });
  }, [apodData, itemIsFavorited, addToFavorites, removeFromFavorites]);

  const closeFullImage = useCallback(() => {
    setIsFullImageOpen(false);
  }, []);

  const handleDownloadImage = useCallback(async () => {
    if (!downloadImageUrl || !apodData) {
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const filename = `${sanitizeFilename(apodData.title)}.jpg`;
      await downloadFile(downloadImageUrl, filename, apodData.title, apodData.date);
    } catch (downloadError) {
      const errorMessage = downloadError.message?.includes('Network')
        ? 'Network error: Check your connection'
        : downloadError.message?.includes('blob')
        ? 'Failed to process file'
        : 'Download failed. Please try again.';
      setError(errorMessage);
      console.error('Download failed:', downloadError);
    } finally {
      setIsDownloading(false);
    }
  }, [downloadImageUrl, apodData]);

  return (
    <div className="apod-page">
      <div className="page-hero apod-hero">
        <div className="hero-content">
          <h1 className="page-title">Astronomy Picture of the Day</h1>
          <p className="page-subtitle">Explore the universe, one image at a time</p>
        </div>
      </div>

      <div className="container py-5">
        {/* APOD History Note */}
        <div className="apod-history-note">
          <i className="bi bi-info-circle-fill"></i>
          <span>NASA's Astronomy Picture of the Day has been published daily since <strong>June 16, 1995</strong>. Use the date picker below to explore over 30 years of cosmic discoveries.</span>
        </div>

        {/* Date Navigation */}
        <div className="date-navigation-container">
          <div className="date-controls">
            <button className="btn btn-sm btn-outline-light" onClick={goToPreviousDay}>
              ← Previous Day
            </button>
            <div className="date-input-wrapper">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="date-picker"
                min={APOD_START_DATE}
                max={todayStr}
              />
              <span className="date-label">Select Date</span>
            </div>
            <button className="btn btn-sm btn-outline-light" onClick={goToNextDay}>
              Next Day →
            </button>
            <button className="btn btn-sm btn-primary ms-2" onClick={goToToday}>
              📅 Today
            </button>
          </div>
        </div>

        {/* Content */}
        {loading && (
          <div className="spinner-container">
            <div className="spinner-border spinner-border-lg" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="loading-text">Fetching cosmic wonders...</p>
          </div>
        )}

        {error && (
          <div className="error-alert">
            <div className="error-title">⚠️ Error</div>
            <p>{error}</p>
          </div>
        )}

        {apodData && !loading && (
          <div className="row justify-content-center">
            <div className="col-lg-10">
              <div className="apod-card-large">
                {/* Media Display */}
                <div className="media-container">
                  {apodData.media_type === 'image' ? (
                    <img
                      src={apodData.url}
                      alt={apodData.title}
                      className="apod-media-large"
                      loading="lazy"
                      decoding="async"
                    />
                  ) : apodData.media_type === 'video' ? (
                    <iframe
                      src={apodData.url}
                      className="apod-media-iframe-large"
                      title={apodData.title}
                      allowFullScreen
                    />
                  ) : null}
                </div>

                {/* Content */}
                <div className="apod-content">
                  <h1 className="apod-title-large">{apodData.title}</h1>

                  <div className="apod-meta">
                    <span className="meta-item">
                      📅 {formattedDate}
                    </span>
                    <span className="meta-item">
                      {apodData.media_type === 'image' ? '🖼️ Image' : '🎬 Video'}
                    </span>
                    {apodData.copyright && (
                      <span className="meta-item">© {apodData.copyright}</span>
                    )}
                  </div>

                  <div className="apod-actions">
                    <button className="btn btn-save-favorite" onClick={handleFavoriteToggle}>
                      <i className={`bi ${itemIsFavorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                      {itemIsFavorited ? 'Saved to Collection' : 'Add to Favorites'}
                    </button>
                    <button className="btn btn-save-favorite" onClick={() => navigate(`/media/${apodData.date}`)}>
                      <i className="bi bi-arrows-fullscreen"></i>
                      View in Full Screen
                    </button>
                    {apodData.media_type === 'image' && downloadImageUrl && (
                      <button
                        className="btn btn-save-favorite"
                        onClick={handleDownloadImage}
                        disabled={isDownloading}
                      >
                        <i className="bi bi-download"></i>
                        {isDownloading ? 'Downloading...' : 'Download HD (NASA)'}
                      </button>
                    )}
                  </div>

                  <p className="apod-explanation-large">{apodData.explanation}</p>

                  {/* Additional Info */}
                  <div className="apod-details">
                    <div className="detail-box">
                      <h4>About This Image</h4>
                      <p>
                        This image is part of NASA's Astronomy Picture of the Day (APOD) collection,
                        featuring a different image every day from the Earth and Space Sciences Division
                        of NASA's Goddard Space Flight Center.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {isFullImageOpen && apodData?.media_type === 'image' && (
          <div className="modal-overlay" onClick={closeFullImage}>
            <div className="modal-content apod-fullscreen-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={closeFullImage} aria-label="Close full image view">
                x
              </button>
              <div className="apod-fullscreen-body">
                <img src={apodData.url} alt={apodData.title} className="apod-fullscreen-image" loading="lazy" decoding="async" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default APODPage;
