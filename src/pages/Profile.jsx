import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearApiCache } from '../utils/nasaApi.js';
import './pages.css';

function Profile({ favorites, removeFromFavorites }) {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleClearCache = useCallback(() => {
    clearApiCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  }, []);

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
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename.replace(/\.jpeg$/i, '.jpg');
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(downloadUrl, '_blank');
    }
  };

  const handleDownload = useCallback(async (item) => {
    if (item.media_type !== 'image') {
      return;
    }

    setDownloadingId(item.id);
    setDownloadError(null);

    try {
      const downloadUrl = item.hdurl || item.url;
      const filename = `${item.title.replace(/[^a-zA-Z0-9-_ ]/g, '').trim().replace(/\s+/g, '_')}.jpg`;
      await downloadFile(downloadUrl, filename, item.title, item.date);
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError('Download failed. Please check your connection and try again.');
      setTimeout(() => setDownloadError(null), 4000);
    } finally {
      setDownloadingId(null);
    }
  }, []);

  return (
    <div className="profile-page">
      <div className="page-hero profile-hero">
        <div className="hero-content">
          <h1 className="page-title">My Space Collection</h1>
          <p className="page-subtitle">
            Your personal archive of cosmic moments and discoveries.
          </p>
        </div>
      </div>

      <div className="container py-5">
        {downloadError && (
          <div className="error-alert mb-4">
            <div className="error-title">⚠️ Download Error</div>
            <p>{downloadError}</p>
          </div>
        )}
        <div className="collection-summary mb-4">
          <div className="summary-chip">
            <i className="bi bi-stars"></i>
            <span>{favorites.length} saved item{favorites.length === 1 ? '' : 's'}</span>
          </div>
          <p className="summary-text">
            Items are sorted by when you added them to your profile.
          </p>
          <button
            className="btn btn-sm btn-outline-secondary mt-2"
            onClick={handleClearCache}
            title="Clear cached API data to free up memory"
          >
            <i className="bi bi-trash3 me-1"></i>
            {cacheCleared ? 'Cache Cleared!' : 'Clear Cache'}
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="empty-collection text-center">
            <i className="bi bi-heartbreak empty-icon"></i>
            <h2>Your collection is empty</h2>
            <p>Start exploring APOD entries and save the ones you love.</p>
            <Link to="/apod" className="btn btn-primary go-explore-btn">
              Go Explore
            </Link>
          </div>
        ) : (
          <div className="row g-4">
            {favorites.map((item) => (
              <div key={item.id} className="col-12 col-md-6 col-xl-4">
                <div className="card profile-card h-100">
                  {item.media_type === 'image' ? (
                    <img src={item.url} className="card-img-top profile-image" alt={item.title} loading="lazy" decoding="async" />
                  ) : (
                    <div className="profile-video-placeholder">
                      <i className="bi bi-play-circle"></i>
                      <span>Video Entry</span>
                    </div>
                  )}
                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title profile-card-title">{item.title}</h5>
                    <div className="profile-meta">
                      <span>
                        <i className="bi bi-calendar-event"></i>
                        APOD Date: {item.date}
                      </span>
                      <span>
                        <i className="bi bi-clock-history"></i>
                        Added: {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="card-text profile-explanation">{item.explanation}</p>
                    <div className="mt-auto d-flex gap-2 pt-3">
                      <button
                        className="btn btn-outline-light btn-sm"
                        onClick={() => navigate(`/media/${item.date}`)}
                      >
                        <i className="bi bi-arrows-fullscreen me-1"></i>
                        View Full Image
                      </button>
                      {item.media_type === 'image' && (
                        <button
                          className="btn btn-outline-light btn-sm"
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                        >
                          <i className="bi bi-download me-1"></i>
                          {downloadingId === item.id ? 'Downloading...' : 'Download'}
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm ms-auto"
                        onClick={() => removeFromFavorites(item.id)}
                      >
                        <i className="bi bi-trash3-fill me-1"></i>
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
