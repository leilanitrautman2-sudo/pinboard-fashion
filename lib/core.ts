/**
 * Core module for fashion recommendation system
 * 
 * This module provides the main functionality for analyzing Pinterest boards
 * and generating fashion recommendations based on user preferences and style patterns.
 * 
 * @module lib/core
 */

import { extractColors, calculateSimilarity, normalizeText, groupByCategory } from './utils';

/**
 * Represents a fashion item from Pinterest or catalog
 */
export interface FashionItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'outerwear' | 'shoes' | 'accessories';
  colors: string[];
  style: string[];
  price?: number;
  brand?: string;
  tags: string[];
}

/**
 * Represents a user's Pinterest board data
 */
export interface PinterestBoard {
  id: string;
  name: string;
  pins: FashionItem[];
}

/**
 * Style profile derived from user's Pinterest board
 */
export interface StyleProfile {
  dominantColors: string[];
  preferredCategories: string[];
  styleKeywords: string[];
  priceRange?: { min: number; max: number };
  favoredBrands: string[];
}

/**
 * Recommendation result with score
 */
export interface Recommendation {
  item: FashionItem;
  score: number;
  reasons: string[];
}

/**
 * Main class for fashion recommendation engine
 */
export class FashionRecommendationEngine {
  private styleProfile: StyleProfile | null = null;
  private boardData: PinterestBoard | null = null;

  /**
   * Initialize the recommendation engine with Pinterest board data
   * 
   * @param board - Pinterest board containing user's saved fashion items
   */
  public analyzePinterestBoard(board: PinterestBoard): StyleProfile {
    this.boardData = board;
    this.styleProfile = this._buildStyleProfile(board);
    return this.styleProfile;
  }

  /**
   * Generate recommendations based on analyzed style profile
   * 
   * @param catalogItems - Available fashion items to recommend from
   * @param limit - Maximum number of recommendations to return
   * @returns Array of recommended items with scores
   */
  public generateRecommendations(
    catalogItems: FashionItem[],
    limit: number = 10
  ): Recommendation[] {
    if (!this.styleProfile) {
      throw new Error('Style profile not initialized. Call analyzePinterestBoard first.');
    }

    const scoredItems = catalogItems.map(item => ({
      item,
      score: this._calculateRecommendationScore(item, this.styleProfile!),
      reasons: this._generateReasons(item, this.styleProfile!)
    }));

    // Sort by score descending and return top items
    return scoredItems
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  /**
   * Get the current style profile
   */
  public getStyleProfile(): StyleProfile | null {
    return this.styleProfile;
  }

  /**
   * Find gaps in user's wardrobe based on their style
   * 
   * @returns Categories that are underrepresented in the board
   */
  public findWardrobeGaps(): string[] {
    if (!this.boardData) {
      return [];
    }

    const allCategories = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories'];
    const grouped = groupByCategory(this.boardData.pins);
    const categoryCount = new Map<string, number>();

    allCategories.forEach(cat => {
      categoryCount.set(cat, grouped[cat]?.length || 0);
    });

    const avgCount = Array.from(categoryCount.values()).reduce((a, b) => a + b, 0) / allCategories.length;
    
    // Return categories below average
    return allCategories.filter(cat => (categoryCount.get(cat) || 0) < avgCount * 0.5);
  }

  /**
   * Build style profile from Pinterest board data
   * @private
   */
  private _buildStyleProfile(board: PinterestBoard): StyleProfile {
    const allColors: string[] = [];
    const allStyles: string[] = [];
    const categories: string[] = [];
    const brands: string[] = [];
    const prices: number[] = [];

    board.pins.forEach(pin => {
      allColors.push(...pin.colors);
      allStyles.push(...pin.style);
      categories.push(pin.category);
      if (pin.brand) brands.push(pin.brand);
      if (pin.price) prices.push(pin.price);
    });

    // Find most common colors
    const colorFreq = this._getFrequencyMap(allColors);
    const dominantColors = this._getTopN(colorFreq, 5);

    // Find most common styles
    const styleFreq = this._getFrequencyMap(allStyles);
    const styleKeywords = this._getTopN(styleFreq, 8);

    // Find preferred categories
    const categoryFreq = this._getFrequencyMap(categories);
    const preferredCategories = this._getTopN(categoryFreq, 3);

    // Find favored brands
    const brandFreq = this._getFrequencyMap(brands);
    const favoredBrands = this._getTopN(brandFreq, 5);

    // Calculate price range
    const priceRange = prices.length > 0 ? {
      min: Math.min(...prices),
      max: Math.max(...prices)
    } : undefined;

    return {
      dominantColors,
      preferredCategories,
      styleKeywords,
      priceRange,
      favoredBrands
    };
  }

  /**
   * Calculate recommendation score for an item
   * @private
   */
  private _calculateRecommendationScore(item: FashionItem, profile: StyleProfile): number {
    let score = 0;

    // Color matching (30% weight)
    const colorMatch = this._calculateColorMatch(item.colors, profile.dominantColors);
    score += colorMatch * 0.3;

    // Style matching (40% weight)
    const styleMatch = this._calculateStyleMatch(item.style, profile.styleKeywords);
    score += styleMatch * 0.4;

    // Category preference (15% weight)
    const categoryMatch = profile.preferredCategories.includes(item.category) ? 1 : 0.5;
    score += categoryMatch * 0.15;

    // Brand preference (10% weight)
    const brandMatch = item.brand && profile.favoredBrands.includes(item.brand) ? 1 : 0.5;
    score += brandMatch * 0.1;

    // Price range (5% weight)
    if (item.price && profile.priceRange) {
      const priceMatch = item.price >= profile.priceRange.min && item.price <= profile.priceRange.max ? 1 : 0.5;
      score += priceMatch * 0.05;
    } else {
      score += 0.025; // Neutral score if no price data
    }

    return score;
  }

  /**
   * Generate human-readable reasons for recommendation
   * @private
   */
  private _generateReasons(item: FashionItem, profile: StyleProfile): string[] {
    const reasons: string[] = [];

    // Check color matches
    const matchingColors = item.colors.filter(c => profile.dominantColors.includes(c));
    if (matchingColors.length > 0) {
      reasons.push(`Matches your preferred colors: ${matchingColors.join(', ')}`);
    }

    // Check style matches
    const matchingStyles = item.style.filter(s => profile.styleKeywords.includes(s));
    if (matchingStyles.length > 0) {
      reasons.push(`Fits your ${matchingStyles.join(', ')} style`);
    }

    // Check category preference
    if (profile.preferredCategories.includes(item.category)) {
      reasons.push(`You often save ${item.category}`);
    }

    // Check brand
    if (item.brand && profile.favoredBrands.includes(item.brand)) {
      reasons.push(`From your favorite brand: ${item.brand}`);
    }

    // Check price
    if (item.price && profile.priceRange) {
      if (item.price >= profile.priceRange.min && item.price <= profile.priceRange.max) {
        reasons.push('Within your typical price range');
      }
    }

    return reasons;
  }

  /**
   * Calculate color matching score
   * @private
   */
  private _calculateColorMatch(itemColors: string[], profileColors: string[]): number {
    if (itemColors.length === 0 || profileColors.length === 0) return 0.5;
    
    const matches = itemColors.filter(c => profileColors.includes(c)).length;
    return matches / Math.max(itemColors.length, 1);
  }

  /**
   * Calculate style matching score
   * @private
   */
  private _calculateStyleMatch(itemStyles: string[], profileStyles: string[]): number {
    if (itemStyles.length === 0 || profileStyles.length === 0) return 0.5;
    
    const matches = itemStyles.filter(s => profileStyles.includes(s)).length;
    return matches / Math.max(itemStyles.length, 1);
  }

  /**
   * Get frequency map of items
   * @private
   */
  private _getFrequencyMap(items: string[]): Map<string, number> {
    const freq = new Map<string, number>();
    items.forEach(item => {
      const normalized = normalizeText(item);
      freq.set(normalized, (freq.get(normalized) || 0) + 1);
    });
    return freq;
  }

  /**
   * Get top N items from frequency map
   * @private
   */
  private _getTopN(freqMap: Map<string, number>, n: number): string[] {
    return Array.from(freqMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([key]) => key);
  }
}

/**
 * Create a new fashion recommendation engine instance
 * 
 * @returns New FashionRecommendationEngine instance
 */
export function createRecommendationEngine(): FashionRecommendationEngine {
  return new FashionRecommendationEngine();
}

/**
 * Quick function to get recommendations from a board and catalog
 * 
 * @param board - Pinterest board data
 * @param catalogItems - Available items to recommend
 * @param limit - Number of recommendations
 * @returns Array of recommendations
 */
export function getRecommendations(
  board: PinterestBoard,
  catalogItems: FashionItem[],
  limit: number = 10
): Recommendation[] {
  const engine = createRecommendationEngine();
  engine.analyzePinterestBoard(board);
  return engine.generateRecommendations(catalogItems, limit);
}
