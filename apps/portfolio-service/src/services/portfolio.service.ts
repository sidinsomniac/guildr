import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface CreatePortfolioInput {
  userId: string;
  name: string;
  currency: string;
}

interface AddHoldingInput {
  portfolioId: string;
  assetType: string; // STOCK, MF, FD
  symbol: string;
  quantity: number;
  buyPrice: number;
  assetClass: string; // EQUITY, DEBT, CASH
}

export const PortfolioService = {
  async createUser(email: string, name: string) {
    return prisma.user.create({
      data: { email, name, riskProfile: "PENDING" },
    });
  },

  async createPortfolio(data: CreatePortfolioInput) {
    return prisma.portfolio.create({
      data: {
        userId: data.userId,
        name: data.name,
        baseCurrency: data.currency,
      },
    });
  },

  async addHoldings(holdings: AddHoldingInput[]) {
    const formattedHoldings = holdings.map((h) => ({
      portfolioId: h.portfolioId,
      assetType: h.assetType,
      symbol: h.symbol,
      quantity: new Prisma.Decimal(h.quantity),
      buyPrice: new Prisma.Decimal(h.buyPrice),
      assetClass: h.assetClass,
    }));

    return prisma.holding.createMany({
      data: formattedHoldings,
    });
  },

  async getPortfolio(portfolioId: string) {
    return prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: { holdings: true },
    });
  },

  async getPortfolioSummary(portfolioId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        holdings: true,
        targets: true,
      },
    });
    
    console.log("Fetched portfolio:", portfolio); 
    if (!portfolio) throw new Error("Portfolio not found");

    let totalValue = 0;
    const allocation = {
      EQUITY: 0,
      DEBT: 0,
      CASH: 0,
    };

    for (const holding of portfolio.holdings) {
      const qty = Number(holding.quantity);
      const price = Number(holding.buyPrice);
      const currentValue = qty * price;

      totalValue += currentValue;

      const type = holding.assetClass as keyof typeof allocation;
      if (allocation[type] !== undefined) {
        allocation[type] += currentValue;
      }
    }

    // calculate Percentages
    const stats = {
      totalValue,
      allocation: {
        EQUITY: totalValue ? Math.round((allocation.EQUITY / totalValue) * 100 * 10000) / 10000 : 0,
        DEBT: totalValue ? Math.round((allocation.DEBT / totalValue) * 100 * 10000) / 10000 : 0,
        CASH: totalValue ? Math.round((allocation.CASH / totalValue) * 100 * 10000) / 10000 : 0,
      },
      target: portfolio.targets
        ? {
            EQUITY: Number(portfolio.targets.equityPct),
            DEBT: Number(portfolio.targets.debtPct),
            CASH: Number(portfolio.targets.cashPct),
          }
        : null,
    };

    return stats;
  },
};
