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
  try {
    const params = new URLSearchParams({
      url: downloadUrl,
      title: itemTitle,
      date: itemDate,
    });

    const finalUrl = `/api/download?${params.toString()}`;
    
    // Native window location change triggers browser native download securely on all devices and platforms
    window.location.href = finalUrl;

    // Artificial delay to maintain a smooth loading/downloading state in the UI
    await new Promise((resolve) => setTimeout(resolve, 1500));
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}


/**
 * Fallback download by opening in new tab
 * @param {string} url - The URL to open
 */
export function fallbackDownload(url) {
  window.open(url, '_blank');
}
