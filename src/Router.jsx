import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home.jsx";
import Navbar from "./Components/Navbar.jsx";
import APODPage from "./pages/APODPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";
import Profile from "./pages/Profile.jsx";

function Router({
  favorites,
  addToFavorites,
  removeFromFavorites,
  toggleLike,
  isLiked,
  isFavorited,
}) {
  return (
    <BrowserRouter>
      <Navbar favoritesCount={favorites.length} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/apod"
          element={
            <APODPage
              addToFavorites={addToFavorites}
              removeFromFavorites={removeFromFavorites}
              toggleLike={toggleLike}
              isLiked={isLiked}
              isFavorited={isFavorited}
            />
          }
        />
        <Route
          path="/gallery"
          element={
            <GalleryPage
              addToFavorites={addToFavorites}
              removeFromFavorites={removeFromFavorites}
              toggleLike={toggleLike}
              isLiked={isLiked}
              isFavorited={isFavorited}
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route
          path="/profile"
          element={<Profile favorites={favorites} removeFromFavorites={removeFromFavorites} />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default Router;