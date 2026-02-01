/**
 * Utility functions for fashion recommendation system
 * 
 * This module provides helper functions for data processing, text analysis,
 * color extraction, and similarity calculations used throughout the application.
 * 
 * @module lib/utils
 */

import { FashionItem } from './core';

/**
 * Extract dominant colors from an image URL
 * Note: In a real implementation, this would use an image processing library
 * or API. This is a placeholder that returns mock data.
 * 
 * @param imageUrl - URL of the image to analyze
 * @returns Array of color names or hex codes
 */
export async function extractColors(imageUrl: string): Promise<string[]> {
  // Placeholder implementation
  // In production, use a library like 'node-vibrant' or an API like Cloudinary
  return new Promise((resolve) => {
    setTimeout(() => {
      // Mock color extraction
      resolve(['black', 'white', 'beige']);
    }, 100);
  });
}

/**
 * Calculate similarity between two text strings using Jaccard similarity
 * 
 * @param text1 - First text string
 * @param text2 - Second text string
 * @returns Similarity score between 0 and 1
 */
export function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(normalizeText(text1).split(/\s+/));
  const words2 = new Set(normalizeText(text2).split(/\s+/));

  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
}

/**
 * Normalize text by converting to lowercase and removing special characters
 * 
 * @param text - Text to normalize
 * @returns Normalized text
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Group fashion items by category
 * 
 * @param items - Array of fashion items
 * @returns Object with categories as keys and arrays of items as values
 */
export function groupByCategory(items: FashionItem[]): Record<string, FashionItem[]> {
  const grouped: Record<string, FashionItem[]> = {};

  items.forEach(item => {
    if (!grouped[item.category]) {
      grouped[item.category] = [];
    }
    grouped[item.category].push(item);
  });

  return grouped;
}

/**
 * Group fashion items by any property
 * 
 * @param items - Array of fashion items
 * @param key - Property key to group by
 * @returns Object with property values as keys and arrays of items as values
 */
export function groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]> {
  const grouped: Record<string, T[]> = {};

  items.forEach(item => {
    const groupKey = String(item[key]);
    if (!grouped[groupKey]) {
      grouped[groupKey] = [];
    }
    grouped[groupKey].push(item);
  });

  return grouped;
}

/**
 * Extract style keywords from text description
 * 
 * @param text - Description text
 * @returns Array of style keywords
 */
export function extractStyleKeywords(text: string): string[] {
  const styleKeywords = [
    'casual', 'formal', 'elegant', 'sporty', 'bohemian', 'vintage',
    'modern', 'classic', 'minimalist', 'edgy', 'romantic', 'preppy',
    'streetwear', 'chic', 'sophisticated', 'trendy', 'retro', 'grunge',
    'feminine', 'masculine', 'androgynous', 'professional', 'business',
    'athleisure', 'luxury', 'designer', 'affordable', 'sustainable'
  ];

  const normalized = normalizeText(text);
  return styleKeywords.filter(keyword => normalized.includes(keyword));
}

/**
 * Parse color names from text
 * 
 * @param text - Text containing color descriptions
 * @returns Array of color names found
 */
export function parseColors(text: string): string[] {
  const colorKeywords = [
    'black', 'white', 'gray', 'grey', 'red', 'blue', 'green', 'yellow',
    'orange', 'purple', 'pink', 'brown', 'beige', 'tan', 'navy', 'maroon',
    'burgundy', 'teal', 'turquoise', 'lavender', 'cream', 'ivory',
    'charcoal', 'olive', 'khaki', 'coral', 'mint', 'sage', 'mustard',
    'rust', 'camel', 'nude', 'blush', 'emerald', 'cobalt', 'crimson'
  ];

  const normalized = normalizeText(text);
  return colorKeywords.filter(color => normalized.includes(color));
}

/**
 * Calculate average price from array of items
 * 
 * @param items - Array of fashion items
 * @returns Average price or null if no prices available
 */
export function calculateAveragePrice(items: FashionItem[]): number | null {
  const prices = items
    .map(item => item.price)
    .filter((price): price is number => price !== undefined);

  if (prices.length === 0) return null;
  return prices.reduce((sum, price) => sum + price, 0) / prices.length;
}

/**
 * Filter items by price range
 * 
 * @param items - Array of fashion items
 * @param minPrice - Minimum price (inclusive)
 * @param maxPrice - Maximum price (inclusive)
 * @returns Filtered array of items
 */
export function filterByPriceRange(
  items: FashionItem[],
  minPrice: number,
  maxPrice: number
): FashionItem[] {
  return items.filter(item => {
    if (item.price === undefined) return false;
    return item.price >= minPrice && item.price <= maxPrice;
  });
}

/**
 * Filter items by categories
 * 
 * @param items - Array of fashion items
 * @param categories - Array of category names to include
 * @returns Filtered array of items
 */
export function filterByCategories(
  items: FashionItem[],
  categories: string[]
): FashionItem[] {
  const categorySet = new Set(categories.map(c => normalizeText(c)));
  return items.filter(item => categorySet.has(normalizeText(item.category)));
}

/**
 * Deduplicate items based on similarity threshold
 * 
 * @param items - Array of fashion items
 * @param threshold - Similarity threshold (0-1) for considering items duplicates
 * @returns Deduplicated array of items
 */
export function deduplicateItems(
  items: FashionItem[],
  threshold: number = 0.8
): FashionItem[] {
  const unique: FashionItem[] = [];

  items.forEach(item => {
    const isDuplicate = unique.some(uniqueItem => {
      const titleSim = calculateSimilarity(item.title, uniqueItem.title);
      const descSim = calculateSimilarity(item.description, uniqueItem.description);
      return (titleSim + descSim) / 2 > threshold;
    });

    if (!isDuplicate) {
      unique.push(item);
    }
  });

  return unique;
}

/**
 * Generate a unique ID for an item
 * 
 * @param prefix - Optional prefix for the ID
 * @returns Unique ID string
 */
export function generateId(prefix: string = 'item'): string {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 9);
  return `${prefix}_${timestamp}_${randomStr}`;
}

/**
 * Validate fashion item data structure
 * 
 * @param item - Item to validate
 * @returns True if valid, false otherwise
 */
export function validateFashionItem(item: any): item is FashionItem {
  return (
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.title === 'string' &&
    typeof item.description === 'string' &&
    typeof item.imageUrl === 'string' &&
    typeof item.category === 'string' &&
    Array.isArray(item.colors) &&
    Array.isArray(item.style) &&
    Array.isArray(item.tags)
  );
}

/**
 * Format price for display
 * 
 * @param price - Price value
 * @param currency - Currency code (default: USD)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Shuffle array using Fisher-Yates algorithm
 * 
 * @param array - Array to shuffle
 * @returns New shuffled array
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Get random sample from array
 * 
 * @param array - Array to sample from
 * @param size - Number of items to sample
 * @returns Array of sampled items
 */
export function sampleArray<T>(array: T[], size: number): T[] {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, Math.min(size, array.length));
}

/**
 * Calculate percentage
 * 
 * @param value - Value
 * @param total - Total
 * @returns Percentage (0-100)
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}

/**
 * Clamp value between min and max
 * 
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function execution
 * 
 * @param func - Function to debounce
 * @param wait - Wait time in milliseconds
 * @returns Debounced function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Deep clone an object
 * 
 * @param obj - Object to clone
 * @returns Cloned object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}
