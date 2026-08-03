import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import Router from "./Router.jsx";
import { CACHE_KEYS, createItemId } from "./constants/apod.js";
import useTheme from "./hooks/useTheme.js";

const parseStoredValue = (value, fallback) => {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch (err) {
    console.error("Failed to parse stored value:", err);
    return fallback;
  }
};

const initializeFavorites = () => {
  const stored = localStorage.getItem(CACHE_KEYS.FAVORITES);
  const parsed = parseStoredValue(stored, []);
  return Array.isArray(parsed) ? parsed : [];
};

function App() {
  const [favorites, setFavorites] = useState(initializeFavorites);
  const isFirstPersist = useRef(true);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (isFirstPersist.current) {
      return;
    }
    localStorage.setItem(CACHE_KEYS.FAVORITES, JSON.stringify(favorites));
  }, [favorites]);

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
        if (updated.length === 0) {
          localStorage.removeItem(CACHE_KEYS.FAVORITES);
        } else {
          localStorage.setItem(CACHE_KEYS.FAVORITES, JSON.stringify(updated));
        }
      } catch (error) {
        console.error('Failed to persist favorites:', error);
      }

      return updated;
    });
  }, []);

  const isFavorited = useCallback((item) => favorites.some((favorite) => favorite.id === createItemId(item)), [favorites]);

  return (
    <>
      <SpeedInsights />
      <Router
        favorites={favoritesByNewest}
        addToFavorites={addToFavorites}
        removeFromFavorites={removeFromFavorites}
        isFavorited={isFavorited}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </>
  );
}

export default App;
