import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, Search, Filter, Eye, X, Calendar, FileText, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

interface KYC {
  _id: string;
  name: string;
  email: string;
  documentFront?: string;
  documentBack?: string;
  documentNumber: string;
  documentType?: string;
  dateOfBirth?: string;
  documentExpDate: string;
  status: boolean | string;
  createdAt: string;
  updatedAt: string;
}

export default function KYCApprovalPage() {
  const [kycs, setKycs] = useState<KYC[]>([]);
  const [filteredKycs, setFilteredKycs] = useState<KYC[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [previewKyc, setPreviewKyc] = useState<KYC | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchKycs();
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    filterKycs();
  }, [kycs, searchTerm, statusFilter]);

  const fetchKycs = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // Backend has no KYC list endpoint; derive from users
      const response = await fetch(`${API_URL}/api/auth/users`, { headers });
      const data = await response.json().catch(() => ({}));
      const users = data?.users || data || [];
      const mapped = (users as any[])
        .filter((u) => u.kycStatus)
        .map((u) => ({
          _id: u._id || u.id,
          name: u.name?.full || `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email,
          email: u.email,
          documentFront: u.documentFront,
          documentBack: u.documentBack,
          documentNumber: u.documentNumber || "N/A",
          documentType: u.documentType || "ID",
          dateOfBirth: u.dateOfBirth || "",
          documentExpDate: u.documentExpDate || "",
          status: u.kycStatus || "pending",
          createdAt: u.createdAt,
          updatedAt: u.updatedAt,
        }));
      setKycs(mapped);
    } catch (error) {
      console.error("Failed to fetch KYCs:", error);
      setKycs([]);
    } finally {
      setLoading(false);
    }
  };

  const filterKycs = () => {
    let filtered = kycs;

    // Status filter
    if (statusFilter !== "all") {
      if (statusFilter === "pending") {
        filtered = filtered.filter((k) => k.status === false || k.status === "pending");
      } else if (statusFilter === "approved") {
        filtered = filtered.filter((k) => k.status === true || k.status === "approved");
      } else if (statusFilter === "rejected") {
        filtered = filtered.filter((k) => k.status === "rejected");
      }
    }

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (k) =>
          k.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          k.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          k.documentNumber.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredKycs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handleApprove = async (kycData: KYC) => {
    setProcessingId(kycData._id);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/auth/approve-kyc/${kycData._id}`, {
        method: "PUT",
        headers,
      });

      if (response.ok) {
        await fetchKycs();
        alert("KYC approved successfully! Welcome email sent.");
      } else {
        const error = await response.json();
        alert(`Failed to approve: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Approval error:", error);
      alert("Failed to approve KYC");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (kycData: KYC) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    setProcessingId(kycData._id);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/auth/reject-kyc/${kycData._id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        await fetchKycs();
        alert(`KYC rejected. Rejection email sent.`);
      } else {
        const error = await response.json();
        alert(`Failed to reject: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Rejection error:", error);
      alert("Failed to reject KYC");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: boolean | string) => {
    if (status === true || status === "approved") {
      return <Badge variant="success">Approved</Badge>;
    } else if (status === "rejected") {
      return <Badge variant="destructive">Rejected</Badge>;
    } else {
      return <Badge variant="warning">Pending</Badge>;
    }
  };

  const isExpiringSoon = (expDate: string) => {
    if (!expDate) return false;
    const today = new Date();
    const expiryDate = new Date(expDate);
    const daysUntilExpiry = Math.floor((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 90; // Less than 90 days
  };

  const isExpired = (expDate: string) => {
    if (!expDate) return false;
    const today = new Date();
    const expiryDate = new Date(expDate);
    return expiryDate < today;
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredKycs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedKycs = filteredKycs.slice(startIndex, endIndex);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading KYC submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">KYC Approvals</h1>
        <p className="text-sm text-muted-foreground mt-1">Review and verify identity documents</p>
      </div>

      {/* Filters */}
      <Card variant="glass" padding="lg">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, name, or document number..."
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
      <div className="grid gap-4 md:grid-cols-4">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Submissions</p>
            <p className="text-2xl font-semibold mt-1">{kycs.length}</p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Pending Review</p>
            <p className="text-2xl font-semibold mt-1 text-orange-600">
              {kycs.filter((k) => k.status === false || k.status === "pending").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Approved</p>
            <p className="text-2xl font-semibold mt-1 text-green-600">
              {kycs.filter((k) => k.status === true || k.status === "approved").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Rejected</p>
            <p className="text-2xl font-semibold mt-1 text-red-600">
              {kycs.filter((k) => k.status === "rejected").length}
            </p>
          </div>
        </Card>
      </div>

      {/* KYC Table */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">KYC Submissions</CardTitle>
          <CardDescription>
            Showing {paginatedKycs.length} of {filteredKycs.length} {filteredKycs.length === 1 ? "submission" : "submissions"} (Page {currentPage} of {totalPages || 1})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          {filteredKycs.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No KYC submissions found</div>
          ) : (
            <div className="space-y-3">
              {paginatedKycs.map((kyc) => (
                <div
                  key={kyc._id}
                  className="flex flex-col gap-4 rounded-lg border border-border px-4 py-4 hover:bg-accent/5 transition-colors"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">{kyc.name}</p>
                        {getStatusBadge(kyc.status)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{kyc.email}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Submitted: {new Date(kyc.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setPreviewKyc(kyc)} className="gap-2">
                      <Eye className="h-4 w-4" />
                      View Documents
                    </Button>
                  </div>

                  {/* Document Details */}
                  <div className="grid gap-3 md:grid-cols-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Document Number</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="font-mono text-xs">{kyc.documentNumber}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Expiry Date</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs">
                          {kyc.documentExpDate ? new Date(kyc.documentExpDate).toLocaleDateString() : "Not provided"}
                        </p>
                        {kyc.documentExpDate && isExpired(kyc.documentExpDate) && (
                          <Badge variant="destructive" className="text-xs ml-1">
                            Expired
                          </Badge>
                        )}
                        {kyc.documentExpDate && !isExpired(kyc.documentExpDate) && isExpiringSoon(kyc.documentExpDate) && (
                          <Badge variant="warning" className="text-xs ml-1">
                            Expiring Soon
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Document Type</p>
                      <p className="text-xs mt-0.5">{kyc.documentType || "Not provided"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Date of Birth</p>
                      <p className="text-xs mt-0.5">
                        {kyc.dateOfBirth ? new Date(kyc.dateOfBirth).toLocaleDateString() : "Not provided"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Documents</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {kyc.documentFront && <Badge variant="outline" className="text-xs">Front</Badge>}
                        {kyc.documentBack && <Badge variant="outline" className="text-xs">Back</Badge>}
                        {!kyc.documentFront && !kyc.documentBack && (
                          <p className="text-xs text-red-600">No documents</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Warning for expired documents */}
                  {kyc.documentExpDate && isExpired(kyc.documentExpDate) && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-red-600">Expired Document</p>
                        <p className="text-xs text-red-600/80 mt-0.5">
                          This document expired on {new Date(kyc.documentExpDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {(kyc.status === false || kyc.status === "pending") && (
                    <div className="flex gap-2 pt-2 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => handleApprove(kyc)}
                        disabled={processingId === kyc._id || isExpired(kyc.documentExpDate)}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {processingId === kyc._id ? "Processing..." : "Approve"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReject(kyc)}
                        disabled={processingId === kyc._id}
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

      {/* Document Preview Modal */}
      {previewKyc && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewKyc(null)}
        >
          <div
            className="relative max-w-5xl w-full bg-card rounded-2xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/95 backdrop-blur-xl">
              <div>
                <h2 className="text-lg font-semibold">{previewKyc.name}</h2>
                <p className="text-sm text-muted-foreground">{previewKyc.email}</p>
              </div>
              <button
                onClick={() => setPreviewKyc(null)}
                className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Document Info */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-xs text-muted-foreground">Document Number</p>
                  <p className="text-sm font-mono mt-1">{previewKyc.documentNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Expiry Date</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm">{new Date(previewKyc.documentExpDate).toLocaleDateString()}</p>
                    {isExpired(previewKyc.documentExpDate) && (
                      <Badge variant="destructive" className="text-xs">
                        Expired
                      </Badge>
                    )}
                    {!isExpired(previewKyc.documentExpDate) && isExpiringSoon(previewKyc.documentExpDate) && (
                      <Badge variant="warning" className="text-xs">
                        Expiring Soon
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Document Images */}
              <div className="grid gap-6 md:grid-cols-2">
                {/* Front */}
                {previewKyc.documentFront ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Document Front</p>
                    <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden border border-border">
                      <img
                        src={previewKyc.documentFront}
                        alt="Document Front"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Document Front</p>
                    <div className="aspect-[3/2] bg-muted rounded-lg border border-border flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No document uploaded</p>
                    </div>
                  </div>
                )}

                {/* Back */}
                {previewKyc.documentBack ? (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Document Back</p>
                    <div className="relative aspect-[3/2] bg-muted rounded-lg overflow-hidden border border-border">
                      <img
                        src={previewKyc.documentBack}
                        alt="Document Back"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Document Back</p>
                    <div className="aspect-[3/2] bg-muted rounded-lg border border-border flex items-center justify-center">
                      <p className="text-sm text-muted-foreground">No document uploaded</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions in Modal */}
              {(previewKyc.status === false || previewKyc.status === "pending") && (
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button
                    onClick={() => {
                      handleApprove(previewKyc);
                      setPreviewKyc(null);
                    }}
                    disabled={processingId === previewKyc._id || isExpired(previewKyc.documentExpDate)}
                    className="flex-1 gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {processingId === previewKyc._id ? "Processing..." : "Approve KYC"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => {
                      handleReject(previewKyc);
                      setPreviewKyc(null);
                    }}
                    disabled={processingId === previewKyc._id}
                    className="flex-1 gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject KYC
                  </Button>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      setPreviewKyc(null);
                      setProcessingId(previewKyc._id);
                      try {
                        const token = localStorage.getItem("token");
                        const headers = {
                          ...(token ? { Authorization: `Bearer ${token}` } : {}),
                        };
                        await fetch(`${API_URL}/api/auth/reject-kyc/${previewKyc._id}`, {
                          method: "PUT",
                          headers,
                        });
                        await fetchKycs();
                      } catch (e) {
                        console.error("Reset KYC failed", e);
                      } finally {
                        setProcessingId(null);
                      }
                    }}
                    disabled={processingId === previewKyc._id}
                    className="flex-1 gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reset KYC
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
