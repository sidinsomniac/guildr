import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import apiRoutes from './routes/api.routes';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json()); 

app.use('/api/v1', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'portfolio-service' });
});

app.listen(PORT, () => {
  console.log(`🚀 Portfolio Service running on http://localhost:${PORT}`);
});