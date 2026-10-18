import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, Filter, Copy, RefreshCw, AlertTriangle, ChevronLeft, ChevronRight, Pencil, Save } from "lucide-react";

const API_URL_BASE = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "")).replace(/\/$/, "");

interface Withdrawal {
  _id: string;
  user: {
    id: string;
    email: string;
    name?: {
      full?: string;
      first?: string;
      last?: string;
    };
  };
  amount: number;
  currency: string;
  walletAddress: string;
  network: string;
  status: string;
  failureReason?: string;
  createdAt: string;
  processedAt?: string;
}

type WithdrawalEditForm = {
  amount: string;
  currency: string;
  walletAddress: string;
  network: string;
};

export default function WithdrawalsApprovalPage() {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [filteredWithdrawals, setFilteredWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingWithdrawalId, setEditingWithdrawalId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<WithdrawalEditForm>({
    amount: "",
    currency: "",
    walletAddress: "",
    network: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  useEffect(() => {
    filterWithdrawals();
  }, [withdrawals, searchTerm, statusFilter]);

  const fetchWithdrawals = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/transaction/withdrawals?limit=100&sort=-createdAt`, { headers });
      const data = await response.json();
      setWithdrawals(data?.withdrawals || data || []);
    } catch (error) {
      console.error("Failed to fetch withdrawals:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterWithdrawals = () => {
    let filtered = withdrawals;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((w) => w.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (w) =>
          w.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.user?.name?.full?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.user?.name?.first?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.user?.name?.last?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.walletAddress?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredWithdrawals(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleApprove = async (withdrawal: Withdrawal) => {
    setProcessingId(withdrawal._id);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/transaction/withdrawal/approve/${withdrawal._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          email: withdrawal.user.email,
          amount: withdrawal.amount,
        }),
      });

      if (response.ok) {
        await fetchWithdrawals();
        alert("Withdrawal approved successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to approve: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (withdrawal: Withdrawal) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setProcessingId(withdrawal._id);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/transaction/withdrawal/reject/${withdrawal._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          email: withdrawal.user.email,
          amount: withdrawal.amount,
          reason,
        }),
      });

      if (response.ok) {
        await fetchWithdrawals();
        alert("Withdrawal rejected");
      } else {
        const error = await response.json();
        alert(`Failed to reject: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const startEdit = (withdrawal: Withdrawal) => {
    setEditingWithdrawalId(withdrawal._id);
    setEditForm({
      amount: String(withdrawal.amount || ""),
      currency: withdrawal.currency || "",
      walletAddress: withdrawal.walletAddress || "",
      network: withdrawal.network || "",
    });
  };

  const handleSaveEdit = async (withdrawal: Withdrawal) => {
    setProcessingId(withdrawal._id);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/transaction/withdrawal/${withdrawal._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          amount: Number(editForm.amount),
          symbol: editForm.currency,
          address: editForm.walletAddress,
          network: editForm.network,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update withdrawal");
      }

      setEditingWithdrawalId(null);
      await fetchWithdrawals();
      alert("Withdrawal updated successfully");
    } catch (error: any) {
      console.error("Withdrawal update error:", error);
      alert(`Failed to update withdrawal: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleRetry = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL_BASE}/api/withdrawals/admin/process-pending`, {
        method: "POST",
        headers,
        body: JSON.stringify({ transactionIds: [withdrawalId] }),
      });

      if (response.ok) {
        await fetchWithdrawals();
        alert("Withdrawal retry initiated");
      } else {
        const error = await response.json();
        alert(`Failed to retry: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Retry error:", error);
      alert("Failed to retry withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const handleCheckStatus = async (withdrawalId: string) => {
    setProcessingId(withdrawalId);
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL_BASE}/api/withdrawals/${withdrawalId}/status`, { headers });
      const data = await response.json();

      if (response.ok) {
        await fetchWithdrawals();
        const status = data.withdrawal?.status || data.status || "unknown";
        alert(`Status: ${status}`);
      } else{
        alert(`Failed to check status: ${data.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Status check error:", error);
      alert("Failed to check withdrawal status");
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "approved":
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "rejected":
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      case "processing":
        return <Badge variant="outline">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedWithdrawals = filteredWithdrawals.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading withdrawals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Withdrawal Approvals</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and process pending withdrawals (Manual Mode)</p>
        </div>
      </div>

      {/* Manual Mode Notice */}
      {withdrawals.filter((w) => w.status === "pending").length > 0 && (
        <Card variant="glass" padding="lg">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div>
              <p className="font-semibold">Manual Processing Mode</p>
              <p className="text-sm text-muted-foreground">All withdrawals require manual approval and processing.</p>
            </div>
          </div>
        </Card>
      )}

      {/* Filters */}
      <Card variant="glass" padding="lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or wallet address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Withdrawals</p>
            <p className="text-2xl font-semibold mt-1">{withdrawals.length}</p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold mt-1 text-orange-600">
              {withdrawals.filter((w) => w.status === "pending").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Processing</p>
            <p className="text-2xl font-semibold mt-1 text-blue-600">
              {withdrawals.filter((w) => w.status === "processing").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Completed Today</p>
            <p className="text-2xl font-semibold mt-1 text-green-600">
              {
                withdrawals.filter(
                  (w) =>
                    (w.status === "completed" || w.status === "approved") &&
                    new Date(w.processedAt || w.createdAt).toDateString() === new Date().toDateString()
                ).length
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Withdrawals Table */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">Withdrawals</CardTitle>
          <CardDescription>
            Showing {paginatedWithdrawals.length} of {filteredWithdrawals.length} {filteredWithdrawals.length === 1 ? "withdrawal" : "withdrawals"} (Page {currentPage} of {totalPages || 1})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          {filteredWithdrawals.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No withdrawals found</div>
          ) : (
            <div className="space-y-3">
              {paginatedWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="flex flex-col gap-4 rounded-lg border border-border px-4 py-4 hover:bg-accent/5 transition-colors"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {withdrawal.user?.name?.full || withdrawal.user?.name?.first || withdrawal.user?.email || "Unknown User"}
                        </p>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{withdrawal.user?.email || "No email"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {withdrawal.currency} {withdrawal.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(withdrawal.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Wallet Details */}
                  <div className="grid gap-3 md:grid-cols-2 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Network</p>
                      <p className="font-medium mt-0.5">{withdrawal.network}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Wallet Address</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="font-mono text-xs truncate max-w-[300px]">{withdrawal.walletAddress}</p>
                        <button
                          onClick={() => copyToClipboard(withdrawal.walletAddress)}
                          className="p-1 hover:bg-accent/10 rounded"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingWithdrawalId === withdrawal._id && (
                    <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-3 md:grid-cols-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Amount</p>
                        <Input
                          type="number"
                          step="0.00000001"
                          value={editForm.amount}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, amount: e.target.value }))}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Currency</p>
                        <Input
                          value={editForm.currency}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, currency: e.target.value.toUpperCase() }))}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Network</p>
                        <Input
                          value={editForm.network}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, network: e.target.value }))}
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Wallet Address</p>
                        <Input
                          value={editForm.walletAddress}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, walletAddress: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Failure Reason */}
                  {withdrawal.failureReason && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-red-600">Failure Reason</p>
                        <p className="text-xs text-red-600/80 mt-0.5">{withdrawal.failureReason}</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {withdrawal.status === "pending" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                      {editingWithdrawalId === withdrawal._id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(withdrawal)}
                            disabled={processingId === withdrawal._id}
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingWithdrawalId(null)}
                            disabled={processingId === withdrawal._id}
                          >
                            Cancel Edit
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(withdrawal)}
                          disabled={processingId === withdrawal._id}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleApprove(withdrawal)}
                        disabled={processingId === withdrawal._id || editingWithdrawalId === withdrawal._id}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {processingId === withdrawal._id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(withdrawal)}
                        disabled={processingId === withdrawal._id || editingWithdrawalId === withdrawal._id}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {(withdrawal.status === "processing" || withdrawal.status === "failed") && (
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCheckStatus(withdrawal._id)}
                        disabled={processingId === withdrawal._id}
                        className="gap-2"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Check Status
                      </Button>
                      {withdrawal.status === "failed" && (
                        <Button
                          size="sm"
                          onClick={() => handleRetry(withdrawal._id)}
                          disabled={processingId === withdrawal._id}
                          className="gap-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Retry
                        </Button>
                      )}
                    </div>
                  )}
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
