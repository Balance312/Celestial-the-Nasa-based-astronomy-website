import { useEffect, useState, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/pages.css';
import { getApodByDate } from '../utils/nasaApi.js';



function APODPage({ addToFavorites, removeFromFavorites, isFavorited }) {
  const navigate = useNavigate();
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Default to today's date
  const getDefaultDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [isFullImageOpen, setIsFullImageOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchAPOD(selectedDate, controller.signal);

    return () => {
      controller.abort();
    };
  }, [selectedDate]);

  const fetchAPOD = async (date, signal) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      if (!apiKey) {
        throw new Error('NASA API key is not configured. Please check your .env file.');
      }

      const data = await getApodByDate(apiKey, date, { signal, preferCache: true });
      setApodData(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Failed to load APOD data';
      if (err.message.includes('503')) {
        errorMessage = 'NASA API temporarily unavailable. Retrying... If this persists, please try again later.';
      } else if (err.message.includes('502')) {
        errorMessage = 'Bad gateway error from NASA API. Please try again in a few moments.';
      } else if (err.message.includes('429')) {
        errorMessage = 'API rate limit reached. Please wait a moment before trying again.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      setError(errorMessage);
      console.error('Error fetching APOD:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const dateChangeTimeoutRef = useRef(null);

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
    
    // Enforce minimum date of June 16, 1995 using string comparison
    if (newDateStr >= '1995-06-16') {
      setSelectedDate(newDateStr);
      setError(null);
    } else {
      setError('APOD photos started on June 16, 1995. Please select a date from June 16, 1995 onwards.');
    }
  }, [selectedDate, addDaysToDateString]);

  const goToNextDay = useCallback(() => {
    const newDateStr = addDaysToDateString(selectedDate, 1);
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Use string comparison to check if date is today or earlier
    if (newDateStr <= todayStr) {
      setSelectedDate(newDateStr);
      setError(null);
    } else {
      setError('Cannot select future dates. Please select today or an earlier date.');
    }
  }, [selectedDate, addDaysToDateString]);

  const goToToday = useCallback(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleDateChange = useCallback((e) => {
    const newDate = e.target.value;
    
    // Validate date range using simple string comparison
    const minDateStr = '1995-06-16';
    const maxDateStr = new Date().toISOString().split('T')[0];
    
    if (newDate < minDateStr) {
      setError('APOD photos started on June 16, 1995. Please select a date from June 16, 1995 onwards.');
      return;
    }
    
    if (newDate > maxDateStr) {
      setError('Cannot select future dates. Please select today or an earlier date.');
      return;
    }
    
    setError(null);
    setSelectedDate(newDate);
  }, []);

  useEffect(() => {
    return () => {
      if (dateChangeTimeoutRef.current) {
        clearTimeout(dateChangeTimeoutRef.current);
      }
    };
  }, []);

  const itemIsFavorited = apodData ? isFavorited(apodData) : false;
  const downloadImageUrl = apodData?.hdurl || apodData?.url || '';

  const handleFavoriteToggle = () => {
    if (!apodData) {
      return;
    }

    if (itemIsFavorited) {
      removeFromFavorites(`${apodData.date}-${apodData.title}`);
      return;
    }

    addToFavorites(apodData);
  };

  const closeFullImage = () => {
    setIsFullImageOpen(false);
  };

  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  const downloadFile = async (downloadUrl, filename, itemTitle, itemDate) => {
    try {
      const params = new URLSearchParams({
        url: downloadUrl,
        title: itemTitle,
        date: itemDate,
      });

      // For mobile devices, use direct redirect which is more reliable
      if (isMobileDevice()) {
        window.location.href = `/api/download?${params.toString()}`;
        return;
      }

      // For desktop, use blob download for better UX
      const response = await fetch(`/api/download?${params.toString()}`);
      if (!response.ok) throw new Error(`Download failed: ${response.status}`);

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename.replace(/\.jpeg$/i, '.jpg');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(downloadUrl, '_blank');
    }
  };

  const handleDownloadImage = useCallback(async () => {
    if (!downloadImageUrl || !apodData) {
      return;
    }

    setIsDownloading(true);
    setError(null);

    try {
      const filename = 'nasa-image.jpg';
      await downloadFile(downloadImageUrl, filename, apodData.title, apodData.date);
    } catch (downloadError) {
      setError('Download failed. Please try again or check your connection.');
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
                min="1995-06-16"
                max={new Date().toISOString().split('T')[0]}
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
                      📅 {new Date(apodData.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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
