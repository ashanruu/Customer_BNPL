import { Image } from 'expo-image';

class ImageCacheManager {
  /**
   * Preload images for better performance
   * @param uris Array of image URIs to preload
   */
  static async preloadImages(uris: string[]): Promise<void> {
    try {
      const promises = uris.map(uri => 
        Image.prefetch(uri, 'memory-disk')
      );
      await Promise.all(promises);
      console.log('Images preloaded successfully');
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  }

  /**
   * Clear image cache for specific URIs
   * @param uris Array of image URIs to clear from cache
   */
  static async clearCache(uris?: string[]): Promise<void> {
    try {
      if (uris && uris.length > 0) {
        // Clear specific images
        await Promise.all(uris.map(uri => Image.clearMemoryCache()));
      } else {
        // Clear all cache
        await Image.clearMemoryCache();
        await Image.clearDiskCache();
      }
      console.log('Image cache cleared');
    } catch (error) {
      console.error('Error clearing image cache:', error);
    }
  }

  /**
   * Get cache size information
   */
  static async getCacheInfo(): Promise<{
    memorySize: number;
    diskSize: number;
  }> {
    try {
      // Note: expo-image doesn't provide cache size info directly
      // This is a placeholder for future implementation or custom tracking
      return {
        memorySize: 0,
        diskSize: 0,
      };
    } catch (error) {
      console.error('Error getting cache info:', error);
      return {
        memorySize: 0,
        diskSize: 0,
      };
    }
  }

  /**
   * Preload promotion images specifically
   * @param promotions Array of promotion objects with image links
   */
  static async preloadPromotionImages(promotions: Array<{ promotionImageLink?: string }>): Promise<void> {
    const validUris = promotions
      .map(promo => promo.promotionImageLink)
      .filter((uri): uri is string => !!uri && uri.length > 0);
    
    if (validUris.length > 0) {
      await this.preloadImages(validUris);
    }
  }

  /**
   * Preload shop images specifically
   * @param shops Array of shop objects with image URLs
   */
  static async preloadShopImages(shops: Array<{ imageUrl?: string }>): Promise<void> {
    const validUris = shops
      .map(shop => shop.imageUrl)
      .filter((uri): uri is string => !!uri && uri.length > 0);
    
    if (validUris.length > 0) {
      await this.preloadImages(validUris);
    }
  }
}

export default ImageCacheManager;