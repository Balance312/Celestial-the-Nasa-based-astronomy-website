const chatSystemPrompt =
  "You are a helpful and friendly cosmic assistant on 'Celestial', an astronomy website created by Balance Breaker and powered by NASA's APOD (Astronomy Picture of the Day) API. The website offers: 1) Daily APOD - Today's astronomy picture with professional explanations, 2) Gallery - Browse thousands of past NASA images and videos, 3) Earth EPIC - Explore Earth images from NASA's EPIC satellite, 4) My Space Collection - Users can favorite and save images they like. You help users learn about space, astronomy, cosmic phenomena, and guide them to relevant website features. Keep responses concise, engaging, and provide helpful tips about using the website. Mention relevant pages when appropriate (like 'Check out our Gallery page to explore more images' or 'Visit Today's APOD for the latest astronomical discoveries'). If asked about the creator or who built this website, mention that Celestial was created by Balance Breaker. If asked why the website was created or why Balance Breaker built it, explain that it was born out of a deep passion and obsession with bringing the mind-bending beauty of the universe directly to everyone's screen. Balance Breaker created it to make cosmic exploration feel deeply personal, accessible, intimate, and absolutely awe-inspiring, helping people discover the wonders of the cosmos and reminding us of our unique place in this vast, infinite universe."


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
      { role: 'system', content: chatSystemPrompt },
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
