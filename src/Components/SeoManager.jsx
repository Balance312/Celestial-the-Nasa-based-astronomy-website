import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const DEFAULT_TITLE = "Celestial | NASA APOD Explorer";
const DEFAULT_DESCRIPTION =
  "Discover NASA Astronomy Picture of the Day, browse a space gallery, and save your cosmic favorites on Celestial.";

const SEO_BY_ROUTE = {
  "/": {
    title: "Celestial | Explore NASA APOD and Space Gallery",
    description:
      "Explore NASA's Astronomy Picture of the Day, discover cosmic imagery, and dive into astronomy with Celestial.",
  },
  "/apod": {
    title: "Today's APOD | Celestial",
    description:
      "View NASA's Astronomy Picture of the Day with full explanation, media details, and save it to your favorites.",
  },
  "/gallery": {
    title: "Cosmic Gallery | Celestial",
    description:
      "Browse random NASA APOD images and videos in a beautiful cosmic gallery.",
  },
  "/profile": {
    title: "My Space Collection | Celestial",
    description:
      "Review your saved NASA APOD favorites in your personal space collection.",
  },
  "/about": {
    title: "About Celestial | NASA APOD Explorer",
    description:
      "Learn about Celestial, its NASA APOD data source, and the mission to make space exploration accessible.",
  },
};

function setMeta(name, content, isProperty = false) {
  const selector = isProperty
    ? `meta[property="${name}"]`
    : `meta[name="${name}"]`;
  let tag = document.head.querySelector(selector);

  if (!tag) {
    tag = document.createElement("meta");
    if (isProperty) {
      tag.setAttribute("property", name);
    } else {
      tag.setAttribute("name", name);
    }
    document.head.appendChild(tag);
  }

  tag.setAttribute("content", content);
}

function setCanonical(url) {
  let link = document.head.querySelector("link[rel='canonical']");
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", url);
}

function SeoManager() {
  const location = useLocation();

  useEffect(() => {
    const config = SEO_BY_ROUTE[location.pathname] || {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
    };

    const canonicalUrl = `${window.location.origin}${location.pathname}`;

    document.title = config.title;
    setMeta("description", config.description);
    setMeta("robots", "index, follow");
    setMeta("og:title", config.title, true);
    setMeta("og:description", config.description, true);
    setMeta("og:url", canonicalUrl, true);
    setMeta("twitter:title", config.title, true);
    setMeta("twitter:description", config.description, true);
    setCanonical(canonicalUrl);
  }, [location.pathname]);

  return null;
}

export default SeoManager;
