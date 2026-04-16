import { useEffect, useState } from 'react';
import '../pages/pages.css';
import { getApodByDate } from '../utils/nasaApi.js';

const convertBlobToPng = async (sourceBlob) => {
  const imageBitmap = await createImageBitmap(sourceBlob);
  const canvas = document.createElement('canvas');
  canvas.width = imageBitmap.width;
  canvas.height = imageBitmap.height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Unable to create canvas context for PNG conversion.');
  }

  context.drawImage(imageBitmap, 0, 0);
  imageBitmap.close();

  const pngBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, 'image/png');
  });

  if (!pngBlob) {
    throw new Error('PNG conversion failed.');
  }

  return pngBlob;
};

function APODPage({ addToFavorites, removeFromFavorites, toggleLike, isLiked, isFavorited }) {
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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

      setError(err.message || 'Failed to fetch APOD data');
      console.error('Error fetching APOD:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
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

  const itemIsLiked = apodData ? isLiked(apodData) : false;
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

  const openFullImage = () => {
    setIsFullImageOpen(true);
  };

  const closeFullImage = () => {
    setIsFullImageOpen(false);
  };

  const handleDownloadImage = async () => {
    if (!downloadImageUrl || !apodData) {
      return;
    }

    setIsDownloading(true);
    setError(null);

    const params = new URLSearchParams({
      url: downloadImageUrl,
      title: apodData.title,
      date: apodData.date,
    });

    try {
      let blob;

      // Preferred path: server-side downloader endpoint (works reliably in deployed env).
      const endpointResponse = await fetch(`/api/download?${params.toString()}`);
      const endpointContentType = endpointResponse.headers.get('content-type') || '';

      if (endpointResponse.ok && !endpointContentType.includes('text/html')) {
        blob = await endpointResponse.blob();
      } else {
        // Fallback path: direct fetch (can fail due to CORS on some image hosts).
        const directResponse = await fetch(downloadImageUrl);
        if (!directResponse.ok) {
          throw new Error(`Direct download failed: ${directResponse.status}`);
        }
        blob = await directResponse.blob();
      }

      const pngBlob = await convertBlobToPng(blob);
      const objectUrl = URL.createObjectURL(pngBlob);
      const safeTitle = apodData.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_');
      const filename = `${apodData.date}_${safeTitle || 'nasa_apod'}.png`;

      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(objectUrl);
    } catch (downloadError) {
      setError('Download failed in this environment. Please deploy and try again, or use Full Image and save manually.');
      console.error('Download failed:', downloadError);
    } finally {
      setIsDownloading(false);
    }
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

                  <div className="apod-actions">
                    <button
                      className={`btn btn-heart ${itemIsLiked ? 'is-liked' : ''}`}
                      onClick={() => toggleLike(apodData)}
                    >
                      <i className={`bi ${itemIsLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                      {itemIsLiked ? 'Liked' : 'Like'}
                    </button>
                    <button className="btn btn-save-favorite" onClick={handleFavoriteToggle}>
                      <i className={`bi ${itemIsFavorited ? 'bi-bookmark-check-fill' : 'bi-bookmark-plus'}`}></i>
                      {itemIsFavorited ? 'Saved to Collection' : 'Add to Favorites'}
                    </button>
                    {apodData.media_type === 'image' && (
                      <button className="btn btn-save-favorite" onClick={openFullImage}>
                        <i className="bi bi-arrows-fullscreen"></i>
                        Show Full Image
                      </button>
                    )}
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
                <img src={apodData.url} alt={apodData.title} className="apod-fullscreen-image" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default APODPage;
