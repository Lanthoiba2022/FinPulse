# FinPulse - Portfolio Dashboard

A modern, real-time portfolio tracking and analytics dashboard built with Next.js. Track your stock investments with live market data, visual analytics, and comprehensive sector-wise breakdowns.

## ✨ Features

- **Real-time Market Data**: Live CMP (Current Market Price) fetched from Yahoo Finance API
- **Portfolio Analytics**: 
  - Total investment tracking
  - Real-time present value calculation
  - Gain/Loss analysis with percentage metrics
  - Portfolio allocation by percentage
- **Sector-wise Grouping**: Organize holdings by sectors with collapsible sections
- **Interactive Visualizations**:
  - Pie chart showing investment distribution by sector
  - Bar chart displaying gain/loss by sector
- **Auto-refresh**: Automatic data updates every 15 seconds
- **Smart Caching**: Server-side caching with 15-second TTL to optimize API calls
- **Responsive Design**: Fully optimized for mobile, tablet, and desktop devices
- **Performance Optimized**: Efficient data fetching with batching and retry mechanisms
- **Financial Metrics**: Includes P/E (TTM) ratios and latest EPS data

## 🛠 Tech Stack

### Frontend
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Radix UI](https://www.radix-ui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

### Backend & APIs
- **Runtime**: Node.js
- **Finance API**: [yahoo-finance2](https://www.npmjs.com/package/yahoo-finance2)
- **HTTP Client**: Axios

### Development Tools
- **Package Manager**: npm
- **Linting**: ESLint with Next.js config
- **Build Tool**: Next.js built-in

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or yarn/pnpm/bun)
- **Git**: For cloning the repository

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finpulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Prepare your portfolio data**

   Place your portfolio data file in the `data/` directory. The application supports multiple formats:
   
   - **Recommended**: `data/db.json` with structure:
     ```json
     {
       "holdings": [
         {
           "name": "Company Name",
           "sector": "Sector Name",
           "purchasePrice": 1000.00,
           "quantity": 10,
           "ticker": "SYMBOL.NS"
         }
       ]
     }
     ```
   
4. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

## 📖 Usage

### Dashboard Overview

The dashboard displays your portfolio with the following sections:

1. **Summary Cards**: Three key metrics at the top
   - Total Investment
   - Present Value
   - Net Gain/Loss (with percentage)

2. **Visual Analytics**:
   - Investment by Sector (Pie Chart)
   - Gain/Loss by Sector (Bar Chart)

3. **Sector Groups**: Collapsible sections showing:
   - Sector-level totals (Investment, Current Value, Gain/Loss)
   - Individual stock details with:
     - Stock name and exchange (NSE/BSE)
     - Purchase price and quantity
     - Current market price (CMP)
     - Investment and present value
     - Gain/Loss with percentage
     - P/E ratio and latest EPS

### Data Refresh

- The dashboard automatically refreshes every **15 seconds**
- Data fetching pauses when the browser tab is inactive
- Refresh resumes when you return to the tab

## 🏗 Project Structure

```
finpulse/
├── app/
│   ├── api/
│   │   └── portfolio/
│   │       └── route.ts          # Portfolio API endpoint
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main dashboard page
├── components/
│   ├── Charts.tsx                # Visualization components
│   ├── LoadingSkeleton.tsx       # Loading state component
│   ├── SectorGroup.tsx           # Sector grouping component
│   ├── StockRow.tsx              # Individual stock row
│   └── ui/                       # Reusable UI components
│       ├── card.tsx
│       └── collapsible.tsx
├── lib/
│   ├── api/
│   │   └── yahoo.ts              # Yahoo Finance API client
│   ├── cache/
│   │   └── simpleCache.ts        # In-memory cache implementation
│   ├── types/
│   │   └── portfolio.ts          # TypeScript type definitions
│   └── utils/
│       ├── calculations.ts       # Financial calculation utilities
│       ├── cn.ts                 # Class name utility
│       ├── formatters.ts         # Currency, percentage formatters
│       ├── normalizePortfolioTable.ts  # Data normalization
│       └── tickers.ts            # Ticker symbol utilities
├── data/
│   └── db.json                   # Portfolio data (add your file here)
├── public/                       # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Documentation

### GET `/api/portfolio`

Returns normalized portfolio data with live market information.

**Response Format:**
```typescript
{
  lastUpdated: string;          // ISO timestamp
  holdings: HoldingWithLive[];   // Array of stock holdings
  sectors: SectorGroupTotals[]; // Sector-wise aggregations
  totals: {
    totalInvestment: number;
    totalPresentValue: number;
    totalGainLoss: number;
  };
  usedCache: boolean;           // Whether cached data was used
}
```

**Caching:**
- Data is cached for 15 seconds
- Subsequent requests within the TTL return cached data
- Cache expires automatically after TTL period

**Performance:**
- Batched API calls (20 tickers per batch)
- Retry mechanism with exponential backoff
- Rate limiting with delays between batches

## ⚙️ Configuration

### Cache TTL

Default cache TTL is 15 seconds. To modify, edit `lib/cache/simpleCache.ts`:

```typescript
const DEFAULT_TTL_MS = 15_000; // Change this value
```

### API Batch Size

Modify batch size in `app/api/portfolio/route.ts`:

```typescript
await fetchCmpAll(tickers, 20); // Change batch size
```

### Auto-refresh Interval

Update the refresh interval in `app/page.tsx`:

```typescript
setInterval(fetchPortfolio, 15000); // 15 seconds
```

## 🧪 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js recommended rules
- Tailwind CSS for styling

## 🚢 Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Considerations

- The application uses in-memory caching (cleared on server restart)
- For production, consider implementing persistent caching (Redis, etc.)
- Ensure Yahoo Finance API rate limits are respected

### Deployment Platforms

Compatible with:
- [Vercel](https://vercel.com) (Recommended for Next.js)
- [Netlify](https://netlify.com)
- [AWS](https://aws.amazon.com)
- Any Node.js hosting platform

## 📝 Notes

- **Educational/Demo Purpose**: This project is for demonstration purposes
- **API Reliability**: Unofficial data sources (Yahoo Finance) may break without notice
- **Rate Limiting**: The application includes built-in rate limiting and batching to respect API limits
- **Data Privacy**: Portfolio data is processed locally and not sent to external services (except for market data APIs)

---
