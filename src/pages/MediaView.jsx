import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../pages/pages.css';
import { getApodByDate } from '../utils/nasaApi.js';

const convertVideoUrl = (url) => {
  if (!url) return '';

  // YouTube watch URL to embed URL
  const youtubeMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (youtubeMatch) {
    return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=1`;
  }

  // Vimeo URL to embed URL
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}?autoplay=1`;
  }

  return url;
};

const sanitizeFilename = (value) =>
  (value || 'nasa-image')
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

function MediaView({
  addToFavorites,
  removeFromFavorites,
  isFavorited,
}) {
  const { date } = useParams();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchMediaData({ signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [date]);

  const fetchMediaData = useCallback(async ({ signal } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      if (!apiKey) {
        throw new Error('NASA API key is not configured.');
      }

      const data = await getApodByDate(apiKey, date, { signal, preferCache: true });
      setMedia(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Failed to load media';
      if (err.message.includes('503')) {
        errorMessage = 'NASA API temporarily unavailable. Please try again later.';
      } else if (err.message.includes('502')) {
        errorMessage = 'Bad gateway error from NASA API. Please try again in a few moments.';
      } else if (err.message.includes('404')) {
        errorMessage = 'Media not found for the selected date.';
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your connection.';
      }

      setError(errorMessage);
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  const handleDownload = useCallback(async () => {
    if (!media || media.media_type !== 'image') {
      return;
    }

    const downloadUrl = media.hdurl || media.url;
    const params = new URLSearchParams({
      url: downloadUrl,
      title: media.title,
      date: media.date,
    });

    try {
      const response = await fetch(`/api/download?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const contentDisposition = response.headers.get('content-disposition') || '';
      let filename = `${sanitizeFilename(media.title)}.jpg`;

      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open image in new tab
      window.open(media.hdurl || media.url, '_blank');
    }
  }, [media]);

  if (loading) {
    return (
      <div className="media-view-page">
        <div className="spinner-container">
          <div className="spinner-border spinner-border-lg" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="loading-text">Loading media...</p>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="media-view-page">
        <div className="container py-5">
          <div className="error-alert">
            <div className="error-title">⚠️ Error</div>
            <p>{error || 'Media not found'}</p>
            <button className="btn btn-primary mt-3" onClick={() => navigate('/apod')}>
              ← Back to APOD
            </button>
          </div>
        </div>
      </div>
    );
  }

  const itemIsFavorited = isFavorited(media);
  const mediaItemId = `${media.date}-${media.title}`;

  return (
    <div className="media-view-page">
      <div className="media-view-container">
        {/* Back Button */}
        <button
          className="media-back-btn"
          onClick={() => navigate(-1)}
          title="Go back"
        >
          ← Back
        </button>

        {/* Media Display */}
        <div className="media-display">
          {media.media_type === 'image' ? (
            <img
              src={media.hdurl || media.url}
              alt={media.title}
              className="media-image"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <div className="media-video-wrapper">
              <div className="ratio ratio-16x9">
                <iframe
                  src={convertVideoUrl(media.url)}
                  className="media-iframe"
                  title={media.title}
                  allowFullScreen
                  allow="autoplay; fullscreen; encrypted-media; accelerometer; gyroscope"
                  frameBorder="0"
                  scrolling="no"
                />
              </div>
            </div>
          )}
        </div>

        {/* Controls Bar */}
        <div className="media-controls">
          <div className="media-controls-left">
            <button
              className="btn btn-save-favorite btn-lg"
              onClick={() => {
                if (itemIsFavorited) {
                  removeFromFavorites(mediaItemId);
                } else {
                  addToFavorites(media);
                }
              }}
              title={itemIsFavorited ? 'Remove from favorites' : 'Add to favorites'}
            >
              <i className={`bi ${itemIsFavorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
              <span className="btn-label">{itemIsFavorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>

          <div className="media-controls-right">
            {media.media_type === 'image' && (
              <button
                className="btn btn-download btn-lg"
                onClick={handleDownload}
                title="Download image"
              >
                <i className="bi bi-download"></i>
                <span className="btn-label">Download</span>
              </button>
            )}
          </div>
        </div>

        {/* Info Section */}
        <div className="media-info-section">
          <div className="media-info-content">
            <h1 className="media-title">{media.title}</h1>

            <div className="media-meta">
              <div className="meta-item">
                <i className="bi bi-calendar-event"></i>
                <span>{media.date}</span>
              </div>
              {media.copyright && (
                <div className="meta-item">
                  <i className="bi bi-person"></i>
                  <span>© {media.copyright}</span>
                </div>
              )}
            </div>

            <p className="media-explanation">{media.explanation}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MediaView;
