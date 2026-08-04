import { useEffect, useState, useCallback, useTransition, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getApodByDate } from '../utils/nasaApi.js';
import { downloadFile, sanitizeFilename } from '../utils/downloadHandler.js';
import { getNasaApiKey } from '../utils/apiConfig.js';
import { APOD_START_DATE, DATE_MESSAGES, API_ERROR_MESSAGES, getDefaultDate } from '../constants/apod.js';

function APODPage({ addToFavorites, removeFromFavorites, isFavorited }) {
  const navigate = useNavigate();
  const { date: urlDate } = useParams();
  const [apodData, setApodData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [, startTransition] = useTransition();

  const [selectedDate, setSelectedDate] = useState(urlDate || getDefaultDate());
  const [isDownloading, setIsDownloading] = useState(false);

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const fetchAPOD = useCallback(async (date, signal) => {
    try {
      setLoading(true);
      setError(null);

      const apiKey = getNasaApiKey();
      const data = await getApodByDate(apiKey, date, { signal, preferCache: true });
      setApodData(data);
    } catch (err) {
      if (err.name === 'AbortError') return;

      let errorMessage = 'Failed to load APOD data';
      if (err.message.includes('503')) {
        errorMessage = API_ERROR_MESSAGES.UNAVAILABLE;
      } else if (err.message.includes('502')) {
        errorMessage = API_ERROR_MESSAGES.BAD_GATEWAY;
      } else if (err.message.includes('429')) {
        errorMessage = API_ERROR_MESSAGES.RATE_LIMIT;
      } else if (err.message.includes('Failed to fetch')) {
        errorMessage = API_ERROR_MESSAGES.NETWORK;
      }

      setError(errorMessage);
      console.error('Error fetching APOD:', err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAPOD(selectedDate, controller.signal);
    return () => controller.abort();
  }, [selectedDate, fetchAPOD]);

  const formattedDate = useMemo(() => {
    if (!apodData) return '';
    return new Date(apodData.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, [apodData]);

  const addDaysToDateString = useCallback((dateStr, days) => {
    const parts = dateStr.split('-');
    const date = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    date.setDate(date.getDate() + days);
    return date.getFullYear() + '-' +
           String(date.getMonth() + 1).padStart(2, '0') + '-' +
           String(date.getDate()).padStart(2, '0');
  }, []);

  const goToPreviousDay = useCallback(() => {
    const newDateStr = addDaysToDateString(selectedDate, -1);
    if (newDateStr >= APOD_START_DATE) {
      startTransition(() => { setSelectedDate(newDateStr); setError(null); });
      navigate(`/apod/${newDateStr}`, { replace: true });
    } else {
      setError(DATE_MESSAGES.BEFORE_START);
    }
  }, [selectedDate, addDaysToDateString, navigate]);

  const goToNextDay = useCallback(() => {
    const newDateStr = addDaysToDateString(selectedDate, 1);
    if (newDateStr <= todayStr) {
      startTransition(() => { setSelectedDate(newDateStr); setError(null); });
      navigate(`/apod/${newDateStr}`, { replace: true });
    } else {
      setError(DATE_MESSAGES.FUTURE);
    }
  }, [selectedDate, addDaysToDateString, todayStr, navigate]);

  const goToToday = useCallback(() => {
    startTransition(() => setSelectedDate(todayStr));
    navigate(`/apod/${todayStr}`, { replace: true });
  }, [todayStr, navigate]);

  const handleDateChange = useCallback((e) => {
    const newDate = e.target.value;
    if (newDate < APOD_START_DATE) { setError(DATE_MESSAGES.BEFORE_START); return; }
    if (newDate > todayStr) { setError(DATE_MESSAGES.FUTURE); return; }
    startTransition(() => { setError(null); setSelectedDate(newDate); });
    navigate(`/apod/${newDate}`, { replace: true });
  }, [todayStr, navigate]);

  const itemIsFavorited = apodData ? isFavorited(apodData) : false;
  const downloadImageUrl = apodData?.hdurl || apodData?.url || '';

  const handleFavoriteToggle = useCallback(() => {
    if (!apodData) return;
    startTransition(() => {
      if (itemIsFavorited) {
        removeFromFavorites(`${apodData.date}-${apodData.title}`);
      } else {
        addToFavorites(apodData);
      }
    });
  }, [apodData, itemIsFavorited, addToFavorites, removeFromFavorites]);

  const handleDownloadImage = useCallback(async () => {
    if (!downloadImageUrl || !apodData) return;
    setIsDownloading(true);
    setError(null);
    try {
      const filename = `${sanitizeFilename(apodData.title)}.jpg`;
      await downloadFile(downloadImageUrl, filename, apodData.title, apodData.date);
    } catch (downloadError) {
      const errorMessage = downloadError.message?.includes('Network')
        ? 'Network error: Check your connection'
        : downloadError.message?.includes('blob')
        ? 'Failed to process file'
        : 'Download failed. Please try again.';
      setError(errorMessage);
      console.error('Download failed:', downloadError);
    } finally {
      setIsDownloading(false);
    }
  }, [downloadImageUrl, apodData]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className="page-hero page-hero-image"
        style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1400&q=80)' }}
      >
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-6">
          <h1 className="page-title m-0 text-4xl font-bold md:text-5xl">
            Astronomy Picture of the Day
          </h1>
          <p className="mt-3 text-lg text-text-secondary">
            Daily curated imagery from NASA&apos;s archives
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-6">
        {/* Date Navigation */}
        <div className="mb-8 flex flex-wrap items-center justify-center gap-3">
          <button className="btn btn-outline btn-sm" onClick={goToPreviousDay}>
            ← Previous
          </button>
          <div className="date-input-wrapper">
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="date-picker"
              min={APOD_START_DATE}
              max={todayStr}
            />
          </div>
          <button className="btn btn-primary btn-sm" onClick={goToToday}>
            📅 Today
          </button>
          <button className="btn btn-outline btn-sm" onClick={goToNextDay}>
            Next →
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="error-alert mb-8">
            <div className="error-title">⚠️ Error</div>
            <p>{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="spinner-container">
            <div className="loading-spinner h-14 w-14" role="status">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="loading-text">Fetching cosmic wonders...</p>
          </div>
        )}

        {/* APOD Content */}
        {apodData && !loading && (
          <div>
            {/* Full-width Hero Image */}
            {apodData.media_type === 'image' ? (
              <div className="mb-8 overflow-hidden rounded-lg border border-border-glow">
                <img
                  src={apodData.url}
                  alt={apodData.title}
                  className="w-full object-cover"
                  style={{ maxHeight: '65vh' }}
                  loading="eager"
                  decoding="async"
                />
              </div>
            ) : apodData.media_type === 'video' ? (
              <div className="mb-8 overflow-hidden rounded-lg border border-border-glow">
                <iframe
                  src={apodData.url}
                  className="aspect-video w-full"
                  title={apodData.title}
                  allowFullScreen
                />
              </div>
            ) : null}

            {/* Title + Date + Actions Row */}
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <h1 className="m-0 mb-2 text-3xl font-bold text-text-bright md:text-4xl">
                  {apodData.title}
                </h1>
                <p className="text-sm text-text-muted">
                  {formattedDate}
                  {apodData.copyright && (
                    <span className="ml-2">| Image Credit: {apodData.copyright}</span>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  className={`btn ${itemIsFavorited ? 'btn-gold' : 'btn-outline'}`}
                  onClick={handleFavoriteToggle}
                >
                  <i className={`bi ${itemIsFavorited ? 'bi-heart-fill' : 'bi-heart'}`}></i>
                  {itemIsFavorited ? 'Saved to Favorites' : 'Save to Favorites'}
                </button>
              </div>
            </div>

            {/* Explanation */}
            <div className="mb-8 rounded-lg border border-border-glow bg-surface-card p-6 backdrop-blur-xl">
              <p className="text-sm leading-relaxed text-text-secondary">
                <strong className="text-text-bright">Explanation:</strong> {apodData.explanation}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                className="btn btn-outline"
                onClick={() => navigate(`/media/${apodData.date}`)}
              >
                <i className="bi bi-arrows-fullscreen"></i>
                View in Full Screen
              </button>
              {apodData.media_type === 'image' && downloadImageUrl && (
                <button
                  className="btn btn-secondary"
                  onClick={handleDownloadImage}
                  disabled={isDownloading}
                >
                  <i className="bi bi-download"></i>
                  {isDownloading ? 'Downloading...' : 'Download HD (NASA)'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default APODPage;
