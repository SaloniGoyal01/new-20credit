import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  Moon,
  Sun,
  User,
  Code,
  Smartphone,
  Mail,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/AuthContext";
import OtpVerification from "@/components/OtpVerification";

export default function OtpDemo() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();
  const [verificationResults, setVerificationResults] = useState<string[]>([]);

  const handleVerificationSuccess = (otp: string) => {
    const result = `✅ OTP ${otp} verified successfully at ${new Date().toLocaleTimeString()}`;
    setVerificationResults((prev) => [result, ...prev.slice(0, 4)]);
  };

  const handleVerificationError = (error: string) => {
    const result = `❌ Verification failed: ${error} at ${new Date().toLocaleTimeString()}`;
    setVerificationResults((prev) => [result, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  FraudGuard
                </h1>
                <p className="text-sm text-muted-foreground">
                  OTP Verification Demo
                </p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-muted-foreground hover:text-primary">
              Dashboard
            </Link>
            <Link
              to="/history"
              className="text-muted-foreground hover:text-primary"
            >
              Transaction History
            </Link>
            <Link
              to="/admin"
              className="text-muted-foreground hover:text-primary"
            >
              Admin Panel
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            <Link to="/settings">
              <Button variant="ghost" size="icon">
                <User className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            OTP Verification Component
          </h1>
          <p className="text-muted-foreground text-lg">
            Modern, minimal OTP verification UI for secure authentication
          </p>
          <Badge variant="outline" className="mt-2">
            <Code className="h-3 w-3 mr-1" />
            Interactive Demo
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Component Demo */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Live Component Demo</span>
                </CardTitle>
                <CardDescription>
                  Try the OTP verification component below. Check the browser
                  console for generated OTPs.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OtpVerification
                  title="Security Verification"
                  description="Verify your identity with the OTP sent to your contact"
                  onVerificationSuccess={handleVerificationSuccess}
                  onVerificationError={handleVerificationError}
                  validityMinutes={2}
                />
              </CardContent>
            </Card>

            {/* Verification History */}
            {verificationResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5" />
                    <span>Verification Log</span>
                  </CardTitle>
                  <CardDescription>
                    Recent verification attempts and results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {verificationResults.map((result, index) => (
                      <Alert key={index}>
                        <AlertDescription className="text-sm font-mono">
                          {result}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Features & Documentation */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>🎯 Component Features</CardTitle>
                <CardDescription>
                  All the features included in this OTP verification component
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Generate OTP Button</h4>
                      <p className="text-sm text-muted-foreground">
                        Triggers OTP generation via API call
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Smart OTP Input</h4>
                      <p className="text-sm text-muted-foreground">
                        Individual digit inputs with auto-focus and paste
                        support
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Countdown Timer</h4>
                      <p className="text-sm text-muted-foreground">
                        Shows OTP validity period (2 minutes default)
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Auto-Verification</h4>
                      <p className="text-sm text-muted-foreground">
                        Automatically verifies when all digits are entered
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Success/Error States</h4>
                      <p className="text-sm text-muted-foreground">
                        Clear feedback with success and error messages
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Resend Functionality</h4>
                      <p className="text-sm text-muted-foreground">
                        Ability to resend OTP with cooldown period
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <h4 className="font-medium">Mobile Responsive</h4>
                      <p className="text-sm text-muted-foreground">
                        Optimized for mobile devices and touch interfaces
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>🔧 Technical Details</CardTitle>
                <CardDescription>
                  Implementation details and customization options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium flex items-center space-x-2">
                      <Code className="h-4 w-4" />
                      <span>Props Available</span>
                    </h4>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>
                        • <code>onVerificationSuccess</code> - Success callback
                      </p>
                      <p>
                        • <code>onVerificationError</code> - Error callback
                      </p>
                      <p>
                        • <code>title</code> - Custom title text
                      </p>
                      <p>
                        • <code>description</code> - Custom description
                      </p>
                      <p>
                        • <code>otpLength</code> - Number of digits (default: 6)
                      </p>
                      <p>
                        • <code>validityMinutes</code> - OTP validity period
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Delivery Methods</span>
                    </h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>
                        Supports both email and SMS delivery (simulated in demo)
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium flex items-center space-x-2">
                      <Smartphone className="h-4 w-4" />
                      <span>Mobile Features</span>
                    </h4>
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>
                        Numeric keyboard, paste support, auto-focus navigation
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>📱 Demo Instructions</CardTitle>
                <CardDescription>
                  How to test the OTP verification component
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-primary">1.</span>
                    <span>Click "Generate OTP" to create a new OTP</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-primary">2.</span>
                    <span>Check the browser console for the generated OTP</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-primary">3.</span>
                    <span>Enter the OTP in the input fields</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-primary">4.</span>
                    <span>Watch the automatic verification process</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="font-medium text-primary">5.</span>
                    <span>Try the resend functionality after expiry</span>
                  </div>
                </div>

                <Alert className="mt-4">
                  <Code className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Demo Mode:</strong> Check the browser console to see
                    the generated OTP. In production, this would be sent via
                    SMS/Email.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
