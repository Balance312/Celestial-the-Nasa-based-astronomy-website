import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Navbar from "./Components/Navbar.jsx";
import FloatingChatBubble from "./Components/FloatingChatBubble.jsx";
import SeoManager from "./Components/SeoManager.jsx";
import Footer from "./Components/Footer.jsx";

const Home = lazy(() => import("./pages/Home.jsx"));
const APODPage = lazy(() => import("./pages/APODPage.jsx"));
const GalleryPage = lazy(() => import("./pages/GalleryPage.jsx"));
const AboutPage = lazy(() => import("./pages/AboutPage.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const MediaView = lazy(() => import("./pages/MediaView.jsx"));
const EpicPage = lazy(() => import("./pages/EpicPage.jsx"));
const ChatBot = lazy(() => import("./pages/ChatBot.jsx"));
const NotFound = lazy(() => import("./pages/NotFound.jsx"));

function Router({
  favorites,
  addToFavorites,
  removeFromFavorites,
  isFavorited,
}) {
  return (
    <BrowserRouter>
      <a href="#main-content" className="skip-to-content">
        Skip to content
      </a>
      <SeoManager />
      <Navbar favoritesCount={favorites.length} />
      <FloatingChatBubble />
      <main id="main-content">
      <Suspense
        fallback={
          <div className="spinner-container">
            <div className="loading-spinner" role="status">
              <span className="sr-only">Loading...</span>
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
            path="/apod/:date"
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
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </Suspense>
      </main>
    </BrowserRouter>
  );
}

export default Router;
