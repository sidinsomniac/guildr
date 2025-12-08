import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { DashboardController } from './dashboard.controller';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/dashboard/:portfolioId', DashboardController.getDashboard);

app.listen(PORT, () => {
  console.log(`🚪 Gateway (BFF) running on http://localhost:${PORT}`);
});