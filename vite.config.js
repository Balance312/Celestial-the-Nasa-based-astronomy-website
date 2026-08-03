import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { CHAT_SYSTEM_PROMPT } from './src/constants/chatPrompt.js'


const getOpenRouterConfig = () => {
  const env = loadEnv(process.env.NODE_ENV || 'development', process.cwd(), '')

  return {
    apiKey:
      process.env.OPENROUTER_API_KEY ||
      process.env.VITE_OPENROUTER_API_KEY ||
      env.OPENROUTER_API_KEY ||
      env.VITE_OPENROUTER_API_KEY,
    apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
    model: process.env.OPENROUTER_MODEL || env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
  }
}

const readRequestJson = async (req) => {
  let rawBody = ''

  for await (const chunk of req) {
    rawBody += chunk
  }

  return rawBody ? JSON.parse(rawBody) : {}
}

const forwardChatRequest = async ({ apiKey, apiUrl, model, origin, userMessage, conversationHistory }) => {
  if (!apiKey) {
    return { status: 500, body: { error: 'OpenRouter API key is not configured' } }
  }

  const messages = [
    { role: 'system', content: CHAT_SYSTEM_PROMPT },
    ...(Array.isArray(conversationHistory) ? conversationHistory : []),
    { role: 'user', content: userMessage },
  ]

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': origin || 'http://localhost:5173',
      'X-Title': 'Celestial',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  const responseText = await response.text()
  let responseBody

  try {
    responseBody = responseText ? JSON.parse(responseText) : {}
  } catch {
    responseBody = { error: responseText || 'Invalid JSON response' }
  }

  if (!response.ok) {
    return {
      status: response.status,
      body: {
        error:
          responseBody?.error?.message ||
          responseBody?.error ||
          responseBody?.message ||
          'API request failed',
      },
    }
  }

  return {
    status: 200,
    body: {
      response: responseBody.choices?.[0]?.message?.content || 'No response received',
    },
  }
}

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

const devChatbotProxy = () => ({
  name: 'dev-chatbot-proxy',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (!req.url || !req.url.startsWith('/api/chatbot')) {
        return next()
      }

      if (req.method !== 'POST') {
        res.statusCode = 405
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Method not allowed' }))
        return
      }

      try {
        const { apiKey, apiUrl, model } = getOpenRouterConfig()
        const body = await readRequestJson(req)
        const userMessage = typeof body.userMessage === 'string' ? body.userMessage.trim() : ''
        const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : []

        if (!userMessage) {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Missing userMessage' }))
          return
        }

        const result = await forwardChatRequest({
          apiKey,
          apiUrl,
          model,
          origin: req.headers.origin,
          userMessage,
          conversationHistory,
        })

        res.statusCode = result.status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result.body))
      } catch (error) {
        res.statusCode = 500
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify({ error: 'Failed to process chatbot request', details: String(error) }))
      }
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), devDownloadProxy(), devChatbotProxy()],
  build: {
    // Optimize chunk size and splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          router: ['react-router-dom'],
        },
      },
    },
    // Reduce bundle size with better compression
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: false,
      },
    },
    reportCompressedSize: false,
  },
})
