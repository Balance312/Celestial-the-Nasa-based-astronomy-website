import { useState, useEffect } from 'react';
import '../pages/pages.css';

function APODPage() {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAPOD(selectedDate);
  }, [selectedDate]);

  const fetchAPOD = async (date) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      if (!apiKey) {
        throw new Error('NASA API key is not configured. Please check your .env file.');
      }

      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=${date}`
      );

      if (!response.ok) {
        throw new Error(`NASA API error: ${response.status}`);
      }

      const data = await response.json();
      setApodData(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch APOD data');
      console.error('Error fetching APOD:', err);
    } finally {
      setLoading(false);
    }
  };

  const goToPreviousDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() - 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToNextDay = () => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + 1);
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const goToToday = () => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="apod-page">
      <div className="page-hero apod-hero">
        <div className="hero-content">
          <h1 className="page-title">Astronomy Picture of the Day</h1>
          <p className="page-subtitle">Explore the universe, one image at a time</p>
        </div>
      </div>

      <div className="container py-5">
        {/* Date Navigation */}
        <div className="date-navigation-container">
          <div className="date-controls">
            <button className="btn btn-sm btn-outline-light" onClick={goToPreviousDay}>
              ← Previous
            </button>
            <div className="date-input-wrapper">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="date-picker"
                max={new Date().toISOString().split('T')[0]}
              />
              <span className="date-label">Selected Date</span>
            </div>
            <button className="btn btn-sm btn-outline-light" onClick={goToNextDay}>
              Next →
            </button>
            <button className="btn btn-sm btn-primary ms-2" onClick={goToToday}>
              Today
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
      </div>
    </div>
  );
}

export default APODPage;
