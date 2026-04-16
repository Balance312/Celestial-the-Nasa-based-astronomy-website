import { useEffect, useState } from 'react';
import '../pages/pages.css';
import { getRandomGallery } from '../utils/nasaApi.js';

function GalleryPage({ addToFavorites, removeFromFavorites, toggleLike, isLiked, isFavorited }) {
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

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
                    onClick={() => setSelectedImage(item)}
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
              <div className="modal-overlay" onClick={() => setSelectedImage(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <button className="modal-close" onClick={() => setSelectedImage(null)}>
                    ✕
                  </button>
                  <div className="modal-body">
                    {selectedImage.media_type === 'image' ? (
                      <img src={selectedImage.url} alt={selectedImage.title} className="modal-image" />
                    ) : (
                      <iframe
                        src={selectedImage.url}
                        className="modal-iframe"
                        title={selectedImage.title}
                        allowFullScreen
                      />
                    )}
                  </div>
                  <div className="modal-info">
                    <h2>{selectedImage.title}</h2>
                    <p className="text-muted">{selectedImage.date}</p>
                    {selectedImage.copyright && (
                      <p className="copyright">© {selectedImage.copyright}</p>
                    )}
                    <p className="explanation">{selectedImage.explanation}</p>
                  </div>
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
