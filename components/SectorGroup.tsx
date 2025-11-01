"use client";
import React, { useState } from "react";
import type { HoldingWithLive } from "../lib/types/portfolio";
import { formatCurrency, formatPercentage } from "../lib/utils/formatters";
import { Card } from "./ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { ChevronUp, ChevronDown } from "lucide-react";
import StockRow from "./StockRow";

interface SectorGroupProps {
  sector: string;
  holdings: HoldingWithLive[];
}

export default function SectorGroup({ sector, holdings }: SectorGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  // Calculate sector totals
  const totals = holdings.reduce(
    (acc, h) => ({
      investment: acc.investment + h.investment,
      presentValue: acc.presentValue + h.presentValue,
      gainLoss: acc.gainLoss + h.gainLoss,
    }),
    { investment: 0, presentValue: 0, gainLoss: 0 }
  );

  const gainLossPercentage = totals.investment > 0
    ? (totals.gainLoss / totals.investment) * 100
    : 0;

  const isPositive = totals.gainLoss >= 0;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="overflow-hidden bg-white shadow-md transition-shadow hover:shadow-lg">
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              )}
              <div className="text-left">
                <h3 className="text-lg font-bold">{sector}</h3>
                <p className="text-sm text-gray-500">
                  {holdings.length} {holdings.length === 1 ? "stock" : "stocks"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-8 text-right">
              <div>
                <p className="text-xs text-gray-500 mb-1">Investment</p>
                <p className="font-semibold font-mono text-base">
                  {formatCurrency(totals.investment)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Current Value</p>
                <p className="font-semibold font-mono text-base">
                  {formatCurrency(totals.presentValue)}
                </p>
              </div>
              <div className="min-w-[160px]">
                <p className="text-xs text-gray-500 mb-1 text-right">Gain/Loss</p>
                <div className="flex items-center gap-3 justify-end">
                  <span
                    className={`font-semibold font-mono text-base ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {formatCurrency(totals.gainLoss)}
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      isPositive ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {gainLossPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr className="text-xs font-semibold text-gray-700">
                    <th className="text-left p-3 font-medium">Stock</th>
                    <th className="text-right p-3 font-medium">Purchase Price</th>
                    <th className="text-right p-3 font-medium">Qty</th>
                    <th className="text-right p-3 font-medium">Investment</th>
                    <th className="text-right p-3 font-medium">Portfolio %</th>
                    <th className="text-center p-3 font-medium">Exchange</th>
                    <th className="text-right p-3 font-medium">CMP</th>
                    <th className="text-right p-3 font-medium">Present Value</th>
                    <th className="text-right p-3 font-medium">Gain/Loss</th>
                    <th className="text-right p-3 font-medium">P/E Ratio</th>
                    <th className="text-left p-3 font-medium">Latest Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map((stock) => (
                    <StockRow key={`${stock.ticker}-${stock.name}`} stock={stock} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

