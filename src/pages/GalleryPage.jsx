import { useEffect, useState, useCallback, useMemo, useRef, useTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import '../pages/pages.css';
import { getRandomGallery } from '../utils/nasaApi.js';

const sanitizeFilename = (value) =>
  (value || 'nasa-image')
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

function GalleryPage({ addToFavorites, removeFromFavorites, isFavorited }) {
  const navigate = useNavigate();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isFullscreenMediaOnly, setIsFullscreenMediaOnly] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [isPending, startTransition] = useTransition();
  const closeModalRef = useRef(null);

  useEffect(() => {
    const controller = new AbortController();
    fetchRandomGallery({ signal: controller.signal, preferCache: true });

    return () => {
      controller.abort();
    };
  }, []);

  const fetchRandomGallery = useCallback(async ({ signal, preferCache = true } = {}) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = import.meta.env.VITE_NASA_API_KEY;
      if (!apiKey) {
        throw new Error('NASA API key is not configured.');
      }

      const data = await getRandomGallery(apiKey, 8, { signal, preferCache });
      setGallery(data);
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }

      let errorMessage = 'Failed to load gallery';
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
      console.error('Error fetching gallery:', err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const convertedVideoUrl = useMemo(() => {
    if (!selectedImage?.url) return '';
    const url = selectedImage.url;
    
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
  }, [selectedImage?.url]);

  const handleGalleryItemClick = useCallback((item) => {
    startTransition(() => {
      setSelectedImage(item);
      setIsFullscreenMediaOnly(false);
    });
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedImage(null);
    setIsFullscreenMediaOnly(false);
  }, []);

  const handleDownload = useCallback(async (event, item) => {
    event.stopPropagation();

    if (item.media_type !== 'image') {
      return;
    }

    setDownloadingId(item.date);
    setDownloadError(null);

    const downloadUrl = item.hdurl || item.url;
    const params = new URLSearchParams({
      url: downloadUrl,
      title: item.title,
      date: item.date,
    });

    try {
      // Use blob download for all devices (more reliable)
      const response = await fetch(`/api/download?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Download failed: ${response.status}`);
      }

      const contentDisposition = response.headers.get('content-disposition') || '';
      let filename = `${sanitizeFilename(item.title)}.jpg`;
      
      const filenameMatch = contentDisposition.match(/filename="([^"]+)"/);
      if (filenameMatch) {
        filename = filenameMatch[1];
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);

      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename.replace(/\.jpeg$/i, '.jpg');
      anchor.style.display = 'none';
      document.body.appendChild(anchor);
      
      // Trigger click and ensure it completes before cleanup
      anchor.click();
      
      // Delay cleanup to allow download to start
      setTimeout(() => {
        document.body.removeChild(anchor);
        URL.revokeObjectURL(objectUrl);
      }, 100);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError('Download failed. Please check your connection and try again.');
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setDownloadingId(null);
    }
  }, []);

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
            style={loading ? { pointerEvents: 'none' } : {}}
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

        {downloadError && (
          <div className="error-alert" style={{ marginBottom: '1rem' }}>
            <div className="error-title">⚠️ Download Error</div>
            <p>{downloadError}</p>
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
                const itemIsFavorited = isFavorited(item);

                return (
                  <div
                    key={itemId}
                    className="gallery-item"
                    onClick={() => handleGalleryItemClick(item)}
                  >
                    <div className="gallery-thumbnail">
                      {item.media_type === 'image' ? (
                        <img 
                          src={item.url} 
                          alt={item.title} 
                          loading="lazy" 
                          decoding="async"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="video-placeholder">
                          <div className="video-play-button">
                            <i className="bi bi-play-circle-fill"></i>
                          </div>
                          <span className="video-label">🎬 Video</span>
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
                            navigate(`/media/${item.date}`);
                          }}
                        >
                          <i className="bi bi-arrows-fullscreen"></i>
                          {item.media_type === 'image' ? 'View Full' : 'Open Media'}
                        </button>
                        <button
                          className="btn btn-gallery-action btn-download btn-sm"
                          onClick={(event) => handleDownload(event, item)}
                          disabled={item.media_type !== 'image' || downloadingId === item.date}
                          title={item.media_type === 'image' ? 'Download image' : 'Download is only available for images'}
                        >
                          <i className={`bi ${downloadingId === item.date ? 'bi-hourglass-split' : 'bi-download'}`}></i>
                          {downloadingId === item.date ? 'Downloading...' : 'Download'}
                        </button>
                      </div>
                      <div className="gallery-item-actions">
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
                          <i className={`bi ${itemIsFavorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
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
              <>
                <div
                  className="modal-overlay"
                  onClick={handleCloseModal}
                >
                  <div
                    className={`modal-content ${isFullscreenMediaOnly ? 'apod-fullscreen-content' : ''}`}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                      position: 'fixed',
                      top: `50%`,
                      left: `50%`,
                      transform: 'translate(-50%, -50%)',
                      maxHeight: '85vh',
                      zIndex: '1001'
                    }}
                  >
                  <button
                    className="modal-close"
                    onClick={handleCloseModal}
                  >
                    ✕
                  </button>
                  <div className={`modal-body ${isFullscreenMediaOnly ? 'apod-fullscreen-body' : ''}`}>
                    {selectedImage.media_type === 'image' ? (
                      <img
                        src={selectedImage.hdurl || selectedImage.url}
                        alt={selectedImage.title}
                        className={isFullscreenMediaOnly ? 'apod-fullscreen-image' : 'modal-image'}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="video-container">
                        <iframe
                          src={convertedVideoUrl}
                          className="modal-iframe"
                          title={selectedImage.title}
                          allowFullScreen
                          allow="autoplay; fullscreen; encrypted-media; accelerometer; gyroscope"
                          frameBorder="0"
                          scrolling="no"
                        />
                      </div>
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
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default GalleryPage;
