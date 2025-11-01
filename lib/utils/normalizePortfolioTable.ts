import fs from "node:fs";
import path from "node:path";
import type { HoldingBase, HoldingInputRow } from "../types/portfolio";
import { deriveTicker } from "./tickers";

function isNumberLike(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function loadPortfolioRaw(): unknown[] {
  const cleanPath = path.join(process.cwd(), "data", "holdings.json");
  if (fs.existsSync(cleanPath)) {
    try {
      const json = fs.readFileSync(cleanPath, "utf8");
      const data = JSON.parse(json);
      if (Array.isArray(data)) return data;
    } catch {
    }
  }

  const dbPath = path.join(process.cwd(), "data", "db.json");
  if (fs.existsSync(dbPath)) {
    try {
      const json = fs.readFileSync(dbPath, "utf8");
      const data = JSON.parse(json);
      if (data && Array.isArray((data as any).holdings)) return (data as any).holdings as unknown[];
    } catch {
    }
  }

  const legacyPath = path.join(process.cwd(), "data", "portfolioTable.json");
  const json = fs.readFileSync(legacyPath, "utf8");
  const data = JSON.parse(json);
  if (!Array.isArray(data)) return [];
  return data;
}

export function normalizePortfolioTable(rows: unknown[]): HoldingBase[] {
  const holdings: HoldingBase[] = [];
  let currentSector = "Unknown";

  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const r = row as HoldingInputRow;

    if ("name" in r && "purchasePrice" in r && "quantity" in r && "sector" in r) {
      const name = String((r as any).name ?? "").trim();
      const sector = String((r as any).sector ?? "Unknown").trim();
      const purchasePrice = Number((r as any).purchasePrice);
      const quantity = Number((r as any).quantity);
    const rawSymbol = (r as any).ticker ?? (r as any).symbol;
    const { ticker, exchange } = deriveTicker(rawSymbol);
    if (name && Number.isFinite(purchasePrice) && Number.isFinite(quantity)) {
      holdings.push({ name, ticker, exchange, sector, purchasePrice, quantity });
      continue;
    }
  }

  const name = r["Column2"] as unknown;
  const purchasePrice = r["Column3"] as unknown;
  const quantity = r["Column4"] as unknown;
  const symbol = r["Column7"] as unknown;

  if (typeof name === "string" && !isNumberLike(purchasePrice) && !isNumberLike(quantity)) {
    const sectorCandidate = name.trim();
      if (sectorCandidate) currentSector = sectorCandidate;
      continue;
    }

    if (typeof name !== "string" || !isNumberLike(purchasePrice) || !isNumberLike(quantity)) {
      continue;
    }

    const { ticker, exchange } = deriveTicker(symbol);

    holdings.push({
      name: name.trim(),
      ticker,
      exchange,
      sector: currentSector.trim(),
      purchasePrice,
      quantity,
    });
  }

  return holdings;
}


