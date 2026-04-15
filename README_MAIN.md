# 🌌 Celestial - NASA APOD Explorer

A modern, responsive web application that displays NASA's Astronomy Picture of the Day (APOD) with a beautiful cosmic purple theme.

![Celestial Preview](https://img.shields.io/badge/React-19.2.0-blue?style=flat-square) ![Vite](https://img.shields.io/badge/Vite-7.2.4-purple?style=flat-square) ![Bootstrap](https://img.shields.io/badge/Bootstrap-5.3-green?style=flat-square)

## ✨ Features

- 🔭 **Daily APOD Display** - Shows NASA's Astronomy Picture of the Day
- 📅 **Date Navigation** - Browse historical APOD images with interactive date picker
- 🌌 **Cosmic Gallery** - Browse collections of stunning space images
- ℹ️ **About Page** - Learn about the project and NASA APOD
- 🎨 **Purple Cosmic Theme** - Beautiful gradient backgrounds and smooth animations
- 📱 **Fully Responsive** - Works seamlessly on desktop, tablet, and mobile
- ⚡ **Fast & Modern** - Built with Vite for lightning-fast performance
- 🎭 **Smooth UX** - Interactive hover effects, loading states, and transitions
- 🔗 **React Router** - Client-side navigation without page reloads

## 🚀 Quick Start

### Prerequisites
- Node.js v14 or higher
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd celestial

# Install dependencies
npm install

# Create .env file and add NASA API key
echo "VITE_NASA_API_KEY=your_api_key_here" > .env

# Start development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

### Get NASA API Key
1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill out the form to request an API key
3. Check your email for the key
4. Add it to your `.env` file

## 📁 Project Structure

```
celestial/
├── public/
│   └── favicon.svg                  # Compass logo
├── src/
│   ├── Components/
│   │   ├── Navbar.jsx              # Navigation component
│   │   └── navbar.css              # Navigation styles
│   ├── pages/
│   │   ├── APODPage.jsx            # Daily APOD with date picker
│   │   ├── GalleryPage.jsx         # Image gallery with modal
│   │   ├── AboutPage.jsx           # Project information
│   │   └── pages.css               # Page styles
│   ├── App.jsx                     # Main app component
│   ├── Router.jsx                  # Route configuration
│   ├── Home.jsx                    # Landing page
│   ├── main.jsx                    # Entry point
│   ├── app.css                     # Global styles
│   └── home.css                    # Home page styles
├── index.html                       # HTML template
├── vite.config.js                  # Vite configuration
├── .env                             # Environment variables (not committed)
├── .env.example                     # Environment template
├── .gitignore                       # Git ignore rules
├── package.json                     # Dependencies
└── README.md                        # This file
```

## 🎯 Core Pages

### 🏠 Home Page (`/`)
- Hero section with centered title and CTA buttons
- Today's APOD preview with image/video
- Features showcase (6 feature cards)
- Statistics section
- Call-to-action section
- Professional footer

### 🔭 APOD Page (`/apod`)
- Full-size display of APOD image/video
- Date picker to browse past images
- Previous/Next day navigation
- Formatted date display
- Complete explanation text
- Media type badge and copyright info
- Loading spinner and error handling

### 🌌 Gallery Page (`/gallery`)
- 3x3 grid of random APOD images
- Hover effects with smooth animations
- Click to expand modal with full details
- "Load New Images" button to refresh
- Shows title, date, explanation, and copyright
- Responsive grid that adapts to screen size

### ℹ️ About Page (`/about`)
- Mission statement and project overview
- Features breakdown (Daily APOD, Gallery, Space Knowledge)
- Technology stack information
- Statistics by the numbers
- NASA APOD information and history
- Contact section

## 🎨 Design System

### Color Palette
```css
/* Purple Cosmic Theme */
--primary-color: rgb(110, 14, 255)       /* Deep Purple */
--secondary-color: rgb(168, 85, 247)     /* Lighter Purple */
--dark-bg: rgb(15, 12, 35)               /* Very Dark Purple */
--light-text: rgba(255, 255, 255, 0.9)   /* Off White */
```

### Responsive Breakpoints
- **Desktop**: 768px and up (full layout)
- **Tablet**: 481px - 768px (medium adjustments)
- **Mobile**: 480px and below (stacked layout)

## 🛠 Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run ESLint linter
npm run lint
```

## 📦 Dependencies

### Core Libraries
- **react** (^19.2.0) - UI framework
- **react-dom** (^19.2.0) - React DOM rendering
- **react-router-dom** (^7.12.0) - Client-side routing
- **bootstrap** - CSS framework
- **vite** (^7.2.4) - Build tool & dev server

### Development Tools
- **@vitejs/plugin-react** - React support for Vite
- **eslint** - Code linting
- **eslint-plugin-react-refresh** - React refresh support

## 🔌 API Integration

### NASA APOD API
Used to fetch astronomy pictures and data.

**Endpoint**: `https://api.nasa.gov/planetary/apod`

**Parameters**:
- `api_key` (required) - Your NASA API key
- `date` (optional) - YYYY-MM-DD format (defaults to today)
- `count` (optional) - Number of random images to return

**Response Data**:
- `url` - Image or video URL
- `title` - Picture title
- `date` - Picture date (YYYY-MM-DD)
- `explanation` - Description text
- `media_type` - "image" or "video"
- `copyright` - Image credit (if available)

### Example Request
```javascript
const apiKey = import.meta.env.VITE_NASA_API_KEY;
const response = await fetch(
  `https://api.nasa.gov/planetary/apod?api_key=${apiKey}&date=2026-04-15`
);
const data = await response.json();
```

## 🔐 Security

- ✅ API key stored in `.env` (local development only)
- ✅ `.env` added to `.gitignore` to prevent accidental commits
- ✅ Environment variables use `VITE_` prefix for frontend exposure
- ✅ Error handling without exposing sensitive information
- ✅ CORS-safe requests to NASA API

### Environment Variables Format
```bash
# .env (local only, never commit)
VITE_NASA_API_KEY=your_actual_key_here

# .env.example (template to share)
VITE_NASA_API_KEY=your_api_key_here
```

## 🌐 Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Netlify
```bash
npm run build
# Drag and drop 'dist' folder to Netlify dashboard
```

### GitHub Pages
```bash
npm run build
# Deploy 'dist' folder to gh-pages branch
```

**⚠️ Important**: Always set `VITE_NASA_API_KEY` in your deployment platform's environment variables, never in the code.

## 🐛 Troubleshooting

### Issue: Page Not Loading
- **Solution**: Check browser console for errors, ensure `.env` has NASA API key, restart dev server

### Issue: Images Not Showing
- **Solution**: Verify NASA API key is valid and active, check network tab for failed requests

### Issue: Styling Problems
- **Solution**: Clear browser cache (Ctrl+Shift+Delete), restart dev server, verify CSS file imports

### Issue: API Key Error
- **Solution**: Regenerate key at https://api.nasa.gov/, update `.env`, restart dev server

### Issue: Port Already in Use
- **Solution**: Change port with `npm run dev -- --port 3000` or kill process using port 5173

## 📚 Additional Resources

- **NASA APOD**: https://apod.nasa.gov/
- **NASA API Docs**: https://api.nasa.gov/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **React Router**: https://reactrouter.com/
- **Bootstrap Documentation**: https://getbootstrap.com/

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is open source and available under the MIT License. See LICENSE file for details.

---

## 🎓 Learning Resources

This project demonstrates:
- **React Hooks** (useState, useEffect) - State and side effects management
- **React Router** - Client-side navigation
- **RESTful API Integration** - Fetching and handling external data
- **Responsive Design** - CSS media queries and mobile-first approach
- **Component Architecture** - Reusable components and composition
- **State Management** - Managing loading, error, and data states
- **CSS Grid & Flexbox** - Modern layout techniques
- **JavaScript Async/Await** - Asynchronous data fetching

## 📊 Project Statistics

- **Total Components**: 8 (Navbar + 3 Pages)
- **Pages**: 4 (Home, APOD, Gallery, About)
- **CSS Files**: 4 (organized by section)
- **Responsive Breakpoints**: 3 (Desktop, Tablet, Mobile)
- **API Endpoints**: 1 (NASA APOD)
- **Color Scheme**: Purple Cosmic Theme (6 main colors)

## 🚀 Roadmap

Future enhancements:
- [ ] User accounts and favorites
- [ ] Search functionality
- [ ] Dark/Light mode toggle
- [ ] Share functionality (Twitter, Facebook)
- [ ] Offline mode with service workers
- [ ] Multiple language support
- [ ] Advanced filtering and sorting
- [ ] User comments and ratings

## 😊 Feedback & Support

Have questions or suggestions?
- Open an issue on GitHub
- Check out existing issues and discussions
- Visit our documentation at SETUP_GUIDE.md

---

**Explore the cosmos with Celestial! 🌌✨**

Made with ❤️ using React, Vite, and NASA APOD API
