import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import '../pages/pages.css';
import { getApodByDate } from '../utils/nasaApi.js';
import { downloadFile, sanitizeFilename } from '../utils/downloadHandler.js';
import { getNasaApiKey } from '../utils/apiConfig.js';
import { API_ERROR_MESSAGES, MOBILE_PATTERN } from '../constants/apod.js';

function MediaView({
  addToFavorites,
  removeFromFavorites,
  isFavorited,
}) {
  const { date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [media, setMedia] = useState(null);
  const [relatedImages, setRelatedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch media data - declared before useEffect
  const fetchMediaData = useCallback(async ({ signal } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = getNasaApiKey();
      const data = await getApodByDate(apiKey, date, { signal, preferCache: true });
      setMedia(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Failed to load media';
      if (err.message.includes('503')) {
        errorMessage = API_ERROR_MESSAGES.UNAVAILABLE;
      } else if (err.message.includes('502')) {
        errorMessage = API_ERROR_MESSAGES.BAD_GATEWAY;
      } else if (err.message.includes('404')) {
        errorMessage = API_ERROR_MESSAGES.NOT_FOUND;
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = API_ERROR_MESSAGES.NETWORK;
      }

      setError(errorMessage);
      console.error('Error fetching media:', err);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    const controller = new AbortController();
    
    // Check if data is passed via navigation state (from image library or gallery)
    if (location.state?.image) {
      setMedia(location.state.image);
      setRelatedImages(location.state.relatedImages || []);
      setLoading(false);
    } else if (date) {
      // Fetch from API if date parameter is provided (APOD)
      fetchMediaData({ signal: controller.signal });
    } else {
      setError('No media data provided');
      setLoading(false);
    }

    return () => {
      controller.abort();
    };
  }, [date, location.state, fetchMediaData]);

  const handleDownload = useCallback(async () => {
    if (!media || media.media_type !== 'image') {
      return;
    }

    try {
      const downloadUrl = media.hdurl || media.url;
      const filename = `${sanitizeFilename(media.title)}.jpg`;
      await downloadFile(downloadUrl, filename, media.title, media.date);
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
            <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
              ← Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const itemIsFavorited = isFavorited(media);
  const mediaItemId = media.date ? `${media.date}-${media.title}` : media.id;
  
  // Determine if this is APOD data (has media_type) or image library data (has thumbnail)
  const isApodData = media.media_type !== undefined;
  const isImageLibraryData = media.thumbnail !== undefined;

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
          {isApodData ? (
            // APOD Media Display
            media.media_type === 'image' ? (
              <img
                src={media.hdurl || media.url}
                alt={media.title}
                className="media-image"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <iframe
                src={media.url}
                className="media-iframe"
                title={media.title}
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; accelerometer; gyroscope"
                frameBorder="0"
                scrolling="no"
                style={{ width: '100%', height: '100%', aspectRatio: '16/9' }}
              />
            )
          ) : (
            // Image Library Media Display
            <img
              src={media.thumbnail}
              alt={media.title}
              className="media-image"
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.target.src = '';
                e.target.parentElement.innerHTML = '<div style="width: 100%; height: 500px; background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.2)); display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 10px; color: rgba(96, 165, 250, 0.7); border-radius: 8px;"><i class="bi bi-image" style="font-size: 3rem;"></i><span>Image unavailable</span></div>';
              }}
            />
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
            {(!isApodData || media.media_type === 'image') && (
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
              {media.date && (
                <div className="meta-item">
                  <i className="bi bi-calendar-event"></i>
                  <span>{media.date}</span>
                </div>
              )}
              {media.dateCreated && (
                <div className="meta-item">
                  <i className="bi bi-calendar-event"></i>
                  <span>{new Date(media.dateCreated).toLocaleDateString()}</span>
                </div>
              )}
              {media.copyright && (
                <div className="meta-item">
                  <i className="bi bi-person"></i>
                  <span>© {media.copyright}</span>
                </div>
              )}
              {media.photographer && (
                <div className="meta-item">
                  <i className="bi bi-person"></i>
                  <span>{media.photographer}</span>
                </div>
              )}
              {media.location && (
                <div className="meta-item">
                  <i className="bi bi-geo-alt"></i>
                  <span>{media.location}</span>
                </div>
              )}
            </div>

            <p className="media-explanation">{media.explanation || media.description}</p>

            {media.keywords && media.keywords.length > 0 && (
              <div className="media-keywords mt-3">
                <strong>Keywords:</strong>
                <div className="keywords-container mt-2">
                  {media.keywords.map((kw, idx) => (
                    <span key={idx} className="badge bg-primary me-2 mb-2">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related Images Gallery - for Image Library items */}
        {isImageLibraryData && relatedImages && relatedImages.length > 0 && (
          <div className="media-gallery-section" style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid rgba(147, 112, 219, 0.3)' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#9370db' }}>Related Photos from Collection</h2>
            <div className="gallery-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
              {relatedImages.map((image, idx) => (
                <div key={idx} className="gallery-item" style={{
                  border: '1px solid rgba(147, 112, 219, 0.3)',
                  borderRadius: '8px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }} onClick={() => {
                  setMedia(image);
                  window.scrollTo(0, 0);
                }}>
                  <div style={{
                    width: '100%',
                    paddingBottom: '100%',
                    position: 'relative',
                    backgroundColor: 'rgba(147, 112, 219, 0.1)'
                  }}>
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      loading="lazy"
                      decoding="async"
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </div>
                  <div style={{
                    padding: '0.75rem',
                    backgroundColor: '#1a0d2e',
                    minHeight: '60px',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#9370db',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {image.title}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaView;
