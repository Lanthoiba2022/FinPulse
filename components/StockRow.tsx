"use client";
import React from "react";
import type { HoldingWithLive } from "../lib/types/portfolio";
import { formatCurrency, formatNumber, formatPercentage } from "../lib/utils/formatters";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StockRowProps {
  stock: HoldingWithLive;
}

export default function StockRow({ stock }: StockRowProps) {
  const isPositive = stock.gainLoss >= 0;

  // Format latest earnings - showing EPS or placeholder
  // In the image it shows revenue like "₹6,586 Cr (Q3 FY24)" but we have EPS
  // For now showing EPS formatted, or placeholder
  const latestEarnings = stock.latestEps != null
    ? `₹ ${stock.latestEps}`
    : "—";

  return (
    <tr className="border-t hover:bg-gray-50/50 transition-colors">
      <td className="p-3">
        <div className="font-semibold">{stock.name}</div>
      </td>
      <td className="p-3 text-right font-mono text-sm">
        {formatCurrency(stock.purchasePrice)}
      </td>
      <td className="p-3 text-right font-mono text-sm">
        {stock.quantity % 1 === 0 ? stock.quantity.toFixed(0) : stock.quantity.toFixed(2)}
      </td>
      <td className="p-3 text-right font-mono text-sm">
        {formatCurrency(stock.investment)}
      </td>
      <td className="p-3 text-right font-mono text-sm">
        {formatPercentage(stock.portfolioPercent)}
      </td>
      <td className="p-3 text-center">
        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500 text-white">
          {stock.exchange}
        </span>
      </td>
      <td className="p-3 text-right font-mono text-sm font-semibold">
        {stock.cmp == null ? "—" : formatCurrency(stock.cmp)}
      </td>
      <td className="p-3 text-right font-mono text-sm font-semibold">
        {formatCurrency(stock.presentValue)}
      </td>
      <td className="p-3 text-right">
        <div className="flex items-center gap-2 justify-end">
          <div
            className={`flex items-center gap-1 font-mono text-sm font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? (
              <ArrowUp className="h-3 w-3" />
            ) : (
              <ArrowDown className="h-3 w-3" />
            )}
            {formatCurrency(Math.abs(stock.gainLoss))}
          </div>
          <span
            className={`text-xs font-semibold ${
              isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {isPositive ? "+" : ""}
            {(stock.investment > 0 ? ((stock.gainLoss / stock.investment) * 100).toFixed(2) : "0.00")}%
          </span>
        </div>
      </td>
      <td className="p-3 text-right font-mono text-sm">
        {stock.peTTM == null ? "—" : formatNumber(stock.peTTM, 2)}
      </td>
      <td className="p-3 text-sm text-left">
        {latestEarnings}
      </td>
    </tr>
  );
}

