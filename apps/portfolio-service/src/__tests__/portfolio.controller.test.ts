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

  it('should add holdings successfully with valid data', async () => {
    const mockResult = { count: 2 };
    (PortfolioService.addHoldings as jest.Mock).mockResolvedValue(mockResult);

    const req = mockReq({
      portfolioId: '550e8400-e29b-41d4-a716-446655440000',
      holdings: [
        { assetType: 'STOCK', symbol: 'AAPL', quantity: 10, buyPrice: 150, assetClass: 'EQUITY' },
        { assetType: 'FD', symbol: 'SBI-FD', quantity: 5, buyPrice: 1000, assetClass: 'DEBT' },
      ],
    });
    const res = mockRes();

    await PortfolioController.addHoldings(req, res);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'Holdings added', count: 2 });
  });

  it('should return 400 for invalid holdings data', async () => {
    const req = mockReq({
      portfolioId: 'invalid-uuid',
      holdings: [{ assetType: 'INVALID', symbol: 'TEST', quantity: -5, buyPrice: 100, assetClass: 'EQUITY' }],
    });
    const res = mockRes();

    await PortfolioController.addHoldings(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalled();
  });

  it('should get portfolio successfully', async () => {
    const mockPortfolio = { id: 'portfolio-1', userId: 'user-1', name: 'My Portfolio', baseCurrency: 'USD', holdings: [] };
    (PortfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

    const req = { params: { id: 'portfolio-1' } } as unknown as Request;
    const res = mockRes();

    await PortfolioController.getPortfolio(req, res);
    expect(res.json).toHaveBeenCalledWith(mockPortfolio);
  });

  it('should return 404 for non-existent portfolio', async () => {
    (PortfolioService.getPortfolio as jest.Mock).mockResolvedValue(null);

    const req = { params: { id: 'non-existent' } } as unknown as Request;
    const res = mockRes();

    await PortfolioController.getPortfolio(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not found' });
  });

  it('should get portfolio summary with allocation stats', async () => {
    const mockSummary = {
      totalValue: 100000,
      allocation: { EQUITY: 60, DEBT: 30, CASH: 10 },
      target: { EQUITY: 70, DEBT: 20, CASH: 10 },
    };
    (PortfolioService.getPortfolioSummary as jest.Mock).mockResolvedValue(mockSummary);

    const req = { params: { id: 'portfolio-1' } } as unknown as Request;
    const res = mockRes();

    await PortfolioController.getPortfolioSummary(req, res);
    expect(res.json).toHaveBeenCalledWith(mockSummary);
  });

  it('should handle error in portfolio summary calculation', async () => {
    (PortfolioService.getPortfolioSummary as jest.Mock).mockRejectedValue(new Error('Portfolio not found'));

    const req = { params: { id: 'invalid-id' } } as unknown as Request;
    const res = mockRes();

    await PortfolioController.getPortfolioSummary(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to calculate summary' });
  });
});
