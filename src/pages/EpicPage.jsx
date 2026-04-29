import { useEffect, useState, useCallback, useMemo, useTransition } from 'react';
import '../pages/pages.css';
import { getEpicLatest, getEpicByDate, getEpicImageUrl } from '../utils/nasaApi.js';

function EpicPage() {
  const [epicData, setEpicData] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const getDefaultDate = () => {
    return new Date().toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getDefaultDate());
  const [, startTransition] = useTransition();

  const fetchEpicData = useCallback(async (date, signal) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      if (!apiKey) {
        throw new Error('NASA API key is not configured.');
      }

      // Helper function to add/subtract days
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
      const maxDaysToSearch = 7; // Search back up to 7 days

      // Try to find data starting from the requested date and going backwards
      while (!foundData && currentDate >= minDate && daysSearched < maxDaysToSearch) {
        try {
          const data = await getEpicByDate(apiKey, currentDate, { signal, preferCache: true });
          
          if (data && data.length > 0) {
            setEpicData(data);
            setSelectedImage(data[0]);
            foundData = true;

            // If we had to go back to a previous date, notify the user
            if (daysSearched > 0) {
              const formattedCurrentDate = new Date(currentDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              });
              setError(`📌 No photos available for that date. Showing the most recent photos from ${formattedCurrentDate} instead.`);
              // Clear the error after 5 seconds
              setTimeout(() => setError(null), 5000);
            }

            return;
          }
        } catch (err) {
          // If this specific date fails, try the previous day
          if (err.name === 'AbortError') {
            throw err;
          }
        }

        // Go back one day and try again
        currentDate = addDaysToDate(currentDate, -1);
        daysSearched++;
      }

      // If we couldn't find data anywhere, try the latest available
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
            setError(`📌 We couldn't find photos near that date. Here are the latest available photos from ${formattedLatestDate}.`);
            setTimeout(() => setError(null), 5000);
            return;
          }
        } catch (err) {
          if (err.name === 'AbortError') {
            throw err;
          }
        }
      }

      // If we still have no data, show an error
      throw new Error('No EPIC data available. Please try a different date.');
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Failed to load EPIC data';
      if (err.message.includes('503')) {
        errorMessage = '⚠️ NASA API temporarily unavailable. Please try again later.';
      } else if (err.message.includes('502')) {
        errorMessage = '⚠️ Bad gateway error from NASA API. Please try again in a few moments.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = '⚠️ Network error. Please check your connection.';
      } else if (err.message.includes('No EPIC data available')) {
        errorMessage = '😕 ' + err.message;
      }
      
      setError(errorMessage);
      console.error('Error fetching EPIC data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDateChange = useCallback((e) => {
    const newDate = e.target.value;
    startTransition(() => {
      setSelectedDate(newDate);
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

    return () => {
      controller.abort();
    };
  }, [selectedDate, fetchEpicData]);

  // Pre-memoize today's date
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

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
    const minDate = '2015-06-13';
    
    if (newDateStr >= minDate) {
      startTransition(() => {
        setSelectedDate(newDateStr);
        setError(null);
      });
    } else {
      setError('EPIC data is available from June 13, 2015 onwards. Please select a later date.');
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
      setError('Cannot select future dates. Please select today or an earlier date.');
    }
  }, [selectedDate, addDaysToDateString, todayStr]);

  const goToToday = useCallback(() => {
    startTransition(() => {
      setSelectedDate(todayStr);
      setError(null);
    });
  }, [todayStr]);

  const apiKey = useMemo(() => import.meta.env.VITE_NASA_API_KEY, []);

  const selectedImageUrl = useMemo(() => {
    if (!selectedImage) return '';
    return getEpicImageUrl(selectedImage.date, selectedImage, apiKey);
  }, [selectedImage, apiKey]);

  // Memoized formatted date for display
  const formattedDate = useMemo(() => {
    if (!selectedImage) return '';
    return new Date(selectedImage.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [selectedImage]);

  return (
    <div className="epic-page">
      <div className="page-hero epic-hero">
        <div className="hero-content">
          <h1 className="page-title">EPIC - Earth Polychromatic Imaging Camera</h1>
          <p className="page-subtitle">View Earth from NASA's DSCOVR satellite in real-time</p>
        </div>
      </div>

      <div className="container py-5">
        {/* Date Navigation Controls */}
        <div className="date-navigation-container mb-4">
          <div className="date-controls">
            <button 
              className="btn btn-outline-light"
              onClick={goToPreviousDay}
              disabled={selectedDate <= '2015-06-13'}
            >
              <i className="bi bi-chevron-left"></i> Previous Day
            </button>
            
            <div className="date-input-wrapper">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                className="date-picker"
                min="2015-06-13"
                max={todayStr}
              />
              <span className="date-label">Select Date</span>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={goToToday}
            >
              Today
            </button>
            
            <button 
              className="btn btn-outline-light"
              onClick={goToNextDay}
              disabled={selectedDate >= todayStr}
            >
              Next Day <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="epic-info-banner mb-4">
          <i className="bi bi-info-circle-fill"></i>
          <div>
            <strong>EPIC Satellite:</strong> NASA's DSCOVR satellite captures Earth imagery from 1 million miles away at the L1 Lagrange Point, providing unique perspectives of our entire planet's sunlit side.
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-alert">
            <div className="error-title">⚠️ Error</div>
            <p>{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && epicData.length === 0 && (
          <div className="spinner-container">
            <div className="spinner-border spinner-border-lg" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="loading-text">Retrieving Earth imagery...</p>
          </div>
        )}

        {/* Main Content */}
        {!loading && epicData.length > 0 && (
          <>
            {/* Selected Image Display */}
            {selectedImage && (
              <div className="row justify-content-center mb-5">
                <div className="col-lg-10">
                  <div className="epic-main-container">
                    <div className="epic-image-display">
                      <img
                        src={selectedImageUrl}
                        alt="Earth from EPIC"
                        className="epic-image"
                        onError={(e) => {
                          // Fallback to ensure API key is included
                          if (!e.target.src.includes('api_key')) {
                            e.target.src = getEpicImageUrl(selectedImage.date, selectedImage, import.meta.env.VITE_NASA_API_KEY);
                          }
                        }}
                      />
                    </div>
                    <div className="epic-details">
                      <div className="epic-header">
                        <h2 className="epic-title">
                          <i className="bi bi-globe"></i> Earth from EPIC
                        </h2>
                        <p className="epic-subtitle">DSCOVR Satellite - L1 Lagrange Point</p>
                      </div>
                      
                      <div className="epic-meta">
                        <div className="meta-item">
                          <i className="bi bi-calendar-event"></i>
                          <div>
                            <span className="meta-label">Date</span>
                            <span className="meta-value">{formattedDate}</span>
                          </div>
                        </div>
                        <div className="meta-item">
                          <i className="bi bi-clock"></i>
                          <div>
                            <span className="meta-label">Capture Time</span>
                            <span className="meta-value">{selectedImage.time} UTC</span>
                          </div>
                        </div>
                        {selectedImage.lunar_j2000_x && (
                          <div className="meta-item">
                            <i className="bi bi-geo-alt"></i>
                            <div>
                              <span className="meta-label">Position Data</span>
                              <span className="meta-value">Available</span>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="epic-description">
                        <p>
                          This stunning image captures Earth from NASA's DSCOVR satellite, positioned at the Earth-Sun Lagrange Point 1 (L1), 
                          approximately <strong>1 million miles</strong> from Earth. From this unique vantage point, the satellite provides daily imagery 
                          of the full sunlit side of Earth, allowing us to observe our planet in its entirety and monitor atmospheric phenomena.
                        </p>
                        <p style={{ marginTop: '15px', fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.7)' }}>
                          The EPIC instrument captures images in 10 different wavelengths, enabling scientists to study various atmospheric and surface properties.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Thumbnail Gallery */}
            <div className="epic-gallery-section">
              <div className="gallery-header">
                <h3 className="epic-gallery-title">
                  <i className="bi bi-images"></i> Available Images for {new Date(selectedDate).toLocaleDateString()}
                </h3>
                <p className="gallery-subtitle">Click to view different captures from this day</p>
              </div>
              <div className="epic-thumbnail-grid">
                {epicData.map((image, index) => (
                  <button
                    key={index}
                    className={`epic-thumbnail-btn ${selectedImage?.image === image.image ? 'active' : ''}`}
                    onClick={() => handleImageSelect(image)}
                    title={`${image.time}`}
                  >
                    <img
                      src={getEpicImageUrl(image.date, image, apiKey)}
                      alt={`EPIC ${image.time}`}
                      className="epic-thumbnail"
                      onError={(e) => {
                        e.target.style.backgroundColor = '#333';
                      }}
                    />
                    <span className="epic-thumbnail-time">{image.time}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {!loading && epicData.length === 0 && !error && (
          <div className="text-center py-5">
            <p className="text-muted">
              <span style={{ fontSize: '2rem', marginRight: '10px' }}>🌍</span>
              <br />
              <strong>No Earth imagery available</strong>
              <br />
              <span style={{ fontSize: '0.95rem' }}>
                We couldn't find EPIC imagery for the dates you searched. 
                EPIC data is available from June 13, 2015 onwards. 
                Please try selecting a date between June 13, 2015 and today.
              </span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EpicPage;
