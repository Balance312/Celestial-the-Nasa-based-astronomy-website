import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { clearApiCache } from '../utils/nasaApi.js';
import { sanitizeFilename, downloadFile } from '../utils/downloadHandler.js';


function Profile({ favorites, removeFromFavorites }) {
  const navigate = useNavigate();
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [removedItemId, setRemovedItemId] = useState(null);

  const handleClearCache = useCallback(() => {
    clearApiCache();
    setCacheCleared(true);
    setTimeout(() => setCacheCleared(false), 3000);
  }, []);

  const handleRemoveFromFavorites = useCallback((itemId, itemTitle) => {
    const confirmed = window.confirm(
      `Remove "${itemTitle}" from your space collection? This action cannot be undone.`
    );
    
    if (confirmed) {
      setRemovedItemId(itemId);
      removeFromFavorites(itemId);
      
      // Show success feedback
      setTimeout(() => {
        setRemovedItemId(null);
      }, 1500);
    }
  }, [removeFromFavorites]);



  const handleDownload = useCallback(async (item) => {
    if (item.media_type !== 'image') {
      return;
    }

    setDownloadingId(item.id);
    setDownloadError(null);

    try {
      const downloadUrl = item.hdurl || item.url;
      const extension = downloadUrl.split('.').pop()?.split('?')[0] || 'jpg';
      const filename = `${sanitizeFilename(item.title)}.${extension}`;
      
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

      <div className="mx-auto max-w-7xl px-4 py-12">
        {downloadError && (
          <div className="error-alert mb-6">
            <div className="error-title">⚠️ Download Error</div>
            <p>{downloadError}</p>
          </div>
        )}
        <div className="collection-summary mb-6">
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
            <i className="bi bi-trash3 mr-1"></i>
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
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <div key={item.id}>
                <div className="card profile-card flex h-full flex-col overflow-hidden">
                  {item.media_type === 'image' ? (
                    <img src={item.url} className="profile-image w-full" alt={item.title} loading="lazy" decoding="async" />
                  ) : (
                    <div className="profile-video-placeholder">
                      <i className="bi bi-play-circle"></i>
                      <span>Video Entry</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h5 className="profile-card-title mb-2">{item.title}</h5>
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
                    <p className="profile-explanation mb-4">{item.explanation}</p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <button
                        className="btn btn-outline-light btn-sm"
                        onClick={() => navigate(`/media/${item.id || item.date}`, { state: { image: item } })}
                      >
                        <i className="bi bi-arrows-fullscreen mr-1"></i>
                        View Full Image
                      </button>
                      {item.media_type === 'image' && (
                        <button
                          className="btn btn-outline-light btn-sm"
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                        >
                          <i className="bi bi-download mr-1"></i>
                          {downloadingId === item.id ? 'Downloading...' : 'Download'}
                        </button>
                      )}
                      <button
                        className="btn btn-danger btn-sm ml-auto"
                        onClick={() => handleRemoveFromFavorites(item.id, item.title)}
                        disabled={removedItemId === item.id}
                        title="Remove from your collection"
                      >
                        <i className="bi bi-trash3-fill mr-1"></i>
                        {removedItemId === item.id ? 'Removing...' : 'Remove'}
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
