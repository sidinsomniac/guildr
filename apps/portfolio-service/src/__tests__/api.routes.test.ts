jest.mock('../services/portfolio.service');

import request from 'supertest';
import express from 'express';
import apiRoutes from '../routes/api.routes';
import { PortfolioService } from '../services/portfolio.service';

const app = express();
app.use(express.json());
app.use('/api/v1', apiRoutes);

describe('API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /api/v1/users should create user', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test', riskProfile: 'PENDING', createdAt: new Date(), updatedAt: new Date() };
    (PortfolioService.createUser as jest.Mock).mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/api/v1/users')
      .send({ email: 'test@example.com', name: 'Test' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('POST /api/v1/portfolios should create portfolio', async () => {
    const mockPortfolio = { id: 'portfolio-1', userId: 'user-1', name: 'My Portfolio', baseCurrency: 'USD', createdAt: new Date(), updatedAt: new Date() };
    (PortfolioService.createPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

    const res = await request(app)
      .post('/api/v1/portfolios')
      .send({ userId: 'user-1', name: 'My Portfolio', currency: 'USD' });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/v1/portfolios/:id should get portfolio', async () => {
    const mockPortfolio = { id: 'portfolio-1', userId: 'user-1', name: 'My Portfolio', baseCurrency: 'USD', createdAt: new Date(), updatedAt: new Date(), holdings: [] };
    (PortfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

    const res = await request(app).get('/api/v1/portfolios/portfolio-1');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('GET /api/v1/portfolios/:id/summary should get portfolio summary', async () => {
    const mockSummary = {
      totalValue: 100000,
      allocation: { EQUITY: 60, DEBT: 30, CASH: 10 },
      target: { EQUITY: 70, DEBT: 20, CASH: 10 },
    };
    (PortfolioService.getPortfolioSummary as jest.Mock).mockResolvedValue(mockSummary);

    const res = await request(app).get('/api/v1/portfolios/portfolio-1/summary');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('allocation');
    expect(res.body).toHaveProperty('totalValue');
  });

  it('POST /api/v1/holdings/bulk should add holdings with validation', async () => {
    const mockResult = { count: 1 };
    (PortfolioService.addHoldings as jest.Mock).mockResolvedValue(mockResult);

    const res = await request(app)
      .post('/api/v1/holdings/bulk')
      .send({
        portfolioId: '550e8400-e29b-41d4-a716-446655440000',
        holdings: [{ assetType: 'STOCK', symbol: 'AAPL', quantity: 10, buyPrice: 150, assetClass: 'EQUITY' }],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'Holdings added');
  });

  it('POST /api/v1/holdings/bulk should return 400 for invalid data', async () => {
    const res = await request(app)
      .post('/api/v1/holdings/bulk')
      .send({
        portfolioId: 'invalid-uuid',
        holdings: [{ assetType: 'INVALID', symbol: 'TEST', quantity: -5, buyPrice: 100, assetClass: 'EQUITY' }],
      });
    expect(res.statusCode).toBe(400);
  });
});
