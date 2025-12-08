import request from 'supertest';
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import axios from 'axios';
import { DashboardController } from '../dashboard.controller';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Create app instance for testing
const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.get('/api/dashboard/:portfolioId', DashboardController.getDashboard);

  return app;
};

describe('Gateway - Dashboard Controller', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
    jest.clearAllMocks();
  });

  describe('GET /api/dashboard/:portfolioId', () => {
    const mockPortfolioData = {
      id: 'portfolio-123',
      userId: 'user-456',
      totalValue: 500000,
      stocks: [
        {
          symbol: 'RELIANCE',
          quantity: 100,
          currentPrice: 2450,
          totalValue: 245000,
        },
        {
          symbol: 'TCS',
          quantity: 50,
          currentPrice: 3500,
          totalValue: 175000,
        },
      ],
      holdings: 2,
    };

    const mockMarketData = {
      indices: {
        NIFTY_50: {
          value: 19500.0,
          change: '+0.45%',
        },
        SENSEX: {
          value: 65000.0,
          change: '+0.42%',
        },
      },
      rates: {
        FD_1YR: 6.8,
      },
    };

    it('should return aggregated dashboard data on success', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('portfolio');
      expect(response.body).toHaveProperty('market');
      expect(response.body).toHaveProperty('lastUpdated');
      expect(response.body.portfolio).toEqual(mockPortfolioData);
      expect(response.body.market).toEqual(mockMarketData);
    });

    it('should include lastUpdated timestamp', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      const beforeRequest = new Date().toISOString();
      const response = await request(app).get('/api/dashboard/portfolio-123');
      const afterRequest = new Date().toISOString();

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('lastUpdated');

      const lastUpdated = new Date(response.body.lastUpdated);
      const beforeDate = new Date(beforeRequest);
      const afterDate = new Date(afterRequest);

      expect(lastUpdated.getTime()).toBeGreaterThanOrEqual(
        beforeDate.getTime()
      );
      expect(lastUpdated.getTime()).toBeLessThanOrEqual(afterDate.getTime());
    });

    it('should call portfolio service with correct URL', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      const portfolioId = 'portfolio-123';
      await request(app).get(`/api/dashboard/${portfolioId}`);

      expect(mockedAxios.get).toHaveBeenCalledWith(
        `http://localhost:3001/api/v1/portfolios/${portfolioId}/summary`
      );
    });

    it('should call market service with correct URL', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      await request(app).get('/api/dashboard/portfolio-123');

      expect(mockedAxios.get).toHaveBeenCalledWith(
        'http://localhost:3002/api/v1/market-summary'
      );
    });

    it('should make parallel requests to both services', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      await request(app).get('/api/dashboard/portfolio-123');

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    });

    it('should return 404 when portfolio service returns 404', async () => {
      const error = {
        response: {
          status: 404,
          data: { error: 'Portfolio not found' },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Portfolio not found' });
    });

    it('should return 500 when portfolio service returns 500', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Internal server error' },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Internal server error' });
    });

    it('should return 500 when market service returns 500', async () => {
      const error = {
        response: {
          status: 500,
          data: { error: 'Market service unavailable' },
        },
      };
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.reject(error);
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: 'Market service unavailable' });
    });

    it('should handle network errors gracefully', async () => {
      const error = new Error('Network error');
      mockedAxios.get.mockRejectedValue(error);

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to load dashboard',
      });
    });

    it('should handle timeout errors', async () => {
      const error = new Error('Request timeout');
      mockedAxios.get.mockRejectedValue(error);

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to load dashboard',
      });
    });

    it('should handle partial failures with 503 status', async () => {
      const error = {
        response: {
          status: 503,
          data: { error: 'Service unavailable' },
        },
      };
      mockedAxios.get.mockRejectedValue(error);

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(503);
      expect(response.body).toEqual({ error: 'Service unavailable' });
    });

    it('should support different portfolio IDs', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      const portfolioIds = [
        'portfolio-123',
        'portfolio-456',
        'user-789-portfolio',
      ];

      for (const portfolioId of portfolioIds) {
        jest.clearAllMocks();
        mockedAxios.get.mockImplementation((url: string) => {
          if (url.includes('portfolio')) {
            return Promise.resolve({ data: mockPortfolioData });
          }
          return Promise.resolve({ data: mockMarketData });
        });

        const response = await request(app).get(`/api/dashboard/${portfolioId}`);

        expect(response.status).toBe(200);
        expect(mockedAxios.get).toHaveBeenCalledWith(
          `http://localhost:3001/api/v1/portfolios/${portfolioId}/summary`
        );
      }
    });

    it('should return correct content type', async () => {
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: mockPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should handle empty portfolio data', async () => {
      const emptyPortfolioData = {
        id: 'portfolio-empty',
        userId: 'user-456',
        totalValue: 0,
        stocks: [],
        holdings: 0,
      };

      jest.clearAllMocks();
      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: emptyPortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(200);
      expect(response.body.portfolio).toEqual(emptyPortfolioData);
      expect(response.body.portfolio.stocks.length).toBe(0);
    });

    it('should handle missing response property with error response', async () => {
      mockedAxios.get.mockImplementation(() => {
        const error = new Error('Network error without response');
        return Promise.reject(error);
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Failed to load dashboard',
      });
    });
    it('should return aggregated data with multiple stocks', async () => {
      const largePortfolioData = {
        id: 'portfolio-123',
        userId: 'user-456',
        totalValue: 1000000,
        stocks: [
          { symbol: 'RELIANCE', quantity: 100, currentPrice: 2450, totalValue: 245000 },
          { symbol: 'TCS', quantity: 50, currentPrice: 3500, totalValue: 175000 },
          { symbol: 'HDFCBANK', quantity: 200, currentPrice: 1580, totalValue: 316000 },
          { symbol: 'INFY', quantity: 100, currentPrice: 1400, totalValue: 140000 },
          { symbol: 'SBI', quantity: 500, currentPrice: 768, totalValue: 384000 },
        ],
        holdings: 5,
      };

      mockedAxios.get.mockImplementation((url: string) => {
        if (url.includes('portfolio')) {
          return Promise.resolve({ data: largePortfolioData });
        }
        return Promise.resolve({ data: mockMarketData });
      });

      const response = await request(app).get('/api/dashboard/portfolio-123');

      expect(response.status).toBe(200);
      expect(response.body.portfolio.holdings).toBe(5);
      expect(response.body.portfolio.stocks.length).toBe(5);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should log error messages', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = new Error('Test error message');
      mockedAxios.get.mockRejectedValueOnce(error);

      await request(app).get('/api/dashboard/portfolio-123');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Gateway Aggregation Error:',
        'Test error message'
      );

      consoleSpy.mockRestore();
    });
  });
});
