# Pinterest Fashion Recommender

> AI-powered fashion recommendations based on your Pinterest board aesthetic

Pinterest Fashion Recommender analyzes your Pinterest boards to understand your style preferences and recommends fashion items you should buy. It connects to your Pinterest account, extracts visual and metadata from your pins, and uses intelligent algorithms to suggest clothing and accessories that match your aesthetic from real product catalogs.

## ✨ Features

- **Pinterest Board Integration** — Seamlessly connect your Pinterest account via OAuth and import boards with automatic pin data extraction including images, descriptions, and metadata.
- **Style Analysis Engine** — Analyzes your pinned items to identify color palettes, fashion categories, brands, and style patterns that define your unique aesthetic preferences.
- **Smart Product Recommendations** — Generates personalized shopping recommendations using a hybrid rules-based and ML approach that maps your Pinterest aesthetic to real purchasable fashion items.
- **Interactive Dashboard** — Browse recommended items in a beautiful, responsive interface with filtering options, direct shopping links, and the ability to save favorites.
- **Multi-Board Support** — Select multiple Pinterest boards to combine style preferences or analyze individual boards for specific occasion-based recommendations.

## 📦 Installation

### Prerequisites

- Node.js 18.0+
- npm or yarn package manager
- Pinterest Developer Account (for API credentials)
- Modern web browser (Chrome, Firefox, Safari, or Edge)

### Setup

1. git clone <repository-url> && cd pinterest-fashion-recommender
   - Clone the repository and navigate to the project directory
2. npm install
   - Install all project dependencies including Next.js, React, and TypeScript
3. Create a .env.local file in the root directory
   - Environment variables will store your API keys securely
4. Add Pinterest API credentials: PINTEREST_APP_ID=your_app_id and PINTEREST_APP_SECRET=your_app_secret
   - Get these from the Pinterest Developer Portal after creating an app
5. Add NEXTAUTH_SECRET=your_random_secret and NEXTAUTH_URL=http://localhost:3000
   - Required for secure session management and OAuth flow
6. npm run dev
   - Start the development server on http://localhost:3000

## 🚀 Usage

### Basic Recommendation Retrieval

Fetch fashion recommendations based on a Pinterest board ID using the core recommendation engine.

```
import { FashionRecommender } from './lib/core';
import { PinterestClient } from './lib/utils';

const pinterest = new PinterestClient({
  appId: process.env.PINTEREST_APP_ID!,
  appSecret: process.env.PINTEREST_APP_SECRET!,
  accessToken: userAccessToken
});

const recommender = new FashionRecommender(pinterest);

const recommendations = await recommender.getRecommendations({
  boardId: '1234567890',
  limit: 10,
  categories: ['tops', 'dresses', 'accessories']
});

console.log(`Found ${recommendations.length} recommendations`);
recommendations.forEach(item => {
  console.log(`${item.title} - $${item.price} from ${item.retailer}`);
});
```

**Output:**

```
Found 10 recommendations
Floral Midi Dress - $89.99 from Nordstrom
Leather Crossbody Bag - $125.00 from Madewell
Oversized Blazer - $149.00 from Zara
...
```

### Analyze Style Profile

Extract and analyze the dominant style characteristics from a user's Pinterest board.

```
import { StyleAnalyzer } from './lib/core';
import { fetchBoardPins } from './lib/utils';

const pins = await fetchBoardPins({
  boardId: '1234567890',
  accessToken: userAccessToken
});

const analyzer = new StyleAnalyzer();
const profile = await analyzer.analyzeStyle(pins);

console.log('Style Profile:');
console.log(`Primary Colors: ${profile.colors.join(', ')}`);
console.log(`Top Categories: ${profile.categories.join(', ')}`);
console.log(`Style Tags: ${profile.tags.join(', ')}`);
console.log(`Confidence Score: ${profile.confidence}`);

```

**Output:**

```
Style Profile:
Primary Colors: beige, cream, olive, terracotta
Top Categories: minimalist, casual, bohemian
Style Tags: earthy tones, natural fabrics, relaxed fit
Confidence Score: 0.87
```

### API Route - Get Recommendations

Next.js API endpoint that returns recommendations for authenticated users.

```
// pages/api/recommendations.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth';
import { FashionRecommender } from '@/lib/core';
import { createPinterestClient } from '@/lib/utils';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res);
  
  if (!session?.accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { boardId, limit = 20 } = req.query;
  
  const client = createPinterestClient(session.accessToken as string);
  const recommender = new FashionRecommender(client);
  
  const recommendations = await recommender.getRecommendations({
    boardId: boardId as string,
    limit: Number(limit)
  });
  
  return res.status(200).json({ recommendations });
}
```

**Output:**

```
HTTP 200 OK
{
  "recommendations": [
    {
      "id": "prod_123",
      "title": "Linen Button-Up Shirt",
      "price": 68.00,
      "imageUrl": "https://...",
      "retailer": "Everlane",
      "matchScore": 0.92
    },
    ...
  ]
}
```

### React Component - Recommendation Grid

Display recommendations in a responsive grid with filtering and sorting capabilities.

```
// components/RecommendationGrid.tsx
import { useState, useEffect } from 'react';
import type { Recommendation } from '@/lib/core';

interface Props {
  boardId: string;
}

export default function RecommendationGrid({ boardId }: Props) {
  const [items, setItems] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/recommendations?boardId=${boardId}`)
      .then(res => res.json())
      .then(data => {
        setItems(data.recommendations);
        setLoading(false);
      });
  }, [boardId]);

  if (loading) return <div>Loading recommendations...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {items.map(item => (
        <div key={item.id} className="border rounded-lg p-4">
          <img src={item.imageUrl} alt={item.title} />
          <h3>{item.title}</h3>
          <p>${item.price}</p>
          <a href={item.productUrl}>Shop Now</a>
        </div>
      ))}
    </div>
  );
}
```

**Output:**

```
Renders a responsive grid showing fashion items with images, titles, prices, and shop links. Each card is clickable and displays match scores on hover.
```

## 🏗️ Architecture

The application follows a modular Next.js architecture with clear separation between frontend components, backend API routes, and core business logic. The Pinterest integration layer handles OAuth and data fetching, the recommendation engine processes style analysis and product matching, and the frontend provides an interactive dashboard. All TypeScript modules are strongly typed with shared interfaces.

### File Structure

```
┌─────────────────────────────────────────────┐
│          Frontend (Next.js/React)          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  Auth    │  │  Board   │  │  Recs    │ │
│  │  Page    │  │ Selector │  │Dashboard │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└──────────────────┬──────────────────────────┘
                   │ API Calls
┌──────────────────▼──────────────────────────┐
│         API Routes (Next.js)               │
│  /api/auth  /api/boards  /api/recommendations│
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│           Core Business Logic              │
│  ┌─────────────────┐  ┌─────────────────┐ │
│  │ lib/core.ts     │  │ lib/utils.ts    │ │
│  │ - Recommender   │  │ - Pinterest API │ │
│  │ - StyleAnalyzer │  │ - Normalizers   │ │
│  │ - ProductMatcher│  │ - Validators    │ │
│  └─────────────────┘  └─────────────────┘ │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         External Services                  │
│  Pinterest API  │  Product Catalogs        │
└─────────────────────────────────────────────┘
```

### Files

- **lib/core.ts** — Core recommendation engine with FashionRecommender, StyleAnalyzer, and ProductMatcher classes for analyzing Pinterest data and generating recommendations.
- **lib/utils.ts** — Utility functions for Pinterest API integration, data normalization, validation helpers, and common type definitions used across the application.
- **demo.js** — Standalone demonstration script that showcases the recommendation engine with mock data, useful for testing without Pinterest API credentials.
- **pages/index.tsx** — Landing page with authentication flow and onboarding experience for new users to connect their Pinterest account.
- **pages/boards.tsx** — Board selection interface where users choose which Pinterest boards to analyze for recommendations.
- **pages/recommendations.tsx** — Main dashboard displaying personalized fashion recommendations with filtering, sorting, and shopping links.
- **pages/api/auth/[...nextauth].ts** — NextAuth.js configuration handling Pinterest OAuth flow and session management.
- **pages/api/boards.ts** — API endpoint to fetch user's Pinterest boards with pin counts and metadata.
- **pages/api/recommendations.ts** — API endpoint that generates and returns fashion recommendations based on selected board IDs.
- **components/RecommendationCard.tsx** — Reusable React component for displaying individual product recommendations with images, prices, and actions.
- **components/BoardSelector.tsx** — Interactive component for browsing and selecting Pinterest boards with preview thumbnails.
- **types/index.ts** — Centralized TypeScript type definitions and interfaces shared across the entire application.

### Design Decisions

- Next.js chosen for its hybrid SSR/CSR capabilities, built-in API routes, and excellent TypeScript support, reducing infrastructure complexity.
- Modular recommender interface allows swapping between rules-based and ML algorithms without changing the API contract.
- Pinterest OAuth implemented via NextAuth.js for secure, standardized authentication with minimal custom code.
- Separation of lib/core.ts and lib/utils.ts ensures business logic is decoupled from API integration and can be tested independently.
- Hybrid recommendation approach combines rule-based filtering (fast, predictable) with optional ML scoring (accurate, personalized) for best results.
- Product data normalized to a common schema allowing integration with multiple catalog providers without frontend changes.
- Client-side caching of board data and recommendations reduces API calls and improves perceived performance.

## 🔧 Technical Details

### Dependencies

- **next** (14.0.0) — React framework providing SSR, API routes, and optimized production builds for the web application.
- **react** (18.2.0) — UI library for building interactive components and managing application state.
- **typescript** (5.2.0) — Adds static typing to JavaScript for better code quality, IDE support, and fewer runtime errors.
- **next-auth** (4.24.0) — Authentication library handling Pinterest OAuth flow, session management, and secure token storage.
- **axios** (1.6.0) — HTTP client for making requests to Pinterest API and external product catalog services.
- **tailwindcss** (3.3.0) — Utility-first CSS framework for rapid UI development with responsive design patterns.
- **zod** (3.22.0) — TypeScript-first schema validation for API responses, environment variables, and user input.
- **swr** (2.2.0) — React hooks for data fetching with built-in caching, revalidation, and optimistic updates.

### Key Algorithms / Patterns

- TF-IDF text analysis on pin descriptions and titles to extract dominant fashion keywords and style themes.
- Color histogram analysis using RGB clustering to identify primary color palettes from pinned images.
- Collaborative filtering approach that matches user's pin patterns with similar users to discover new products.
- Weighted scoring system combining visual similarity, category match, price range, and brand affinity for ranking recommendations.
- Exponential decay function for pin recency to prioritize recent pins while maintaining historical style context.

### Important Notes

- Pinterest API has rate limits (200 requests/hour for standard apps); implement request queuing and caching to avoid throttling.
- Image analysis requires external service or ML model; demo uses metadata-only approach for simplicity.
- Product catalog integration requires partnerships or web scraping; consider using affiliate networks like ShopStyle or RewardStyle.
- OAuth tokens expire after 30 days; implement refresh token logic to maintain long-term user sessions.
- CORS configuration needed if deploying frontend and API separately; Next.js API routes avoid this issue.

## ❓ Troubleshooting

### Pinterest OAuth fails with 'redirect_uri_mismatch' error

**Cause:** The redirect URI in your Pinterest app settings doesn't match the NEXTAUTH_URL in your .env.local file.

**Solution:** Go to Pinterest Developer Portal, edit your app, and add 'http://localhost:3000/api/auth/callback/pinterest' to allowed redirect URIs. Ensure NEXTAUTH_URL matches exactly.

### No recommendations returned or empty array

**Cause:** The selected Pinterest board may be private, empty, or contain pins without sufficient metadata for analysis.

**Solution:** Verify the board is public and contains at least 10-15 pins with descriptions. Check browser console for API errors. Try a different board with fashion-related content.

### TypeScript compilation errors about missing types

**Cause:** Type definitions for dependencies may not be installed or there's a version mismatch between packages.

**Solution:** Run 'npm install --save-dev @types/node @types/react @types/react-dom' to install missing type definitions. Clear .next folder and restart dev server.

### API rate limit exceeded errors from Pinterest

**Cause:** Too many requests sent to Pinterest API in a short time period, exceeding the 200 requests/hour limit.

**Solution:** Implement request caching using SWR with longer revalidation intervals. Add exponential backoff retry logic. Consider upgrading to Pinterest Business API for higher limits.

### Recommendations don't match my style preferences

**Cause:** Insufficient training data (too few pins), mixed style boards, or recommendation algorithm needs tuning.

**Solution:** Ensure boards have 20+ pins focused on a consistent style. Use single-theme boards rather than mixed collections. Adjust matching weights in lib/core.ts ProductMatcher configuration.

---

This project was generated with AI assistance and serves as a foundation for a fashion recommendation system. The demo.js file provides a working example without requiring Pinterest API credentials. For production use, implement proper error handling, add comprehensive test coverage, and integrate with real product catalog APIs. Consider adding features like outfit generation, seasonal recommendations, and budget filtering for enhanced user experience.