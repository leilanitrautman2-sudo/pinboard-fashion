import { 
  FashionItem, 
  PinterestBoard, 
  StyleProfile, 
  Recommendation,
  createRecommendationEngine,
  getRecommendations 
} from './lib/core';

import { 
  groupByCategory,
  calculateAveragePrice,
  filterByPriceRange,
  formatPrice,
  extractStyleKeywords,
  parseColors,
  deduplicateItems,
  generateId,
  sampleArray
} from './lib/utils';

/**
 * Fashion Recommendation App Demo
 * 
 * This demo showcases a fashion recommendation system that analyzes
 * a user's Pinterest board and recommends items to purchase based on
 * their style preferences, color palette, and wardrobe gaps.
 */

// ============================================================================
// MOCK DATA GENERATION
// ============================================================================

/**
 * Generate a mock Pinterest board with sample pins
 */
function createMockPinterestBoard(): PinterestBoard {
  const pins: FashionItem[] = [
    {
      id: generateId('pin'),
      name: 'Minimalist White Blazer',
      description: 'Clean lines, minimalist style, professional white blazer perfect for office wear',
      category: 'outerwear',
      colors: ['white', 'cream'],
      style: ['minimalist', 'professional', 'modern'],
      price: 150,
      imageUrl: 'https://example.com/white-blazer.jpg',
      brand: 'Everlane',
      tags: ['blazer', 'office', 'formal']
    },
    {
      id: generateId('pin'),
      name: 'High-Waisted Black Trousers',
      description: 'Classic black trousers with high waist, tailored fit, elegant and versatile',
      category: 'bottoms',
      colors: ['black'],
      style: ['classic', 'elegant', 'minimalist'],
      price: 80,
      imageUrl: 'https://example.com/black-trousers.jpg',
      brand: 'Mango',
      tags: ['trousers', 'formal', 'office']
    },
    {
      id: generateId('pin'),
      name: 'Silk Cream Blouse',
      description: 'Luxurious silk blouse in cream color, feminine and sophisticated',
      category: 'tops',
      colors: ['cream', 'beige'],
      style: ['elegant', 'feminine', 'sophisticated'],
      price: 120,
      imageUrl: 'https://example.com/silk-blouse.jpg',
      brand: 'Massimo Dutti',
      tags: ['blouse', 'silk', 'formal']
    },
    {
      id: generateId('pin'),
      name: 'Minimalist Leather Loafers',
      description: 'Black leather loafers with clean design, comfortable and stylish',
      category: 'shoes',
      colors: ['black'],
      style: ['minimalist', 'classic', 'comfortable'],
      price: 180,
      imageUrl: 'https://example.com/loafers.jpg',
      brand: 'Everlane',
      tags: ['shoes', 'loafers', 'leather']
    },
    {
      id: generateId('pin'),
      name: 'Camel Wool Coat',
      description: 'Timeless camel coat in wool, perfect for fall and winter',
      category: 'outerwear',
      colors: ['camel', 'tan', 'brown'],
      style: ['classic', 'timeless', 'elegant'],
      price: 350,
      imageUrl: 'https://example.com/camel-coat.jpg',
      brand: 'Massimo Dutti',
      tags: ['coat', 'wool', 'winter']
    },
    {
      id: generateId('pin'),
      name: 'Striped Cotton T-Shirt',
      description: 'Classic striped t-shirt in navy and white, casual and versatile',
      category: 'tops',
      colors: ['navy', 'white'],
      style: ['casual', 'classic', 'minimalist'],
      price: 35,
      imageUrl: 'https://example.com/striped-tee.jpg',
      brand: 'COS',
      tags: ['t-shirt', 'casual', 'stripes']
    },
    {
      id: generateId('pin'),
      name: 'Beige Knit Sweater',
      description: 'Cozy beige knit sweater, perfect for layering',
      category: 'tops',
      colors: ['beige', 'cream'],
      style: ['cozy', 'minimalist', 'casual'],
      price: 90,
      imageUrl: 'https://example.com/knit-sweater.jpg',
      brand: '& Other Stories',
      tags: ['sweater', 'knit', 'casual']
    },
    {
      id: generateId('pin'),
      name: 'Wide-Leg Linen Pants',
      description: 'Comfortable wide-leg pants in natural linen, perfect for summer',
      category: 'bottoms',
      colors: ['beige', 'natural'],
      style: ['relaxed', 'comfortable', 'minimalist'],
      price: 75,
      imageUrl: 'https://example.com/linen-pants.jpg',
      brand: 'Arket',
      tags: ['pants', 'linen', 'summer']
    }
  ];

  return {
    id: 'board-001',
    name: 'My Style Inspiration',
    description: 'Minimalist, elegant fashion inspiration',
    pins: pins,
    userId: 'user-123'
  };
}

/**
 * Generate a mock catalog of available fashion items to purchase
 */
function createMockCatalog(): FashionItem[] {
  return [
    {
      id: generateId('catalog'),
      name: 'Ivory Silk Camisole',
      description: 'Delicate ivory silk camisole with adjustable straps, elegant and versatile',
      category: 'tops',
      colors: ['ivory', 'cream'],
      style: ['elegant', 'feminine', 'minimalist'],
      price: 85,
      imageUrl: 'https://example.com/catalog/silk-cami.jpg',
      brand: 'Everlane',
      tags: ['camisole', 'silk', 'layering']
    },
    {
      id: generateId('catalog'),
      name: 'Navy Wool Blazer',
      description: 'Classic navy blazer in premium wool, tailored fit for professional look',
      category: 'outerwear',
      colors: ['navy', 'blue'],
      style: ['professional', 'classic', 'elegant'],
      price: 220,
      imageUrl: 'https://example.com/catalog/navy-blazer.jpg',
      brand: 'Mango',
      tags: ['blazer', 'wool', 'office']
    },
    {
      id: generateId('catalog'),
      name: 'White Leather Sneakers',
      description: 'Minimalist white leather sneakers, comfortable and stylish for everyday wear',
      category: 'shoes',
      colors: ['white'],
      style: ['minimalist', 'casual', 'comfortable'],
      price: 120,
      imageUrl: 'https://example.com/catalog/white-sneakers.jpg',
      brand: 'Common Projects',
      tags: ['sneakers', 'leather', 'casual']
    },
    {
      id: generateId('catalog'),
      name: 'Beige Trench Coat',
      description: 'Classic beige trench coat with belt, timeless and elegant',
      category: 'outerwear',
      colors: ['beige', 'tan'],
      style: ['classic', 'timeless', 'elegant'],
      price: 280,
      imageUrl: 'https://example.com/catalog/trench-coat.jpg',
      brand: 'COS',
      tags: ['trench', 'coat', 'spring']
    },
    {
      id: generateId('catalog'),
      name: 'Black Ankle Boots',
      description: 'Sleek black leather ankle boots with low heel, versatile and chic',
      category: 'shoes',
      colors: ['black'],
      style: ['chic', 'minimalist', 'versatile'],
      price: 195,
      imageUrl: 'https://example.com/catalog/ankle-boots.jpg',
      brand: 'Everlane',
      tags: ['boots', 'ankle', 'leather']
    },
    {
      id: generateId('catalog'),
      name: 'Cream Cashmere Sweater',
      description: 'Luxurious cream cashmere sweater, soft and cozy',
      category: 'tops',
      colors: ['cream', 'beige'],
      style: ['luxurious', 'cozy', 'minimalist'],
      price: 250,
      imageUrl: 'https://example.com/catalog/cashmere-sweater.jpg',
      brand: 'Everlane',
      tags: ['sweater', 'cashmere', 'luxury']
    },
    {
      id: generateId('catalog'),
      name: 'Straight-Leg Jeans',
      description: 'Classic straight-leg jeans in dark wash, versatile and comfortable',
      category: 'bottoms',
      colors: ['blue', 'denim'],
      style: ['classic', 'casual', 'versatile'],
      price: 98,
      imageUrl: 'https://example.com/catalog/straight-jeans.jpg',
      brand: 'Levi\'s',
      tags: ['jeans', 'denim', 'casual']
    },
    {
      id: generateId('catalog'),
      name: 'Structured Leather Tote',
      description: 'Black structured leather tote bag, professional and spacious',
      category: 'accessories',
      colors: ['black'],
      style: ['professional', 'structured', 'minimalist'],
      price: 320,
      imageUrl: 'https://example.com/catalog/leather-tote.jpg',
      brand: 'Cuyana',
      tags: ['bag', 'tote', 'leather']
    },
    {
      id: generateId('catalog'),
      name: 'Gold Minimalist Necklace',
      description: 'Delicate gold chain necklace with simple pendant, elegant and understated',
      category: 'accessories',
      colors: ['gold'],
      style: ['minimalist', 'elegant', 'delicate'],
      price: 65,
      imageUrl: 'https://example.com/catalog/gold-necklace.jpg',
      brand: 'Mejuri',
      tags: ['jewelry', 'necklace', 'gold']
    },
    {
      id: generateId('catalog'),
      name: 'Pleated Midi Skirt',
      description: 'Elegant pleated midi skirt in navy, perfect for office or evening',
      category: 'bottoms',
      colors: ['navy', 'blue'],
      style: ['elegant', 'feminine', 'professional'],
      price: 110,
      imageUrl: 'https://example.com/catalog/pleated-skirt.jpg',
      brand: '& Other Stories',
      tags: ['skirt', 'midi', 'pleated']
    },
    {
      id: generateId('catalog'),
      name: 'White Button-Down Shirt',
      description: 'Crisp white cotton button-down shirt, essential wardrobe staple',
      category: 'tops',
      colors: ['white'],
      style: ['classic', 'minimalist', 'professional'],
      price: 78,
      imageUrl: 'https://example.com/catalog/white-shirt.jpg',
      brand: 'Everlane',
      tags: ['shirt', 'button-down', 'essential']
    },
    {
      id: generateId('catalog'),
      name: 'Tan Leather Belt',
      description: 'Classic tan leather belt with gold buckle, versatile accessory',
      category: 'accessories',
      colors: ['tan', 'brown'],
      style: ['classic', 'versatile', 'minimalist'],
      price: 55,
      imageUrl: 'https://example.com/catalog/leather-belt.jpg',
      brand: 'Madewell',
      tags: ['belt', 'leather', 'accessory']
    },
    {
      id: generateId('catalog'),
      name: 'Oversized Sunglasses',
      description: 'Chic oversized sunglasses with tortoiseshell frames',
      category: 'accessories',
      colors: ['brown', 'tortoiseshell'],
      style: ['chic', 'trendy', 'bold'],
      price: 180,
      imageUrl: 'https://example.com/catalog/sunglasses.jpg',
      brand: 'Celine',
      tags: ['sunglasses', 'accessory', 'luxury']
    },
    {
      id: generateId('catalog'),
      name: 'Ribbed Tank Top',
      description: 'Simple ribbed tank top in black, perfect for layering',
      category: 'tops',
      colors: ['black'],
      style: ['minimalist', 'casual', 'basic'],
      price: 28,
      imageUrl: 'https://example.com/catalog/ribbed-tank.jpg',
      brand: 'COS',
      tags: ['tank', 'basic', 'layering']
    },
    {
      id: generateId('catalog'),
      name: 'Wool Blend Cardigan',
      description: 'Cozy wool blend cardigan in grey, perfect for layering',
      category: 'tops',
      colors: ['grey', 'gray'],
      style: ['cozy', 'casual', 'comfortable'],
      price: 115,
      imageUrl: 'https://example.com/catalog/wool-cardigan.jpg',
      brand: 'Arket',
      tags: ['cardigan', 'wool', 'layering']
    }
  ];
}

// ============================================================================
// FASHION APP CLASS
// ============================================================================

/**
 * Main Fashion Recommendation App
 * Analyzes Pinterest boards and provides personalized shopping recommendations
 */
class FashionRecommendationApp {
  private engine = createRecommendationEngine();
  private catalog: FashionItem[] = [];
  private currentBoard: PinterestBoard | null = null;
  private styleProfile: StyleProfile | null = null;

  constructor() {
    console.log('🎨 Fashion Recommendation App initialized!\n');
  }

  /**
   * Load the product catalog
   */
  loadCatalog(items: FashionItem[]): void {
    this.catalog = items;
    console.log(`📦 Loaded ${items.length} items into catalog\n`);
  }

  /**
   * Analyze a Pinterest board and create style profile
   */
  analyzePinterestBoard(board: PinterestBoard): void {
    console.log(`🔍 Analyzing Pinterest board: "${board.name}"`);
    console.log(`   Board contains ${board.pins.length} pins\n`);

    this.currentBoard = board;
    this.styleProfile = this.engine.analyzePinterestBoard(board);

    this.displayStyleProfile(this.styleProfile);
  }

  /**
   * Display the user's style profile
   */
  private displayStyleProfile(profile: StyleProfile): void {
    console.log('👤 YOUR STYLE PROFILE');
    console.log('═'.repeat(60));
    
    console.log('\n🎨 Dominant Colors:');
    profile.dominantColors.slice(0, 5).forEach((color, idx) => {
      console.log(`   ${idx + 1}. ${color}`);
    });

    console.log('\n✨ Style Preferences:');
    profile.preferredStyles.slice(0, 5).forEach((style, idx) => {
      console.log(`   ${idx + 1}. ${style}`);
    });

    console.log('\n📂 Category Distribution:');
    Object.entries(profile.categoryDistribution)
      .sort(([, a], [, b]) => b - a)
      .forEach(([category, count]) => {
        const percentage = ((count / profile.totalItems) * 100).toFixed(0);
        console.log(`   ${category}: ${count} items (${percentage}%)`);
      });

    if (profile.averagePrice) {
      console.log(`\n💰 Average Price Point: ${formatPrice(profile.averagePrice)}`);
    }

    console.log('\n🏷️  Favorite Brands:');
    profile.favoriteBrands.slice(0, 5).forEach((brand, idx) => {
      console.log(`   ${idx + 1}. ${brand}`);
    });

    console.log('\n');
  }

  /**
   * Generate personalized recommendations
   */
  getRecommendations(limit: number = 10): Recommendation[] {
    if (!this.currentBoard) {
      throw new Error('No Pinterest board analyzed yet. Call analyzePinterestBoard first.');
    }

    console.log(`🎯 Generating ${limit} personalized recommendations...\n`);

    const recommendations = getRecommendations(
      this.currentBoard,
      this.catalog,
      limit
    );

    return recommendations;
  }

  /**
   * Display recommendations in a user-friendly format
   */
  displayRecommendations(recommendations: Recommendation[]): void {
    console.log('🛍️  PERSONALIZED RECOMMENDATIONS FOR YOU');
    console.log('═'.repeat(60));
    console.log('Based on your Pinterest board, we recommend:\n');

    recommendations.forEach((rec, idx) => {
      const item = rec.item;
      const matchPercentage = (rec.score * 100).toFixed(0);
      
      console.log(`${idx + 1}. ${item.name}`);
      console.log(`   Brand: ${item.brand || 'N/A'}`);
      console.log(`   Price: ${formatPrice(item.price || 0)}`);
      console.log(`   Category: ${item.category}`);
      console.log(`   Colors: ${item.colors.join(', ')}`);
      console.log(`   Style: ${item.style.join(', ')}`);
      console.log(`   Match Score: ${matchPercentage}% ⭐`);
      console.log(`   Why: ${rec.reason}`);
      console.log('');
    });
  }

  /**
   * Find wardrobe gaps - categories that are underrepresented
   */
  findWardrobeGaps(): void {
    if (!this.currentBoard) {
      throw new Error('No Pinterest board analyzed yet.');
    }

    console.log('🔎 WARDROBE GAP ANALYSIS');
    console.log('═'.repeat(60));

    const gaps = this.engine.findWardrobeGaps(this.currentBoard);

    if (gaps.length === 0) {
      console.log('✅ Your wardrobe looks well-balanced!\n');
      return;
    }

    console.log('We noticed you might be missing items in these categories:\n');
    
    gaps.forEach((gap, idx) => {
      console.log(`${idx + 1}. ${gap.category.toUpperCase()}`);
      console.log(`   Current items: ${gap.currentCount}`);
      console.log(`   Suggestion: Add ${gap.suggestedCount} more items`);
      console.log(`   Priority: ${gap.priority}\n`);
    });
  }

  /**
   * Filter recommendations by price range
   */
  filterByBudget(recommendations: Recommendation[], maxBudget: number): Recommendation[] {
    console.log(`💵 Filtering recommendations within budget: ${formatPrice(maxBudget)}\n`);
    
    const filtered = recommendations.filter(rec => 
      rec.item.price !== undefined && rec.item.price <= maxBudget
    );

    console.log(`   Found ${filtered.length} items within your budget\n`);
    return filtered;
  }

  /**
   * Group recommendations by category
   */
  groupRecommendationsByCategory(recommendations: Recommendation[]): void {
    console.log('📊 RECOMMENDATIONS BY CATEGORY');
    console.log('═'.repeat(60));

    const items = recommendations.map(rec => rec.item);
    const grouped = groupByCategory(items);

    Object.entries(grouped).forEach(([category, categoryItems]) => {
      console.log(`\n${category.toUpperCase()} (${categoryItems.length} items):`);
      categoryItems.forEach((item, idx) => {
        console.log(`   ${idx + 1}. ${item.name} - ${formatPrice(item.price || 0)}`);
      });
    });

    console.log('\n');
  }

  /**
   * Calculate total cost of recommendations
   */
  calculateShoppingBudget(recommendations: Recommendation[]): void {
    console.log('💰 SHOPPING BUDGET SUMMARY');
    console.log('═'.repeat(60));

    const items = recommendations.map(rec => rec.item);
    const totalCost = items.reduce((sum, item) => sum + (item.price || 0), 0);
    const avgPrice = calculateAveragePrice(items);

    console.log(`   Total items: ${items.length}`);
    console.log(`   Total cost: ${formatPrice(totalCost)}`);
    if (avgPrice) {
      console.log(`   Average price: ${formatPrice(avgPrice)}`);
    }

    // Group by price ranges
    const budget = items.filter(i => (i.price || 0) < 100);
    const midRange = items.filter(i => (i.price || 0) >= 100 && (i.price || 0) < 200);
    const premium = items.filter(i => (i.price || 0) >= 200);

    console.log('\n   Price Distribution:');
    console.log(`   Budget (<$100): ${budget.length} items`);
    console.log(`   Mid-range ($100-$200): ${midRange.length} items`);
    console.log(`   Premium ($200+): ${premium.length} items`);
    console.log('\n');
  }

  /**
   * Get top picks - highest scoring recommendations
   */
  getTopPicks(recommendations: Recommendation[], count: number = 3): Recommendation[] {
    console.log(`⭐ TOP ${count} PICKS FOR YOU`);
    console.log('═'.repeat(60));
    console.log('These items best match your style:\n');

    const topPicks = recommendations.slice(0, count);
    
    topPicks.forEach((rec, idx) => {
      const matchPercentage = (rec.score * 100).toFixed(0);
      console.log(`${idx + 1}. ${rec.item.name}`);
      console.log(`   ${formatPrice(rec.item.price || 0)} | ${matchPercentage}% match`);
      console.log(`   ${rec.reason}\n`);
    });

    return topPicks;
  }
}

// ============================================================================
// DEMO EXECUTION
// ============================================================================

/**
 * Main demo function
 */
function runDemo(): void {
  console.clear();
  console.log('═'.repeat(60));
  console.log('         FASHION RECOMMENDATION APP - DEMO');
  console.log('═'.repeat(60));
  console.log('\n');

  try {
    // Initialize the app
    const app = new FashionRecommendationApp();

    // Load catalog
    const catalog = createMockCatalog();
    app.loadCatalog(catalog);

    // Create and analyze Pinterest board
    const pinterestBoard = createMockPinterestBoard();
    app.analyzePinterestBoard(pinterestBoard);

    // Find wardrobe gaps
    app.findWardrobeGaps();

    // Generate recommendations
    const recommendations = app.getRecommendations(12);
    app.displayRecommendations(recommendations);

    // Show top picks
    const topPicks = app.getTopPicks(recommendations, 3);

    // Calculate shopping budget
    app.calculateShoppingBudget(recommendations);

    // Group by category
    app.groupRecommendationsByCategory(recommendations);

    // Filter by budget
    const budgetRecommendations = app.filterByBudget(recommendations, 150);
    if (budgetRecommendations.length > 0) {
      console.log('🏷️  BUDGET-FRIENDLY OPTIONS (Under $150)');
      console.log('═'.repeat(60));
      budgetRecommendations.slice(0, 5).forEach((rec, idx) => {
        console.log(`${idx + 1}. ${rec.item.name} - ${formatPrice(rec.item.price || 0)}`);
      });
      console.log('\n');
    }

    // Summary
    console.log('✅ DEMO COMPLETE!');
    console.log('═'.repeat(60));
    console.log('This demo showcased:');
    console.log('  ✓ Pinterest board analysis');
    console.log('  ✓ Style profile generation');
    console.log('  ✓ Personalized recommendations');
    console.log('  ✓ Wardrobe gap analysis');
    console.log('  ✓ Budget filtering');
    console.log('  ✓ Category grouping');
    console.log('  ✓ Shopping budget calculation');
    console.log('\n');

  } catch (error) {
    console.error('❌ Error running demo:', error);
    if (error instanceof Error) {
      console.error('   Message:', error.message);
      console.error('   Stack:', error.stack);
    }
    process.exit(1);
  }
}

// ============================================================================
// RUN THE DEMO
// ============================================================================

// Execute the demo
runDemo();
