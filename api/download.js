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
    let extensionFromType = contentType.split('/')[1]?.split(';')[0] || 'jpg';
    
    // Normalize common image extensions
    if (extensionFromType === 'jpeg') {
      extensionFromType = 'jpg';
    }
    
    // Map extensions to proper MIME types for mobile compatibility
    const mimeTypeMap = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'svg': 'image/svg+xml'
    };
    
    // Ensure proper MIME type based on extension
    let finalMimeType = mimeTypeMap[extensionFromType] || contentType;
    
    // For images without proper type, default to JPEG
    if (!finalMimeType.startsWith('image/')) {
      finalMimeType = 'image/jpeg';
      extensionFromType = 'jpg';
    }
    
    const safeTitle = String(title)
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .trim()
      .replace(/\s+/g, '_');
    const fileName = `${date}_${safeTitle || 'nasa_apod'}.${extensionFromType}`;

    const arrayBuffer = await upstream.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    res.setHeader('Content-Type', finalMimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"; filename*=UTF-8''${encodeURIComponent(fileName)}`);
    res.setHeader('Content-Length', fileBytes.length);
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.status(200).send(fileBytes);
  } catch (error) {
    res.status(500).json({ error: 'Failed to download image', details: String(error) });
  }
}
