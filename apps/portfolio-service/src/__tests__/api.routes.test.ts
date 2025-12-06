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
});
