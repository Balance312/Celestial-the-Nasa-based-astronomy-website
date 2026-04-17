import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import Router from "./Router.jsx";
import { clearApiCache } from "./utils/nasaApi.js";
import { CACHE_KEYS } from "./constants/apod.js";
import "./app.css";

// Import Bootstrap CSS for styling (Tailwind + Bootstrap hybrid approach)
import "../bootstrap/bootstrap.min.css";

const parseStoredValue = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (err) {
    console.error("Failed to parse stored value:", err);
    return fallback;
  }
};

const createItemId = (item) => `${item.date}-${item.title}`;

// Initialize state from localStorage immediately
const initializeFavorites = () => {
  const stored = localStorage.getItem(CACHE_KEYS.FAVORITES);
  const parsed = parseStoredValue(stored, []);
  return Array.isArray(parsed) ? parsed : [];
};

function App() {
  const [favorites, setFavorites] = useState(initializeFavorites);
  const isFirstPersist = useRef(true);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    if (isFirstPersist.current) {
      return;
    }
    localStorage.setItem(CACHE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

  // Avoid overwriting storage on the first render cycle.
  useEffect(() => {
    isFirstPersist.current = false;
  }, []);

  const favoritesByNewest = useMemo(
    () =>
      [...favorites].sort(
        (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
      ),
    [favorites],
  );

  const addToFavorites = useCallback((item) => {
    const itemId = createItemId(item);

    setFavorites((prev) => {
      if (prev.some((favorite) => favorite.id === itemId)) {
        return prev;
      }

      return [
        ...prev,
        {
          ...item,
          id: itemId,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  }, []);

  const removeFromFavorites = useCallback((id) => {
    setFavorites((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      
      try {
        // Remove item from localStorage - delete key if empty, otherwise update
        if (updated.length === 0) {
          localStorage.removeItem(CACHE_KEYS.FAVORITES);
        } else {
          localStorage.setItem(CACHE_KEYS.FAVORITES, JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Failed to persist favorites:', error);
        // State still updated, but warn user if needed
      }
      
      // Clear all API cache to free up memory
      clearApiCache();
      
      return updated;
    });
  }, []);

  const isFavorited = useCallback((item) => favorites.some((favorite) => favorite.id === createItemId(item)), [favorites]);

  return (
    <Router
      favorites={favoritesByNewest}
      addToFavorites={addToFavorites}
      removeFromFavorites={removeFromFavorites}
      isFavorited={isFavorited}
    />
  );
}

export default App;