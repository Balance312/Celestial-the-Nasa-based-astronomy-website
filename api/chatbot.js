const chatSystemPrompt =
  "You are a helpful and friendly cosmic assistant on 'Celestial', an astronomy website created by Balance Breaker and powered by NASA's APOD (Astronomy Picture of the Day) API. The website offers: 1) Daily APOD - Today's astronomy picture with professional explanations, 2) Gallery - Browse thousands of past NASA images and videos, 3) Earth EPIC - Explore Earth images from NASA's EPIC satellite, 4) My Space Collection - Users can favorite and save images they like. You help users learn about space, astronomy, cosmic phenomena, and guide them to relevant website features. Keep responses concise, engaging, and provide helpful tips about using the website. Mention relevant pages when appropriate (like 'Check out our Gallery page to explore more images' or 'Visit Today's APOD for the latest astronomical discoveries'). If asked about the creator or who built this website, mention that Celestial was created by Balance Breaker.";

const getOpenRouterConfig = () => ({
  apiKey:
    process.env.OPENROUTER_API_KEY ||
    process.env.VITE_OPENROUTER_API_KEY,
  apiUrl: 'https://openrouter.ai/api/v1/chat/completions',
  model: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini',
})

const forwardChatRequest = async ({ apiKey, apiUrl, model, origin, userMessage, conversationHistory }) => {
  if (!apiKey) {
    return { status: 500, body: { error: 'OpenRouter API key is not configured' } }
  }

  const messages = [
    { role: 'system', content: chatSystemPrompt },
    ...(Array.isArray(conversationHistory) ? conversationHistory : []),
    { role: 'user', content: userMessage },
  ]

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': origin || 'https://celestial.vercel.app',
      'X-Title': 'Celestial',
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 500,
      temperature: 0.7,
    }),
  })

  const responseBody = await response.json().catch(async () => ({ error: await response.text() }))

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

const readRequestJson = async (req) => {
  if (req.body && typeof req.body === 'object') {
    return req.body
  }

  if (typeof req.body === 'string') {
    return JSON.parse(req.body)
  }

  return new Promise((resolve, reject) => {
    let rawBody = ''

    req.on('data', (chunk) => {
      rawBody += chunk
    })

    req.on('end', () => {
      try {
        resolve(rawBody ? JSON.parse(rawBody) : {})
      } catch (error) {
        reject(error)
      }
    })

    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const body = await readRequestJson(req)
    const userMessage = typeof body.userMessage === 'string' ? body.userMessage.trim() : ''
    const conversationHistory = Array.isArray(body.conversationHistory) ? body.conversationHistory : []

    if (!userMessage) {
      res.status(400).json({ error: 'Missing userMessage' })
      return
    }

    const result = await forwardChatRequest({
      ...getOpenRouterConfig(),
      origin: req.headers.origin,
      userMessage,
      conversationHistory,
    })

    res.status(result.status).json(result.body)
  } catch (error) {
    res.status(500).json({ error: 'Failed to process chatbot request', details: String(error) })
  }
}