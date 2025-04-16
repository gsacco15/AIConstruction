/**
 * Utilities for working with affiliate links
 */

export const AFFILIATE_TAG = "aiconstructio-20";

/**
 * Creates an Amazon affiliate link for a product name
 * @param productName The name of the product
 * @returns The affiliate URL for the product
 */
export function createAffiliateLink(productName: string): string {
  // Replace spaces with "+" for URL encoding
  const encodedName = encodeURIComponent(productName).replace(/%20/g, "+");
  return `https://www.amazon.com/s?k=${encodedName}&tag=${AFFILIATE_TAG}`;
}

/**
 * Type definitions for the recommendation data structure
 */
export interface ProductItem {
  name: string;
  affiliate_url: string;
}

export interface Recommendations {
  materials: ProductItem[];
  tools: ProductItem[];
} 