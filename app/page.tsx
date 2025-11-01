"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { PortfolioResponse } from "./../lib/types/portfolio";
import LoadingSkeleton from "../components/LoadingSkeleton";
import Charts from "../components/Charts";
import SectorGroup from "../components/SectorGroup";

export default function Home() {
  const [data, setData] = useState<PortfolioResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchPortfolio = async () => {
    try {
      const resp = await fetch(`/api/portfolio`, { cache: "no-store" });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const json: PortfolioResponse = await resp.json();
      setData(json);
      setError(null);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load portfolio");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolio();
    intervalRef.current = setInterval(fetchPortfolio, 15000);
    const onVis = () => {
      if (document.hidden) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (!intervalRef.current) {
        intervalRef.current = setInterval(fetchPortfolio, 15000);
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Group holdings by sector
  const holdingsBySector = useMemo(() => {
    if (!data) return new Map<string, PortfolioResponse['holdings']>();
    const map = new Map<string, typeof data.holdings>();
    for (const h of data.holdings) {
      const existing = map.get(h.sector) || [];
      map.set(h.sector, [...existing, h]);
    }
    return map;
  }, [data]);

  const sectors = useMemo(() => {
    return Array.from(holdingsBySector.keys()).sort((a, b) => a.localeCompare(b));
  }, [holdingsBySector]);

  return (
    <div className="min-h-screen w-full bg-gray-50 font-sans">
      {/* Header */}
      <div className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-6 py-5 shadow-lg">
        <div className="mx-auto flex max-w-[1920px] items-center justify-between">
          <h1 className="text-2xl font-bold tracking-wide text-white md:text-3xl">FinPulse - Portfolio Dashboard</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto w-full max-w-[1920px] px-6 py-8">
        {error && (
          <div className="mb-6 rounded-lg border-l-4 border-red-500 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            {error}
          </div>
        )}

        {loading && <LoadingSkeleton />}

        {!loading && data && (
          <>
            {/* Status Bar */}
            <div className="mb-6 flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Last updated: {new Date(data.lastUpdated).toLocaleString()}
              </div>
            </div>

            {/* Summary Cards */}
            <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Total Investment</div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(data.totals.totalInvestment)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Present Value</div>
                <div className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(data.totals.totalPresentValue)}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Net Gain/Loss</div>
                <div className="flex items-center gap-2">
                  <div className={`text-2xl font-bold ${data.totals.totalGainLoss > 0 ? "text-emerald-600" : data.totals.totalGainLoss < 0 ? "text-red-600" : "text-gray-900"}`}>
                    {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(data.totals.totalGainLoss)}
                  </div>
                  <div className={`text-sm font-semibold ${data.totals.totalGainLoss > 0 ? "text-emerald-600" : data.totals.totalGainLoss < 0 ? "text-red-600" : "text-gray-900"}`}>
                    {data.totals.totalGainLoss > 0 ? "+" : ""}{((data.totals.totalGainLoss / data.totals.totalInvestment) * 100).toFixed(2)}%
                  </div>
                </div>
              </div>
            </div>
            
            {/* Charts */}
            <div className="mb-8">
              <Charts holdings={data.holdings} sectors={data.sectors} />
            </div>

            {/* Sector Groups */}
            <div className="space-y-6">
              {sectors.map((sector) => (
                <SectorGroup
                  key={sector}
                  sector={sector}
                  holdings={holdingsBySector.get(sector) || []}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
