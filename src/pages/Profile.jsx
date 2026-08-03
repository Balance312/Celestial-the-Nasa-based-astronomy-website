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
      setTimeout(() => setRemovedItemId(null), 1500);
    }
  }, [removeFromFavorites]);

  const handleDownload = useCallback(async (item) => {
    if (item.media_type !== 'image') return;

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
    <div className="min-h-screen">
      {/* Hero Header */}
      <div
        className="page-hero page-hero-image"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=1400&q=80)' }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <h1 className="page-title m-0 text-4xl font-bold md:text-5xl">
            My Space Collection
          </h1>
          <p className="mt-3 text-lg text-text-secondary">
            Your personal archive of cosmic moments and discoveries.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Download Error */}
        {downloadError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="mb-1 text-sm font-bold text-red-400">
              <i className="bi bi-exclamation-triangle-fill mr-2"></i>
              Download Error
            </div>
            <p className="m-0 text-sm text-red-300">{downloadError}</p>
          </div>
        )}

        {/* Stats Bar */}
        <div className="mb-8 flex flex-wrap items-center gap-4">
          <div className="stat-card inline-flex items-center gap-2 px-4 py-2">
            <i className="bi bi-stars text-cyan-glow"></i>
            <span className="text-sm font-semibold text-text-bright">
              {favorites.length} saved item{favorites.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="text-sm text-text-muted">
            Items are sorted by when you added them to your profile.
          </p>
          <button
            className="btn btn-outline btn-sm ml-auto"
            onClick={handleClearCache}
            title="Clear cached API data to free up memory"
          >
            <i className="bi bi-trash3"></i>
            {cacheCleared ? 'Cache Cleared!' : 'Clear Cache'}
          </button>
        </div>

        {/* Empty State */}
        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <i className="bi bi-heartbreak mb-4 text-5xl text-space-600"></i>
            <h2 className="m-0 mb-2 text-xl font-bold text-text-bright">
              Your collection is empty
            </h2>
            <p className="mb-6 text-sm text-text-muted">
              Start exploring APOD entries and save the ones you love.
            </p>
            <Link
              to="/apod"
              className="btn btn-primary no-underline"
            >
              Go Explore
            </Link>
          </div>
        ) : (
          /* Favorites Grid */
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {favorites.map((item) => (
              <div key={item.id}>
                <div className="card flex h-full flex-col overflow-hidden">
                  {item.media_type === 'image' ? (
                    <img
                      src={item.url}
                      className="w-full object-cover"
                      alt={item.title}
                      loading="lazy"
                      decoding="async"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-space-800">
                      <i className="bi bi-play-circle text-4xl text-cyan-glow"></i>
                      <span className="ml-2 text-sm font-semibold text-text-muted">Video Entry</span>
                    </div>
                  )}
                  <div className="flex flex-1 flex-col p-4">
                    <h5 className="m-0 mb-2 text-lg font-bold text-text-bright">
                      {item.title}
                    </h5>
                    <div className="mb-3 flex flex-wrap gap-3 text-xs text-text-muted">
                      <span className="flex items-center gap-1">
                        <i className="bi bi-calendar-event"></i>
                        APOD Date: {item.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <i className="bi bi-clock-history"></i>
                        Added: {new Date(item.addedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="m-0 mb-4 line-clamp-3 text-sm leading-relaxed text-text-secondary">
                      {item.explanation}
                    </p>
                    <div className="mt-auto flex flex-wrap gap-2 pt-3">
                      <button
                        className="btn btn-secondary btn-sm text-[11px]"
                        onClick={() => navigate(`/media/${item.date}`, { state: { image: item } })}
                      >
                        <i className="bi bi-arrows-fullscreen"></i>
                        View Full Image
                      </button>
                      {item.media_type === 'image' && (
                        <button
                          className="btn btn-secondary btn-sm text-[11px]"
                          onClick={() => handleDownload(item)}
                          disabled={downloadingId === item.id}
                        >
                          <i className="bi bi-download"></i>
                          {downloadingId === item.id ? 'Downloading...' : 'Download'}
                        </button>
                      )}
                      <button
                        className="btn btn-sm ml-auto text-[11px] border border-red-500/30 bg-transparent text-red-400 hover:bg-red-500/10"
                        onClick={() => handleRemoveFromFavorites(item.id, item.title)}
                        disabled={removedItemId === item.id}
                        title="Remove from your collection"
                      >
                        <i className="bi bi-trash3-fill"></i>
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
