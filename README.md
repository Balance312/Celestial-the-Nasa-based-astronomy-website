# Celestial

A React SPA for browsing NASA's Astronomy Picture of the Day. View daily images, browse a gallery, explore Earth EPIC satellite imagery, and save favorites.

## Tech Stack

- **Framework:** React 19 + Vite 7
- **Routing:** React Router v7
- **Styling:** Tailwind CSS v4 + custom component CSS
- **Testing:** Vitest + Testing Library
- **API:** NASA APOD + EPIC endpoints
- **Deployment:** Vercel

## Features

- Daily APOD display with date navigation (1995–present)
- Random image gallery (8 items per load)
- Earth EPIC satellite imagery with date filtering
- Full-screen media viewer with HD download
- Favorites system (localStorage persistence)
- AI chatbot for astronomy questions (OpenRouter API)
- Responsive design, keyboard navigation, ARIA labels

## Getting Started

### Prerequisites

- Node.js 16+
- A NASA API key from https://api.nasa.gov/

### Setup

```bash
git clone https://github.com/Balance312/Celestial-the-Nasa-based-astronomy-website.git
cd Celestial-the-Nasa-based-astronomy-website
npm install
```

Create a `.env` file in the project root:

```
VITE_NASA_API_KEY=your_nasa_api_key_here
```

For the chatbot feature, also add:

```
OPENROUTER_API_KEY=your_openrouter_api_key
```

### Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build to dist/
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
npm test             # Run tests in watch mode
npm test -- --run    # Run tests once
```

## Project Structure

```
src/
├── App.jsx                  # Root component, favorites state
├── Router.jsx               # Route definitions, layout
├── main.jsx                 # Entry point
├── index.css                # Tailwind theme, base styles
│
├── Components/
│   ├── Navbar.jsx           # Navigation with mobile toggle
│   ├── Footer.jsx           # Global footer
│   ├── FloatingChatBubble.jsx  # Chat widget (portal)
│   ├── ErrorBoundary.jsx    # Class-based error catcher
│   └── SeoManager.jsx       # Dynamic meta tags
│
├── hooks/
│   └── useChat.js           # Shared chat logic
│
├── pages/
│   ├── Home.jsx             # Landing page, APOD preview
│   ├── APODPage.jsx         # Browse by date
│   ├── GalleryPage.jsx      # Random gallery + modal
│   ├── MediaView.jsx        # Full media viewer
│   ├── EpicPage.jsx         # EPIC satellite images
│   ├── ChatBot.jsx          # Full-page chat
│   ├── AboutPage.jsx        # About
│   └── Profile.jsx          # Saved favorites
│
├── constants/
│   ├── apod.js              # Shared constants, helpers
│   └── chatPrompt.js        # Chatbot system prompt
│
├── utils/
│   ├── nasaApi.js           # API calls, caching, retry
│   ├── apiConfig.js         # API key management
│   ├── downloadHandler.js   # File download logic
│   └── chatbotService.js    # Chat API client
│
├── styles/
│   └── components.css       # All component styles
│
└── __tests__/               # 59 tests across 11 files
```

## Recent Changes

- Removed dead code: unused utilities, Bootstrap files, prototype exports
- Extracted shared chat logic into `useChat` hook (was duplicated across two components)
- Unified chat system prompt to a single source of truth
- Centralized ID generation and date utilities into constants
- Removed side effect where removing a favorite cleared the entire API cache
- Fixed `setTimeout` cleanup leak in EpicPage
- Replaced inline styles with CSS classes in MediaView and EpicPage
- Moved Footer to a global component (was page-specific)
- Added 33 new tests covering API utilities, page components, navbar, and error boundary
- Added skip-to-content link, modal focus management, skeleton loading CSS
- Updated documentation to reflect actual codebase state
