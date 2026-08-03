/**
 * Centralized download handler utility
 * Eliminates code duplication across Gallery, Profile, and MediaView components
 */

/**
 * Sanitize filename to remove special characters
 * @param {string} value - The filename to sanitize
 * @returns {string} Sanitized filename
 */
export const sanitizeFilename = (value) =>
  (value || 'nasa-image')
    .replace(/[^a-z0-9\s-]/gi, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();

/**
 * Download file via API endpoint
 * @param {string} downloadUrl - The URL of the resource to download
 * @param {string} filename - The filename for the download (with extension)
 * @param {string} itemTitle - The title of the item being downloaded
 * @param {string} itemDate - The date of the item being downloaded
 * @throws {Error} If download fails
 */
export async function downloadFile(downloadUrl, filename, itemTitle, itemDate) {
  const params = new URLSearchParams({
    url: downloadUrl,
    title: itemTitle,
    date: itemDate,
  });

  const proxyUrl = `/api/download?${params.toString()}`;

  // Fetch as blob and trigger download via <a download> — works on iOS Safari
  const response = await fetch(proxyUrl);
  if (!response.ok) {
    throw new Error(`Download failed: ${response.status}`);
  }

  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();

  // Cleanup
  setTimeout(() => {
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  }, 100);
}


/**
 * Fallback download by opening in new tab
 * @param {string} url - The URL to open
 */
export function fallbackDownload(url) {
  window.open(url, '_blank');
}
