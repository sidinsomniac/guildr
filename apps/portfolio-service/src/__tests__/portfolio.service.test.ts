jest.mock('../services/portfolio.service');

import { PortfolioService } from '../services/portfolio.service';

describe('PortfolioService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com', name: 'Test', riskProfile: 'PENDING', createdAt: new Date(), updatedAt: new Date() };
    (PortfolioService.createUser as jest.Mock).mockResolvedValue(mockUser);

    const user = await PortfolioService.createUser('test@example.com', 'Test');
    expect(user).toEqual(mockUser);
    expect(PortfolioService.createUser).toHaveBeenCalledWith('test@example.com', 'Test');
  });

  it('should create a portfolio', async () => {
    const mockPortfolio = { id: 'portfolio-1', userId: 'user-1', name: 'My Portfolio', baseCurrency: 'USD', createdAt: new Date(), updatedAt: new Date() };
    (PortfolioService.createPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

    const portfolio = await PortfolioService.createPortfolio({ userId: 'user-1', name: 'My Portfolio', currency: 'USD' });
    expect(portfolio).toEqual(mockPortfolio);
    expect(PortfolioService.createPortfolio).toHaveBeenCalled();
  });

  it('should add holdings', async () => {
    const mockResult = { count: 2 };
    (PortfolioService.addHoldings as jest.Mock).mockResolvedValue(mockResult);

    const result = await PortfolioService.addHoldings([{ portfolioId: 'p-1', assetType: 'STOCK', symbol: 'AAPL', quantity: 10, buyPrice: 150, assetClass: 'EQUITY' }]);
    expect(result).toEqual(mockResult);
    expect(PortfolioService.addHoldings).toHaveBeenCalled();
  });

  it('should get a portfolio', async () => {
    const mockPortfolio = { id: 'portfolio-1', userId: 'user-1', name: 'My Portfolio', baseCurrency: 'USD', createdAt: new Date(), updatedAt: new Date(), holdings: [] };
    (PortfolioService.getPortfolio as jest.Mock).mockResolvedValue(mockPortfolio);

    const portfolio = await PortfolioService.getPortfolio('portfolio-1');
    expect(portfolio).toBeDefined();
    expect(portfolio?.holdings).toBeInstanceOf(Array);
    expect(PortfolioService.getPortfolio).toHaveBeenCalledWith('portfolio-1');
  });

  it('should get portfolio summary with allocation stats', async () => {
    const mockSummary = {
      totalValue: 100000,
      allocation: {
        EQUITY: 60,
        DEBT: 30,
        CASH: 10,
      },
      target: {
        EQUITY: 70,
        DEBT: 20,
        CASH: 10,
      },
    };
    (PortfolioService.getPortfolioSummary as jest.Mock).mockResolvedValue(mockSummary);

    const summary = await PortfolioService.getPortfolioSummary('portfolio-1');
    expect(summary).toEqual(mockSummary);
    expect(summary.allocation.EQUITY).toBe(60);
    expect(summary.allocation.DEBT).toBe(30);
    expect(summary.allocation.CASH).toBe(10);
    expect(PortfolioService.getPortfolioSummary).toHaveBeenCalledWith('portfolio-1');
  });

  it('should handle portfolio not found error in summary', async () => {
    (PortfolioService.getPortfolioSummary as jest.Mock).mockRejectedValue(new Error('Portfolio not found'));

    await expect(PortfolioService.getPortfolioSummary('non-existent-id')).rejects.toThrow('Portfolio not found');
  });
});
