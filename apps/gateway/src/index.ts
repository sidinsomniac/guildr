import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRoutes from "./routes/api.routes";
import { config } from "./config/env";

const app = express();
const PORT = config.PORT;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api", apiRoutes);

app.listen(PORT, () => {
  console.log(`🚪 Gateway (BFF) running on http://localhost:${PORT}`);
});
