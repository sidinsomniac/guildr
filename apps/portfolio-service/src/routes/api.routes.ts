import { Router } from 'express';
import { PortfolioController } from '../controllers/portfolio.controller';

const router = Router();


router.post('/users', PortfolioController.createUser);
router.post('/portfolios', PortfolioController.createPortfolio);
router.post('/holdings/bulk', PortfolioController.addHoldings);
router.get('/portfolios/:id', PortfolioController.getPortfolio);
router.get('/portfolios/:id/summary', PortfolioController.getPortfolioSummary);

export default router;