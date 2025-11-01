// Popular Indian stocks whitelist (by common NSE symbol/name prefix)
// Matches against either derived ticker base (before .NS/.BO) or holding name case-insensitively.

const POPULAR_BASES = new Set<string>([
  "RELIANCE",
  "TCS",
  "INFY",
  "HDFCBANK",
  "ICICIBANK",
  "SBIN",
  "AXISBANK",
  "KOTAKBANK",
  "ITC",
  "LT",
  "LTIM",
  "HINDUNILVR",
  "TATAMOTORS",
  "MARUTI",
  "TATAPOWER",
  "TATACONSUMER",
  "PIDILITIND",
  "ASTRAL",
  "POLYCAB",
  "ASIANPAINT",
  "ULTRACEMCO",
  "BHARTIARTL",
  "SUNPHARMA",
  "BAJFINANCE",
  "BAJAJFINSV",
  "HCLTECH",
  "WIPRO",
  "TECHM",
  "POWERGRID",
  "NTPC",
  "ONGC",
  "COALINDIA",
  "TITAN",
  "NESTLEIND",
  "BRITANNIA",
  "ADANIENT",
  "ADANIPORTS",
]);

export function isPopularSymbol(ticker: string, name: string): boolean {
  const base = (ticker || "").toUpperCase().split(".")[0];
  if (POPULAR_BASES.has(base)) return true;
  const nameUpper = (name || "").toUpperCase();
  for (const sym of POPULAR_BASES) {
    if (nameUpper.includes(sym)) return true;
  }
  return false;
}


