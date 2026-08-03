import { CHAT_SYSTEM_PROMPT } from '../src/constants/chatPrompt.js'


export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { userMessage, conversationHistory } = req.body || {}
    const trimmedMessage = typeof userMessage === 'string' ? userMessage.trim() : ''

    if (!trimmedMessage) {
      res.status(400).json({ error: 'Missing userMessage' })
      return
    }

    const apiKey =
      process.env.OPENROUTER_API_KEY ||
      process.env.VITE_OPENROUTER_API_KEY

    if (!apiKey) {
      res.status(500).json({ error: 'OpenRouter API key is not configured in environment variables' })
      return
    }

    const apiUrl = 'https://openrouter.ai/api/v1/chat/completions'
    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini'

    const messages = [
      { role: 'system', content: CHAT_SYSTEM_PROMPT },
      ...(Array.isArray(conversationHistory) ? conversationHistory : []),
      { role: 'user', content: trimmedMessage },
    ]

    const openRouterResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': req.headers.referer || req.headers.origin || 'https://celestial-apod.vercel.app',
        'X-Title': 'Celestial',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    })

    const responseText = await openRouterResponse.text()
    let responseBody

    try {
      responseBody = responseText ? JSON.parse(responseText) : {}
    } catch {
      responseBody = { error: responseText || 'Invalid JSON response' }
    }

    if (!openRouterResponse.ok) {
      const errorMsg =
        responseBody?.error?.message ||
        responseBody?.error ||
        responseBody?.message ||
        'API request failed'
      
      if (openRouterResponse.status === 402) {
        res.status(402).json({
          error: "OpenRouter rejected the request because the account has no credits. Add credits or use a funded OpenRouter account."
        })
      } else {
        res.status(openRouterResponse.status).json({ error: errorMsg })
      }
      return
    }

    const aiResponse = responseBody.choices?.[0]?.message?.content || 'No response received'
    res.status(200).json({ response: aiResponse })
  } catch (error) {
    console.error('Chat API Error:', error)
    res.status(500).json({ error: 'Failed to process chatbot request', details: String(error) })
  }
}
