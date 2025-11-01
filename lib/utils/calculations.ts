export function calculateInvestment(price: number, quantity: number): number {
  return Math.max(0, price) * Math.max(0, quantity);
}

export function calculatePresentValue(cmp: number | null, quantity: number): number {
  return (cmp ?? 0) * Math.max(0, quantity);
}

export function calculateGainLoss(presentValue: number, investment: number): number {
  return presentValue - investment;
}

export function calculatePortfolioPercentage(investment: number, totalInvestment: number): number {
  if (!totalInvestment) return 0;
  return (investment / totalInvestment) * 100;
}


