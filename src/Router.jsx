import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./Home.jsx";
import Navbar from "./Components/Navbar.jsx";
import APODPage from "./pages/APODPage.jsx";
import GalleryPage from "./pages/GalleryPage.jsx";
import AboutPage from "./pages/AboutPage.jsx";

function Router() {

  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/apod" element={<APODPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </BrowserRouter>

  );
}

export default Router;