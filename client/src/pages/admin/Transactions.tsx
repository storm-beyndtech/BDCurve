import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, ChevronLeft, ChevronRight } from "lucide-react";

type Txn = {
  _id: string;
  user?: { email?: string; name?: { full?: string } };
  userId?: string;
  type: string;
  symbol?: string;
  amount?: number;
  status?: string;
  createdAt: string;
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AdminTransactionsPage() {
  const [txns, setTxns] = useState<Txn[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    fetchTxns();
  }, []);

  const fetchTxns = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
      // Admin-only endpoints; fallback if any fail
      const [depositsRes, withdrawalsRes, tradesRes, profitsRes] = await Promise.all([
        fetch(`${API_URL}/api/transaction/deposits`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/transaction/withdrawals`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/transaction/trades`, { headers }).catch(() => null),
        fetch(`${API_URL}/api/transaction/profits`, { headers }).catch(() => null),
      ]);

      const deposits = (await depositsRes?.json().catch(() => [])) || [];
      const withdrawals = (await withdrawalsRes?.json().catch(() => [])) || [];
      const trades = (await tradesRes?.json().catch(() => [])) || [];
      const profits = (await profitsRes?.json().catch(() => [])) || [];

      const normalized: Txn[] = [
        ...deposits.map((d: any) => ({
          _id: d._id,
          userId: d.userId,
          user: d.user,
          type: "deposit",
          symbol: d.symbol || d.currency,
          amount: d.amount,
          status: d.status,
          createdAt: d.createdAt,
        })),
        ...withdrawals.map((w: any) => ({
          _id: w._id,
          userId: w.userId,
          user: w.user,
          type: "withdraw",
          symbol: w.symbol || w.currency,
          amount: w.amount,
          status: w.status,
          createdAt: w.createdAt,
        })),
        ...trades.map((t: any) => ({
          _id: t._id,
          userId: t.userId,
          user: t.user,
          type: t.orderType ? `${t.orderType} trade` : "trade",
          symbol: t.symbol,
          amount: t.amount || t.price,
          status: t.status || t.orderStatus,
          createdAt: t.createdAt,
        })),
        ...profits.map((p: any) => ({
          _id: p._id,
          userId: p.userId,
          user: p.user,
          type: "profit",
          symbol: p.symbol || p.currency,
          amount: p.amount,
          status: p.status,
          createdAt: p.createdAt,
        })),
      ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setTxns(normalized);
    } catch (err) {
      console.error("Failed to fetch transactions", err);
      setTxns([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = Array.isArray(txns) ? txns.filter((t) => {
    const term = search.toLowerCase();
    return (
      t.user?.email?.toLowerCase().includes(term) ||
      t.type?.toLowerCase().includes(term) ||
      (t.symbol || "").toLowerCase().includes(term)
    );
  }) : [];

  // Pagination logic
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedTxns = filtered.slice(startIndex, endIndex);

  const statusBadge = (status?: string) => {
    const s = (status || "").toLowerCase();
    if (s === "completed" || s === "approved") return <Badge variant="success">Completed</Badge>;
    if (s === "pending") return <Badge variant="warning">Pending</Badge>;
    if (s === "rejected" || s === "failed") return <Badge variant="destructive">Failed</Badge>;
    return <Badge variant="outline">{status || "Unknown"}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Transactions</h1>
          <p className="text-sm text-muted-foreground">Recent deposits, withdrawals, and trades</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={fetchTxns} disabled={loading}>
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <Card variant="glass" padding="lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email, type, or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">Recent Activity</CardTitle>
          <CardDescription>Showing {paginatedTxns.length} of {filtered.length} record(s) (Page {currentPage} of {totalPages || 1})</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          {loading ? (
            <div className="text-center py-10 text-sm text-muted-foreground">Loading transactions...</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">No transactions found</div>
          ) : (
            <div className="space-y-3">
              {paginatedTxns.map((txn) => (
                <div key={txn._id} className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-lg border border-border px-4 py-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">
                      {txn.type?.toUpperCase()} {txn.symbol ? `• ${txn.symbol}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {txn.user?.email || "Unknown user"} • {new Date(txn.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">
                      {txn.amount ? `$${txn.amount.toLocaleString()}` : "--"}
                    </p>
                    {statusBadge(txn.status)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-border">
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
