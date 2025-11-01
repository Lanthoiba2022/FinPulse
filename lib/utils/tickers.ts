import type { Exchange } from "../types/portfolio";

const ALPHA_TICKER_REGEX = /^[A-Z&\-]+$/;
const NUMERIC_TICKER_REGEX = /^[0-9]{4,6}$/;

export interface DerivedTicker {
  ticker: string;
  exchange: Exchange;
}

export function deriveTicker(raw: unknown): DerivedTicker {
  if (typeof raw === "string") {
    const cleaned = raw.trim().toUpperCase();
    // Already qualified like ABC.NS or 532174.BO
    if (/\.(NS|BO)$/.test(cleaned)) {
      return {
        ticker: cleaned,
        exchange: cleaned.endsWith(".NS") ? "NSE" : "BSE",
      };
    }
    if (ALPHA_TICKER_REGEX.test(cleaned)) {
      return { ticker: `${cleaned}.NS`, exchange: "NSE" };
    }
    if (NUMERIC_TICKER_REGEX.test(cleaned)) {
      return { ticker: `${cleaned}.BO`, exchange: "BSE" };
    }
  }

  if (typeof raw === "number") {
    const code = String(Math.trunc(raw));
    if (NUMERIC_TICKER_REGEX.test(code)) {
      return { ticker: `${code}.BO`, exchange: "BSE" };
    }
  }

  // Fallback
  return { ticker: "UNKNOWN", exchange: "UNKNOWN" };
}


