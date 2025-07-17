import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Send,
  CheckCircle,
  AlertTriangle,
  Clock,
  Loader2,
  RefreshCw,
  Mail,
  Smartphone,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OtpVerificationProps {
  onVerificationSuccess?: (otp: string) => void;
  onVerificationError?: (error: string) => void;
  title?: string;
  description?: string;
  otpLength?: number;
  validityMinutes?: number;
  className?: string;
}

interface OtpState {
  isGenerating: boolean;
  isVerifying: boolean;
  isGenerated: boolean;
  isVerified: boolean;
  timeRemaining: number;
  message: string;
  messageType: "success" | "error" | "info" | null;
}

export default function OtpVerification({
  onVerificationSuccess,
  onVerificationError,
  title = "OTP Verification",
  description = "Enter the OTP sent to your registered contact",
  otpLength = 6,
  validityMinutes = 2,
  className,
}: OtpVerificationProps) {
  const [otp, setOtp] = useState("");
  const [state, setState] = useState<OtpState>({
    isGenerating: false,
    isVerifying: false,
    isGenerated: false,
    isVerified: false,
    timeRemaining: 0,
    message: "",
    messageType: null,
  });

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize OTP input refs
  useEffect(() => {
    otpInputRefs.current = Array(otpLength).fill(null);
  }, [otpLength]);

  // Timer countdown effect
  useEffect(() => {
    if (state.timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setState((prev) => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1,
        }));
      }, 1000);
    } else if (
      state.timeRemaining === 0 &&
      state.isGenerated &&
      !state.isVerified
    ) {
      setState((prev) => ({
        ...prev,
        isGenerated: false,
        message: "OTP has expired. Please generate a new one.",
        messageType: "error",
      }));
      setOtp("");
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state.timeRemaining, state.isGenerated, state.isVerified]);

  const generateOtp = async () => {
    setState((prev) => ({
      ...prev,
      isGenerating: true,
      message: "",
      messageType: null,
    }));

    try {
      // Simulate API call to generate OTP
      const response = await fetch("/api/auth/generate-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          isGenerated: true,
          timeRemaining: validityMinutes * 60,
          message: `OTP sent successfully to your registered contact (${data.maskedContact || "***@***.com"})`,
          messageType: "success",
        }));

        // Focus first OTP input
        setTimeout(() => {
          otpInputRefs.current[0]?.focus();
        }, 100);
      } else {
        const errorData = await response.json();
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          message: errorData.message || "Failed to generate OTP",
          messageType: "error",
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isGenerating: false,
        message: "Network error. Please try again.",
        messageType: "error",
      }));
    }
  };

  const verifyOtp = async () => {
    if (otp.length !== otpLength) {
      setState((prev) => ({
        ...prev,
        message: `Please enter the complete ${otpLength}-digit OTP`,
        messageType: "error",
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      isVerifying: true,
      message: "",
      messageType: null,
    }));

    try {
      // Simulate API call to verify OTP
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
        body: JSON.stringify({ otp }),
      });

      if (response.ok) {
        setState((prev) => ({
          ...prev,
          isVerifying: false,
          isVerified: true,
          message: "OTP verified successfully!",
          messageType: "success",
        }));

        onVerificationSuccess?.(otp);
      } else {
        const errorData = await response.json();
        const errorMessage =
          errorData.message || "Invalid OTP. Please try again.";

        setState((prev) => ({
          ...prev,
          isVerifying: false,
          message: errorMessage,
          messageType: "error",
        }));

        onVerificationError?.(errorMessage);

        // Clear OTP and focus first input
        setOtp("");
        otpInputRefs.current.forEach((input) => {
          if (input) input.value = "";
        });
        otpInputRefs.current[0]?.focus();
      }
    } catch (error) {
      const errorMessage = "Network error. Please try again.";
      setState((prev) => ({
        ...prev,
        isVerifying: false,
        message: errorMessage,
        messageType: "error",
      }));
      onVerificationError?.(errorMessage);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (!/^\d*$/.test(value)) return;

    const newOtp = otp.split("");
    newOtp[index] = value;
    const updatedOtp = newOtp.join("");
    setOtp(updatedOtp);

    // Auto-focus next input
    if (value && index < otpLength - 1) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (
      updatedOtp.length === otpLength &&
      state.isGenerated &&
      !state.isVerifying
    ) {
      setTimeout(() => verifyOtp(), 100);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "");

    if (pastedData.length === otpLength) {
      setOtp(pastedData);
      pastedData.split("").forEach((digit, index) => {
        if (otpInputRefs.current[index]) {
          otpInputRefs.current[index]!.value = digit;
        }
      });

      // Auto-verify pasted OTP
      if (state.isGenerated && !state.isVerifying) {
        setTimeout(() => verifyOtp(), 100);
      }
    }
  };

  const resetOtp = () => {
    setOtp("");
    setState((prev) => ({
      ...prev,
      isGenerated: false,
      isVerified: false,
      timeRemaining: 0,
      message: "",
      messageType: null,
    }));
    otpInputRefs.current.forEach((input) => {
      if (input) input.value = "";
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusIcon = () => {
    if (state.isVerified)
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    if (state.isGenerated) return <Mail className="h-5 w-5 text-blue-500" />;
    return <Shield className="h-5 w-5 text-primary" />;
  };

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-2">
          {getStatusIcon()}
        </div>
        <CardTitle className="flex items-center justify-center space-x-2">
          <span>{title}</span>
          {state.timeRemaining > 0 && (
            <Badge variant="outline" className="ml-2">
              <Clock className="h-3 w-3 mr-1" />
              {formatTime(state.timeRemaining)}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Generate OTP Section */}
        {!state.isGenerated && !state.isVerified && (
          <div className="text-center">
            <Button
              onClick={generateOtp}
              disabled={state.isGenerating}
              className="w-full"
              size="lg"
            >
              {state.isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating OTP...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Generate OTP
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground mt-2">
              Click to send OTP to your registered email/phone
            </p>
          </div>
        )}

        {/* OTP Input Section */}
        {state.isGenerated && !state.isVerified && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-center block">
                Enter {otpLength}-digit OTP
              </Label>
              <div className="flex justify-center space-x-2">
                {Array.from({ length: otpLength }, (_, index) => (
                  <Input
                    key={index}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-12 text-center text-lg font-mono"
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={handlePaste}
                    disabled={state.isVerifying}
                  />
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={verifyOtp}
                disabled={state.isVerifying || otp.length !== otpLength}
                className="flex-1"
              >
                {state.isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Verify OTP
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={generateOtp}
                disabled={state.isGenerating || state.timeRemaining > 30}
                size="sm"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              Didn't receive the code?
              {state.timeRemaining > 30 ? (
                <span>
                  {" "}
                  Wait {formatTime(state.timeRemaining - 30)} to resend
                </span>
              ) : (
                <span> Click the refresh button to resend</span>
              )}
            </p>
          </div>
        )}

        {/* Success Section */}
        {state.isVerified && (
          <div className="text-center space-y-4">
            <div className="rounded-full bg-green-100 dark:bg-green-900 p-3 w-16 h-16 mx-auto flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-green-600 dark:text-green-400">
                Verification Successful!
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                OTP has been verified successfully
              </p>
            </div>
            <Button variant="outline" onClick={resetOtp} size="sm">
              Verify Another OTP
            </Button>
          </div>
        )}

        {/* Message Section */}
        {state.message && (
          <Alert
            variant={state.messageType === "error" ? "destructive" : "default"}
            className={cn(
              state.messageType === "success" &&
                "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
              state.messageType === "info" &&
                "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950",
            )}
          >
            {state.messageType === "error" && (
              <AlertTriangle className="h-4 w-4" />
            )}
            {state.messageType === "success" && (
              <CheckCircle className="h-4 w-4" />
            )}
            {state.messageType === "info" && <Smartphone className="h-4 w-4" />}
            <AlertDescription>{state.message}</AlertDescription>
          </Alert>
        )}

        {/* Status Indicators */}
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                state.isGenerated ? "bg-green-500" : "bg-gray-300",
              )}
            />
            <span>OTP Sent</span>
          </div>
          <div className="flex items-center space-x-1">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                state.isVerified ? "bg-green-500" : "bg-gray-300",
              )}
            />
            <span>Verified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
