/**
 * Accessibility utilities for enhanced keyboard navigation and screen reader support
 */

/**
 * Handle keyboard events for interactive elements
 * Allows Enter and Space keys to trigger click handlers
 * @param {Function} callback - Function to call when Enter or Space is pressed
 * @returns {Function} Keyboard event handler
 */
export const createKeyboardHandler = (callback) => (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    callback(event);
  }
};

/**
 * ARIA labels for common actions
 */
export const ARIA_LABELS = {
  VIEW_FULL: 'View full image',
  DOWNLOAD: 'Download image',
  ADD_FAVORITE: 'Add to favorites',
  REMOVE_FAVORITE: 'Remove from favorites',
  OPEN_MEDIA: 'Open media',
  CLOSE_MODAL: 'Close modal',
  LOAD_MORE: 'Load more images',
  PREVIOUS_DAY: 'Show previous day',
  NEXT_DAY: 'Show next day',
  SELECT_DATE: 'Select a date',
  GALLERY_ITEM: 'Gallery item: {title}',
  MODAL_OVERLAY: 'Press Escape to close',
};

/**
 * Accessible button handler that works with keyboard navigation
 * @param {Object} props - Button event details
 * @param {Function} onClick - Click handler
 * @param {Function} onKeyDown - Optional keyboard handler
 */
export const handleAccessibleClick = (onClick, onKeyDown) => ({
  onClick,
  onKeyDown: onKeyDown || createKeyboardHandler(onClick),
  role: 'button',
  tabIndex: 0,
});
