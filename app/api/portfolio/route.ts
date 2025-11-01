import type { NextRequest } from "next/server";
import type { HoldingWithLive, PortfolioResponse, SectorGroupTotals } from "../../../lib/types/portfolio";
import { loadPortfolioRaw, normalizePortfolioTable } from "../../../lib/utils/normalizePortfolioTable";
import { calculateInvestment, calculatePresentValue, calculateGainLoss, calculatePortfolioPercentage } from "../../../lib/utils/calculations";
import { getCache, setCache } from "../../../lib/cache/simpleCache";
import { fetchCmpBatch, fetchPeEpsAll } from "../../../lib/api/yahoo";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CACHE_KEY = "portfolio-response-all-v1";

async function fetchCmpAll(tickers: string[], batchSize = 20): Promise<Record<string, number | null>> {
  const out: Record<string, number | null> = {};
  for (let i = 0; i < tickers.length; i += batchSize) {
    const chunk = tickers.slice(i, i + batchSize);
    const res = await fetchCmpBatch(chunk);
    Object.assign(out, res);
    await new Promise((r) => setTimeout(r, 250));
  }
  return out;
}

export async function GET(req: NextRequest) {
  const cached = getCache<PortfolioResponse>(CACHE_KEY);
  if (cached) {
    return Response.json({ ...cached.data, usedCache: true });
  }

  const rows = loadPortfolioRaw();
  const baseHoldings = normalizePortfolioTable(rows);

  const totalInvestment = baseHoldings.reduce((sum, h) => sum + calculateInvestment(h.purchasePrice, h.quantity), 0);

  const tickers = baseHoldings.map((h) => h.ticker).filter((t) => t !== "UNKNOWN");
  let cmpMap: Record<string, number | null> = {};
  let peeps: Record<string, { peTTM: number | null; latestEps: number | null }> = {};
  try {
    cmpMap = await fetchCmpAll(tickers, 20);
  } catch {
    cmpMap = {};
  }
  try {
    const yahooFund = await fetchPeEpsAll(tickers, 20);
    for (const t of Object.keys(yahooFund)) {
      const f = yahooFund[t];
      peeps[t] = { peTTM: f.peTTM, latestEps: f.latestEps };
    }
  } catch {
    peeps = {} as any;
  }

  const holdings: HoldingWithLive[] = baseHoldings.map((h) => {
    const cmp: number | null = cmpMap[h.ticker] ?? null;
    const g = peeps[h.ticker] || { peTTM: null, latestEps: null };
    const investment = calculateInvestment(h.purchasePrice, h.quantity);
    const presentValue = calculatePresentValue(cmp, h.quantity);
    const gainLoss = calculateGainLoss(presentValue, investment);
    const portfolioPercent = calculatePortfolioPercentage(investment, totalInvestment);

    return {
      ...h,
      cmp,
      peTTM: g.peTTM,
      latestEps: g.latestEps,
      investment,
      presentValue,
      gainLoss,
      portfolioPercent,
    };
  });

  const sectorsMap = new Map<string, SectorGroupTotals>();
  for (const h of holdings) {
    const entry = sectorsMap.get(h.sector) || {
      sector: h.sector,
      totalInvestment: 0,
      totalPresentValue: 0,
      totalGainLoss: 0,
    };
    entry.totalInvestment += h.investment;
    entry.totalPresentValue += h.presentValue;
    entry.totalGainLoss += h.gainLoss;
    sectorsMap.set(h.sector, entry);
  }

  const sectors = Array.from(sectorsMap.values());

  const totals = {
    totalInvestment,
    totalPresentValue: holdings.reduce((s, h) => s + h.presentValue, 0),
    totalGainLoss: holdings.reduce((s, h) => s + h.gainLoss, 0),
  };

  const response: PortfolioResponse = {
    lastUpdated: new Date().toISOString(),
    holdings,
    sectors,
    totals,
    usedCache: false,
  };

  setCache(CACHE_KEY, response);
  return Response.json(response);
}


