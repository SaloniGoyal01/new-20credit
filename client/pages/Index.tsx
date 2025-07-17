import { useState, useRef, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic,
  MicOff,
  Send,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  CreditCard,
  MapPin,
  Phone,
  Moon,
  Sun,
  History,
  Settings,
  User,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface Transaction {
  id: string;
  amount: number;
  recipient: string;
  timestamp: Date;
  status: "pending" | "approved" | "flagged" | "completed";
  anomalyScore: number;
  flags: string[];
}

interface VoiceRecognition {
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
}

export default function Index() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentTransaction, setCurrentTransaction] =
    useState<Partial<Transaction> | null>(null);
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: "1",
      amount: 5000,
      recipient: "ABC Bank Account",
      timestamp: new Date(Date.now() - 300000),
      status: "completed",
      anomalyScore: 25,
      flags: [],
    },
    {
      id: "2",
      amount: 15000,
      recipient: "XYZ Corporation",
      timestamp: new Date(Date.now() - 600000),
      status: "flagged",
      anomalyScore: 85,
      flags: ["High Amount", "Unusual Recipient"],
    },
  ]);
  const [geoLocation, setGeoLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const recognitionRef = useRef<VoiceRecognition | null>(null);
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();

  useEffect(() => {
    // Initialize speech recognition
    if ("webkitSpeechRecognition" in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = (event: any) => {
        const result = event.results[0][0].transcript;
        setTranscript(result);
        parseVoiceCommand(result);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGeoLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.warn(
            "Geolocation access denied or unavailable:",
            error.message,
          );
          // Continue without location - this is expected in many cases
        },
        {
          timeout: 5000,
          enableHighAccuracy: false,
          maximumAge: 300000, // 5 minutes
        },
      );
    }
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      setIsListening(true);
      setTranscript("");
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const parseVoiceCommand = (command: string) => {
    // Simple NLP parsing for demo
    const amountMatch = command.match(/₹?(\d+(?:,\d+)*)/);
    const recipientMatch = command.match(/to\s+([A-Za-z0-9\s]+)/i);

    if (amountMatch && recipientMatch) {
      const amount = parseInt(amountMatch[1].replace(/,/g, ""));
      const recipient = recipientMatch[1].trim();

      const transaction: Partial<Transaction> = {
        amount,
        recipient,
        timestamp: new Date(),
        status: "pending",
      };

      setCurrentTransaction(transaction);
      processTransaction(transaction);
    }
  };

  const processTransaction = (transaction: Partial<Transaction>) => {
    // Anomaly detection logic
    let anomalyScore = 0;
    const flags: string[] = [];

    // Amount check
    if (transaction.amount && transaction.amount > 10000) {
      anomalyScore += 40;
      flags.push("High Amount");
    }

    // Frequency check (simplified)
    const recentTransactions = transactions.filter(
      (t) => Date.now() - t.timestamp.getTime() < 3600000, // Last hour
    );

    if (recentTransactions.length >= 3) {
      anomalyScore += 30;
      flags.push("High Frequency");
    }

    // Location check (simplified)
    if (!geoLocation) {
      anomalyScore += 20;
      flags.push("Unknown Location");
    }

    const updatedTransaction = {
      ...transaction,
      id: Date.now().toString(),
      anomalyScore,
      flags,
      status: anomalyScore > 50 ? "flagged" : "approved",
    } as Transaction;

    setCurrentTransaction(updatedTransaction);

    if (anomalyScore > 50) {
      setOtpStep(true);
      // Simulate sending OTP
      console.log("OTP sent for suspicious transaction");
    }
  };

  const verifyOtp = () => {
    if (otp === "123456") {
      // Demo OTP
      if (currentTransaction) {
        const completedTransaction = {
          ...currentTransaction,
          status: "completed" as const,
        };
        setTransactions((prev) => [completedTransaction, ...prev]);
        setCurrentTransaction(null);
        setOtpStep(false);
        setOtp("");
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "approved":
        return "bg-blue-500";
      case "flagged":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getAnomalyColor = (score: number) => {
    if (score > 70) return "text-red-500";
    if (score > 40) return "text-yellow-500";
    return "text-green-500";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-foreground">FraudGuard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome back, {user?.name}
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className="text-foreground hover:text-primary font-medium"
            >
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
            <Link
              to="/otp-demo"
              className="text-muted-foreground hover:text-primary"
            >
              OTP Demo
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

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Voice Input Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mic className="h-5 w-5" />
                  <span>Voice Transaction Command</span>
                </CardTitle>
                <CardDescription>
                  Say something like: "Transfer ₹5000 to ABC Bank Account"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Button
                    onClick={isListening ? stopListening : startListening}
                    variant={isListening ? "destructive" : "default"}
                    size="lg"
                    className="min-w-[140px]"
                  >
                    {isListening ? (
                      <>
                        <MicOff className="h-4 w-4 mr-2" />
                        Stop Listening
                      </>
                    ) : (
                      <>
                        <Mic className="h-4 w-4 mr-2" />
                        Start Voice Input
                      </>
                    )}
                  </Button>
                  {isListening && (
                    <div className="flex items-center space-x-2 text-red-500">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">Listening...</span>
                    </div>
                  )}
                </div>

                {transcript && (
                  <div className="p-4 bg-muted rounded-lg">
                    <Label className="text-sm font-medium">
                      Detected Speech:
                    </Label>
                    <p className="mt-1 text-foreground">{transcript}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Current Transaction */}
            {currentTransaction && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Transaction Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Amount</Label>
                      <p className="text-2xl font-bold text-foreground">
                        ₹{currentTransaction.amount?.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label>Recipient</Label>
                      <p className="text-lg text-foreground">
                        {currentTransaction.recipient}
                      </p>
                    </div>
                    <div>
                      <Label>Status</Label>
                      <div className="flex items-center space-x-2">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full",
                            getStatusColor(
                              currentTransaction.status || "pending",
                            ),
                          )}
                        ></div>
                        <span className="capitalize">
                          {currentTransaction.status}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Anomaly Score</Label>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={currentTransaction.anomalyScore}
                          className="flex-1"
                        />
                        <span
                          className={cn(
                            "font-medium",
                            getAnomalyColor(
                              currentTransaction.anomalyScore || 0,
                            ),
                          )}
                        >
                          {currentTransaction.anomalyScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {currentTransaction.flags &&
                    currentTransaction.flags.length > 0 && (
                      <div className="mt-4">
                        <Label>Risk Flags</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {currentTransaction.flags.map((flag, index) => (
                            <Badge key={index} variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              {flag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                  {/* AI Suggestion */}
                  {currentTransaction.anomalyScore &&
                    currentTransaction.anomalyScore > 50 && (
                      <Alert className="mt-4 border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>AI Suggestion:</strong> This transaction
                          appears suspicious due to high amount and unusual
                          patterns. We recommend additional verification before
                          proceeding.
                        </AlertDescription>
                      </Alert>
                    )}
                </CardContent>
              </Card>
            )}

            {/* OTP Verification */}
            {otpStep && (
              <Card className="mt-6 border-red-200 dark:border-red-800">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-red-600">
                    <Phone className="h-5 w-5" />
                    <span>OTP Verification Required</span>
                  </CardTitle>
                  <CardDescription>
                    A suspicious transaction has been detected. Please enter the
                    OTP sent to your registered mobile number.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="otp">Enter 6-digit OTP</Label>
                      <Input
                        id="otp"
                        type="text"
                        placeholder="123456"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="text-center text-lg font-mono"
                      />
                    </div>
                    <Button
                      onClick={verifyOtp}
                      className="w-full"
                      disabled={otp.length !== 6}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify & Process Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Status Panel */}
          <div className="space-y-6">
            {/* Live Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>System Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Fraud Detection</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-green-500">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Voice Recognition</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-500">Ready</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span>Location Services</span>
                  <div className="flex items-center space-x-2">
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full",
                        geoLocation ? "bg-green-500" : "bg-yellow-500",
                      )}
                    ></div>
                    <span
                      className={cn(
                        "text-sm",
                        geoLocation ? "text-green-500" : "text-yellow-500",
                      )}
                    >
                      {geoLocation ? "Enabled" : "Limited"}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <History className="h-5 w-5" />
                    <span>Recent Transactions</span>
                  </div>
                  <Link to="/history">
                    <Button variant="ghost" size="sm">
                      View All
                    </Button>
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 3).map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">
                          ₹{transaction.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.recipient}
                        </p>
                      </div>
                      <div className="text-right">
                        <div
                          className={cn(
                            "w-3 h-3 rounded-full mx-auto mb-1",
                            getStatusColor(transaction.status),
                          )}
                        ></div>
                        <p className="text-xs text-muted-foreground">
                          {transaction.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Geo-location Status */}
            {geoLocation && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Location Verified</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Transaction location confirmed: {geoLocation.lat.toFixed(4)}
                    , {geoLocation.lng.toFixed(4)}
                  </p>
                  <Badge variant="outline" className="mt-2">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Trusted Location
                  </Badge>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
