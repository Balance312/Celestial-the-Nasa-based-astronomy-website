# NASA Astronomy Picture of the Day (APOD) Dashboard
# YOU CAN VISIT THE WEBSITE AT https://celestial-the-nasa-based-astronomy.vercel.app/

A modern, responsive web application that displays NASA's Astronomy Picture of the Day using React, Vite, and Bootstrap with a beautiful deep space purple theme.

## Features

- 🚀 Displays today's APOD image or video
- 📱 Fully responsive design with Bootstrap
- 🎨 Beautiful purple "deep space" theme
- ⚡ Built with React and Vite for fast development
- 🔄 Real-time data fetching using useEffect hook
- ⏳ Loading spinner while fetching data
- ❌ Comprehensive error handling
- 🛡️ Secure environment variable management for API key

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure NASA API Key

#### Option A: Using Environment Variables (Recommended for Security)

1. The `.env` file already exists with your API key configured:
   ```
   VITE_NASA_API_KEY=your_api_key_here
   ```

2. **Important**: The `.env` file is added to `.gitignore` to prevent accidental commits of sensitive data.

3. For sharing your project with others, use `.env.example` as a template:
   ```bash
   # Users should copy .env.example to .env and add their own API key
   cp .env.example .env
   ```

#### Getting Your NASA API Key

1. Visit [https://api.nasa.gov/](https://api.nasa.gov/)
2. Fill out the form to request an API key
3. Check your email and copy the API key
4. Add it to your `.env` file:
   ```
   VITE_NASA_API_KEY=your_api_key_here
   ```

### 3. Run the Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or another port if 5173 is in use).

### 4. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── App.jsx              # Main APOD dashboard component
├── app.css             # Global styles + APOD component styles
├── main.jsx            # Entry point (Bootstrap import)
├── Components/
│   ├── Navbar.jsx      # Navigation bar
│   └── navbar.css      # Navbar styles
└── Router.jsx          # Routing configuration
```

## How It Works

### App Component (`App.jsx`)

The main component uses React hooks:

- **useState**: Manages three states
  - `apodData`: Stores the API response data
  - `loading`: Boolean indicating if data is being fetched
  - `error`: Stores any error messages

- **useEffect**: Runs on mount to fetch APOD data
  - Retrieves API key from environment variables
  - Makes request to NASA's APOD API
  - Handles loading and error states
  - Supports both images and videos

### Environment Variables

Vite uses the `import.meta.env` object to access environment variables:

```javascript
const apiKey = import.meta.env.VITE_NASA_API_KEY;
```

Only variables prefixed with `VITE_` are accessible in the frontend for security reasons.

## Features Explained

### Media Display
- Displays images using `<img>` tag
- Embeds videos using `<iframe>`
- Automatically detects media type from API response

### Error Handling
- API key validation on component mount
- Network error catching
- User-friendly error messages

### Loading State
- Bootstrap spinner component
- Loading text animation
- Prevents showing stale data during fetch

### Responsive Design
- Mobile-first approach
- Breakpoints for tablets and desktops
- Optimized iframe height for mobile

## Styling

### Color Palette (Deep Space Purple Theme)

```css
--primary-color: rgb(110, 14, 255)
--secondary-color: rgb(168, 85, 247)
--dark-bg: rgb(15, 12, 35)
--lighter-purple: d8b4fe
```

### Custom CSS Classes

- `.apod-container`: Main container with padding and background
- `.apod-card`: Card wrapper with gradient and border
- `.apod-title`: Title with glow effect
- `.apod-explanation`: Readable text styling
- `.apod-info`: Footer with metadata badges

## Security Best Practices

1. ✅ API key stored in `.env` file
2. ✅ `.env` file ignored by git
3. ✅ `.env.example` provided as template for users
4. ❌ Never hardcode API keys in source code
5. ❌ Never commit `.env` files to version control

## API Reference

The app uses the NASA APOD API:

**Endpoint**: `https://api.nasa.gov/planetary/apod`

**Required Parameters**:
- `api_key`: Your NASA API key

**Optional Parameters**:
- `date`: YYYY-MM-DD format (defaults to today)
- `count`: Number of random images
- `thumbs`: Return thumbnail version

**Response Data Used**:
- `url`: Image or video URL
- `title`: Picture title
- `date`: Picture date
- `explanation`: Description text
- `media_type`: "image" or "video"
- `copyright`: Image credit (if available)

## Troubleshooting

### "NASA API key is not configured"
- Check that `.env` file exists in root directory
- Verify `VITE_NASA_API_KEY` is set in `.env`
- Restart dev server after adding `.env` file

### Images not loading
- Verify API key is valid and active
- Check NASA APOD API status at https://api.nasa.gov/

### Styling issues
- Clear browser cache
- Restart dev server
- Ensure Bootstrap CSS is imported in `main.jsx`

## Technologies Used

- **React 18**: UI framework
- **Vite**: Build tool and dev server
- **Bootstrap 5**: Responsive layout and components
- **NASA API**: Astronomy data source

---

**Last Updated**: 2026-04-30
