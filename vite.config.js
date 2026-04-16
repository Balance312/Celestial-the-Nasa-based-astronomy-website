import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const devDownloadProxy = () => ({
  name: 'dev-download-proxy',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url || !req.url.startsWith('/api/download')) {
        return next()
      }

      if (req.method !== 'GET') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      try {
        const requestUrl = new URL(req.url, 'http://localhost:5173')
        const sourceUrl = requestUrl.searchParams.get('url')
        const title = requestUrl.searchParams.get('title') || 'nasa_apod'
        const date = requestUrl.searchParams.get('date') || 'image'

        if (!sourceUrl) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing url query parameter' }))
          return
        }

        const upstream = await fetch(sourceUrl)
        if (!upstream.ok) {
          res.statusCode = upstream.status
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: `Upstream error: ${upstream.status}` }))
          return
        }

        const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
        const extension = contentType.split('/')[1]?.split(';')[0] || 'jpg'
        const safeTitle = String(title)
          .replace(/[^a-zA-Z0-9-_ ]/g, '')
          .trim()
          .replace(/\s+/g, '_')
        const fileName = `${date}_${safeTitle || 'nasa_apod'}.${extension}`

        const arrayBuffer = await upstream.arrayBuffer()
        const fileBytes = new Uint8Array(arrayBuffer)
        res.statusCode = 200
        res.setHeader('Content-Type', contentType)
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
        res.setHeader('Cache-Control', 'no-store')
        res.end(fileBytes)
      } catch (error) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Failed to download image', details: String(error) }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), devDownloadProxy()],
  build: {
    // Optimize chunk size and splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
        }
      }
    },
    // Reduce bundle size with better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      }
    },
    reportCompressedSize: false,
  }
})
