import YahooFinance from "yahoo-finance2";

const yahooFinance = new YahooFinance();

async function sleep(ms: number): Promise<void> {
  await new Promise((res) => setTimeout(res, ms));
}

async function withRetries<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  let delay = 800;
  while (true) {
    try {
      return await fn();
    } catch (err) {
      attempt += 1;
      if (attempt > retries) throw err;
      await sleep(delay);
      delay = Math.min(delay * 2, 5000);
    }
  }
}

export async function fetchCmpBatch(tickers: string[]): Promise<Record<string, number | null>> {
  if (!tickers.length) return {};
  const unique = Array.from(new Set(tickers.filter(Boolean)));
  const result: Record<string, number | null> = {};

  const concurrency = 8;
  let i = 0;
  async function worker() {
    while (i < unique.length) {
      const t = unique[i++];
      try {
        const q = await withRetries(() => yahooFinance.quote(t));
        const price = (q as any)?.regularMarketPrice ?? (q as any)?.postMarketPrice ?? (q as any)?.preMarketPrice;
        result[t] = typeof price === "number" ? price : null;
      } catch {
        result[t] = null;
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, () => worker()));
  return result;
}

export interface YahooFundamentals {
  peTTM: number | null;
  latestEps: number | null;
}

export async function fetchPeEpsAll(tickers: string[], batchSize = 8): Promise<Record<string, YahooFundamentals>> {
  const out: Record<string, YahooFundamentals> = {};
  const unique = Array.from(new Set(tickers.filter(Boolean)));
  for (let i = 0; i < unique.length; i += batchSize) {
    const chunk = unique.slice(i, i + batchSize);
    const promises = chunk.map(async (t) => {
      try {
        const q = await withRetries(() => yahooFinance.quote(t));
        const pe = (q as any)?.trailingPE;
        const eps = (q as any)?.epsTrailingTwelveMonths ?? (q as any)?.epsCurrentYear;
        out[t] = {
          peTTM: typeof pe === "number" && Number.isFinite(pe) ? pe : null,
          latestEps: typeof eps === "number" && Number.isFinite(eps) ? eps : null,
        };
      } catch {
        out[t] = { peTTM: null, latestEps: null };
      }
    });
    await Promise.all(promises);
    if (i + batchSize < unique.length) await sleep(120);
  }
  return out;
}