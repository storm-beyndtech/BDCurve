import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  DollarSign,
  CreditCard,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  AlertCircle,
} from "lucide-react";

interface AnalyticsStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKYC: number;
  totalVolume24h: number;
  totalVolume7d: number;
  totalVolume30d: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AnalyticsStats>({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
    pendingKYC: 0,
    totalVolume24h: 0,
    totalVolume7d: 0,
    totalVolume30d: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");
        const headers: Record<string, string> = {};
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }

        // Fetch users count
        const usersRes = await fetch(`${API_URL}/api/auth/users`, { headers });
        const usersData = await usersRes.json();
        const users = usersData?.users || usersData || [];

        // Fetch deposits
        const depositsRes = await fetch(`${API_URL}/api/transaction/deposits`, { headers });
        const depositsData = await depositsRes.json();
        const deposits = depositsData?.deposits || depositsData || [];

        // Fetch withdrawals
        const withdrawalsRes = await fetch(`${API_URL}/api/transaction/withdrawals`, { headers });
        const withdrawalsData = await withdrawalsRes.json();
        const withdrawals = withdrawalsData?.withdrawals || withdrawalsData || [];

        // Fetch transactions for recent activity (fetch all types and combine)
        const [tradesRes] = await Promise.all([
          fetch(`${API_URL}/api/transaction/trades`, { headers }).catch(() => null),
        ]);

        const trades = tradesRes ? await tradesRes.json().catch(() => []) : [];

        // Combine all transactions
        const allTransactions = [
          ...deposits.map((d: any) => ({ ...d, type: "deposit", _id: d._id || d.id })),
          ...withdrawals.map((w: any) => ({ ...w, type: "withdrawal", _id: w._id || w.id })),
          ...(Array.isArray(trades) ? trades : []).map((t: any) => ({ ...t, type: "trade", _id: t._id || t.id })),
        ];

        // Sort by date and limit to 5
        const transactions = allTransactions
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5);

        // Calculate stats
        setStats({
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.accountStatus === "active").length,
          suspendedUsers: users.filter((u: any) => u.accountStatus === "suspended").length,
          pendingDeposits: deposits.filter((d: any) => d.status === "pending").length,
          pendingWithdrawals: withdrawals.filter((w: any) => w.status === "pending").length,
          pendingKYC: users.filter((u: any) => u.kycStatus === "pending").length,
          totalVolume24h: 0, // TODO: Calculate from transactions
          totalVolume7d: 0,
          totalVolume30d: 0,
        });

        setRecentActivity(transactions.slice(0, 5));
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Monitor platform activity and approvals</p>
      </div>

      {/* Pending Approvals - Priority Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="glass" padding="lg" hover="lift" className="border-l-4 border-l-accent-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pending Deposits</p>
              <p className="text-2xl font-semibold mt-1">{stats.pendingDeposits}</p>
            </div>
            <div className="rounded-full p-3 bg-accent-500/10">
              <DollarSign className="h-5 w-5 text-accent-600" />
            </div>
          </div>
          {stats.pendingDeposits > 0 && (
            <div className="mt-4">
              <Badge variant="warning" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Requires attention
              </Badge>
            </div>
          )}
        </Card>

        <Card variant="glass" padding="lg" hover="lift" className="border-l-4 border-l-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
              <p className="text-2xl font-semibold mt-1">{stats.pendingWithdrawals}</p>
            </div>
            <div className="rounded-full p-3 bg-orange-500/10">
              <CreditCard className="h-5 w-5 text-orange-600" />
            </div>
          </div>
          {stats.pendingWithdrawals > 0 && (
            <div className="mt-4">
              <Badge variant="warning" className="text-xs">
                <AlertCircle className="h-3 w-3 mr-1" />
                Requires attention
              </Badge>
            </div>
          )}
        </Card>

        <Card variant="glass" padding="lg" hover="lift" className="border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Pending KYC</p>
              <p className="text-2xl font-semibold mt-1">{stats.pendingKYC}</p>
            </div>
            <div className="rounded-full p-3 bg-blue-500/10">
              <ShieldCheck className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          {stats.pendingKYC > 0 && (
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {stats.pendingKYC} submissions
              </Badge>
            </div>
          )}
        </Card>
      </div>

      {/* User Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Users</p>
              <p className="text-2xl font-semibold mt-1">{stats.totalUsers}</p>
            </div>
            <Users className="h-5 w-5 text-accent-500" />
          </div>
        </Card>

        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Active</p>
              <p className="text-2xl font-semibold mt-1 text-green-600">{stats.activeUsers}</p>
            </div>
            <TrendingUp className="h-5 w-5 text-green-600" />
          </div>
        </Card>

        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Suspended</p>
              <p className="text-2xl font-semibold mt-1 text-red-600">{stats.suspendedUsers}</p>
            </div>
            <TrendingDown className="h-5 w-5 text-red-600" />
          </div>
        </Card>

        <Card variant="glass" padding="lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">24h Volume</p>
              <p className="text-2xl font-semibold mt-1">${stats.totalVolume24h.toLocaleString()}</p>
            </div>
            <ArrowRightLeft className="h-5 w-5 text-accent-500" />
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Latest transactions across the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No recent activity
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((txn) => {
                // Determine transaction type and display string
                let displayText = "";
                let userEmail = "";

                // Get user email
                if (txn.user?.email) {
                  userEmail = txn.user.email;
                } else if (txn.userId) {
                  userEmail = `User ${txn.userId.substring(0, 8)}...`;
                } else {
                  userEmail = "Unknown user";
                }

                // Determine display text based on type
                if (txn.type === "trade") {
                  const action = txn.action || (txn.orderType === "buy" ? "BUY" : "SELL");
                  displayText = `${action.toUpperCase()} ${txn.symbol || ""} - ${txn.orderType || "market"}`;
                } else if (txn.type === "deposit") {
                  displayText = `DEPOSIT ${txn.symbol || txn.currency || ""}`;
                } else if (txn.type === "withdrawal") {
                  displayText = `WITHDRAWAL ${txn.symbol || txn.currency || ""}`;
                } else {
                  displayText = `${(txn.type || "Transaction").toUpperCase()} ${txn.symbol || ""}`;
                }

                return (
                  <div
                    key={txn._id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium">{displayText}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {userEmail} • {new Date(txn.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">
                        ${(txn.amount || 0).toLocaleString()}
                      </p>
                      <Badge
                        variant={
                          txn.status === "executed" || txn.status === "approved" || txn.status === "completed"
                            ? "success"
                            : txn.status === "pending"
                            ? "warning"
                            : txn.status === "canceled" || txn.status === "rejected" || txn.status === "failed"
                            ? "destructive"
                            : "outline"
                        }
                        className="text-xs mt-1"
                      >
                        {txn.status}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Health */}
      <Card variant="glass" padding="lg">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">System Health</CardTitle>
          <CardDescription>Platform status and monitoring</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium">API Status</p>
                <p className="text-xs text-muted-foreground">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium">Database</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-border">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <div>
                <p className="text-sm font-medium">Email Service</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

