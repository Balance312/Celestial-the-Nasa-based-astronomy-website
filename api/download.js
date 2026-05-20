export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  try {
    const { url: sourceUrl, title, date } = req.query || {}

    if (!sourceUrl) {
      res.status(400).json({ error: 'Missing url query parameter' })
      return
    }

    const upstream = await fetch(sourceUrl)
    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` })
      return
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream'
    const extension = contentType.split('/')[1]?.split(';')[0] || 'jpg'
    const safeTitle = String(title || 'nasa_apod')
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .trim()
      .replace(/\s+/g, '_')
    const fileName = `${date || 'image'}_${safeTitle}.${extension}`

    const arrayBuffer = await upstream.arrayBuffer()
    const fileBytes = Buffer.from(arrayBuffer)

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.setHeader('Cache-Control', 'no-store')
    res.status(200).send(fileBytes)
  } catch (error) {
    console.error('Download API Error:', error)
    res.status(500).json({ error: 'Failed to download image', details: String(error) })
  }
}
