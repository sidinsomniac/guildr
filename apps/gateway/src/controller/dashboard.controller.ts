import { Request, Response } from "express";
import axios from "axios";
import { config } from "../config/env";

const PORTFOLIO_SERVICE = config.PORTFOLIO_SERVICE_URL;
const MARKET_SERVICE = config.MARKET_SERVICE_URL;

export const DashboardController = {
  async getDashboard(req: Request, res: Response) {
    const { portfolioId } = req.params;

    try {
      const [portfolioRes, marketRes] = await Promise.all([
        axios.get(`${PORTFOLIO_SERVICE}/portfolios/${portfolioId}/summary`),
        axios.get(`${MARKET_SERVICE}/market-summary`),
      ]);
      const dashboardData = {
        portfolio: portfolioRes.data,
        market: marketRes.data,
        lastUpdated: new Date().toISOString(),
      };

      res.json(dashboardData);
    } catch (error: any) {
      console.error("Gateway Aggregation Error:", error);

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      res.status(500).json({
        error: "Failed to load dashboard",
        message: error.message || "Unknown error",
        code: "DASHBOARD_LOAD_ERROR",
      });
    }
  },

  async createUser(req: Request, res: Response) {
    const { email, name } = req.body;

    if (!email || !name) {
      return res.status(400).json({ error: "Missing 'email' or 'name'" });
    }

    try {
      const userRes = await axios.post(`${PORTFOLIO_SERVICE}/users`, {
        email,
        name,
      });

      res.status(201).json(userRes.data);
    } catch (error: any) {
      console.error("Create User Error:", error.message);

      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  },
  async createPortfolio(req: Request, res: Response) {
    try {
      const response = await axios.post(
        `${PORTFOLIO_SERVICE}/portfolios`,
        req.body
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      res
        .status(error.response?.status || 500)
        .json(error.response?.data || { error: "Proxy Error" });
    }
  },
  async addHoldings(req: Request, res: Response) {
    try {
      const response = await axios.post(
        `${PORTFOLIO_SERVICE}/holdings/bulk`,
        req.body
      );
      res.status(response.status).json(response.data);
    } catch (error: any) {
      res
        .status(error.response?.status || 500)
        .json(error.response?.data || { error: "Proxy Error" });
    }
  },
};
