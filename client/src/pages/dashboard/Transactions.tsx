import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Search, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "@/components/providers/auth-provider";
import { apiGet } from "@/lib/api";

const kindLabel: Record<string, string> = {
  deposit: "Deposit",
  withdraw: "Withdrawal",
  internal_transfer: "Internal Transfer",
  external_transfer: "External Transfer",
  crypto_deposit: "Crypto Deposit",
  crypto_withdrawal: "Crypto Withdrawal",
  gift_card_purchase: "Gift Card",
  virtual_card_purchase: "Virtual Card",
  flight_booking: "Flight Booking",
  fee: "Fee",
  profit: "Profit",
};

const isUsdPeggedAsset = (symbol?: string) => ["USDT", "USDC", "USD"].includes(symbol?.toUpperCase() || "");

const formatTransactionAmount = (amount: number, symbol?: string) => {
  const formattedAmount = amount.toLocaleString();

  if (isUsdPeggedAsset(symbol)) {
    return `$${formattedAmount}`;
  }

  return `${symbol || "USD"} ${formattedAmount}`;
};

export default function TransactionsPage() {
  const { user } = useAuth();
  const [allTxns, setAllTxns] = useState<any[]>([]);
  const [filteredTxns, setFilteredTxns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    if (user?.id) {
      fetchTransactions();
    }
  }, [user?.id]);

  useEffect(() => {
    filterTransactions();
  }, [allTxns, searchTerm, typeFilter, statusFilter, dateFrom, dateTo]);

  const fetchTransactions = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await apiGet<any>(`/api/transaction/all?userId=${user.id}`);
      // Backend returns { success, transactions } or just transactions array
      const data = response?.transactions || response;
      setAllTxns(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Failed to load transactions");
      setAllTxns([]);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = allTxns;

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((t) => t.type === typeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    // Date range filter
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filtered = filtered.filter((t) => new Date(t.createdAt) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filtered = filtered.filter((t) => new Date(t.createdAt) <= toDate);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.currency?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.symbol?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTxns(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setSearchTerm("");
    setTypeFilter("all");
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  // Pagination
  const totalPages = Math.ceil(filteredTxns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTxns = filteredTxns.slice(startIndex, endIndex);

  const uniqueTypes = Array.from(new Set(allTxns.map((t) => t.type).filter(Boolean)));
  const totalProfit = allTxns
    .filter((t) => t.type === "profit")
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Recent activity across all rails.</p>
        </div>
        <Card variant="glass" padding="lg">
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground mt-1">Recent activity across all rails.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{allTxns.length}</p>
          <p className="text-xs text-muted-foreground">Total Transactions</p>
        </div>
      </div>

      {/* Filters */}
      <Card variant="glass" padding="lg">
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by description, type, or currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="all">All Types</option>
                {uniqueTypes.map((type) => (
                  <option key={type} value={type}>
                    {kindLabel[type] || type}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">From Date</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">To Date</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
            </div>
          </div>

          {/* Clear Filters */}
          {(searchTerm || typeFilter !== "all" || statusFilter !== "all" || dateFrom || dateTo) && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Transactions</p>
            <p className="text-lg sm:text-2xl font-semibold mt-1 break-words">{allTxns.length}</p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Profit</p>
            <p className={`text-2xl font-semibold mt-1 ${totalProfit >= 0 ? "text-green-600" : "text-red-600"}`}>
              {totalProfit >= 0 ? "+" : "-"}$
              {Math.abs(totalProfit).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-lg sm:text-2xl font-semibold mt-1 break-words text-green-600">
              {allTxns.filter((t) => t.status === "completed" || t.status === "approved").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-lg sm:text-2xl font-semibold mt-1 break-words text-orange-600">
              {allTxns.filter((t) => t.status === "pending").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">Activity</CardTitle>
          <CardDescription>
            Showing {paginatedTxns.length} of {filteredTxns.length} transactions (Page {currentPage} of{" "}
            {totalPages || 1})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6 overflow-x-auto">
          {paginatedTxns.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No transactions found</div>
          ) : (
            <>
            {/* Mobile: stacked cards */}
            <ul className="space-y-2 sm:hidden">
              {paginatedTxns.map((t) => {
                const amount = Number(t.amount || 0);
                const isProfit = t.type === "profit";
                return (
                  <li key={t.id || t._id} className="rounded-lg border border-border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`font-semibold text-sm ${isProfit ? "text-green-600" : ""}`}>{kindLabel[t.type] ?? t.type}</span>
                      <Badge variant={t.status === "completed" ? "success" : t.status === "pending" ? "warning" : t.status === "failed" || t.status === "rejected" ? "destructive" : "outline"}>{t.status}</Badge>
                    </div>
                    <div className="mt-1 flex items-end justify-between gap-2">
                      <p className="min-w-0 truncate text-xs text-muted-foreground">{t.description || "No description"}</p>
                      <p className={`shrink-0 text-sm font-semibold ${isProfit && amount >= 0 ? "text-green-600" : ""}`}>{isProfit && amount >= 0 ? "+" : ""}{formatTransactionAmount(amount, t.currency || t.symbol)}</p>
                    </div>
                    <p className="mt-1 text-[11px] text-muted-foreground">{new Date(t.createdAt).toLocaleString()}</p>
                  </li>
                );
              })}
            </ul>
            <table className="hidden w-full text-sm sm:table">
              <thead>
                <tr className="text-left text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Type</th>
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 font-medium">Amount</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {paginatedTxns.map((t) => {
                  const amount = Number(t.amount || 0);
                  const isProfit = t.type === "profit";
                  return (
                  <tr key={t.id || t._id} className="align-middle hover:bg-accent/5 transition-colors">
                    <td className={`py-3 font-semibold ${isProfit ? "text-green-600" : ""}`}>
                      {kindLabel[t.type] ?? t.type}
                    </td>
                    <td className="py-3 text-muted-foreground">
                      {t.description || "No description"}
                    </td>
                    <td className={`py-3 font-semibold ${isProfit && amount >= 0 ? "text-green-600" : ""}`}>
                      {isProfit && amount >= 0 ? "+" : ""}
                      {formatTransactionAmount(amount, t.currency || t.symbol)}
                    </td>
                    <td className="py-3">
                      <Badge
                        variant={
                          t.status === "completed"
                            ? "success"
                            : t.status === "pending"
                            ? "warning"
                            : t.status === "failed" || t.status === "rejected"
                            ? "destructive"
                            : "outline"
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3 text-xs text-muted-foreground">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2 mt-6 pt-6 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
