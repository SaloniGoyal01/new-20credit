import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
} from "recharts";
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
  Activity,
  Moon,
  Sun,
  ArrowLeft,
  User,
  Bell,
  Settings,
  Download,
  RefreshCw,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FlaggedTransaction {
  id: string;
  userId: string;
  amount: number;
  recipient: string;
  timestamp: Date;
  anomalyScore: number;
  flags: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
  status: "pending" | "investigating" | "resolved" | "blocked";
}

interface SystemMetric {
  label: string;
  value: number;
  change: number;
  status: "up" | "down" | "stable";
}

const flaggedTransactions: FlaggedTransaction[] = [
  {
    id: "TX001",
    userId: "USR123",
    amount: 25000,
    recipient: "Unknown Account",
    timestamp: new Date(Date.now() - 300000),
    anomalyScore: 95,
    flags: ["High Amount", "Unknown Recipient", "Unusual Time"],
    riskLevel: "critical",
    status: "pending",
  },
  {
    id: "TX002",
    userId: "USR456",
    amount: 15000,
    recipient: "XYZ Corporation",
    timestamp: new Date(Date.now() - 600000),
    anomalyScore: 85,
    flags: ["High Amount", "Unusual Recipient"],
    riskLevel: "high",
    status: "investigating",
  },
  {
    id: "TX003",
    userId: "USR789",
    amount: 12000,
    recipient: "ABC Services",
    timestamp: new Date(Date.now() - 900000),
    anomalyScore: 75,
    flags: ["High Amount", "Multiple Transactions"],
    riskLevel: "medium",
    status: "investigating",
  },
];

const systemMetrics: SystemMetric[] = [
  { label: "Total Transactions", value: 1247, change: 12, status: "up" },
  { label: "Flagged Transactions", value: 38, change: -5, status: "down" },
  { label: "False Positives", value: 8, change: -15, status: "down" },
  { label: "Active Users", value: 892, change: 8, status: "up" },
];

const riskDistribution = [
  { name: "Low Risk", value: 65, color: "#10b981" },
  { name: "Medium Risk", value: 25, color: "#f59e0b" },
  { name: "High Risk", value: 8, color: "#ef4444" },
  { name: "Critical", value: 2, color: "#dc2626" },
];

const timelineData = [
  { hour: "00", alerts: 2 },
  { hour: "04", alerts: 1 },
  { hour: "08", alerts: 5 },
  { hour: "12", alerts: 8 },
  { hour: "16", alerts: 12 },
  { hour: "20", alerts: 6 },
];

export default function AdminDashboard() {
  const [selectedTransaction, setSelectedTransaction] =
    useState<FlaggedTransaction | null>(null);
  const { theme, setTheme } = useTheme();

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "text-red-600 bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800";
      case "high":
        return "text-orange-600 bg-orange-50 border-orange-200 dark:bg-orange-950 dark:border-orange-800";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800";
      case "low":
        return "text-green-600 bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200 dark:bg-gray-950 dark:border-gray-800";
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "resolved":
        return "default";
      case "investigating":
        return "secondary";
      case "blocked":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
    }
  };

  const handleTransactionAction = (
    transactionId: string,
    action: "approve" | "block" | "investigate",
  ) => {
    console.log(`${action} transaction ${transactionId}`);
    // Implementation for handling transaction actions
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
              <h1 className="text-2xl font-bold text-foreground">FraudGuard</h1>
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
              className="text-foreground hover:text-primary font-medium"
            >
              Admin Panel
            </Link>
          </nav>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-4 w-4" />
            </Button>
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
            <Button variant="ghost" size="icon">
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor system performance and manage flagged transactions
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* System Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {systemMetrics.map((metric, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {metric.label}
                    </p>
                    <p className="text-2xl font-bold">{metric.value}</p>
                  </div>
                  <div
                    className={cn(
                      "flex items-center text-sm",
                      metric.change > 0
                        ? "text-green-600"
                        : metric.change < 0
                          ? "text-red-600"
                          : "text-gray-600",
                    )}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    {metric.change > 0 ? "+" : ""}
                    {metric.change}%
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Risk Distribution</CardTitle>
              <CardDescription>
                Current distribution of transaction risk levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={riskDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}%`}
                  >
                    {riskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Alert Timeline */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Alert Timeline (24h)</CardTitle>
              <CardDescription>
                Fraud alert distribution throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" axisLine={true} tickLine={true} />
                  <YAxis axisLine={true} tickLine={true} />
                  <Tooltip />
                  <Bar dataKey="alerts" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Active Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span>High Priority Alerts</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical:</strong> Suspicious transaction pattern
                  detected for user USR123 - Multiple high-value transfers
                  within 1 hour.
                </AlertDescription>
              </Alert>
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High:</strong> Unusual location detected for user
                  USR456 - Transaction from unregistered IP address.
                </AlertDescription>
              </Alert>
              <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Medium:</strong> Transaction velocity threshold
                  exceeded for user USR789.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5 text-blue-500" />
                <span>System Health</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>ML Model Accuracy</span>
                <div className="flex items-center space-x-2">
                  <Progress value={94} className="w-20" />
                  <span className="text-green-500 font-medium">94%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>API Response Time</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500">125ms</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Database Performance</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-500">Optimal</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span>Alert Queue</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-yellow-500">3 Pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flagged Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>Flagged Transactions</CardTitle>
            <CardDescription>
              Transactions requiring admin review and action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Risk Level</TableHead>
                  <TableHead>Anomaly Score</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flaggedTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.id}
                    </TableCell>
                    <TableCell>{transaction.userId}</TableCell>
                    <TableCell className="font-semibold">
                      ₹{transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "capitalize",
                          getRiskColor(transaction.riskLevel),
                        )}
                      >
                        {transaction.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={transaction.anomalyScore}
                          className="w-16"
                        />
                        <span className="text-sm font-medium text-red-500">
                          {transaction.anomalyScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {transaction.flags.map((flag, index) => (
                          <Badge
                            key={index}
                            variant="destructive"
                            className="text-xs"
                          >
                            {flag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(transaction.status)}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleTransactionAction(transaction.id, "approve")
                          }
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleTransactionAction(transaction.id, "block")
                          }
                        >
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Block
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
