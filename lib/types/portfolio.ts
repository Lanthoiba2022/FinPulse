export type Exchange = "NSE" | "BSE" | "UNKNOWN";

export interface HoldingInputRow {
  [key: string]: unknown;
}

export interface HoldingBase {
  name: string;
  ticker: string; // Derived like HDFCBANK.NS or 532174.BO
  exchange: Exchange;
  sector: string;
  purchasePrice: number;
  quantity: number; // allow fractional
}

export interface HoldingWithLive extends HoldingBase {
  cmp: number | null; // Current Market Price (live)
  peTTM: number | null; // Trailing P/E
  latestEps: number | null; // Most recent quarterly EPS
  investment: number;
  presentValue: number;
  gainLoss: number;
  portfolioPercent: number; // 0..100
}

export interface SectorGroupTotals {
  sector: string;
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}

export interface PortfolioTotals {
  totalInvestment: number;
  totalPresentValue: number;
  totalGainLoss: number;
}

export interface PortfolioResponse {
  lastUpdated: string; // ISO
  holdings: HoldingWithLive[];
  sectors: SectorGroupTotals[];
  totals: PortfolioTotals;
  usedCache: boolean;
  page?: number;
  limit?: number;
  totalCount?: number;
}


