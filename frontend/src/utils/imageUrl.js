/**
 * Helper to construct full image URLs for the backend relative paths.
 * Useful for MERN stack deployments where frontend and backend are on different domains.
 * @param {string} path - The relative path (e.g., '/uploads/image.jpg' or 'uploads/image.jpg')
 * @returns {string} The full absolute URL or the original path if it's already an absolute URL.
 */
export const getImageUrl = (path) => {
  if (!path) return '';

  // Return as is if it's already a full URL (external links)
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const baseUrl = import.meta.env.VITE_API_URL || '';
  
  // Ensure we don't have double slashes if the path already starts with one
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${baseUrl}${cleanPath}`;
};
