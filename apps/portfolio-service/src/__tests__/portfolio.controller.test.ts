jest.mock('../services/portfolio.service');

import { PortfolioController } from '../controllers/portfolio.controller';
import { PortfolioService } from '../services/portfolio.service';
import { Request, Response } from 'express';

describe('PortfolioController', () => {
  const mockReq = (body = {}) => ({ body } as Request);
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn().mockReturnThis();
    return res as Response;
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test', riskProfile: 'PENDING', createdAt: new Date(), updatedAt: new Date() };
    (PortfolioService.createUser as jest.Mock).mockResolvedValue(mockUser);

    const req = mockReq({ email: 'test@example.com', name: 'Test' });
    const res = mockRes();

    await PortfolioController.createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockUser);
  });

  it('should handle error when creating a user', async () => {
    (PortfolioService.createUser as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const req = mockReq({ email: 'test@example.com', name: 'Test' });
    const res = mockRes();

    await PortfolioController.createUser(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create user' });
  });

  it('should create a portfolio successfully', async () => {
    const mockPortfolio = { id: 'portfolio-1', userId: 'user-1', name: 'My Portfolio', baseCurrency: 'USD', createdAt: new Date(), updatedAt: new Date() };
    (PortfolioService.createPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

    const req = mockReq({ userId: 'user-1', name: 'My Portfolio', currency: 'USD' });
    const res = mockRes();

    await PortfolioController.createPortfolio(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(mockPortfolio);
  });

  it('should handle error when creating a portfolio', async () => {
    (PortfolioService.createPortfolio as jest.Mock).mockRejectedValue(new Error('DB Error'));

    const req = mockReq({ userId: 'user-1', name: 'My Portfolio', currency: 'USD' });
    const res = mockRes();

    await PortfolioController.createPortfolio(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to create portfolio' });
  });
});
