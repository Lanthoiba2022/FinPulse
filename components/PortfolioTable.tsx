"use client";
import React, { useMemo, useState } from "react";
import type { HoldingWithLive } from "../lib/types/portfolio";
import { formatCurrency, formatNumber, formatPercentage } from "../lib/utils/formatters";

interface PortfolioTableProps {
  holdings: HoldingWithLive[];
}

function cnGain(value: number): string {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-gray-600";
}

type SortKey =
  | "name"
  | "purchasePrice"
  | "quantity"
  | "investment"
  | "cmp"
  | "presentValue"
  | "gainLoss"
  | "portfolioPercent"
  | "exchange"
  | "peTTM"
  | "latestEps";

export default function PortfolioTable({ holdings }: PortfolioTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  function requestSort(key: SortKey) {
    setSortBy((prev) => {
      if (prev === key) {
        setSortAsc((s) => !s);
        return prev;
      }
      setSortAsc(true);
      return key;
    });
  }

  function sortIcon(key: SortKey): JSX.Element {
    const active = sortBy === key;
    const onClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (active) {
        setSortAsc((s) => !s);
      } else {
        setSortBy(key);
        setSortAsc(true);
      }
    };
    if (active) {
      // Single long arrow indicating direction
      return (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          className="inline-block align-middle cursor-pointer"
          onClick={onClick}
        >
          {sortAsc ? (
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <line x1="12" y1="20" x2="12" y2="6" />
              <polyline points="7,11 12,6 17,11" />
            </g>
          ) : (
            <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <line x1="12" y1="4" x2="12" y2="18" />
              <polyline points="7,13 12,18 17,13" />
            </g>
          )}
        </svg>
      );
    }
    // Inactive: show a faint bidirectional long arrow
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="inline-block align-middle cursor-pointer"
        onClick={onClick}
      >
        <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6">
          <line x1="12" y1="4" x2="12" y2="20" />
          <polyline points="7,9 12,4 17,9" />
          <polyline points="7,15 12,20 17,15" />
        </g>
      </svg>
    );
  }

  const sorted = useMemo(() => {
    const copy = [...holdings];
    const dir = sortAsc ? 1 : -1;
    function val(v: any) {
      if (v == null) return Number.NEGATIVE_INFINITY; // nulls last when ascending
      return v;
    }
    copy.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return dir * a.name.localeCompare(b.name);
        case "purchasePrice":
          return dir * (val(a.purchasePrice) - val(b.purchasePrice));
        case "quantity":
          return dir * (val(a.quantity) - val(b.quantity));
        case "investment":
          return dir * (val(a.investment) - val(b.investment));
        case "cmp":
          return dir * (val(a.cmp) - val(b.cmp));
        case "presentValue":
          return dir * (val(a.presentValue) - val(b.presentValue));
        case "gainLoss":
          return dir * (val(a.gainLoss) - val(b.gainLoss));
        case "portfolioPercent":
          return dir * (val(a.portfolioPercent) - val(b.portfolioPercent));
        case "exchange":
          return dir * a.exchange.localeCompare(b.exchange);
        case "peTTM":
          return dir * (val(a.peTTM) - val(b.peTTM));
        case "latestEps":
          return dir * (val(a.latestEps) - val(b.latestEps));
        default:
          return 0;
      }
    });
    return copy;
  }, [holdings, sortBy, sortAsc]);

  const totals = useMemo(() => {
    let investment = 0;
    let presentValue = 0;
    let gainLoss = 0;
    for (const h of holdings) {
      investment += h.investment;
      presentValue += h.presentValue;
      gainLoss += h.gainLoss;
    }
    return { investment, presentValue, gainLoss };
  }, [holdings]);

  return (
    <div className="">
      <table className="min-w-full divide-y divide-gray-200 text-xs md:text-sm dark:divide-zinc-800">
        <thead className="sticky top-0 z-10 bg-gray-50/90 backdrop-blur dark:bg-zinc-900/80">
          <tr>
            <th className="p-2 md:p-3 text-left font-semibold">
              <button
                type="button"
                onClick={() => requestSort("name")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by name"
                title="Sort by name"
              >
                Particulars
                <span className="ml-1">{sortIcon("name")}</span>
              </button>
            </th>
            <th className="p-2 md:p-3 text-left font-semibold">Sector</th>
            <th className="p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("purchasePrice")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by purchase price"
                title="Sort by purchase price"
              >
                Purchase Price
                <span className="ml-1">{sortIcon("purchasePrice")}</span>
              </button>
            </th>
            <th className="p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("quantity")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by quantity"
                title="Sort by quantity"
              >
                Quantity
                <span className="ml-1">{sortIcon("quantity")}</span>
              </button>
            </th>
            <th className="p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("investment")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by investment"
                title="Sort by investment"
              >
                Investment
                <span className="ml-1">{sortIcon("investment")}</span>
              </button>
            </th>
            <th className="p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("cmp")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by CMP"
                title="Sort by CMP"
              >
                CMP
                <span className="ml-1">{sortIcon("cmp")}</span>
              </button>
            </th>
            <th className="p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("presentValue")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by present value"
                title="Sort by present value"
              >
                Present Value
                <span className="ml-1">{sortIcon("presentValue")}</span>
              </button>
            </th>
            <th className="p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("gainLoss")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by gain/loss"
                title="Sort by gain/loss"
              >
                Gain/Loss
                <span className="ml-1">{sortIcon("gainLoss")}</span>
              </button>
            </th>
            <th className="hidden lg:table-cell p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("portfolioPercent")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by portfolio percent"
                title="Sort by portfolio percent"
              >
                Portfolio %
                <span className="ml-1">{sortIcon("portfolioPercent")}</span>
              </button>
            </th>
            <th className="hidden lg:table-cell p-2 md:p-3 text-left font-semibold">
              <button
                type="button"
                onClick={() => requestSort("exchange")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by exchange"
                title="Sort by exchange"
              >
                NSE/BSE
                <span className="ml-1">{sortIcon("exchange")}</span>
              </button>
            </th>
            <th className="hidden xl:table-cell p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("peTTM")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by P/E"
                title="Sort by P/E"
              >
                P/E (TTM)
                <span className="ml-1">{sortIcon("peTTM")}</span>
              </button>
            </th>
            <th className="hidden xl:table-cell p-2 md:p-3 text-right font-semibold">
              <button
                type="button"
                onClick={() => requestSort("latestEps")}
                className="inline-flex items-center gap-1 hover:underline"
                aria-label="Sort by latest EPS"
                title="Sort by latest EPS"
              >
                Latest EPS
                <span className="ml-1">{sortIcon("latestEps")}</span>
              </button>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
          {sorted.map((h) => (
            <tr key={`${h.ticker}-${h.name}`} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50/60 dark:odd:bg-zinc-900 dark:even:bg-zinc-950 dark:hover:bg-zinc-800/60 transition-colors">
              <td className="p-2 md:p-3">{h.name}</td>
              <td className="p-2 md:p-3">{h.sector}</td>
              <td className="p-2 md:p-3 text-right">{formatCurrency(h.purchasePrice)}</td>
              <td className="p-2 md:p-3 text-right">{h.quantity % 1 === 0 ? h.quantity.toFixed(0) : h.quantity.toFixed(2)}</td>
              <td className="p-2 md:p-3 text-right">{formatCurrency(h.investment)}</td>
              <td className="p-2 md:p-3 text-right">{h.cmp == null ? "—" : formatCurrency(h.cmp)}</td>
              <td className="p-2 md:p-3 text-right">{formatCurrency(h.presentValue)}</td>
              <td className="p-2 md:p-3 text-right">
                <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] md:text-xs font-medium ${h.gainLoss > 0 ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/25 dark:text-emerald-300" : h.gainLoss < 0 ? "bg-rose-50 text-rose-600 dark:bg-rose-900/25 dark:text-rose-300" : "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300"}`}>
                  {formatCurrency(h.gainLoss)}
                </span>
              </td>
              <td className="hidden lg:table-cell p-2 md:p-3 text-right">{formatPercentage(h.portfolioPercent)}</td>
              <td className="hidden lg:table-cell p-2 md:p-3">{h.exchange}</td>
              <td className="hidden xl:table-cell p-2 md:p-3 text-right">{h.peTTM == null ? "—" : formatNumber(h.peTTM, 2)}</td>
              <td className="hidden xl:table-cell p-2 md:p-3 text-right">{h.latestEps == null ? "—" : formatNumber(h.latestEps, 2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-50 text-xs md:text-sm font-medium dark:bg-zinc-900">
          <tr>
            <td className="p-2 md:p-3">Totals</td>
            <td className="p-2 md:p-3"></td>
            <td className="p-2 md:p-3 text-right"></td>
            <td className="p-2 md:p-3 text-right"></td>
            <td className="p-2 md:p-3 text-right">{formatCurrency(totals.investment)}</td>
            <td className="p-2 md:p-3 text-right"></td>
            <td className="p-2 md:p-3 text-right">{formatCurrency(totals.presentValue)}</td>
            <td className={`p-2 md:p-3 text-right ${cnGain(totals.gainLoss)}`}>{formatCurrency(totals.gainLoss)}</td>
            <td className="hidden lg:table-cell p-2 md:p-3"></td>
            <td className="hidden lg:table-cell p-2 md:p-3"></td>
            <td className="hidden xl:table-cell p-2 md:p-3 text-right"></td>
            <td className="hidden xl:table-cell p-2 md:p-3 text-right"></td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}


