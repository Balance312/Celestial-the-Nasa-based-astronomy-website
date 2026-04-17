# ✅ Quick Setup Checklist

## Before You Start
- [ ] Node.js v14+ installed
- [ ] npm installed
- [ ] Git installed
- [ ] Code editor ready (VS Code recommended)

## Step 1: Create Project
- [ ] Create new directory: `mkdir celestial && cd celestial`
- [ ] Initialize Vite: `npm create vite@latest . -- --template react`
- [ ] Install dependencies: `npm install`
- [ ] Install React Router: `npm install react-router-dom`
- [ ] Install Bootstrap: `npm install bootstrap`

## Step 2: Set Up Files
- [ ] Copy `index.html` → root
- [ ] Copy `vite.config.js` → root
- [ ] Copy all files from `src/` folder structure
- [ ] Copy `public/favicon.svg` → public folder
- [ ] Copy `.gitignore` → root

## Step 3: Environment Setup
- [ ] Create `.env` file in root
- [ ] Get NASA API key from https://api.nasa.gov/
- [ ] Add to `.env`: `VITE_NASA_API_KEY=your_key_here`
- [ ] Create `.env.example` with same format (no key)
- [ ] Verify `.env` is in `.gitignore`

## Step 4: Verify Structure
```
celestial/
├── public/
│   └── favicon.svg
├── src/
│   ├── Components/
│   │   ├── Navbar.jsx
│   │   └── navbar.css
│   ├── pages/
│   │   ├── APODPage.jsx
│   │   ├── GalleryPage.jsx
│   │   ├── AboutPage.jsx
│   │   └── pages.css
│   ├── App.jsx
│   ├── Router.jsx
│   ├── Home.jsx
│   ├── main.jsx
│   ├── app.css
│   └── home.css
├── index.html
├── vite.config.js
├── package.json
├── .env (NOT in Git)
├── .env.example
└── .gitignore
```

## Step 5: Install Dependencies
- [ ] Run: `npm install`
- [ ] All dependencies installed successfully

## Step 6: Test Development
- [ ] Run: `npm run dev`
- [ ] App opens at localhost:5173
- [ ] All pages load (Home, /apod, /gallery, /about)
- [ ] Navigation works
- [ ] No console errors

## Step 7: Test Features
- [ ] Homepage loads with centered text
- [ ] APOD page displays today's image
- [ ] Date picker works on APOD page
- [ ] Gallery page loads images
- [ ] Gallery modal works
- [ ] About page displays content
- [ ] Responsive on mobile view
- [ ] No images broken or missing

## Step 8: Build for Production
- [ ] Run: `npm run build`
- [ ] Build completes without errors
- [ ] `dist/` folder created
- [ ] Can preview with: `npm run preview`

## Step 9: Git Setup (Optional)
- [ ] `git init`
- [ ] `git add .`
- [ ] `git commit -m "Initial commit: Celestial APOD app"`
- [ ] Push to GitHub/GitLab

## Step 10: Deployment (Optional)
Choose one:
- [ ] **Vercel**: `npm install -g vercel && vercel`
- [ ] **Netlify**: Drag `dist/` folder to Netlify
- [ ] **GitHub Pages**: Push `dist/` to gh-pages branch

## Important Files Checklist

### Must Have
- [ ] `package.json` - Lists all dependencies
- [ ] `index.html` - Main HTML entry point
- [ ] `vite.config.js` - Vite configuration
- [ ] `.env` - NASA API key (local only)
- [ ] `.env.example` - Template for others
- [ ] `.gitignore` - Prevents committing sensitive files

### Source Files Needed
- [ ] `src/main.jsx` - App entry point
- [ ] `src/App.jsx` - Main component
- [ ] `src/Router.jsx` - Route setup
- [ ] `src/Home.jsx` - Landing page
- [ ] `src/Components/Navbar.jsx` - Navigation
- [ ] `src/pages/APODPage.jsx` - APOD display
- [ ] `src/pages/GalleryPage.jsx` - Gallery
- [ ] `src/pages/AboutPage.jsx` - About info

### CSS Files Needed
- [ ] `src/app.css` - Global styles
- [ ] `src/home.css` - Home page styles
- [ ] `src/Components/navbar.css` - Navigation styles
- [ ] `src/pages/pages.css` - Page styles

### Assets Needed
- [ ] `public/favicon.svg` - Website icon

---

## Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Port 5173 in use | Change port: `npm run dev -- --port 3000` |
| API key error | Check `.env` file, restart dev server |
| Styles not loading | Clear cache, restart dev server |
| Page blank | Check browser console for errors |
| Images missing | Verify NASA API key, check network tab |

---

## Environment Variables Reference

### Required:
```
VITE_NASA_API_KEY=your_api_key_here
```

### Optional (for advanced setup):
```
VITE_API_URL=https://api.nasa.gov
VITE_APP_TITLE=Celestial
```

---

## Key Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview build
npm run lint             # Run ESLint

# Installation
npm install              # Install dependencies
npm install [package]    # Install specific package

# Version Check
npm -v                   # Check npm version
node -v                  # Check Node version
```

---

## Success Indicators

✅ You're done when:
- [ ] `npm run dev` works without errors
- [ ] Website loads at localhost:5173
- [ ] All 4 pages accessible from navigation
- [ ] Today's APOD image displays
- [ ] Gallery shows space images
- [ ] No broken links or missing images
- [ ] Responsive on mobile (F12 → Toggle device toolbar)
- [ ] `npm run build` creates dist/ without errors

---

**You're all set to launch Celestial! 🚀✨**
