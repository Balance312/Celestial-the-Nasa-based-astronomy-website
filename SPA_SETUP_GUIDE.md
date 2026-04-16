# NASA APOD Single Page Application (SPA) Setup Guide

## 🎉 Congratulations!
Your React Vite application has been successfully transformed into a Full Single Page Application with React Router DOM and a dedicated Full Media View page!

---

## 📋 What's Been Implemented

### 1. **React Router DOM Setup** ✅
Your application now uses `react-router-dom` (already installed) for client-side routing:
- **No more page refreshes** - All navigation is instant and smooth
- **Deep linking support** - Users can share URLs directly to specific media
- **Browser history** - Back/forward buttons work as expected

### 2. **Routing Structure** 🛣️

```
/                  → Home page (Main feed)
/apod              → Astronomy Picture of the Day
/gallery           → Random NASA gallery viewer
/media/:date       → Full Media View (NEW!)
/profile           → Your favorite and liked items
/about             → About the application
```

### 3. **New MediaView Component** 🖼️

**Location:** `src/pages/MediaView.jsx`

**Features:**
- **Fullscreen media display** with responsive design
- **Image support** - Displays HD images with maximum viewport usage
- **Video support** - Uses Bootstrap's `ratio` utility (16x9) for perfect video scaling
- **Smart download** - Direct blob download for images, with fallback to new tab
- **Like/Favorite sync** - Uses same localStorage logic as main app
- **Dynamic data fetching** - Uses the `getApodByDate()` function to fetch specific date media
- **Responsive controls** - All buttons adapt to mobile/desktop layouts

---

## 🚀 How to Use the MediaView Component

### **Linking to MediaView from Your Components**

```jsx
import { Link } from 'react-router-dom';

// In any component:
<Link to={`/media/${item.date}`} className="btn btn-primary">
  View Full Media
</Link>
```

### **Example: Adding to Gallery Page**

If you want to add a "View Full" link on gallery cards that opens the MediaView:

```jsx
// In GalleryPage.jsx or similar
import { useNavigate } from 'react-router-dom';

const navigate = useNavigate();

// In a button click handler:
const handleViewFull = (date) => {
  navigate(`/media/${date}`);
};
```

### **Direct URL Navigation**

Users can also navigate directly by typing URLs:
```
http://localhost:5174/media/2024-04-16
http://localhost:5174/media/2023-12-25
```

---

## 💾 State Management & localStorage Sync

The MediaView component automatically syncs with your existing localStorage state:

```javascript
// Favorites
const itemId = `${media.date}-${media.title}`;
addToFavorites(media);      // Adds to localStorage
removeFromFavorites(itemId); // Removes from localStorage

// Likes
toggleLike(media);           // Toggles in localStorage
isLiked(media);              // Check if liked
isFavorited(media);          // Check if favorited
```

All changes are **automatically persisted** to localStorage and sync across all routes!

---

## 🎨 Styling & Theme Consistency

### **Color Palette Used:**
- **Primary Purple:** `rgb(110, 14, 255)`
- **Accent Purple:** `rgb(168, 85, 247)`
- **Text Light:** `rgba(216, 180, 254, 0.8)`
- **Background Dark:** `rgb(15, 12, 35)`

### **CSS Classes Available:**

The MediaView uses these main CSS classes (in `src/pages/pages.css`):

```css
.media-view-page        /* Main container */
.media-view-container   /* Content wrapper */
.media-back-btn         /* Back button */
.media-display          /* Media container */
.media-image           /* Image element */
.media-video-wrapper   /* Video container */
.media-controls        /* Button controls */
.media-info-section    /* Title & description */
```

### **Responsive Breakpoints:**

```css
Desktop (default)  /* Full layout with labels on buttons */
@media (max-width: 768px) /* Tablet - adjusted spacing */
@media (max-width: 480px) /* Mobile - compact layout */
```

---

## 📱 Features by Device

### **Desktop (1024px+)**
✅ Full-size media display (up to 70vh height)
✅ Button labels visible
✅ Multi-line controls layout
✅ Large title (2.5rem)

### **Tablet (768px - 1024px)**
✅ Responsive image height (50vh max)
✅ Centered control buttons
✅ Adjusted padding and spacing
✅ Medium title (1.8rem)

### **Mobile (< 768px)**
✅ Compact controls stacked
✅ Optimized image height (40vh max)
✅ Touch-friendly button sizes
✅ Smaller title (1.4rem)
✅ Single-column layout

---

## 🎬 Video Handling

The MediaView automatically detects and converts video URLs:

```javascript
YouTube:  https://www.youtube.com/watch?v=... → Embeddable URL
Vimeo:    https://vimeo.com/... → Embeddable URL
Direct:   https://example.com/video.mp4 → Used as-is
```

Videos use Bootstrap's responsive **`ratio-16x9`** class for perfect scaling:

```html
<div class="ratio ratio-16x9">
  <iframe src="..."></iframe>
</div>
```

This ensures videos:
- Scale proportionally on all devices
- Maintain aspect ratio
- Don't get letterboxed or cut off
- Remain fully responsive

---

## 📥 Download Functionality

### **Image Downloads:**

```javascript
// Primary method: Server-side download
1. Sends request to /api/download endpoint
2. Retrieves blob with proper headers
3. Downloads with sanitized filename

// Fallback method: Open in new tab
If CORS blocks blob download, opens HD URL in new tab
```

### **Video Downloads:**
Currently disabled (videos are typically very large). Users can:
- Right-click → "Save video as..." on the player
- Use video download tools if provided by video platform

---

## 🔗 API Reference

### **getApodByDate(apiKey, date, options)**

```javascript
// Fetch media for a specific date
const media = await getApodByDate(
  import.meta.env.VITE_NASA_API_KEY,
  '2024-04-16',
  { signal, preferCache: true }
);

// Returns:
{
  title: string,
  date: string,
  explanation: string,
  url: string,           // Thumbnail/web-friendly URL
  hdurl: string,         // High-resolution URL (images only)
  copyright: string,     // Creator attribution
  media_type: 'image' | 'video'
}
```

---

## 🛠️ Customization Examples

### **Example 1: Add Share Buttons**

```jsx
// In MediaView.jsx, add to .media-controls section:
<button 
  className="btn btn-outline-light btn-lg"
  onClick={() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    alert('Link copied!');
  }}
>
  <i className="bi bi-share"></i> Share
</button>
```

### **Example 2: Add Fullscreen Toggle**

```jsx
const [isFullscreen, setIsFullscreen] = useState(false);

const toggleFullscreen = () => {
  const element = document.querySelector('.media-display');
  if (!isFullscreen) {
    element.requestFullscreen?.();
  } else {
    document.exitFullscreen?.();
  }
  setIsFullscreen(!isFullscreen);
};

// Then add button:
<button onClick={toggleFullscreen}>
  <i className={`bi bi-${isFullscreen ? 'x' : 'arrows-fullscreen'}`}></i>
</button>
```

### **Example 3: Navigate to MediaView from Gallery**

```jsx
// In GalleryPage.jsx, modify the card onClick:
onClick={() => navigate(`/media/${item.date}`)}
```

---

## ⚙️ Environment Setup

Your `.env` file should contain:

```env
VITE_NASA_API_KEY=your_api_key_here
```

The application automatically reads this via `import.meta.env.VITE_NASA_API_KEY`

---

## 🐛 Troubleshooting

### **Issue: "Cannot find module MediaView"**
✅ **Solution:** Ensure `MediaView.jsx` exists in `src/pages/` directory

### **Issue: Route not working**
✅ **Solution:** Check Router.jsx has the new route with correct path `/media/:date`

### **Issue: Images not loading in MediaView**
✅ **Solution:** Verify VITE_NASA_API_KEY is set correctly in `.env`

### **Issue: Download not working**
✅ **Solution:** Check browser console. This is likely CORS restrictions. Fallback will open in new tab.

### **Issue: Video doesn't fill screen**
✅ **Solution:** Bootstrap ratio utility should handle this. Check browser dev tools for CSS conflicts.

---

## 📊 Performance Considerations

1. **Lazy Loading:** MediaView uses `React.lazy()` - only loaded when navigated to
2. **Image Optimization:** Uses `<img loading="lazy" decoding="async">`
3. **Caching:** NASA API responses cached for 30 days (configurable)
4. **No Re-renders:** State is managed at App level, minimal re-renders

---

## 🚦 Next Steps

### **To enhance further:**

1. **Add more routes** - More pages/features
2. **Add animations** - Framer Motion for smoother transitions
3. **Add search** - Find media by date or keyword
4. **Add filters** - Filter by media type, date range
5. **Add social sharing** - Share to Twitter, Facebook, etc.
6. **Add analytics** - Track which media users view most

---

## 📚 Files Modified/Created

### **Created:**
- ✅ `src/pages/MediaView.jsx` - New full media view component

### **Modified:**
- ✅ `src/Router.jsx` - Added MediaView route
- ✅ `src/pages/pages.css` - Added MediaView styling

### **Unchanged (already configured):**
- ✅ `src/App.jsx` - State management
- ✅ `src/main.jsx` - React Router already set up
- ✅ `package.json` - react-router-dom already installed

---

## 🎓 React Router Concepts Used

```javascript
// Hooks
import { useParams }   // Get URL parameters
import { useNavigate } // Programmatic navigation
import { Link }        // Client-side navigation

// Routes
<Route path="/media/:date" element={<MediaView />} />

// URL Parameters
const { date } = useParams();  // Gets date from /media/:date
```

---

## ✨ Summary

Your NASA APOD application is now a **full-featured Single Page Application** with:

✅ **Client-side routing** for instant navigation
✅ **Deep linking** support (shareable URLs)
✅ **Full media view** with responsive design
✅ **localStorage sync** across all routes
✅ **Mobile-responsive** layout
✅ **Video support** with Bootstrap ratio utilities
✅ **Download functionality** with fallback
✅ **Consistent theming** across all pages

**Happy coding! 🚀**

---

*Last updated: April 17, 2026*
*Framework: React 19.2.0 + Vite + React Router DOM + Bootstrap*
