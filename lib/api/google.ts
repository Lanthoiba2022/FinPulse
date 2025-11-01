import axios from "axios";
import * as cheerio from "cheerio";
import { sleep, fetchPeEpsAll } from "./yahoo";

export interface GoogleMetrics {
  peTTM: number | null;
  latestEps: number | null;
}

async function fetchGoogleMetrics(ticker: string): Promise<GoogleMetrics> {
  // Expect ticker like HDFCBANK.NS or 532174.BO
  const [base, suffix] = ticker.split(".");
  const exchange = suffix === "BO" ? "BSE" : "NSE";
  const url = `https://www.google.com/finance/quote/${base}:${exchange}?hl=en&gl=IN`;
  const resp = await axios.get<string>(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "en-IN,en;q=0.9",
      "Referer": "https://www.google.com/",
    },
  });
  const $ = cheerio.load(resp.data);

  // Heuristic selectors; may change over time
  // Try the key-stats grid where metric titles are in div[aria-label]
  let peText = $("div[aria-label='P/E ratio']").next().text().trim();
  if (!peText) peText = $("div:contains('P/E ratio')").first().parent().find("div[data-attr]").last().text().trim();
  if (!peText) peText = $("div:contains('P/E')").first().next().text().trim();
  let epsText = $("div[aria-label='EPS']").next().text().trim();
  if (!epsText) epsText = $("div:contains('EPS')").first().parent().find("div[data-attr]").last().text().trim();
  if (!epsText) epsText = $("div:contains('Earnings per share')").first().next().text().trim();

  const pe = parseFloat(peText.replace(/[^0-9.\-]/g, ""));
  const eps = parseFloat(epsText.replace(/[^0-9.\-]/g, ""));

  return {
    peTTM: Number.isFinite(pe) ? pe : null,
    latestEps: Number.isFinite(eps) ? eps : null,
  };
}

export async function fetchGoogleAll(tickers: string[], delayMs = 0): Promise<Record<string, GoogleMetrics>> {
  const out: Record<string, GoogleMetrics> = {};
  const unique = Array.from(new Set(tickers.filter(Boolean)));
  const concurrency = 6;
  let i = 0;
  async function worker() {
    while (i < unique.length) {
      const t = unique[i++];
      try {
        out[t] = await fetchGoogleMetrics(t);
      } catch {
        out[t] = { peTTM: null, latestEps: null };
      }
      if (delayMs) await sleep(delayMs);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, unique.length) }, () => worker()));

  // Fallback fill via Yahoo for any null metrics
  const missing = unique.filter((t) => !out[t] || out[t].peTTM == null || out[t].latestEps == null);
  if (missing.length) {
    const yahoo = await fetchPeEpsAll(missing, 20);
    for (const t of missing) {
      const cur = out[t] ?? { peTTM: null, latestEps: null };
      const y = yahoo[t];
      out[t] = {
        peTTM: cur.peTTM ?? y?.peTTM ?? null,
        latestEps: cur.latestEps ?? y?.latestEps ?? null,
      };
    }
  }
  return out;
}


