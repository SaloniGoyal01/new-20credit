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
import {
  login,
  register,
  forgotPassword,
  getCurrentUser,
  updateProfile,
  changePassword,
  logout,
  generateOtp,
  verifyOtpEndpoint,
  authenticateToken,
} from "./routes/auth";

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

  // Authentication API routes
  app.post("/api/auth/login", login);
  app.post("/api/auth/register", register);
  app.post("/api/auth/forgot-password", forgotPassword);
  app.get("/api/auth/me", authenticateToken, getCurrentUser);
  app.put("/api/auth/update-profile", authenticateToken, updateProfile);
  app.put("/api/auth/change-password", authenticateToken, changePassword);
  app.post("/api/auth/logout", authenticateToken, logout);

  // OTP API routes
  app.post("/api/auth/generate-otp", authenticateToken, generateOtp);
  app.post("/api/auth/verify-otp", authenticateToken, verifyOtpEndpoint);

  // Fraud Detection API routes (protected)
  app.post("/api/fraud/analyze", authenticateToken, analyzeTransaction);
  app.post("/api/fraud/verify-otp", authenticateToken, verifyOtp);
  app.get("/api/fraud/transactions", authenticateToken, getTransactionHistory);
  app.get("/api/fraud/flagged", authenticateToken, getFlaggedTransactions);
  app.get("/api/fraud/metrics", authenticateToken, getSystemMetrics);
  app.post("/api/fraud/ai-suggestion", authenticateToken, generateAiSuggestion);

  return app;
}
