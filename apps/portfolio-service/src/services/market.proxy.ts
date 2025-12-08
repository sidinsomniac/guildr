import axios from 'axios';

const MARKET_SERVICE_URL = 'http://localhost:3002/api/v1';

export const MarketProxy = {
  async getLivePrices(symbols: string[]): Promise<Record<string, number>> {
    if (symbols.length === 0) return {};

    try {
      const response = await axios.post(`${MARKET_SERVICE_URL}/prices`, {
        symbols
      });
      return response.data;
    } catch (error) {
      if (error instanceof Error) {
        console.error("⚠️ Failed to fetch live prices:", error.message);
      } else {
        console.error("⚠️ Failed to fetch live prices:", error);
      }
      return {};
    }
  }
};