# 🚀 Celestial - Complete Setup Guide

## Project Overview

**Celestial** is a modern, responsive web application that displays NASA's Astronomy Picture of the Day (APOD). It features a beautiful deep space purple theme, multi-page navigation, and real-time data fetching from the NASA APOD API.

### Key Features:
- 🔭 **Daily APOD Display** - Shows today's astronomy image/video with explanations
- 📅 **Date Navigation** - Browse historical APOD images with date picker
- 🌌 **Gallery** - Browse random collections of cosmic images
- ℹ️ **About Page** - Information about the project and NASA APOD
- 🎨 **Purple Cosmic Theme** - Beautiful gradient backgrounds and animations
- 📱 **Fully Responsive** - Works on desktop, tablet, and mobile
- ⚡ **Fast Performance** - Built with Vite for lightning-fast loading

---

## Prerequisites

Before starting, ensure you have installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (for version control) - [Download](https://git-scm.com/)

---

## Step 1: Create a New Repository

### Option A: Starting from Scratch

```bash
# Create a new Vite React project
npm create vite@latest celestial -- --template react

# Navigate to project directory
cd celestial

# Install dependencies
npm install

# Install additional dependencies
npm install react-router-dom bootstrap
```

### Option B: Clone from GitHub (after pushing)

```bash
git clone <your-repository-url>
cd celestial
npm install
```

---

## Step 2: Project Structure

Create this folder structure:

```
celestial/
├── public/
│   └── favicon.svg              # Compass logo
├── src/
│   ├── Components/
│   │   ├── Navbar.jsx          # Navigation component
│   │   └── navbar.css          # Navbar styles
│   ├── pages/
│   │   ├── APODPage.jsx        # Daily APOD page with date picker
│   │   ├── GalleryPage.jsx     # Image gallery page
│   │   ├── AboutPage.jsx       # About/info page
│   │   └── pages.css           # Page styles
│   ├── App.jsx                 # Main app component
│   ├── app.css                 # Global styles
│   ├── Home.jsx                # Landing page
│   ├── home.css                # Home page styles
│   ├── Router.jsx              # Route configuration
│   └── main.jsx                # Entry point
├── .env                         # Environment variables (NOT committed)
├── .env.example                 # Template for .env
├── .gitignore                   # Git ignore rules
├── index.html                   # HTML template
├── vite.config.js              # Vite configuration
├── package.json                # Dependencies
└── README.md                   # Documentation
```

---

## Step 3: Install Dependencies

```bash
npm install
```

### Required Packages:
- **react** (^19.2.0) - UI library
- **react-dom** (^19.2.0) - React DOM rendering
- **react-router-dom** (^7.12.0) - Client-side routing
- **vite** (^7.2.4) - Build tool & dev server
- **@vitejs/plugin-react** (^5.1.1) - React support for Vite
- **bootstrap** - CSS framework (optional, for styling)

### For Development:
```bash
npm install --save-dev eslint @eslint/js eslint-plugin-react-refresh
```

---

## Step 4: Environment Variables Setup

### Create `.env` file:

```bash
# .env file
VITE_NASA_API_KEY=your_api_key_here
```

### Create `.env.example`:

```bash
# .env.example (share this, not .env)
VITE_NASA_API_KEY=your_api_key_here
```

### Get NASA API Key:
1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill out the form to request an API key
3. Check your email for the key
4. Add to your `.env` file

> ⚠️ **Important**: Never commit `.env` - it's already in `.gitignore`

---

## Step 5: Copy All Files

Copy these files into your project:

### Root Files:
- `index.html` - Update title to "Celestial - Explore the Universe"
- `vite.config.js` - Vite configuration
- `.gitignore` - Git ignore patterns
- `package.json` - Dependencies list

### Source Files:
```
src/
├── App.jsx
├── app.css
├── Router.jsx
├── Home.jsx
├── home.css
├── main.jsx
├── Components/
│   ├── Navbar.jsx
│   └── navbar.css
└── pages/
    ├── APODPage.jsx
    ├── GalleryPage.jsx
    ├── AboutPage.jsx
    └── pages.css
```

### Public Files:
```
public/
└── favicon.svg
```

---

## Step 6: Core Files Explanation

### `main.jsx` - Entry Point
```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import '../bootstrap/bootstrap.min.css'
import '../bootstrap/bootstrap.bundle.min.js'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

### `App.jsx` - Main App
Routes to the Router component which manages all pages.

### `Router.jsx` - Route Configuration
```javascript
Routes:
- / → Home (landing page)
- /apod → APODPage (daily image with date picker)
- /gallery → GalleryPage (image collection)
- /about → AboutPage (information page)
```

### `Home.jsx` - Landing Page
- Hero section with centered text and CTA buttons
- Today's APOD preview
- Features showcase
- Stats section
- Call-to-action
- Footer

### `APODPage.jsx` - APOD Display
- Date picker to browse past images
- Previous/Next day navigation
- Full image/video display
- Title, date, explanation
- Media type badge

### `GalleryPage.jsx` - Image Gallery
- 3x3 grid of random APOD images
- Hover effects and zoom
- Modal popup for full details
- Load new images button

### `AboutPage.jsx` - Information
- Mission statement
- Features overview
- Technology stack
- Statistics
- NASA APOD information

### `Navbar.jsx` - Navigation
Links to all pages with responsive menu

---

## Step 7: Styling System

### Color Palette (Purple Theme):
```css
--primary-color: rgb(110, 14, 255)       /* Deep Purple */
--secondary-color: rgb(168, 85, 247)     /* Lighter Purple */
--dark-bg: rgb(15, 12, 35)               /* Very Dark */
--light-text: rgba(255, 255, 255, 0.9)   /* Almost White */
```

### CSS Files:
- `app.css` - Global styles + APOD component styles
- `home.css` - Landing page styles + animations
- `navbar.css` - Navigation bar styles
- `pages/pages.css` - APOD, Gallery, About page styles

### Responsive Breakpoints:
- **Desktop**: 768px and up
- **Tablet**: 481px - 768px
- **Mobile**: 480px and down

---

## Step 8: Run Development Server

```bash
npm run dev
```

Then open: `http://localhost:5173`

---

## Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint
npm run lint
```

---

## File Sizes (Reference)

Key component files:
- `Home.jsx` - Landing page with APOD preview (~150 lines)
- `APODPage.jsx` - Daily APOD display (~110 lines)
- `GalleryPage.jsx` - Image gallery (~130 lines)
- `AboutPage.jsx` - Information page (~150 lines)
- `Router.jsx` - Route configuration (~20 lines)
- CSS files - Combined ~1200 lines

---

## Key Dependencies & Versions

```json
{
  "react": "^19.2.0",
  "react-dom": "^19.2.0",
  "react-router-dom": "^7.12.0",
  "vite": "^7.2.4",
  "@vitejs/plugin-react": "^5.1.1",
  "bootstrap": "^5.3.0"
}
```

---

## API Integration

### NASA APOD API
- **Endpoint**: `https://api.nasa.gov/planetary/apod`
- **Method**: GET
- **Parameters**:
  - `api_key` (required) - Your NASA API key
  - `date` (optional) - YYYY-MM-DD format
  - `count` (optional) - Number of random images

### Example Fetch:
```javascript
const apiKey = import.meta.env.VITE_NASA_API_KEY;
const response = await fetch(
  `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=2026-04-15`
);
const data = await response.json();
```

---

## Security Best Practices

✅ **DO:**
- Store API key in `.env` file
- Add `.env` to `.gitignore`
- Use `import.meta.env.VITE_*` for environment variables
- Validate API responses
- Handle errors gracefully

❌ **DON'T:**
- Hardcode API keys in source code
- Commit `.env` file to Git
- Expose API keys in console logs
- Skip error handling

---

## Deployment Options

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop 'dist' folder to Netlify
```

### GitHub Pages
```bash
npm run build
# Push 'dist' folder to gh-pages branch
```

**Environment Variables Setup:**
- Add `VITE_NASA_API_KEY` environment variable
- Never expose keys in deployment settings UI

---

## Troubleshooting

### Page not loading?
- Check browser console for errors
- Verify `.env` file has NASA API key
- Check that all imports use correct paths

### Images not loading?
- Verify NASA API key is valid
- Check API response in network tab
- Ensure date format is YYYY-MM-DD

### Styling issues?
- Clear browser cache
- Restart dev server
- Check CSS file paths
- Verify Bootstrap is imported

---

## Project Statistics

- **Total Components**: 8 (Navbar, 3 Pages + Routing)
- **CSS Files**: 4 (organized by section)
- **API Calls**: Real-time NASA APOD data
- **Responsive**: Yes (Mobile, Tablet, Desktop)
- **Theme**: Deep Space Purple
- **Pages**: 4 (Home, APOD, Gallery, About)

---

## Next Steps

1. ✅ Create new repository on GitHub
2. ✅ Clone locally or create with Vite
3. ✅ Install dependencies
4. ✅ Create `.env` with NASA API key
5. ✅ Copy all source files
6. ✅ Run `npm run dev`
7. ✅ Test all pages and features
8. ✅ Build with `npm run build`
9. ✅ Deploy to hosting platform

---

## Support & Resources

- **NASA APOD API**: https://apod.nasa.gov/
- **React Docs**: https://react.dev/
- **Vite Docs**: https://vitejs.dev/
- **React Router**: https://reactrouter.com/
- **Bootstrap**: https://getbootstrap.com/

---

**Ready to explore the cosmos! 🚀✨**
