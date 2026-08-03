import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getRandomGallery, searchNasaLibrary } from '../utils/nasaApi.js';
import { sanitizeFilename, downloadFile } from '../utils/downloadHandler.js';
import { getNasaApiKey } from '../utils/apiConfig.js';
import { API_ERROR_MESSAGES, GALLERY_ITEMS_COUNT, createItemId } from '../constants/apod.js';

function GalleryPage({ addToFavorites, removeFromFavorites, isFavorited }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [downloadError, setDownloadError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');

  const isSearchMode = !!searchParams.get('q');

  // ── Search NASA Image & Video Library ──
  const fetchSearchResults = useCallback(async (query, signal) => {
    try {
      const data = await searchNasaLibrary(query, { signal });

      if (signal?.aborted) return;

      const items = (data?.collection?.items || []).map((item) => {
        const d = item.data?.[0] || {};
        const preview = item.links?.find((l) => l.rel === 'preview');
        return {
          id: d.nasa_id,
          title: d.title || 'Untitled',
          date: d.date_created ? d.date_created.split('T')[0] : '',
          explanation: d.description || '',
          url: preview?.href || '',
          hdurl: preview?.href || '',
          media_type: d.media_type || 'image',
        };
      }).filter((item) => item.url);

      setGallery(items);
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError('Search failed. Please try a different query.');
      console.error('Search error:', err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // ── Fetch random APOD gallery ──
  const fetchRandomGallery = useCallback(async ({ signal, preferCache = true } = {}) => {
    try {
      setLoading(true);
      setError(null);
      if (!preferCache) setGallery([]);
      const apiKey = getNasaApiKey();
      const data = await getRandomGallery(apiKey, GALLERY_ITEMS_COUNT, { signal, preferCache });

      if (signal?.aborted) return;

      setGallery(data);
    } catch (err) {
      if (err.name === 'AbortError') return;
      let errorMessage = 'Failed to load gallery';
      if (err.message.includes('503')) errorMessage = API_ERROR_MESSAGES.UNAVAILABLE;
      else if (err.message.includes('502')) errorMessage = API_ERROR_MESSAGES.BAD_GATEWAY;
      else if (err.message.includes('429')) errorMessage = API_ERROR_MESSAGES.RATE_LIMIT;
      else if (err.message.includes('Failed to fetch')) errorMessage = API_ERROR_MESSAGES.NETWORK;
      setError(errorMessage);
      console.error('Error fetching gallery:', err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  // ── Load data based on URL params ──
  useEffect(() => {
    const controller = new AbortController();
    const query = searchParams.get('q');

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    setError(null);

    if (query) {
      fetchSearchResults(query, controller.signal);
    } else {
      fetchRandomGallery({ signal: controller.signal, preferCache: true });
    }

    return () => controller.abort();
  }, [searchParams, fetchSearchResults, fetchRandomGallery]);

  const filteredGallery = useMemo(() => {
    let items = gallery;
    if (!isSearchMode && searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter((item) => item.title?.toLowerCase().includes(q) || item.explanation?.toLowerCase().includes(q));
    }
    if (activeFilter === 'images') items = items.filter((i) => i.media_type === 'image');
    if (activeFilter === 'videos') items = items.filter((i) => i.media_type === 'video');
    return items;
  }, [gallery, searchQuery, activeFilter, isSearchMode]);

  const filterCounts = useMemo(() => ({
    all: gallery.length,
    images: gallery.filter((i) => i.media_type === 'image').length,
    videos: gallery.filter((i) => i.media_type === 'video').length,
  }), [gallery]);

  const handleGalleryItemClick = useCallback((item) => {
    const itemId = createItemId(item);
    if (isSearchMode) {
      navigate(`/media/${itemId}`, { state: { image: item } });
    } else {
      navigate(`/media/${item.date}`);
    }
  }, [navigate, isSearchMode]);

  const handleDownload = useCallback(async (event, item) => {
    event.stopPropagation();
    if (item.media_type !== 'image') return;
    setDownloadingId(item.date || item.id);
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

  const handleSearchSubmit = useCallback((e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    if (trimmed) {
      setSearchParams({ q: trimmed });
    }
  }, [searchQuery, setSearchParams]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchParams({});
  }, [setSearchParams]);

  const filters = [
    { key: 'all', label: `All (${filterCounts.all})` },
    { key: 'images', label: `Images (${filterCounts.images})` },
    { key: 'videos', label: `Videos (${filterCounts.videos})` },
  ];

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="page-hero page-hero-image"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=1400&q=80)' }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <h1 className="page-title m-0 text-4xl font-bold md:text-5xl">
            {isSearchMode ? `Search: "${searchParams.get('q')}"` : 'Universal Space Gallery'}
          </h1>
          {isSearchMode && (
            <p className="mt-3 text-lg text-text-secondary">
              Results from NASA Image &amp; Video Library
            </p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {/* Search + Filters */}
        <div className="mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="mx-auto mb-6 max-w-2xl">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search NASA Images and Video..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border-glow bg-space-700 py-3 pl-12 pr-12 text-text-primary placeholder-text-muted focus:border-cyan-glow focus:outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-cyan-glow"
                >
                  <i className="bi bi-x-lg"></i>
                </button>
              )}
            </div>
          </form>

          {/* Filter Chips */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {filters.map((filter) => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key)}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                  activeFilter === filter.key
                    ? 'border-cyan-glow bg-cyan-subtle text-cyan-glow'
                    : 'border-border-glow bg-space-700 text-text-secondary hover:border-cyan-dim hover:text-text-bright'
                }`}
              >
                {filter.label}
              </button>
            ))}
            {!isSearchMode && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => fetchRandomGallery({ preferCache: false })}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load New Images'}
              </button>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 rounded-lg border border-gold-dim bg-gold-subtle p-4">
            <div className="mb-1 text-sm font-bold text-gold">
              <i className="bi bi-exclamation-triangle-fill mr-2"></i>Error
            </div>
            <p className="m-0 text-sm text-gold-light">{error}</p>
          </div>
        )}

        {downloadError && (
          <div className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <div className="mb-1 text-sm font-bold text-red-400">
              <i className="bi bi-exclamation-triangle-fill mr-2"></i>Download Error
            </div>
            <p className="m-0 text-sm text-red-300">{downloadError}</p>
          </div>
        )}

        {/* Loading */}
        {loading && gallery.length === 0 && (
          <div className="spinner-container">
            <div className="loading-spinner h-14 w-14" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="loading-text">{isSearchMode ? 'Searching NASA database...' : 'Gathering cosmic wonders...'}</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && filteredGallery.length > 0 && (
          <div className="gallery-grid" role="grid" aria-label="Gallery of NASA images and videos">
            {filteredGallery.map((item) => {
              const itemId = createItemId(item);
              const itemIsFavorited = isFavorited(item);
              return (
                <div
                  key={itemId}
                  className="gallery-item group"
                  onClick={() => handleGalleryItemClick(item)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open ${item.media_type === 'image' ? 'image' : 'video'}: ${item.title}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleGalleryItemClick(item); }
                  }}
                >
                  <div className="gallery-thumbnail relative">
                    {item.media_type === 'image' ? (
                      <img src={item.url} alt={item.title} loading="lazy" decoding="async" />
                    ) : (
                      <div className="video-placeholder">
                        <div className="video-play-button"><i className="bi bi-play-circle-fill"></i></div>
                        <span className="video-label">Video</span>
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-space-900/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <div className="flex w-full gap-2 p-3">
                        <button
                          className="flex-1 rounded bg-cyan-glow/90 px-2 py-1.5 text-xs font-bold text-space-900 transition-colors hover:bg-cyan-glow"
                          onClick={(event) => {
                            event.stopPropagation();
                            if (isSearchMode) {
                              navigate(`/media/${item.id}`, { state: { image: item } });
                            } else {
                              navigate(`/media/${item.date}`);
                            }
                          }}
                        >
                          {item.media_type === 'image' ? 'View Full' : 'Open Media'}
                        </button>
                        <button
                          className="rounded bg-space-800/90 px-2 py-1.5 text-xs font-bold text-text-bright transition-colors hover:bg-space-700"
                          onClick={(event) => handleDownload(event, item)}
                          disabled={item.media_type !== 'image' || downloadingId === (item.date || item.id)}
                        >
                          <i className={`bi ${downloadingId === (item.date || item.id) ? 'bi-hourglass-split' : 'bi-download'}`}></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="gallery-info">
                    <h4 className="gallery-title line-clamp-1">{item.title}</h4>
                    <p className="gallery-date">{item.date}</p>
                    <div className="flex items-center justify-between">
                      <button
                        className="text-[11px] font-semibold text-text-muted transition-colors hover:text-cyan-glow"
                        onClick={(event) => {
                          event.stopPropagation();
                          if (itemIsFavorited) { removeFromFavorites(itemId); return; }
                          addToFavorites(item);
                        }}
                      >
                        <i className={`bi ${itemIsFavorited ? 'bi-heart-fill text-cyan-glow' : 'bi-heart'}`}></i>
                        {itemIsFavorited ? ' Saved' : ' Favorite'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredGallery.length === 0 && gallery.length > 0 && (
          <div className="py-16 text-center">
            <p className="text-text-muted">No results found for &quot;{searchQuery}&quot;</p>
          </div>
        )}

        {!loading && filteredGallery.length === 0 && gallery.length === 0 && !error && (
          <div className="py-16 text-center">
            <i className="bi bi-search mb-4 text-5xl text-space-600"></i>
            <p className="text-text-muted">
              {isSearchMode ? 'No results found. Try a different search.' : 'Click "Load New Images" to explore the cosmos.'}
            </p>
          </div>
        )}

        {/* Modal */}
      </div>
    </div>
  );
}

export default GalleryPage;
