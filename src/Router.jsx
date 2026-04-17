import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import FloatingChatBubble from "./Components/FloatingChatBubble.jsx";
import SeoManager from "./Components/SeoManager.jsx";

const Home = lazy(() => import("./Home.jsx"));
const APODPage = lazy(() => import("./pages/APODPage.jsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const MediaView = lazy(() => import("./pages/MediaView.jsx"));
const EpicPage = lazy(() => import("./pages/EpicPage.jsx"));
const ChatBot = lazy(() => import("./pages/ChatBot.jsx"));

function Router({
  favorites,
  addToFavorites,
  removeFromFavorites,
  isFavorited,
}) {
  return (
    <BrowserRouter>
      <SeoManager />
      <Navbar favoritesCount={favorites.length} />
      <FloatingChatBubble />
      <Suspense
        fallback={
          <div className="spinner-container">
            <div className="spinner-border spinner-border-lg" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="loading-text">Loading page...</p>
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route
            path="/apod"
            element={
              <APODPage
                addToFavorites={addToFavorites}
                removeFromFavorites={removeFromFavorites}
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
                isFavorited={isFavorited}
              />
            }
          />
          <Route path="/epic" element={<EpicPage />} />
          <Route
            path="/media/:date"
            element={
              <MediaView
                addToFavorites={addToFavorites}
                removeFromFavorites={removeFromFavorites}
                isFavorited={isFavorited}
              />
            }
          />
          <Route path="/about" element={<AboutPage />} />
          <Route
            path="/profile"
            element={<Profile favorites={favorites} removeFromFavorites={removeFromFavorites} />}
          />
          <Route path="/chat" element={<ChatBot />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default Router;