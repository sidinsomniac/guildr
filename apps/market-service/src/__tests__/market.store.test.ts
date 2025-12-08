import { MarketStore, MOCK_PRICES, MOCK_RATES } from '../market.store';

describe('MarketStore', () => {
  describe('getPrice', () => {
    it('should return correct price for RELIANCE', () => {
      const price = MarketStore.getPrice('RELIANCE');
      expect(price).toBe(2450.0);
    });

    it('should return correct price for HDFCBANK', () => {
      const price = MarketStore.getPrice('HDFCBANK');
      expect(price).toBe(1580.0);
    });

    it('should return correct price for TCS', () => {
      const price = MarketStore.getPrice('TCS');
      expect(price).toBe(3500.0);
    });

    it('should return correct price for INFY', () => {
      const price = MarketStore.getPrice('INFY');
      expect(price).toBe(1400.0);
    });

    it('should return correct price for NIFTY_50', () => {
      const price = MarketStore.getPrice('NIFTY_50');
      expect(price).toBe(19500.0);
    });

    it('should return correct price for SENSEX', () => {
      const price = MarketStore.getPrice('SENSEX');
      expect(price).toBe(65000.0);
    });

    it('should return 0 for unknown symbol', () => {
      const price = MarketStore.getPrice('UNKNOWN_SYMBOL');
      expect(price).toBe(0);
    });

    it('should handle case-insensitive symbols', () => {
      const upperPrice = MarketStore.getPrice('RELIANCE');
      const lowerPrice = MarketStore.getPrice('reliance');
      const mixedPrice = MarketStore.getPrice('ReLiAnCe');

      expect(upperPrice).toBe(lowerPrice);
      expect(lowerPrice).toBe(mixedPrice);
      expect(upperPrice).toBe(2450.0);
    });

    it('should return 0 for empty string', () => {
      const price = MarketStore.getPrice('');
      expect(price).toBe(0);
    });

    it('should return all prices from MOCK_PRICES', () => {
      Object.keys(MOCK_PRICES).forEach((symbol) => {
        const price = MarketStore.getPrice(symbol);
        expect(price).toBe(MOCK_PRICES[symbol]);
      });
    });

    it('should handle ETF prices', () => {
      const price1 = MarketStore.getPrice('SBI_NIFTY_ETF');
      const price2 = MarketStore.getPrice('AXIS_BLUECHIP');

      expect(price1).toBe(210.5);
      expect(price2).toBe(45.2);
    });
  });

  describe('getRate', () => {
    it('should return correct rate for SBI_FD_1YR', () => {
      const rate = MarketStore.getRate('SBI_FD_1YR');
      expect(rate).toBe(6.8);
    });

    it('should return correct rate for SBI_FD_5YR', () => {
      const rate = MarketStore.getRate('SBI_FD_5YR');
      expect(rate).toBe(7.2);
    });

    it('should return correct rate for PPF', () => {
      const rate = MarketStore.getRate('PPF');
      expect(rate).toBe(7.1);
    });

    it('should return 0 for unknown rate', () => {
      const rate = MarketStore.getRate('UNKNOWN_RATE');
      expect(rate).toBe(0);
    });

    it('should handle case-insensitive rate symbols', () => {
      const upperRate = MarketStore.getRate('SBI_FD_1YR');
      const lowerRate = MarketStore.getRate('sbi_fd_1yr');
      const mixedRate = MarketStore.getRate('Sbi_Fd_1yr');

      expect(upperRate).toBe(lowerRate);
      expect(lowerRate).toBe(mixedRate);
      expect(upperRate).toBe(6.8);
    });

    it('should return 0 for empty string', () => {
      const rate = MarketStore.getRate('');
      expect(rate).toBe(0);
    });

    it('should return all rates from MOCK_RATES', () => {
      Object.keys(MOCK_RATES).forEach((symbol) => {
        const rate = MarketStore.getRate(symbol);
        expect(rate).toBe(MOCK_RATES[symbol]);
      });
    });
  });

  describe('MOCK_PRICES', () => {
    it('should contain all required stock symbols', () => {
      expect(MOCK_PRICES).toHaveProperty('RELIANCE');
      expect(MOCK_PRICES).toHaveProperty('HDFCBANK');
      expect(MOCK_PRICES).toHaveProperty('TCS');
      expect(MOCK_PRICES).toHaveProperty('INFY');
    });

    it('should contain all required indices', () => {
      expect(MOCK_PRICES).toHaveProperty('NIFTY_50');
      expect(MOCK_PRICES).toHaveProperty('SENSEX');
    });

    it('should contain all ETF prices', () => {
      expect(MOCK_PRICES).toHaveProperty('SBI_NIFTY_ETF');
      expect(MOCK_PRICES).toHaveProperty('AXIS_BLUECHIP');
    });

    it('should have positive prices for all symbols', () => {
      Object.values(MOCK_PRICES).forEach((price) => {
        expect(price).toBeGreaterThan(0);
      });
    });
  });

  describe('MOCK_RATES', () => {
    it('should contain all required fixed deposit rates', () => {
      expect(MOCK_RATES).toHaveProperty('SBI_FD_1YR');
      expect(MOCK_RATES).toHaveProperty('SBI_FD_5YR');
      expect(MOCK_RATES).toHaveProperty('PPF');
    });

    it('should have positive rates for all products', () => {
      Object.values(MOCK_RATES).forEach((rate) => {
        expect(rate).toBeGreaterThan(0);
      });
    });

    it('should have rates in expected range (4-10%)', () => {
      Object.values(MOCK_RATES).forEach((rate) => {
        expect(rate).toBeGreaterThanOrEqual(4);
        expect(rate).toBeLessThanOrEqual(10);
      });
    });

    it('should have 5-year rate higher than 1-year rate', () => {
      const rate1Yr = MarketStore.getRate('SBI_FD_1YR');
      const rate5Yr = MarketStore.getRate('SBI_FD_5YR');

      expect(rate5Yr).toBeGreaterThan(rate1Yr);
    });
  });
});
