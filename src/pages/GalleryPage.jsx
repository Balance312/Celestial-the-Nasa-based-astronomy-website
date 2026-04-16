import { useEffect, useState } from 'react';
import '../pages/pages.css';
import { getRandomGallery } from '../utils/nasaApi.js';

const sanitizeFilename = (value) =>
  (value || 'nasa-image')
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

function GalleryPage({ addToFavorites, removeFromFavorites, toggleLike, isLiked, isFavorited }) {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFullscreenMediaOnly, setIsFullscreenMediaOnly] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetchRandomGallery({ signal: controller.signal, preferCache: true });

    return () => {
      controller.abort();
    };
  }, []);

  const fetchRandomGallery = async ({ signal, preferCache = true } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      if (!apiKey) {
        throw new Error('NASA API key is not configured.');
      }

      const data = await getRandomGallery(apiKey, 12, { signal, preferCache });
      setGallery(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      setError(err.message || 'Failed to fetch gallery data');
      console.error('Error fetching gallery:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  };

  const handleDownload = (event, item) => {
    event.stopPropagation();

    if (item.media_type !== 'image') {
      return;
    }

    const downloadUrl = item.hdurl || item.url;
    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = `${sanitizeFilename(item.title)}.jpg`;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  return (
    <div className="gallery-page">
      <div className="page-hero gallery-hero">
        <div className="hero-content">
          <h1 className="page-title">Cosmic Gallery</h1>
          <p className="page-subtitle">A collection of the universe's most stunning moments</p>
        </div>
      </div>

      <div className="container py-5">
        <div className="gallery-controls text-center mb-5">
          <button
            className="btn btn-primary"
            onClick={() => fetchRandomGallery({ preferCache: false })}
            disabled={loading}
          >
            {loading ? '⏳ Loading...' : '🔄 Load New Images'}
          </button>
        </div>

        {error && (
          <div className="error-alert">
            <div className="error-title">⚠️ Error</div>
            <p>{error}</p>
          </div>
        )}

        {loading && gallery.length === 0 && (
          <div className="spinner-container">
            <div className="spinner-border spinner-border-lg" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="loading-text">Gathering cosmic wonders...</p>
          </div>
        )}

        {!loading && gallery.length > 0 && (
          <>
            <div className="gallery-grid">
              {gallery.map((item) => {
                const itemId = `${item.date}-${item.title}`;
                const itemIsLiked = isLiked(item);
                const itemIsFavorited = isFavorited(item);

                return (
                  <div
                    key={itemId}
                    className="gallery-item"
                    onClick={() => {
                      setSelectedImage(item);
                      setIsFullscreenMediaOnly(false);
                    }}
                  >
                    <div className="gallery-thumbnail">
                      {item.media_type === 'image' ? (
                        <img src={item.url} alt={item.title} />
                      ) : (
                        <div className="video-placeholder">
                          <span>🎬 Video</span>
                        </div>
                      )}
                    </div>
                    <div className="gallery-info">
                      <h4 className="gallery-title">{item.title}</h4>
                      <p className="gallery-date">{item.date}</p>
                      <div className="gallery-item-primary-actions">
                        <button
                          className="btn btn-gallery-action btn-sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelectedImage(item);
                            setIsFullscreenMediaOnly(true);
                          }}
                        >
                          <i className="bi bi-arrows-fullscreen"></i>
                          {item.media_type === 'image' ? 'View Full' : 'Open Media'}
                        </button>
                        <button
                          className="btn btn-gallery-action btn-download btn-sm"
                          onClick={(event) => handleDownload(event, item)}
                          disabled={item.media_type !== 'image'}
                          title={item.media_type === 'image' ? 'Download image' : 'Download is only available for images'}
                        >
                          <i className="bi bi-download"></i>
                          Download
                        </button>
                      </div>
                      <div className="gallery-item-actions">
                        <button
                          className={`btn btn-heart btn-sm ${itemIsLiked ? 'is-liked' : ''}`}
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleLike(item);
                          }}
                        >
                          <i className={`bi ${itemIsLiked ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                        </button>
                        <button
                          className="btn btn-save-favorite btn-sm"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (itemIsFavorited) {
                              removeFromFavorites(itemId);
                              return;
                            }
                            addToFavorites(item);
                          }}
                        >
                          <i className={`bi ${itemIsFavorited ? 'bi-bookmark-check-fill' : 'bi-bookmark-plus'}`}></i>
                          {itemIsFavorited ? 'Saved' : 'Favorite'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal for selected image */}
            {selectedImage && (
              <div
                className="modal-overlay"
                onClick={() => {
                  setSelectedImage(null);
                  setIsFullscreenMediaOnly(false);
                }}
              >
                <div
                  className={`modal-content ${isFullscreenMediaOnly ? 'apod-fullscreen-content' : ''}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="modal-close"
                    onClick={() => {
                      setSelectedImage(null);
                      setIsFullscreenMediaOnly(false);
                    }}
                  >
                    ✕
                  </button>
                  <div className={`modal-body ${isFullscreenMediaOnly ? 'apod-fullscreen-body' : ''}`}>
                    {selectedImage.media_type === 'image' ? (
                      <img
                        src={selectedImage.hdurl || selectedImage.url}
                        alt={selectedImage.title}
                        className={isFullscreenMediaOnly ? 'apod-fullscreen-image' : 'modal-image'}
                      />
                    ) : (
                      <iframe
                        src={selectedImage.url}
                        className="modal-iframe"
                        title={selectedImage.title}
                        allowFullScreen
                      />
                    )}
                  </div>
                  {!isFullscreenMediaOnly && (
                    <div className="modal-info">
                      <h2>{selectedImage.title}</h2>
                      <p className="text-muted">{selectedImage.date}</p>
                      {selectedImage.copyright && (
                        <p className="copyright">© {selectedImage.copyright}</p>
                      )}
                      <p className="explanation">{selectedImage.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GalleryPage;
