"use client";
import React, { useMemo, useState } from "react";
import type { HoldingWithLive, SectorGroupTotals } from "../lib/types/portfolio";
import { formatCurrency } from "../lib/utils/formatters";

interface ChartsProps {
  holdings: HoldingWithLive[];
  sectors: SectorGroupTotals[];
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const delta = endAngle - startAngle;
  const largeArcFlag = delta > 180 ? "1" : "0";
  return `M ${cx.toFixed(2)} ${cy.toFixed(2)} L ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${r.toFixed(2)} ${r.toFixed(2)} 0 ${largeArcFlag} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)} Z`;
}

const palette = [
  "#3b82f6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#ef4444",
  "#06b6d4",
  "#f97316",
  "#6366f1",
];

export default function Charts({ holdings, sectors }: ChartsProps) {
  const investmentBySector = useMemo(() => {
    const total = sectors.reduce((s, x) => s + x.totalInvestment, 0);
    return sectors.map((s, idx) => ({
      sector: s.sector,
      value: s.totalInvestment,
      percent: total ? (s.totalInvestment / total) * 100 : 0,
      color: palette[idx % palette.length],
    }));
  }, [sectors]);

  const gainLossBySector = useMemo(() => {
    const maxAbs = Math.max(1, ...sectors.map((s) => Math.abs(s.totalGainLoss)));
    return sectors.map((s, idx) => ({
      sector: s.sector,
      value: s.totalGainLoss,
      widthPct: (Math.abs(s.totalGainLoss) / maxAbs) * 100,
      color: s.totalGainLoss >= 0 ? "#10b981" : "#ef4444",
      bg: s.totalGainLoss >= 0 ? "#d1fae5" : "#fee2e2",
      text: s.totalGainLoss >= 0 ? "#065f46" : "#7f1d1d",
    }));
  }, [sectors]);

  const [hoveredSlice, setHoveredSlice] = useState<string | null>(null);

  const pie = useMemo(() => {
    const size = 220;
    const r = 110;
    const cx = size / 2;
    const cy = size / 2;
    let currentAngle = 0;
    const total = investmentBySector.reduce((sum, d) => sum + d.percent, 0);
    
    const slices = investmentBySector.map((d) => {
      const startAngle = currentAngle;
      const delta = (d.percent / total) * 360;
      const endAngle = currentAngle + delta;
      currentAngle = endAngle;
      const path = describeArc(cx, cy, r, startAngle, endAngle);
      return { ...d, path, startAngle, endAngle };
    });
    return { size, r, cx, cy, slices };
  }, [investmentBySector]);

  const hoveredData = hoveredSlice ? investmentBySector.find((d) => d.sector === hoveredSlice) : null;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-md transition-all hover:shadow-lg">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-900">Investment by Sector</h3>
        </div>
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
          <div className="relative flex-shrink-0">
            <svg 
              width={pie.size} 
              height={pie.size} 
              viewBox={`0 0 ${pie.size} ${pie.size}`}
              className="cursor-pointer drop-shadow-sm"
            >
              {pie.slices.map((s, i) => {
                const isHovered = hoveredSlice === s.sector;
                
                return (
                  <path
                    key={s.sector}
                    d={s.path}
                    fill={s.color}
                    stroke="white"
                    strokeWidth={isHovered ? 3 : 2}
                    strokeLinejoin="round"
                    className="transition-all duration-200"
                    style={{ 
                      opacity: hoveredSlice && !isHovered ? 0.5 : 1,
                      filter: isHovered ? 'brightness(1.1)' : 'none',
                    }}
                    onMouseEnter={() => setHoveredSlice(s.sector)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  />
                );
              })}
            </svg>
            
            {hoveredData && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none animate-in fade-in duration-200">
                <div className="bg-white rounded-md border border-gray-300 shadow-xl px-5 py-3 whitespace-nowrap">
                  <div className="text-sm font-normal text-gray-900">
                    <span className="font-medium">{hoveredData.sector}</span> : {formatCurrency(hoveredData.value)}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex-1 w-full lg:w-auto">
            <div className="space-y-2.5">
              {investmentBySector.map((d) => (
                <div
                  key={d.sector}
                  className={`flex items-center justify-between gap-4 rounded-full px-4 py-2.5 transition-all duration-200 ${
                    hoveredSlice === d.sector
                      ? 'bg-gray-100 shadow-sm scale-105'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                  onMouseEnter={() => setHoveredSlice(d.sector)}
                  onMouseLeave={() => setHoveredSlice(null)}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span
                      className="inline-block h-4 w-4 rounded-full flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: d.color }}
                    />
                    <span
                      className={`text-sm font-medium text-gray-700 truncate ${
                        hoveredSlice === d.sector ? 'font-semibold' : ''
                      }`}
                      title={d.sector}
                    >
                      {d.sector}
                    </span>
                  </div>
                  <div className={`text-sm font-bold tabular-nums text-gray-900 flex-shrink-0 ${
                    hoveredSlice === d.sector ? 'text-base' : ''
                  }`}>
                    {d.percent.toFixed(1)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 sm:p-6 shadow-sm transition-shadow hover:shadow-md">
        <div className="mb-2 sm:mb-4 flex items-center justify-between">
          <h3 className="text-xs sm:text-base font-semibold text-gray-900">Gain/Loss by Sector</h3>
        </div>
        <div className="space-y-1.5 sm:space-y-3">
          {gainLossBySector.map((d) => (
            <div key={d.sector} className="grid grid-cols-12 items-center gap-1.5 sm:gap-3">
              <div className="col-span-4 truncate text-xs sm:text-sm font-medium text-gray-700" title={d.sector}>{d.sector}</div>
              <div className="col-span-6">
                <div className="h-2.5 sm:h-4 w-full rounded-full bg-gray-200">
                  <div
                    className="h-2.5 sm:h-4 rounded-full transition-all"
                    style={{ width: `${d.widthPct}%`, backgroundColor: d.color }}
                    aria-hidden
                  />
                </div>
              </div>
              <div className="col-span-2 text-right text-xs sm:text-sm font-semibold" style={{ color: d.text }}>
                {formatCurrency(d.value)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


