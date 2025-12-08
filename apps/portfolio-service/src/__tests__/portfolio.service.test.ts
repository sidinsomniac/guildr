import { PortfolioService } from '../services/portfolio.service';

// Mock Prisma Client
jest.mock('@prisma/client', () => {
  const mockPrisma = {
    user: {
      create: jest.fn(),
    },
    portfolio: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    holding: {
      createMany: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrisma),
    Prisma: {
      Decimal: jest.fn((value) => ({
        toString: () => value.toString(),
        toNumber: () => Number(value),
        valueOf: () => Number(value),
      })),
    },
  };
});

jest.mock('@prisma/adapter-pg');
jest.mock('pg');

describe('PortfolioService', () => {
  let prismaClientMock: any;

  beforeEach(() => {
    jest.clearAllMocks();
    const { PrismaClient } = require('@prisma/client');
    prismaClientMock = new PrismaClient();
  });

  describe('createUser', () => {
    it('should create a user with email and name', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
        name: 'Test User',
        riskProfile: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClientMock.user.create.mockResolvedValue(mockUser);

      const user = await PortfolioService.createUser('test@example.com', 'Test User');

      expect(prismaClientMock.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          riskProfile: 'PENDING',
        },
      });
      expect(user.email).toBe('test@example.com');
      expect(user.riskProfile).toBe('PENDING');
    });

    it('should throw error on database failure', async () => {
      prismaClientMock.user.create.mockRejectedValue(new Error('Database error'));

      await expect(PortfolioService.createUser('error@example.com', 'Error User')).rejects.toThrow('Database error');
    });
  });

  describe('createPortfolio', () => {
    it('should create a portfolio with user ID, name, and currency', async () => {
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClientMock.portfolio.create.mockResolvedValue(mockPortfolio);

      const portfolio = await PortfolioService.createPortfolio({
        userId: 'user-1',
        name: 'Test Portfolio',
        currency: 'USD',
      });

      expect(prismaClientMock.portfolio.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          name: 'Test Portfolio',
          baseCurrency: 'USD',
        },
      });
      expect(portfolio.baseCurrency).toBe('USD');
    });

    it('should throw error when user ID is invalid', async () => {
      prismaClientMock.portfolio.create.mockRejectedValue(new Error('Invalid userId'));

      await expect(
        PortfolioService.createPortfolio({ userId: 'invalid', name: 'Test', currency: 'USD' })
      ).rejects.toThrow('Invalid userId');
    });
  });

  describe('addHoldings', () => {
    it('should add multiple holdings to a portfolio', async () => {
      const mockResult = { count: 2 };
      prismaClientMock.holding.createMany.mockResolvedValue(mockResult);

      const holdings = [
        {
          portfolioId: 'portfolio-1',
          assetType: 'STOCK',
          symbol: 'AAPL',
          quantity: 10,
          buyPrice: 150,
          assetClass: 'EQUITY',
        },
        {
          portfolioId: 'portfolio-1',
          assetType: 'FD',
          symbol: 'SBI-FD',
          quantity: 5,
          buyPrice: 1000,
          assetClass: 'DEBT',
        },
      ];

      const result = await PortfolioService.addHoldings(holdings);

      expect(prismaClientMock.holding.createMany).toHaveBeenCalled();
      expect(result.count).toBe(2);
    });

    it('should handle fractional quantities for crypto', async () => {
      const mockResult = { count: 1 };
      prismaClientMock.holding.createMany.mockResolvedValue(mockResult);

      const holdings = [
        {
          portfolioId: 'portfolio-1',
          assetType: 'CRYPTO',
          symbol: 'BTC',
          quantity: 0.0001,
          buyPrice: 50000,
          assetClass: 'EQUITY',
        },
      ];

      const result = await PortfolioService.addHoldings(holdings);
      expect(result.count).toBe(1);
    });

    it('should throw error on invalid portfolio ID', async () => {
      prismaClientMock.holding.createMany.mockRejectedValue(new Error('Invalid portfolioId'));

      const holdings = [
        {
          portfolioId: 'invalid',
          assetType: 'STOCK',
          symbol: 'TEST',
          quantity: 10,
          buyPrice: 100,
          assetClass: 'EQUITY',
        },
      ];

      await expect(PortfolioService.addHoldings(holdings)).rejects.toThrow('Invalid portfolioId');
    });
  });

  describe('getPortfolio', () => {
    it('should fetch portfolio with holdings', async () => {
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
        createdAt: new Date(),
        updatedAt: new Date(),
        holdings: [
          {
            id: 'holding-1',
            portfolioId: 'portfolio-1',
            assetType: 'STOCK',
            symbol: 'AAPL',
            quantity: 10,
            buyPrice: 150,
            assetClass: 'EQUITY',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      };

      prismaClientMock.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const portfolio = await PortfolioService.getPortfolio('portfolio-1');

      expect(prismaClientMock.portfolio.findUnique).toHaveBeenCalledWith({
        where: { id: 'portfolio-1' },
        include: { holdings: true },
      });
      expect(portfolio?.holdings).toHaveLength(1);
      expect(portfolio?.holdings?.[0].symbol).toBe('AAPL');
    });

    it('should return null if portfolio not found', async () => {
      prismaClientMock.portfolio.findUnique.mockResolvedValue(null);

      const portfolio = await PortfolioService.getPortfolio('non-existent');

      expect(portfolio).toBeNull();
    });

    it('should throw error on database connection failure', async () => {
      prismaClientMock.portfolio.findUnique.mockRejectedValue(new Error('Connection failed'));

      await expect(PortfolioService.getPortfolio('portfolio-1')).rejects.toThrow('Connection failed');
    });
  });

  describe('getPortfolioSummary', () => {
    it('should calculate portfolio summary with mixed allocations', async () => {
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
        holdings: [
          {
            id: 'h-1',
            portfolioId: 'portfolio-1',
            assetType: 'STOCK',
            symbol: 'AAPL',
            quantity: 10,
            buyPrice: 150,
            assetClass: 'EQUITY',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'h-2',
            portfolioId: 'portfolio-1',
            assetType: 'FD',
            symbol: 'SBI-FD',
            quantity: 5,
            buyPrice: 1000,
            assetClass: 'DEBT',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        targets: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClientMock.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const summary = await PortfolioService.getPortfolioSummary('portfolio-1');

      expect(summary.totalValue).toBe(6500); // (10*150) + (5*1000)
      expect(summary.allocation.EQUITY).toBe(23.0769); // (1500/6500)*100 rounded to 4 decimals
      expect(summary.allocation.DEBT).toBe(76.9231); // (5000/6500)*100 rounded to 4 decimals
      expect(summary.allocation.CASH).toBe(0);
    });

    it('should calculate portfolio summary with target allocations', async () => {
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
        holdings: [
          {
            id: 'h-1',
            portfolioId: 'portfolio-1',
            assetType: 'STOCK',
            symbol: 'TCS',
            quantity: 100,
            buyPrice: 3500,
            assetClass: 'EQUITY',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        targets: {
          id: 't-1',
          portfolioId: 'portfolio-1',
          equityPct: 60,
          debtPct: 30,
          cashPct: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClientMock.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const summary = await PortfolioService.getPortfolioSummary('portfolio-1');

      expect(summary.totalValue).toBe(350000);
      expect(summary.allocation.EQUITY).toBe(100);
      expect(summary.target).not.toBeNull();
      expect(summary.target?.EQUITY).toBe(60);
    });

    it('should handle empty portfolio (no holdings)', async () => {
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Empty Portfolio',
        baseCurrency: 'USD',
        holdings: [],
        targets: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClientMock.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const summary = await PortfolioService.getPortfolioSummary('portfolio-1');

      expect(summary.totalValue).toBe(0);
      expect(summary.allocation.EQUITY).toBe(0);
      expect(summary.allocation.DEBT).toBe(0);
      expect(summary.allocation.CASH).toBe(0);
    });

    it('should throw error when portfolio not found', async () => {
      prismaClientMock.portfolio.findUnique.mockResolvedValue(null);

      await expect(PortfolioService.getPortfolioSummary('non-existent')).rejects.toThrow('Portfolio not found');
    });

    it('should round percentages to exactly 4 decimal places', async () => {
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
        holdings: [
          {
            id: 'h-1',
            portfolioId: 'portfolio-1',
            assetType: 'STOCK',
            symbol: 'TEST',
            quantity: 333,
            buyPrice: 100,
            assetClass: 'EQUITY',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'h-2',
            portfolioId: 'portfolio-1',
            assetType: 'MF',
            symbol: 'TEST2',
            quantity: 334,
            buyPrice: 100,
            assetClass: 'DEBT',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'h-3',
            portfolioId: 'portfolio-1',
            assetType: 'CASH',
            symbol: 'TEST3',
            quantity: 333,
            buyPrice: 100,
            assetClass: 'CASH',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        targets: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClientMock.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const summary = await PortfolioService.getPortfolioSummary('portfolio-1');

      const equityDecimal = summary.allocation.EQUITY.toString().split('.')[1];
      const debtDecimal = summary.allocation.DEBT.toString().split('.')[1];
      const cashDecimal = summary.allocation.CASH.toString().split('.')[1];

      expect(equityDecimal.length).toBeLessThanOrEqual(4);
      expect(debtDecimal.length).toBeLessThanOrEqual(4);
      expect(cashDecimal.length).toBeLessThanOrEqual(4);
    });

    it('should correctly allocate holdings by asset class', async () => {
      const mockPortfolio = {
        id: 'portfolio-1',
        userId: 'user-1',
        name: 'Test Portfolio',
        baseCurrency: 'USD',
        holdings: [
          {
            id: 'h-1',
            portfolioId: 'portfolio-1',
            assetType: 'STOCK',
            symbol: 'AAPL',
            quantity: 10,
            buyPrice: 100,
            assetClass: 'EQUITY',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'h-2',
            portfolioId: 'portfolio-1',
            assetType: 'STOCK',
            symbol: 'MSFT',
            quantity: 10,
            buyPrice: 100,
            assetClass: 'EQUITY',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'h-3',
            portfolioId: 'portfolio-1',
            assetType: 'FD',
            symbol: 'FD1',
            quantity: 10,
            buyPrice: 100,
            assetClass: 'DEBT',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        targets: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      prismaClientMock.portfolio.findUnique.mockResolvedValue(mockPortfolio);

      const summary = await PortfolioService.getPortfolioSummary('portfolio-1');

      expect(summary.totalValue).toBe(3000); // 1000 + 1000 + 1000
      expect(summary.allocation.EQUITY).toBe(66.6667); // 2000/3000 * 100
      expect(summary.allocation.DEBT).toBe(33.3333); // 1000/3000 * 100
    });
  });
});
