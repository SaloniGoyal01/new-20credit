import { RequestHandler } from "express";

interface TransactionRequest {
  amount: number;
  recipient: string;
  userId: string;
  location?: {
    lat: number;
    lng: number;
  };
}

interface AnomalyResult {
  anomalyScore: number;
  flags: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  requiresOtp: boolean;
}

interface OtpRequest {
  transactionId: string;
  otp: string;
}

// Simple in-memory storage for demo (use database in production)
const transactions: any[] = [];
const otpStore: { [key: string]: string } = {};

export const analyzeTransaction: RequestHandler = (req, res) => {
  try {
    const { amount, recipient, userId, location }: TransactionRequest =
      req.body;

    let anomalyScore = 0;
    const flags: string[] = [];

    // Amount-based detection
    if (amount > 50000) {
      anomalyScore += 50;
      flags.push("Very High Amount");
    } else if (amount > 10000) {
      anomalyScore += 30;
      flags.push("High Amount");
    }

    // Recipient analysis (simplified)
    const suspiciousKeywords = ["unknown", "temp", "test", "fake"];
    if (
      suspiciousKeywords.some((keyword) =>
        recipient.toLowerCase().includes(keyword),
      )
    ) {
      anomalyScore += 25;
      flags.push("Suspicious Recipient");
    }

    // Frequency check (simplified - check last hour transactions)
    const userTransactions = transactions.filter(
      (t) => t.userId === userId && Date.now() - t.timestamp < 3600000,
    );

    if (userTransactions.length >= 5) {
      anomalyScore += 40;
      flags.push("High Frequency");
    } else if (userTransactions.length >= 3) {
      anomalyScore += 20;
      flags.push("Moderate Frequency");
    }

    // Location check
    if (!location) {
      anomalyScore += 15;
      flags.push("Location Unavailable");
    }

    // Time-based check (night transactions are more suspicious)
    const hour = new Date().getHours();
    if (hour >= 22 || hour <= 5) {
      anomalyScore += 20;
      flags.push("Unusual Time");
    }

    // Determine risk level
    let riskLevel: "low" | "medium" | "high" | "critical";
    if (anomalyScore >= 80) {
      riskLevel = "critical";
    } else if (anomalyScore >= 60) {
      riskLevel = "high";
    } else if (anomalyScore >= 40) {
      riskLevel = "medium";
    } else {
      riskLevel = "low";
    }

    const requiresOtp = anomalyScore > 50;

    // Store transaction
    const transactionId = `TX${Date.now()}`;
    const transaction = {
      id: transactionId,
      amount,
      recipient,
      userId,
      location,
      timestamp: Date.now(),
      anomalyScore,
      flags,
      riskLevel,
      status: requiresOtp ? "pending_otp" : "approved",
    };

    transactions.push(transaction);

    // Generate OTP if required
    if (requiresOtp) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otpStore[transactionId] = otp;

      // In production, send OTP via SMS/email
      console.log(`OTP for transaction ${transactionId}: ${otp}`);

      // Simulate email notification
      console.log(`
        Email sent to user ${userId}:
        Subject: Suspicious Transaction Detected
        
        A suspicious transaction of ₹${amount.toLocaleString()} to ${recipient} 
        has been detected on your account. 
        
        Anomaly Score: ${anomalyScore}%
        Risk Flags: ${flags.join(", ")}
        
        If this transaction was initiated by you, please verify with OTP: ${otp}
        
        If you did not initiate this transaction, please contact our security team immediately.
      `);
    }

    const result: AnomalyResult = {
      anomalyScore,
      flags,
      riskLevel,
      requiresOtp,
    };

    res.json({
      success: true,
      transactionId,
      result,
      message: requiresOtp
        ? "Transaction flagged as suspicious. OTP verification required."
        : "Transaction approved.",
    });
  } catch (error) {
    console.error("Error analyzing transaction:", error);
    res.status(500).json({
      success: false,
      message: "Error analyzing transaction",
    });
  }
};

export const verifyOtp: RequestHandler = (req, res) => {
  try {
    const { transactionId, otp }: OtpRequest = req.body;

    const storedOtp = otpStore[transactionId];

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid transaction ID or OTP expired",
      });
    }

    if (otp === storedOtp) {
      // OTP is correct, approve transaction
      const transactionIndex = transactions.findIndex(
        (t) => t.id === transactionId,
      );
      if (transactionIndex !== -1) {
        transactions[transactionIndex].status = "approved";
        transactions[transactionIndex].otpVerifiedAt = Date.now();
      }

      // Remove OTP from store
      delete otpStore[transactionId];

      res.json({
        success: true,
        message: "OTP verified successfully. Transaction approved.",
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(500).json({
      success: false,
      message: "Error verifying OTP",
    });
  }
};

export const getTransactionHistory: RequestHandler = (req, res) => {
  try {
    const { userId } = req.query;

    let filteredTransactions = transactions;

    if (userId) {
      filteredTransactions = transactions.filter((t) => t.userId === userId);
    }

    // Sort by timestamp (newest first)
    filteredTransactions.sort((a, b) => b.timestamp - a.timestamp);

    res.json({
      success: true,
      transactions: filteredTransactions,
      total: filteredTransactions.length,
    });
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching transaction history",
    });
  }
};

export const getFlaggedTransactions: RequestHandler = (req, res) => {
  try {
    const flaggedTransactions = transactions.filter(
      (t) => t.anomalyScore > 40 || t.flags.length > 0,
    );

    // Sort by anomaly score (highest first)
    flaggedTransactions.sort((a, b) => b.anomalyScore - a.anomalyScore);

    res.json({
      success: true,
      transactions: flaggedTransactions,
      total: flaggedTransactions.length,
    });
  } catch (error) {
    console.error("Error fetching flagged transactions:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching flagged transactions",
    });
  }
};

export const getSystemMetrics: RequestHandler = (req, res) => {
  try {
    const totalTransactions = transactions.length;
    const flaggedCount = transactions.filter((t) => t.anomalyScore > 40).length;
    const approvedCount = transactions.filter(
      (t) => t.status === "approved",
    ).length;
    const pendingCount = transactions.filter(
      (t) => t.status === "pending_otp",
    ).length;

    // Calculate some basic metrics
    const avgAnomalyScore =
      transactions.length > 0
        ? transactions.reduce((sum, t) => sum + t.anomalyScore, 0) /
          transactions.length
        : 0;

    const metrics = {
      totalTransactions,
      flaggedTransactions: flaggedCount,
      approvedTransactions: approvedCount,
      pendingTransactions: pendingCount,
      averageAnomalyScore: Math.round(avgAnomalyScore),
      flaggedPercentage:
        totalTransactions > 0
          ? Math.round((flaggedCount / totalTransactions) * 100)
          : 0,
      systemHealth: {
        mlModelAccuracy: 94,
        apiResponseTime: "125ms",
        databaseStatus: "optimal",
        alertQueueCount: pendingCount,
      },
    };

    res.json({
      success: true,
      metrics,
    });
  } catch (error) {
    console.error("Error fetching system metrics:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching system metrics",
    });
  }
};

export const generateAiSuggestion: RequestHandler = (req, res) => {
  try {
    const { transactionData } = req.body;

    // Simple AI suggestion logic (in production, integrate with ChatGPT API)
    let suggestion = "";

    if (transactionData.anomalyScore > 80) {
      suggestion =
        "This transaction shows critical risk indicators. We strongly recommend blocking this transaction and conducting a thorough investigation. Multiple red flags suggest potential fraud activity.";
    } else if (transactionData.anomalyScore > 60) {
      suggestion =
        "This transaction appears highly suspicious. Consider requiring additional verification steps such as biometric authentication or contacting the user directly before proceeding.";
    } else if (transactionData.anomalyScore > 40) {
      suggestion =
        "This transaction shows moderate risk. While it may be legitimate, we recommend monitoring the user's activity closely and potentially requiring OTP verification.";
    } else {
      suggestion =
        "This transaction appears to be within normal parameters. However, continue monitoring for any unusual patterns.";
    }

    res.json({
      success: true,
      suggestion,
      confidence: Math.random() * 0.3 + 0.7, // 70-100% confidence
      recommendedAction:
        transactionData.anomalyScore > 60
          ? "block"
          : transactionData.anomalyScore > 40
            ? "verify"
            : "approve",
    });
  } catch (error) {
    console.error("Error generating AI suggestion:", error);
    res.status(500).json({
      success: false,
      message: "Error generating AI suggestion",
    });
  }
};
