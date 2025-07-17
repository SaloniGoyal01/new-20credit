import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Shield,
  Search,
  Download,
  Filter,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Moon,
  Sun,
  ArrowLeft,
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
  location: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "TX001",
    amount: 15000,
    recipient: "XYZ Corporation",
    timestamp: new Date(Date.now() - 600000),
    status: "flagged",
    anomalyScore: 85,
    flags: ["High Amount", "Unusual Recipient"],
    location: "Mumbai, India",
  },
  {
    id: "TX002",
    amount: 5000,
    recipient: "ABC Bank Account",
    timestamp: new Date(Date.now() - 300000),
    status: "completed",
    anomalyScore: 25,
    flags: [],
    location: "Delhi, India",
  },
  {
    id: "TX003",
    amount: 25000,
    recipient: "PQR Enterprises",
    timestamp: new Date(Date.now() - 900000),
    status: "flagged",
    anomalyScore: 95,
    flags: ["High Amount", "Unusual Time", "New Recipient"],
    location: "Unknown",
  },
  {
    id: "TX004",
    amount: 2500,
    recipient: "John Doe",
    timestamp: new Date(Date.now() - 1200000),
    status: "completed",
    anomalyScore: 15,
    flags: [],
    location: "Delhi, India",
  },
  {
    id: "TX005",
    amount: 8000,
    recipient: "Electric Bill Payment",
    timestamp: new Date(Date.now() - 1800000),
    status: "completed",
    anomalyScore: 30,
    flags: [],
    location: "Delhi, India",
  },
];

const chartData = [
  { date: "Jan", transactions: 45, anomalies: 12 },
  { date: "Feb", transactions: 52, anomalies: 8 },
  { date: "Mar", transactions: 48, anomalies: 15 },
  { date: "Apr", transactions: 61, anomalies: 7 },
  { date: "May", transactions: 55, anomalies: 10 },
  { date: "Jun", transactions: 67, anomalies: 5 },
];

const anomalyTrendData = [
  { time: "00:00", score: 20 },
  { time: "04:00", score: 15 },
  { time: "08:00", score: 45 },
  { time: "12:00", score: 35 },
  { time: "16:00", score: 60 },
  { time: "20:00", score: 80 },
];

export default function TransactionHistory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [filteredTransactions, setFilteredTransactions] =
    useState(mockTransactions);
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

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

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "approved":
        return "secondary";
      case "flagged":
        return "destructive";
      case "pending":
        return "outline";
      default:
        return "secondary";
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
              className="text-foreground hover:text-primary font-medium"
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
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Transaction History
            </h1>
            <p className="text-muted-foreground mt-2">
              Monitor and analyze all transaction activities and anomaly scores
            </p>
          </div>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5" />
                <span>Transaction Volume & Anomalies</span>
              </CardTitle>
              <CardDescription>
                Monthly overview of transaction volume and detected anomalies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" axisLine={true} tickLine={true} />
                  <YAxis axisLine={true} tickLine={true} />
                  <Tooltip />
                  <Bar dataKey="transactions" fill="hsl(var(--primary))" />
                  <Bar dataKey="anomalies" fill="hsl(var(--destructive))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5" />
                <span>Anomaly Score Trends</span>
              </CardTitle>
              <CardDescription>
                Real-time anomaly score patterns throughout the day
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={anomalyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" axisLine={true} tickLine={true} />
                  <YAxis axisLine={true} tickLine={true} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filters & Search</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="flagged">Flagged</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Advanced Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Table */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction Details</CardTitle>
            <CardDescription>
              Detailed view of all transactions with anomaly analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Anomaly Score</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Timestamp</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-medium">
                      {transaction.id}
                    </TableCell>
                    <TableCell className="font-semibold">
                      ₹{transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>{transaction.recipient}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(transaction.status)}
                      >
                        {transaction.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Progress
                          value={transaction.anomalyScore}
                          className="w-16"
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            getAnomalyColor(transaction.anomalyScore),
                          )}
                        >
                          {transaction.anomalyScore}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {transaction.flags.length > 0 ? (
                          transaction.flags.map((flag, index) => (
                            <Badge
                              key={index}
                              variant="destructive"
                              className="text-xs"
                            >
                              {flag}
                            </Badge>
                          ))
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Clean
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{transaction.location}</TableCell>
                    <TableCell>
                      {transaction.timestamp.toLocaleString()}
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
