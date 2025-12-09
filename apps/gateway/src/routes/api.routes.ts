import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";

const router = Router();

router.post("/users", DashboardController.createUser);
router.get("/dashboard/:portfolioId", DashboardController.getDashboard);

export default router;
