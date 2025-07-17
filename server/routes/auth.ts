import { RequestHandler } from "express";
import { z } from "zod";

// Simple in-memory storage for demo (use database in production)
interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In production, hash this
  createdAt: string;
}

const users: User[] = [
  {
    id: "user_1",
    name: "Demo User",
    email: "demo@fraudguard.com",
    password: "demo123", // In production, this should be hashed
    createdAt: new Date().toISOString(),
  },
];

// Simple token storage (use JWT and proper session management in production)
const tokens: { [key: string]: string } = {};

// OTP storage (use Redis or database in production)
const otpStore: {
  [key: string]: { otp: string; expires: number; userId: string };
} = {};

// Validation schemas
const LoginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

// Helper function to generate token
const generateToken = (userId: string): string => {
  const token = `token_${Date.now()}_${Math.random()}`;
  tokens[token] = userId;
  return token;
};

// Helper function to get user from token
const getUserFromToken = (token: string): User | null => {
  const userId = tokens[token];
  if (!userId) return null;
  return users.find((user) => user.id === userId) || null;
};

// Middleware to verify authentication
export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is required",
    });
  }

  const user = getUserFromToken(token);
  if (!user) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  (req as any).user = user;
  next();
};

export const login: RequestHandler = (req, res) => {
  try {
    const validation = LoginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.errors,
      });
    }

    const { email, password } = validation.data;

    // Find user
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Check password (in production, compare hashed passwords)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const register: RequestHandler = (req, res) => {
  try {
    const validation = RegisterSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.errors,
      });
    }

    const { name, email, password } = validation.data;

    // Check if user already exists
    const existingUser = users.find((u) => u.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User with this email already exists",
      });
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      name,
      email,
      password, // In production, hash this
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    // Generate token
    const token = generateToken(newUser.id);

    // Return user without password
    const { password: _, ...userWithoutPassword } = newUser;

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const forgotPassword: RequestHandler = (req, res) => {
  try {
    const validation = ForgotPasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.errors,
      });
    }

    const { email } = validation.data;

    // Check if user exists
    const user = users.find((u) => u.email === email);
    if (!user) {
      // For security, don't reveal if email exists
      return res.json({
        success: true,
        message: "If the email exists, a reset link has been sent",
      });
    }

    // In production, send actual email with reset link
    console.log(`
      Password Reset Email for ${email}:
      
      Subject: Reset Your FraudGuard Password
      
      Hi ${user.name},
      
      You requested to reset your password. Click the link below to reset it:
      
      Reset Link: https://fraudguard.com/reset-password?token=reset_${Date.now()}
      
      If you didn't request this, please ignore this email.
      
      Best regards,
      FraudGuard Team
    `);

    res.json({
      success: true,
      message: "If the email exists, a reset link has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getCurrentUser: RequestHandler = (req, res) => {
  try {
    const user = (req as any).user;
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateProfile: RequestHandler = (req, res) => {
  try {
    const validation = UpdateProfileSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.errors,
      });
    }

    const { name, email } = validation.data;
    const currentUser = (req as any).user;

    // Check if email is taken by another user
    const existingUser = users.find(
      (u) => u.email === email && u.id !== currentUser.id,
    );
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already taken by another user",
      });
    }

    // Update user
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    users[userIndex] = {
      ...users[userIndex],
      name,
      email,
    };

    // Return updated user without password
    const { password: _, ...userWithoutPassword } = users[userIndex];

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changePassword: RequestHandler = (req, res) => {
  try {
    const validation = ChangePasswordSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid input",
        errors: validation.error.errors,
      });
    }

    const { currentPassword, newPassword } = validation.data;
    const currentUser = (req as any).user;

    // Verify current password
    if (currentUser.password !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Update password
    const userIndex = users.findIndex((u) => u.id === currentUser.id);
    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    users[userIndex].password = newPassword; // In production, hash this

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const logout: RequestHandler = (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token && tokens[token]) {
      delete tokens[token];
    }

    res.json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const generateOtp: RequestHandler = (req, res) => {
  try {
    const currentUser = (req as any).user;

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpId = `otp_${Date.now()}_${currentUser.id}`;
    const expires = Date.now() + 2 * 60 * 1000; // 2 minutes

    // Store OTP
    otpStore[otpId] = {
      otp,
      expires,
      userId: currentUser.id,
    };

    // Mask email for security
    const email = currentUser.email;
    const [localPart, domain] = email.split("@");
    const maskedEmail = `${localPart.charAt(0)}${"*".repeat(localPart.length - 2)}${localPart.charAt(localPart.length - 1)}@${domain}`;

    // In production, send OTP via SMS/Email
    console.log(`
🔐 OTP Generated for ${currentUser.name} (${email}):

OTP: ${otp}
Valid for: 2 minutes
Generated at: ${new Date().toLocaleTimeString()}

Email would be sent to: ${email}
SMS would be sent to: +**-****-***
`);

    res.json({
      success: true,
      message: "OTP generated successfully",
      otpId,
      maskedContact: maskedEmail,
      expiresIn: 120, // seconds
    });
  } catch (error) {
    console.error("Generate OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate OTP",
    });
  }
};

export const verifyOtpEndpoint: RequestHandler = (req, res) => {
  try {
    const { otp } = req.body;
    const currentUser = (req as any).user;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    // Find valid OTP for this user
    const otpEntry = Object.entries(otpStore).find(
      ([_, data]) =>
        data.userId === currentUser.id &&
        data.otp === otp &&
        data.expires > Date.now(),
    );

    if (!otpEntry) {
      // Check if OTP exists but expired
      const expiredOtp = Object.entries(otpStore).find(
        ([_, data]) => data.userId === currentUser.id && data.otp === otp,
      );

      if (expiredOtp) {
        return res.status(400).json({
          success: false,
          message: "OTP has expired. Please generate a new one.",
        });
      }

      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please check and try again.",
      });
    }

    // Remove used OTP
    delete otpStore[otpEntry[0]];

    // Clean up expired OTPs
    Object.entries(otpStore).forEach(([id, data]) => {
      if (data.expires <= Date.now()) {
        delete otpStore[id];
      }
    });

    res.json({
      success: true,
      message: "OTP verified successfully",
      verifiedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
    });
  }
};
