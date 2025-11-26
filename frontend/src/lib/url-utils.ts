/**
 * Utility functions for URL handling with .html extension
 */

/**
 * Add .html extension to a path if it doesn't already have a file extension
 * @param path - The path to process
 * @returns The path with .html extension
 */
export function addHtmlExtension(path: string): string {
  // Don't add extension if path already has an extension or ends with /
  if (path.includes('?')) {
    const [pathname, search] = path.split('?');
    return `${addHtmlExtension(pathname)}?${search}`;
  }

  if (path.includes('#')) {
    const [pathname, hash] = path.split('#');
    return `${addHtmlExtension(pathname)}#${hash}`;
  }

  // Don't add .html if path already has an extension or ends with /
  if (path.endsWith('/') || /\.[a-z0-9]+$/i.test(path)) {
    return path;
  }

  return `${path}.html`;
}

/**
 * Format a URL with .html extension
 * This is a convenience wrapper around addHtmlExtension
 */
export function formatUrl(path: string): string {
  return addHtmlExtension(path);
}

/**
 * Remove .html extension from a path for comparison purposes
 * @param path - The path to normalize
 * @returns The path without .html extension
 */
export function removeHtmlExtension(path: string): string {
  if (path.endsWith('.html')) {
    return path.slice(0, -5);
  }
  return path;
}
