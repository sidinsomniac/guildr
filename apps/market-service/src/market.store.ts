export const MOCK_PRICES: Record<string, number> = {
  RELIANCE: 2450.0,
  HDFCBANK: 1580.0,
  TCS: 3500.0,
  INFY: 1400.0,

  SBI_NIFTY_ETF: 210.5,
  AXIS_BLUECHIP: 45.2,

  NIFTY_50: 19500.0,
  SENSEX: 65000.0,
};

export const MOCK_RATES: Record<string, number> = {
  SBI_FD_1YR: 6.8,
  SBI_FD_5YR: 7.2,
  PPF: 7.1,
};

export const MarketStore = {
  getPrice(symbol: string): number {
    return MOCK_PRICES[symbol.toUpperCase()] || 0;
  },

  getRate(symbol: string): number {
    return MOCK_RATES[symbol.toUpperCase()] || 0;
  },
};
