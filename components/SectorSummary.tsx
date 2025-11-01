"use client";
import React, { useMemo, useState } from "react";
import type { SectorGroupTotals } from "../lib/types/portfolio";
import { formatCurrency } from "../lib/utils/formatters";

interface SectorSummaryProps {
  sectors: SectorGroupTotals[];
}

export default function SectorSummary({ sectors }: SectorSummaryProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    for (const s of sectors) map[s.sector] = true; // default expanded
    return map;
  });

  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const sorted = useMemo(() => {
    const copy = [...sectors];
    copy.sort((a, b) => (sortAsc ? a.sector.localeCompare(b.sector) : b.sector.localeCompare(a.sector)));
    return copy;
  }, [sectors, sortAsc]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={() => setSortAsc((s) => !s)}
          className="text-xs text-blue-600 hover:underline dark:text-blue-400"
          aria-label="Sort sectors"
          title="Sort sectors"
        >
          Sort by sector {sortAsc ? "▲" : "▼"}
        </button>
      </div>
      {sorted.map((s) => (
        <div key={s.sector} className="rounded border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{s.sector}</h3>
            <button
              onClick={() => setExpanded((e) => ({ ...e, [s.sector]: !e[s.sector] }))}
              className="text-xs text-blue-600 hover:underline dark:text-blue-400"
            >
              {expanded[s.sector] ? "Collapse" : "Expand"}
            </button>
          </div>
          {expanded[s.sector] && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="rounded bg-gray-50 p-2 text-sm dark:bg-zinc-800">Investment: {formatCurrency(s.totalInvestment)}</div>
              <div className="rounded bg-gray-50 p-2 text-sm dark:bg-zinc-800">Present Value: {formatCurrency(s.totalPresentValue)}</div>
              <div className="rounded bg-gray-50 p-2 text-sm dark:bg-zinc-800">Gain/Loss: {formatCurrency(s.totalGainLoss)}</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}


