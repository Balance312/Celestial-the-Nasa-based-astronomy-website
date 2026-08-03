import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getApodByDate } from '../utils/nasaApi.js';
import { downloadFile, sanitizeFilename } from '../utils/downloadHandler.js';
import { getNasaApiKey } from '../utils/apiConfig.js';
import { API_ERROR_MESSAGES, createItemId } from '../constants/apod.js';

function MediaView({
  addToFavorites,
  removeFromFavorites,
  isFavorited,
}) {
  const { date } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Initialize state from location.state if available
  const [media, setMedia] = useState(() => location.state?.image || null);
  const [imgError, setImgError] = useState(false);
  const [relatedImages] = useState(() => location.state?.relatedImages || []);
  const [loading, setLoading] = useState(() => !location.state?.image && !!date);
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

  // Effect for API fetch when date changes
  useEffect(() => {
    if (location.state?.image) {
      return;
    }

    if (!date) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('No media data provided');
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    fetchMediaData({ signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [date, fetchMediaData, location.state]);

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
          <div className="loading-spinner h-14 w-14" role="status">
            <span className="sr-only">Loading...</span>
          </div>
          <p className="loading-text">Loading media...</p>
        </div>
      </div>
    );
  }

  if (error || !media) {
    return (
      <div className="media-view-page">
        <div className="mx-auto max-w-7xl px-4 py-12">
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
  const mediaItemId = media.date ? createItemId(media) : media.id;
  
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
              !imgError ? (
                <img
                  src={media.thumbnail}
                  alt={media.title}
                  className="media-image"
                  loading="lazy"
                  decoding="async"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="media-fallback-container">
                  <i className="bi bi-image media-fallback-icon"></i>
                  <span>Image unavailable</span>
                </div>
              )
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
                    <span key={idx} className="badge mr-2 mb-2">
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
          <div className="related-gallery-section">
            <h2 className="related-gallery-title">Related Photos from Collection</h2>
            <div className="related-gallery-grid">
              {relatedImages.map((image, idx) => (
                <div
                  key={idx}
                  className="related-gallery-item"
                  onClick={() => {
                    setMedia(image);
                    window.scrollTo(0, 0);
                  }}
                >
                  <div className="related-gallery-thumb">
                    <img
                      src={image.thumbnail}
                      alt={image.title}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="related-gallery-label">
                    <span>{image.title}</span>
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
