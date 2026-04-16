export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { url, title = 'nasa_apod', date = 'image' } = req.query;

  if (!url || typeof url !== 'string') {
    res.status(400).json({ error: 'Missing url query parameter' });
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch {
    res.status(400).json({ error: 'Invalid URL' });
    return;
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    res.status(400).json({ error: 'Unsupported URL protocol' });
    return;
  }

  try {
    const upstream = await fetch(parsedUrl.toString());

    if (!upstream.ok) {
      res.status(upstream.status).json({ error: `Upstream error: ${upstream.status}` });
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const extensionFromType = contentType.split('/')[1]?.split(';')[0] || 'jpg';
    const safeTitle = String(title)
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const fileName = `${date}_${safeTitle || 'nasa_apod'}.${extensionFromType}`;

    const arrayBuffer = await upstream.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(fileBytes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download image', details: String(error) });
  }
}
