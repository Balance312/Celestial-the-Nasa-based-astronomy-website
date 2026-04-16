import { useEffect, useMemo, useRef, useState } from "react";
import Router from "./Router.jsx";
import "./app.css";

const FAVORITES_STORAGE_KEY = "celestialFavorites";
const LIKES_STORAGE_KEY = "celestialLikes";

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
  const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
  const parsed = parseStoredValue(stored, []);
  return Array.isArray(parsed) ? parsed : [];
};

const initializeLikes = () => {
  const stored = localStorage.getItem(LIKES_STORAGE_KEY);
  const parsed = parseStoredValue(stored, []);
  return Array.isArray(parsed) ? parsed : [];
};

function App() {
  const [favorites, setFavorites] = useState(initializeFavorites);
  const [likes, setLikes] = useState(initializeLikes);
  const isFirstPersist = useRef(true);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    if (isFirstPersist.current) {
      return;
    }
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  }, [favorites]);

  // Persist likes to localStorage whenever they change
  useEffect(() => {
    if (isFirstPersist.current) {
      return;
    }
    localStorage.setItem(LIKES_STORAGE_KEY, JSON.stringify(likes));
  }, [likes]);

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

  const addToFavorites = (item) => {
    const itemId = createItemId(item);

    setFavorites((prev) => {
      if (prev.some((favorite) => favorite.id === itemId)) {
        return prev;
      }

      return [
        ...prev,
        {
          id: itemId,
          title: item.title,
          date: item.date,
          url: item.url,
          explanation: item.explanation,
          media_type: item.media_type,
          copyright: item.copyright,
          addedAt: new Date().toISOString(),
        },
      ];
    });
  };

  const removeFromFavorites = (id) => {
    setFavorites((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleLike = (item) => {
    const itemId = createItemId(item);

    setLikes((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId],
    );
  };

  const isLiked = (item) => likes.includes(createItemId(item));
  const isFavorited = (item) => favorites.some((favorite) => favorite.id === createItemId(item));

  return (
    <Router
      favorites={favoritesByNewest}
      likes={likes}
      addToFavorites={addToFavorites}
      removeFromFavorites={removeFromFavorites}
      toggleLike={toggleLike}
      isLiked={isLiked}
      isFavorited={isFavorited}
    />
  );
}

export default App;