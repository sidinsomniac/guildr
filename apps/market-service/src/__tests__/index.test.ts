import request from 'supertest';
import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { MarketStore } from '../market.store';

// Create app instance for testing
const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(morgan('dev'));

  app.post('/api/v1/prices', (req: Request, res: Response) => {
    const { symbols } = req.body;

    if (!Array.isArray(symbols)) {
      return res
        .status(400)
        .json({ error: "Input 'symbols' must be an array" });
    }

    const responseData: Record<string, number> = {};

    symbols.forEach((sym: string) => {
      const basePrice = MarketStore.getPrice(sym);
      const jitter = basePrice * (Math.random() * 0.02 - 0.01);

      responseData[sym] = Number((basePrice + jitter).toFixed(2));
    });

    res.json(responseData);
  });

  app.get('/api/v1/market-summary', (req, res) => {
    res.json({
      indices: {
        NIFTY_50: {
          value: MarketStore.getPrice('NIFTY_50'),
          change: '+0.45%',
        },
        SENSEX: { value: MarketStore.getPrice('SENSEX'), change: '+0.42%' },
      },
      rates: {
        FD_1YR: MarketStore.getRate('SBI_FD_1YR'),
      },
    });
  });

  return app;
};

describe('Market Service API', () => {
  let app: any;

  beforeEach(() => {
    app = createApp();
  });

  describe('POST /api/v1/prices', () => {
    it('should return prices for valid symbols', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: ['RELIANCE', 'TCS', 'INFY'] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('RELIANCE');
      expect(response.body).toHaveProperty('TCS');
      expect(response.body).toHaveProperty('INFY');
    });

    it('should return prices with jitter applied', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: ['RELIANCE'] });

      expect(response.status).toBe(200);
      const basePrice = MarketStore.getPrice('RELIANCE');
      const returnedPrice = response.body.RELIANCE;

      // Price should be within 1% of base price (jitter range is -1% to +1%)
      expect(returnedPrice).toBeGreaterThan(basePrice * 0.99);
      expect(returnedPrice).toBeLessThan(basePrice * 1.01);
    });

    it('should return 0 for unknown symbols', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: ['UNKNOWN_SYMBOL'] });

      expect(response.status).toBe(200);
      expect(response.body.UNKNOWN_SYMBOL).toBe(0);
    });

    it('should handle empty symbols array', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: [] });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({});
    });

    it('should return 400 for non-array symbols', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: 'RELIANCE' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe("Input 'symbols' must be an array");
    });

    it('should return 400 when symbols is an object', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: { symbol: 'RELIANCE' } });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Input 'symbols' must be an array");
    });

    it('should return 400 when symbols is missing', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({});

      expect(response.status).toBe(400);
    });

    it('should handle case-insensitive symbols', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: ['reliance', 'TCS', 'Infy'] });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('reliance');
      expect(response.body).toHaveProperty('TCS');
      expect(response.body).toHaveProperty('Infy');
      expect(response.body.reliance).toBeGreaterThan(0);
      expect(response.body.TCS).toBeGreaterThan(0);
      expect(response.body.Infy).toBeGreaterThan(0);
    });

    it('should return prices with 2 decimal places', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: ['RELIANCE'] });

      expect(response.status).toBe(200);
      const price = response.body.RELIANCE;
      const decimalPlaces = price.toString().split('.')[1]?.length || 0;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should handle multiple unknown symbols', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({
          symbols: ['UNKNOWN1', 'UNKNOWN2', 'RELIANCE', 'UNKNOWN3'],
        });

      expect(response.status).toBe(200);
      expect(response.body.UNKNOWN1).toBe(0);
      expect(response.body.UNKNOWN2).toBe(0);
      expect(response.body.UNKNOWN3).toBe(0);
      expect(response.body.RELIANCE).toBeGreaterThan(0);
    });
  });

  describe('GET /api/v1/market-summary', () => {
    it('should return market summary with correct structure', async () => {
      const response = await request(app).get('/api/v1/market-summary');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('indices');
      expect(response.body).toHaveProperty('rates');
    });

    it('should return NIFTY_50 and SENSEX indices', async () => {
      const response = await request(app).get('/api/v1/market-summary');

      expect(response.status).toBe(200);
      expect(response.body.indices).toHaveProperty('NIFTY_50');
      expect(response.body.indices).toHaveProperty('SENSEX');
    });

    it('should return correct values for indices', async () => {
      const response = await request(app).get('/api/v1/market-summary');

      expect(response.status).toBe(200);
      expect(response.body.indices.NIFTY_50.value).toBe(19500.0);
      expect(response.body.indices.SENSEX.value).toBe(65000.0);
    });

    it('should return correct change percentages', async () => {
      const response = await request(app).get('/api/v1/market-summary');

      expect(response.status).toBe(200);
      expect(response.body.indices.NIFTY_50.change).toBe('+0.45%');
      expect(response.body.indices.SENSEX.change).toBe('+0.42%');
    });

    it('should return FD rates', async () => {
      const response = await request(app).get('/api/v1/market-summary');

      expect(response.status).toBe(200);
      expect(response.body.rates).toHaveProperty('FD_1YR');
      expect(response.body.rates.FD_1YR).toBe(6.8);
    });

    it('should return consistent data on multiple requests', async () => {
      const response1 = await request(app).get('/api/v1/market-summary');
      const response2 = await request(app).get('/api/v1/market-summary');

      expect(response1.body).toEqual(response2.body);
    });
  });

  describe('Content-Type and Headers', () => {
    it('should return JSON content type for prices endpoint', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .send({ symbols: ['RELIANCE'] });

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should return JSON content type for market-summary endpoint', async () => {
      const response = await request(app).get('/api/v1/market-summary');

      expect(response.headers['content-type']).toMatch(/json/);
    });

    it('should accept JSON content type in prices endpoint', async () => {
      const response = await request(app)
        .post('/api/v1/prices')
        .set('Content-Type', 'application/json')
        .send({ symbols: ['RELIANCE'] });

      expect(response.status).toBe(200);
    });
  });
});
