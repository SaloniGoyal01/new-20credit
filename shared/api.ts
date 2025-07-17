/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

// Fraud Detection API Types
export interface TransactionRequest {
  amount: number;
  recipient: string;
  userId: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface AnomalyResult {
  anomalyScore: number;
  flags: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresOtp: boolean;
}

export interface TransactionAnalysisResponse {
  success: boolean;
  transactionId: string;
  result: AnomalyResult;
  message: string;
}

export interface OtpVerificationRequest {
  transactionId: string;
  otp: string;
}

export interface OtpVerificationResponse {
  success: boolean;
  message: string;
}

export interface Transaction {
  id: string;
  amount: number;
  recipient: string;
  userId: string;
  location?: {
    lat: number;
    lng: number;
  };
  timestamp: number;
  anomalyScore: number;
  flags: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "pending_otp" | "approved" | "blocked" | "investigating";
  otpVerifiedAt?: number;
}

export interface TransactionHistoryResponse {
  success: boolean;
  transactions: Transaction[];
  total: number;
}

export interface SystemMetrics {
  totalTransactions: number;
  flaggedTransactions: number;
  approvedTransactions: number;
  pendingTransactions: number;
  averageAnomalyScore: number;
  flaggedPercentage: number;
  systemHealth: {
    mlModelAccuracy: number;
    apiResponseTime: string;
    databaseStatus: string;
    alertQueueCount: number;
  };
}

export interface SystemMetricsResponse {
  success: boolean;
  metrics: SystemMetrics;
}

export interface AiSuggestionRequest {
  transactionData: {
    anomalyScore: number;
    flags: string[];
    amount: number;
    recipient: string;
  };
}

export interface AiSuggestionResponse {
  success: boolean;
  suggestion: string;
  confidence: number;
  recommendedAction: "approve" | "verify" | "block";
}
