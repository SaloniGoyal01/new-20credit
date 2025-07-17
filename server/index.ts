import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  analyzeTransaction,
  verifyOtp,
  getTransactionHistory,
  getFlaggedTransactions,
  getSystemMetrics,
  generateAiSuggestion,
} from "./routes/fraud-detection";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Hello from Express server v2!" });
  });

  app.get("/api/demo", handleDemo);

  // Fraud Detection API routes
  app.post("/api/fraud/analyze", analyzeTransaction);
  app.post("/api/fraud/verify-otp", verifyOtp);
  app.get("/api/fraud/transactions", getTransactionHistory);
  app.get("/api/fraud/flagged", getFlaggedTransactions);
  app.get("/api/fraud/metrics", getSystemMetrics);
  app.post("/api/fraud/ai-suggestion", generateAiSuggestion);

  return app;
}
