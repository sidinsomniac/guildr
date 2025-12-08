import { Request, Response } from 'express';
import axios from 'axios';

const PORTFOLIO_SERVICE = 'http://localhost:3001/api/v1';
const MARKET_SERVICE = 'http://localhost:3002/api/v1';

export const DashboardController = {
  async getDashboard(req: Request, res: Response) {
    const { portfolioId } = req.params;

    try {
      const [portfolioRes, marketRes] = await Promise.all([
        axios.get(`${PORTFOLIO_SERVICE}/portfolios/${portfolioId}/summary`),
        axios.get(`${MARKET_SERVICE}/market-summary`)
      ]);
      const dashboardData = {
        portfolio: portfolioRes.data,
        market: marketRes.data,
        lastUpdated: new Date().toISOString()
      };

      res.json(dashboardData);

    } catch (error: any) {
      console.error("Gateway Aggregation Error:", error.message);
      
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      res.status(500).json({ error: "Failed to load dashboard" });
    }
  }
};