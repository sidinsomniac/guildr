import { Request, Response } from "express";
import { PortfolioService } from "../services/portfolio.service";
import { z } from "zod";

const addHoldingsSchema = z.object({
  portfolioId: z.string().uuid(),
  holdings: z.array(
    z.object({
      assetType: z.enum(["STOCK", "MF", "FD", "CASH"]),
      symbol: z.string().min(1),
      quantity: z.number().positive(),
      buyPrice: z.number().nonnegative(),
      assetClass: z.enum(["EQUITY", "DEBT", "CASH"]),
    })
  ),
});

export const PortfolioController = {
  // POST /users
  async createUser(req: Request, res: Response) {
    try {
      const { email, name } = req.body;
      const user = await PortfolioService.createUser(email, name);
      res.status(201).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to create user" });
    }
  },

  // POST /portfolios
  async createPortfolio(req: Request, res: Response) {
    try {
      const { userId, name, currency } = req.body;
      const portfolio = await PortfolioService.createPortfolio({
        userId,
        name,
        currency,
      });
      res.status(201).json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Failed to create portfolio" });
    }
  },

  // POST /holdings/bulk
  async addHoldings(req: Request, res: Response) {
    try {
      const validatedData = addHoldingsSchema.parse(req.body);

      const holdingsWithPortfolioId = validatedData.holdings.map((holding) => ({
        ...holding,
        portfolioId: validatedData.portfolioId,
      }));
      const result = await PortfolioService.addHoldings(holdingsWithPortfolioId);

      res.status(201).json({ message: "Holdings added", count: result.count });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues });
      }
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // GET /portfolios/:id
  async getPortfolio(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const portfolio = await PortfolioService.getPortfolio(id);
      if (!portfolio) return res.status(404).json({ error: "Not found" });
      res.json(portfolio);
    } catch (error) {
      res.status(500).json({ error: "Error fetching portfolio" });
    }
  },
};
