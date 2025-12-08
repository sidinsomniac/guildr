import express, { Request, Response } from "express";
import cors from "cors";
import morgan from "morgan";
import { MarketStore } from "./market.store";

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.post("/api/v1/prices", (req: Request, res: Response) => {
  const { symbols } = req.body;

  if (!Array.isArray(symbols)) {
    return res.status(400).json({ error: "Input 'symbols' must be an array" });
  }

  const responseData: Record<string, number> = {};

  symbols.forEach((sym: string) => {
    const basePrice = MarketStore.getPrice(sym);
    const jitter = basePrice * (Math.random() * 0.02 - 0.01);

    responseData[sym] = Number((basePrice + jitter).toFixed(2));
  });

  res.json(responseData);
});


app.get("/api/v1/market-summary", (req, res) => {
  res.json({
    indices: {
      NIFTY_50: { value: MarketStore.getPrice("NIFTY_50"), change: "+0.45%" },
      SENSEX: { value: MarketStore.getPrice("SENSEX"), change: "+0.42%" },
    },
    rates: {
      FD_1YR: MarketStore.getRate("SBI_FD_1YR"),
    },
  });
});

app.listen(PORT, () => {
  console.log(`📈 Market Service running on http://localhost:${PORT}`);
});
