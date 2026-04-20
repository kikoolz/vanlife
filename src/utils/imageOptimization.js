import { config } from "../config";

/**
 * Generate optimized image URL using Supabase image transformation
 * @param {string} imageUrl - Original image URL from Supabase
 * @param {number} width - Target width in pixels
 * @param {number} height - Target height in pixels
 * @param {number} quality - Image quality (1-100, default 80)
 * @returns {string} Optimized image URL
 */
export function getOptimizedImageUrl(imageUrl, width = 800, height = 600, quality = 80) {
  if (!imageUrl || !imageUrl.includes("supabase.co")) {
    return imageUrl;
  }

  try {
    // Extract the storage path from the Supabase URL
    const url = new URL(imageUrl);
    const pathParts = url.pathname.split("/storage/v1/object/public/");
    
    if (pathParts.length < 2) {
      return imageUrl;
    }

    const bucketAndPath = pathParts[1];
    
    // Build the transformed URL using Supabase image transformation
    // Format: https://[project-ref].supabase.co/storage/v1/object/render/image/[bucket]/[path]?width=X&height=Y&quality=Z
    const baseUrl = `${url.protocol}//${url.host}`;
    const transformedUrl = `${baseUrl}/storage/v1/object/render/image/${bucketAndPath}?width=${width}&height=${height}&quality=${quality}&format=webp`;
    
    return transformedUrl;
  } catch (error) {
    console.warn("Failed to optimize image URL:", error);
    return imageUrl;
  }
}

/**
 * Generate thumbnail URL for small displays
 * @param {string} imageUrl - Original image URL
 * @returns {string} Thumbnail URL (100x100)
 */
export function getThumbnailUrl(imageUrl) {
  return getOptimizedImageUrl(imageUrl, 100, 100, 75);
}

/**
 * Generate medium URL for medium displays
 * @param {string} imageUrl - Original image URL
 * @returns {string} Medium URL (400x300)
 */
export function getMediumImageUrl(imageUrl) {
  return getOptimizedImageUrl(imageUrl, 400, 300, 80);
}

/**
 * Generate large URL for large displays
 * @param {string} imageUrl - Original image URL
 * @returns {string} Large URL (800x600)
 */
export function getLargeImageUrl(imageUrl) {
  return getOptimizedImageUrl(imageUrl, 800, 600, 85);
}
