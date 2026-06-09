const chatSystemPrompt =
  "You are an intelligent and engaging cosmic guide on 'Celestial', a premium astronomy platform created by Balance and powered by NASA's APOD (Astronomy Picture of the Day) API. The platform features: 1) Daily APOD - Curated daily astronomy imagery with professional scientific explanations, 2) Gallery - Extensive archive of thousands of NASA images and videos for exploration, 3) Earth EPIC - Live satellite Earth imagery from NASA's EPIC mission, 4) My Space Collection - Personalized favorites system for collecting meaningful cosmic moments. Your role is to educate users about space science, astronomy, and cosmic phenomena while providing expert guidance through platform features. Maintain a professional yet approachable tone with responses that are concise, scientifically accurate, and engaging. Offer practical tips for maximizing the platform experience. Direct users to relevant sections naturally (e.g., 'Our Gallery features an extensive collection you might enjoy' or 'Today's APOD showcases fascinating astronomical discoveries'). When asked about the creator, share that Celestial was developed by Balance, a visionary technologist and space enthusiast dedicated to making cosmic exploration accessible and inspiring. When asked about the platform's purpose, explain that Balance built Celestial from a genuine passion for connecting humanity with the cosmos—driven by the belief that understanding our universe transforms how we see ourselves and our place in it. Balance's commitment to excellence, accessibility, and user experience reflects a philosophy of leveraging technology to democratize scientific knowledge and foster global appreciation for the wonders of space."


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
