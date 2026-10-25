import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TxStatus, TxStatusBadge } from "@/components/common/tx-status";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, Filter, Copy, ChevronLeft, ChevronRight, Pencil, Save } from "lucide-react";

interface Deposit {
  description?: string;
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
  walletData: {
    address: string;
    network: string;
    coinName: string;
    convertedAmount?: number;
  };
  status: string;
  date: string;
  createdAt: string;
}

type DepositEditForm = {
  amount: string;
  currency: string;
  address: string;
  network: string;
};

export default function DepositsApprovalPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [filteredDeposits, setFilteredDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [editingDepositId, setEditingDepositId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<DepositEditForm>({
    amount: "",
    currency: "",
    address: "",
    network: "",
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDeposits();
  }, []);

  useEffect(() => {
    filterDeposits();
  }, [deposits, searchTerm, statusFilter]);

  const fetchDeposits = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/transaction/deposits`, { headers });
      const data = await response.json();
      setDeposits(data?.deposits || data || []);
    } catch (error) {
      console.error("Failed to fetch deposits:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterDeposits = () => {
    let filtered = deposits;

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((d) => d.status === statusFilter);
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((d) => {
        const email = d.user?.email?.toLowerCase?.() || "";
        const fullName = d.user?.name?.full?.toLowerCase?.() || "";
        const firstName = d.user?.name?.first?.toLowerCase?.() || "";
        const lastName = d.user?.name?.last?.toLowerCase?.() || "";
        const addr = d.walletData?.address?.toLowerCase?.() || "";
        const term = searchTerm.toLowerCase();
        return (
          email.includes(term) ||
          fullName.includes(term) ||
          firstName.includes(term) ||
          lastName.includes(term) ||
          addr.includes(term)
        );
      });
    }

    setFilteredDeposits(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleApprove = async (deposit: Deposit) => {
    setProcessingId(deposit._id);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/transaction/deposit/approve/${deposit._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          email: deposit.user.email,
          amount: deposit.amount,
        }),
      });

      if (response.ok) {
        // Refresh deposits
        await fetchDeposits();
        alert("Deposit approved successfully!");
      } else {
        const error = await response.json();
        alert(`Failed to approve: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve deposit");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (deposit: Deposit) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setProcessingId(deposit._id);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/transaction/deposit/reject/${deposit._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ email: deposit.user.email, amount: deposit.amount, reason }),
      });

      if (response.ok) {
        await fetchDeposits();
        alert("Deposit rejected");
      } else {
        const error = await response.json();
        alert(`Failed to reject: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject deposit");
    } finally {
      setProcessingId(null);
    }
  };

  const startEdit = (deposit: Deposit) => {
    setEditingDepositId(deposit._id);
    setEditForm({
      amount: String(deposit.amount || ""),
      currency: deposit.currency || "",
      address: deposit.walletData?.address || "",
      network: deposit.walletData?.network || "",
    });
  };

  const handleSaveEdit = async (deposit: Deposit) => {
    setProcessingId(deposit._id);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/transaction/deposit/${deposit._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({
          amount: Number(editForm.amount),
          symbol: editForm.currency,
          address: editForm.address,
          network: editForm.network,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || "Failed to update deposit");
      }

      setEditingDepositId(null);
      await fetchDeposits();
      alert("Deposit updated successfully");
    } catch (error: any) {
      console.error("Deposit update error:", error);
      alert(`Failed to update deposit: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getStatusBadge = (status: string) => <TxStatusBadge type="deposit" status={status} audience="admin" />;

  // Pagination logic
  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDeposits = filteredDeposits.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading deposits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Deposit Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and approve pending deposits</p>
      </div>

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
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Deposits</p>
            <p className="text-2xl font-semibold mt-1">{deposits.length}</p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Pending</p>
            <p className="text-2xl font-semibold mt-1 text-orange-600">
              {deposits.filter((d) => d.status === "pending").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Approved Today</p>
            <p className="text-2xl font-semibold mt-1 text-green-600">
              {
                deposits.filter(
                  (d) =>
                    d.status === "approved" &&
                    new Date(d.createdAt).toDateString() === new Date().toDateString()
                ).length
              }
            </p>
          </div>
        </Card>
      </div>

      {/* Deposits Table */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">Deposits</CardTitle>
          <CardDescription>
            Showing {paginatedDeposits.length} of {filteredDeposits.length} {filteredDeposits.length === 1 ? "deposit" : "deposits"} (Page {currentPage} of {totalPages || 1})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          {filteredDeposits.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">
              No deposits found
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedDeposits.map((deposit) => (
                <div
                  key={deposit._id}
                  className="flex flex-col gap-4 rounded-lg border border-border px-4 py-4 hover:bg-accent/5 transition-colors"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">
                          {deposit.user?.name?.full || deposit.user?.name?.first || deposit.user?.email || "Unknown User"}
                        </p>
                        <TxStatus type="deposit" status={deposit.status} reason={deposit.description} audience="admin" className="max-w-[220px]" />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{deposit.user?.email || "No email"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-semibold">
                        {deposit.currency} {deposit.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(deposit.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Wallet Details */}
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Network</p>
                      <p className="font-medium mt-0.5">{deposit.walletData?.network || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Coin</p>
                      <p className="font-medium mt-0.5">{deposit.walletData?.coinName || (deposit.walletData as any)?.coin || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Wallet Address</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="font-mono text-xs truncate max-w-full sm:max-w-[200px]">
                          {deposit.walletData?.address || "—"}
                        </p>
                        <button
                          onClick={() => deposit.walletData?.address && copyToClipboard(deposit.walletData.address)}
                          className="p-1 hover:bg-accent/10 rounded"
                        >
                          <Copy className="h-3 w-3 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {editingDepositId === deposit._id && (
                    <div className="grid gap-3 rounded-lg border border-border/70 bg-muted/20 p-3 grid-cols-2 md:grid-cols-4">
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
                          value={editForm.address}
                          onChange={(e) => setEditForm((prev) => ({ ...prev, address: e.target.value }))}
                        />
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {deposit.status === "pending" && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border/50">
                      {editingDepositId === deposit._id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEdit(deposit)}
                            disabled={processingId === deposit._id}
                            className="gap-2"
                          >
                            <Save className="h-4 w-4" />
                            Save Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingDepositId(null)}
                            disabled={processingId === deposit._id}
                          >
                            Cancel Edit
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(deposit)}
                          disabled={processingId === deposit._id}
                          className="gap-2"
                        >
                          <Pencil className="h-4 w-4" />
                          Edit
                        </Button>
                      )}
                      <Button
                        size="sm"
                        onClick={() => handleApprove(deposit)}
                        disabled={processingId === deposit._id || editingDepositId === deposit._id}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {processingId === deposit._id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(deposit)}
                        disabled={processingId === deposit._id || editingDepositId === deposit._id}
                        className="gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Reject
                      </Button>
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
