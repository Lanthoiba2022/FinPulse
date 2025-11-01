import YahooFinance from "yahoo-finance2";
import axios from "axios";
import * as cheerio from "cheerio";

const yahooFinance = new YahooFinance();

export async function sleep(ms: number): Promise<void> {
  await new Promise((res) => setTimeout(res, ms));
}

async function withRetries<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  let attempt = 0;
  let delay = 800;
  // eslint-disable-next-line no-constant-condition
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

  // Fallback to Yahoo HTML if still null
  const missing = unique.filter((t) => result[t] == null);
  await Promise.all(missing.map(async (t) => {
    try {
      const url = `https://finance.yahoo.com/quote/${encodeURIComponent(t)}`;
      const resp = await axios.get<string>(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept-Language": "en-IN,en;q=0.9",
          "Referer": "https://finance.yahoo.com/",
        },
        timeout: 4000,
      });
      const $ = cheerio.load(resp.data);
      const valAttr = $("fin-streamer[data-field='regularMarketPrice']").attr("value");
      const textVal = $("fin-streamer[data-field='regularMarketPrice']").first().text();
      const parsed = parseFloat((valAttr || textVal || "").replace(/[^0-9.\-]/g, ""));
      if (Number.isFinite(parsed)) {
        result[t] = parsed;
        return;
      }
      const m = resp.data.match(/\"regularMarketPrice\":\{\"raw\":([0-9.\-]+)\,/);
      if (m && m[1]) {
        const p = parseFloat(m[1]);
        if (Number.isFinite(p)) result[t] = p;
      }
    } catch {
      // keep null
    }
  }));

  return result;
}

export interface YahooFundamentals {
  peTTM: number | null;
  latestEps: number | null;
}

export async function fetchPeEpsAll(tickers: string[], batchSize = 8): Promise<Record<string, YahooFundamentals>> {
  const out: Record<string, YahooFundamentals> = {};
  for (let i = 0; i < tickers.length; i += batchSize) {
    const chunk = Array.from(new Set(tickers.slice(i, i + batchSize).filter(Boolean)));
    for (const t of chunk) {
      try {
        const q = await withRetries(() => yahooFinance.quote(t));
        const pe = (q as any)?.trailingPE;
        const eps = (q as any)?.epsTrailingTwelveMonths;
        out[t] = {
          peTTM: typeof pe === "number" && Number.isFinite(pe) ? pe : null,
          latestEps: typeof eps === "number" && Number.isFinite(eps) ? eps : null,
        };
      } catch {
        out[t] = { peTTM: null, latestEps: null };
      }
      await sleep(120);
    }
  }
  return out;
}