import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { COUNTRIES } from "@/lib/countries";
import {
  Search,
  Eye,
  Ban,
  CheckCircle,
  Trash2,
  X,
  User as UserIcon,
  Mail,
  Calendar,
  Shield,
  LayoutDashboard,
  MapPin,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface User {
  _id: string;
  title?: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  accountNumber?: string;
  routingNumber?: string;
  accountStatus: string;
  kycStatus: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  documentFront?: string;
  documentBack?: string;
  documentType?: string;
  documentNumber?: string;
  phone?: string;
  dob?: string;
  houseNo?: string;
  streetAddress?: string;
  city?: string;
  province?: string;
  zipCode?: string;
  country?: string;
  countryCode?: string;
  yearsTrading?: string;
  tradingFrequency?: string;
  instruments?: string;
  knowledgeLevel?: string;
  preferredMarkets?: string;
  tradingPlatforms?: string;
  annualIncome?: string;
  incomeSource?: string;
  taxResidency?: string;
  dateOfBirth?: string;
  withdrawalsDisabled?: boolean;
  withdrawalsDisabledReason?: string;
  assets?: Array<{
    symbol: string;
    name?: string;
    spot: number;
    funding?: number;
  }>;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState<{
    accountStatus: string;
    kycStatus: string;
    password: string;
    accountNumber: string;
    routingNumber: string;
    withdrawalsDisabled: boolean;
    withdrawalsDisabledReason: string;
    profitToAdd: string;
    assets: Array<{
      symbol: string;
      name?: string;
      spot: number;
      funding?: number;
    }>;
  } | null>(null);
  const limit = 20;

  const getLocationLabel = (user: User) => {
    const rawCountry = (user.country || user.countryCode || "").trim();
    const countryCode = (user.countryCode || rawCountry).trim().toUpperCase();
    const countryName =
      rawCountry.length > 2
        ? rawCountry
        : COUNTRIES.find((country) => country.code === countryCode)?.name || rawCountry || "Not set";

    if (countryName === "Not set") return countryName;
    return countryCode && countryName !== countryCode ? `${countryName} (${countryCode})` : countryName;
  };

  const getCountryLabel = (value?: string) => {
    if (!value) return "Not set";
    const normalized = value.trim().toUpperCase();
    const countryName = COUNTRIES.find((country) => country.code === normalized)?.name;
    return countryName ? `${countryName} (${normalized})` : value;
  };

  const formatDob = (value?: string) => {
    if (!value) return "Not set";
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(value)) return value;
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    return parsed.toLocaleDateString();
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: limit.toString(),
        ...(searchTerm ? { search: searchTerm } : {}),
      });

      const data = await apiGet<{
        users: User[];
        page: number;
        limit: number;
        totalUsers: number;
        totalPages: number;
      }>(`/api/auth/users?${params}`);

      setUsers(data.users || []);
      setTotalPages(data.totalPages || 1);
      setTotalUsers(data.totalUsers || 0);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const openUserModal = (user: User) => {
    setSelectedUser(user);
    setEditForm({
      accountStatus: user.accountStatus || "active",
      kycStatus: user.kycStatus || "pending",
      password: "",
      accountNumber: user.accountNumber || "",
      routingNumber: user.routingNumber || "",
      withdrawalsDisabled: Boolean(user.withdrawalsDisabled),
      withdrawalsDisabledReason: user.withdrawalsDisabledReason || "",
      profitToAdd: "",
      assets: user.assets || [],
    });
  };

  const handleAdminUpdate = async () => {
    if (!selectedUser || !editForm) return;
    setProcessingId(selectedUser._id);
    try {
      const profitAmount = editForm.profitToAdd.trim() ? Number(editForm.profitToAdd) : 0;
      if (editForm.profitToAdd.trim() && !Number.isFinite(profitAmount)) {
        alert("Invalid profit amount");
        setProcessingId(null);
        return;
      }

      const payload: Record<string, any> = {
        accountStatus: editForm.accountStatus,
        kycStatus: editForm.kycStatus,
        accountNumber: editForm.accountNumber,
        routingNumber: editForm.routingNumber,
        withdrawalsDisabled: editForm.withdrawalsDisabled,
        withdrawalsDisabledReason: editForm.withdrawalsDisabledReason,
        assets: editForm.assets,
      };
      if (editForm.password.trim()) {
        payload.password = editForm.password.trim();
      }

      await apiPut(`/api/auth/update-user/${selectedUser._id}`, payload);
      if (profitAmount !== 0) {
        await apiPost("/api/transaction/profit", {
          userId: selectedUser._id,
          amount: profitAmount,
          symbol: "USDT",
          description: profitAmount > 0 ? "Profit credited by admin" : "Profit adjusted by admin",
        });
      }
      alert("User updated successfully");
      await fetchUsers();
      setSelectedUser(null);
    } catch (error: any) {
      console.error("Admin update error:", error);
      alert(`Failed to update user: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleSuspend = async (userId: string) => {
    if (!confirm("Are you sure you want to suspend this user?")) return;

    setProcessingId(userId);
    try {
      await apiPut(`/api/auth/update-user/${userId}`, { accountStatus: "suspended" });
      await fetchUsers();
      alert("User suspended successfully");
    } catch (error: any) {
      console.error("Suspend error:", error);
      alert(`Failed to suspend: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleActivate = async (userId: string) => {
    setProcessingId(userId);
    try {
      await apiPut(`/api/auth/update-user/${userId}`, { accountStatus: "active" });
      await fetchUsers();
      alert("User activated successfully");
    } catch (error: any) {
      console.error("Activate error:", error);
      alert(`Failed to activate: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleUpdateKYC = async (userId: string, kycStatus: string) => {
    setProcessingId(userId);
    try {
      await apiPut(`/api/auth/update-user/${userId}`, { kycStatus });
      await fetchUsers();
      alert(`KYC status updated to ${kycStatus}`);
    } catch (error: any) {
      console.error("KYC update error:", error);
      alert(`Failed to update KYC: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (userId: string, userEmail: string) => {
    const confirmation = prompt(
      `Type "${userEmail}" to confirm deletion. This action CANNOT be undone.`
    );

    if (confirmation !== userEmail) {
      alert("Deletion cancelled. Email did not match.");
      return;
    }

    setProcessingId(userId);
    try {
      await apiPut(`/api/auth/update-user/${userId}`, { accountStatus: "deactivated" });
      await fetchUsers();
      alert("User marked as deactivated");
    } catch (error: any) {
      console.error("Delete error:", error);
      alert(`Failed to delete user: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleOpenDashboard = async (user: User) => {
    if (!confirm(`Open ${user.email}'s dashboard as admin?`)) return;

    setProcessingId(user._id);
    try {
      const currentToken = localStorage.getItem("token");
      const data = await apiPost<{ token: string }>(`/api/auth/admin/users/${user._id}/dashboard-token`);

      if (currentToken) {
        localStorage.setItem("adminReturnToken", currentToken);
        localStorage.setItem("adminReturnPath", "/admin/users");
      }

      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (error: any) {
      console.error("Dashboard access error:", error);
      alert(`Failed to open dashboard: ${error.message || "Unknown error"}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getAccountStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getKYCStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge variant="success">Verified</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "unverified":
        return <Badge variant="outline">Unverified</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTotalBalance = (user: User) => {
    if (!user.assets || user.assets.length === 0) return 0;
    return user.assets.reduce((total, asset) => {
      const spotBalance = asset.spot || 0;
      const fundingBalance = asset.funding || 0;
      return total + spotBalance + fundingBalance;
    }, 0);
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 min-w-0">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage platform users and permissions</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-semibold">{totalUsers}</p>
          <p className="text-xs text-muted-foreground">Total Users</p>
        </div>
      </div>

      {/* Search */}
      <Card variant="glass" padding="lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or username..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Active Users</p>
            <p className="text-2xl font-semibold mt-1 text-green-600">
              {users.filter((u) => u.accountStatus === "active").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Suspended</p>
            <p className="text-2xl font-semibold mt-1 text-red-600">
              {users.filter((u) => u.accountStatus === "suspended").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">KYC Verified</p>
            <p className="text-2xl font-semibold mt-1 text-green-600">
              {users.filter((u) => u.kycStatus === "approved").length}
            </p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Email Verified</p>
            <p className="text-2xl font-semibold mt-1 text-blue-600">
              {users.filter((u) => u.isEmailVerified).length}
            </p>
          </div>
        </Card>
      </div>

      {/* Users Table */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">Users</CardTitle>
          <CardDescription>
            Showing {users.length} users (Page {currentPage} of {totalPages})
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6">
          {users.length === 0 ? (
            <div className="text-center py-12 text-sm text-muted-foreground">No users found</div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex flex-col gap-4 rounded-lg border border-border px-3 py-3 sm:px-4 sm:py-4 hover:bg-accent/5 transition-colors min-w-0"
                >
                  {/* Top Row */}
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-sm font-semibold">
                          {user.firstName || user.lastName ? `${user.firstName} ${user.lastName}`.trim() : user.email || "Unknown User"}
                        </p>
                        {getAccountStatusBadge(user.accountStatus)}
                        {getKYCStatusBadge(user.kycStatus)}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 break-all">{user.email || "No email"}</p>
                      {user.username && (
                        <p className="text-xs text-muted-foreground mt-0.5">@{user.username}</p>
                      )}
                    </div>
                    <div className="sm:text-right">
                      <p className="text-lg font-semibold">${getTotalBalance(user).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total Balance</p>
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Assets</p>
                      <p className="text-sm mt-0.5">{user.assets?.length || 0} assets</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">KYC Status</p>
                      <p className="text-sm mt-0.5 capitalize">{user.kycStatus || "Not submitted"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm mt-0.5">{getLocationLabel(user)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Joined</p>
                      <p className="text-sm mt-0.5">{new Date(user.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/50 sm:flex sm:flex-wrap [&>button]:w-full sm:[&>button]:w-auto">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openUserModal(user)}
                      disabled={processingId === user._id}
                      className="gap-2"
                    >
                      <Eye className="h-4 w-4" />
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenDashboard(user)}
                      disabled={processingId === user._id}
                      className="gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Open Dashboard
                    </Button>

                    {user.accountStatus === "active" ? (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleSuspend(user._id)}
                        disabled={processingId === user._id}
                        className="gap-2"
                      >
                        <Ban className="h-4 w-4" />
                        Suspend
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleActivate(user._id)}
                        disabled={processingId === user._id}
                        className="gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Activate
                      </Button>
                    )}

                    {user.kycStatus !== "approved" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateKYC(user._id, "approved")}
                        disabled={processingId === user._id}
                        className="gap-2"
                      >
                        <Shield className="h-4 w-4" />
                        Approve KYC
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(user._id, user.email)}
                      disabled={processingId === user._id}
                      className="gap-2 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-2 mt-6 pt-6 border-t border-border">
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

      {/* User Details Modal */}
      {selectedUser && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 p-0 sm:p-4"
          onClick={() => setSelectedUser(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[100dvh] bg-card rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-border bg-card/95 backdrop-blur-xl">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedUser.firstName || selectedUser.lastName ? `${selectedUser.firstName} ${selectedUser.lastName}`.trim() : selectedUser.email || "Unknown User"}
                  </h2>
                  <p className="text-sm text-muted-foreground">{selectedUser.email || "No email"}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-2 hover:bg-accent/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-6 max-h-[80dvh] sm:max-h-[70vh] overflow-y-auto">
              {/* Status Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Account Status</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-2 px-4 py-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Account Status</p>
                    </div>
                    <select
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      value={editForm?.accountStatus || ""}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, accountStatus: e.target.value } : null)}
                    >
                      <option value="active">Active</option>
                      <option value="suspended">Suspended</option>
                      <option value="pending">Pending</option>
                      <option value="deactivated">Deactivated</option>
                    </select>
                    <div className="text-xs text-muted-foreground">Current: {selectedUser.accountStatus}</div>
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-3 rounded-lg border border-border">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">KYC Status</p>
                    </div>
                    <select
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      value={editForm?.kycStatus || ""}
                      onChange={(e) => setEditForm(prev => prev ? { ...prev, kycStatus: e.target.value } : null)}
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                      <option value="unverified">Unverified</option>
                    </select>
                    <div className="text-xs text-muted-foreground">Current: {selectedUser.kycStatus}</div>
                  </div>
                  <div className="flex flex-col gap-2 px-4 py-3 rounded-lg border border-border md:col-span-2">
                    <div className="flex items-center gap-2">
                      <Ban className="h-5 w-5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Withdrawals</p>
                    </div>
                    <select
                      className="rounded-lg border border-border bg-card px-3 py-2 text-sm"
                      value={editForm?.withdrawalsDisabled ? "disabled" : "enabled"}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, withdrawalsDisabled: e.target.value === "disabled" } : null
                        )
                      }
                    >
                      <option value="enabled">Enabled</option>
                      <option value="disabled">Disabled</option>
                    </select>
                    <Input
                      placeholder="Reason shown to the user (optional)"
                      value={editForm?.withdrawalsDisabledReason || ""}
                      onChange={(e) =>
                        setEditForm((prev) =>
                          prev ? { ...prev, withdrawalsDisabledReason: e.target.value } : null
                        )
                      }
                      disabled={!editForm?.withdrawalsDisabled}
                    />
                    <div className="text-xs text-muted-foreground">
                      Current: {selectedUser.withdrawalsDisabled ? "Disabled" : "Enabled"}
                    </div>
                  </div>
                </div>
              </div>

              {(selectedUser.title ||
                selectedUser.dob ||
                selectedUser.houseNo ||
                selectedUser.streetAddress ||
                selectedUser.city ||
                selectedUser.province ||
                selectedUser.zipCode ||
                selectedUser.yearsTrading ||
                selectedUser.tradingFrequency ||
                selectedUser.instruments ||
                selectedUser.knowledgeLevel ||
                selectedUser.preferredMarkets ||
                selectedUser.tradingPlatforms ||
                selectedUser.annualIncome ||
                selectedUser.incomeSource ||
                selectedUser.taxResidency) && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">Onboarding Profile</h3>
                  <div className="grid gap-4 md:grid-cols-2">
                    {selectedUser.title && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Title</p>
                        <p className="text-sm mt-1">{selectedUser.title}</p>
                      </div>
                    )}
                    {selectedUser.dob && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                        <p className="text-sm mt-1">{formatDob(selectedUser.dob)}</p>
                      </div>
                    )}
                    {(selectedUser.houseNo || selectedUser.streetAddress) && (
                      <div className="px-4 py-3 rounded-lg border border-border md:col-span-2">
                        <p className="text-xs text-muted-foreground">Street Address</p>
                        <p className="text-sm mt-1">
                          {[selectedUser.houseNo, selectedUser.streetAddress].filter(Boolean).join(" ")}
                        </p>
                      </div>
                    )}
                    {(selectedUser.city || selectedUser.province || selectedUser.zipCode) && (
                      <div className="px-4 py-3 rounded-lg border border-border md:col-span-2">
                        <p className="text-xs text-muted-foreground">City / Province / Zip</p>
                        <p className="text-sm mt-1">
                          {[selectedUser.city, selectedUser.province, selectedUser.zipCode].filter(Boolean).join(", ")}
                        </p>
                      </div>
                    )}
                    {selectedUser.yearsTrading && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Years Trading</p>
                        <p className="text-sm mt-1">{selectedUser.yearsTrading}</p>
                      </div>
                    )}
                    {selectedUser.tradingFrequency && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Trading Frequency</p>
                        <p className="text-sm mt-1">{selectedUser.tradingFrequency}</p>
                      </div>
                    )}
                    {selectedUser.instruments && (
                      <div className="px-4 py-3 rounded-lg border border-border md:col-span-2">
                        <p className="text-xs text-muted-foreground">Instruments</p>
                        <p className="text-sm mt-1">{selectedUser.instruments}</p>
                      </div>
                    )}
                    {selectedUser.knowledgeLevel && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Knowledge Level</p>
                        <p className="text-sm mt-1">{selectedUser.knowledgeLevel}</p>
                      </div>
                    )}
                    {selectedUser.preferredMarkets && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Preferred Markets</p>
                        <p className="text-sm mt-1">{selectedUser.preferredMarkets}</p>
                      </div>
                    )}
                    {selectedUser.tradingPlatforms && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Trading Platforms</p>
                        <p className="text-sm mt-1">{selectedUser.tradingPlatforms}</p>
                      </div>
                    )}
                    {selectedUser.annualIncome && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Annual Income</p>
                        <p className="text-sm mt-1">{selectedUser.annualIncome}</p>
                      </div>
                    )}
                    {selectedUser.incomeSource && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Income Source</p>
                        <p className="text-sm mt-1">{selectedUser.incomeSource}</p>
                      </div>
                    )}
                    {selectedUser.taxResidency && (
                      <div className="px-4 py-3 rounded-lg border border-border">
                        <p className="text-xs text-muted-foreground">Tax Residency</p>
                        <p className="text-sm mt-1">{getCountryLabel(selectedUser.taxResidency)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* KYC Documents Section */}
              {(selectedUser.documentFront || selectedUser.documentBack || selectedUser.documentType || selectedUser.documentNumber) && (
                <div>
                  <h3 className="text-sm font-semibold mb-3">KYC Documents</h3>
                  <div className="space-y-4">
                    {/* Document Info */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {selectedUser.documentType && (
                        <div className="px-4 py-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">Document Type</p>
                          <p className="text-sm mt-1 font-medium capitalize">
                            {selectedUser.documentType.replace(/_/g, ' ')}
                          </p>
                        </div>
                      )}
                      {selectedUser.documentNumber && (
                        <div className="px-4 py-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">Document Number</p>
                          <p className="text-sm mt-1 font-mono">{selectedUser.documentNumber}</p>
                        </div>
                      )}
                      {selectedUser.phone && (
                        <div className="px-4 py-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">Phone</p>
                          <p className="text-sm mt-1">{selectedUser.phone}</p>
                        </div>
                      )}
                      {selectedUser.dateOfBirth && (
                        <div className="px-4 py-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">Date of Birth</p>
                          <p className="text-sm mt-1">{formatDob(selectedUser.dateOfBirth)}</p>
                        </div>
                      )}
                      {(selectedUser.country || selectedUser.countryCode) && (
                        <div className="px-4 py-3 rounded-lg border border-border">
                          <p className="text-xs text-muted-foreground">Location</p>
                          <p className="text-sm mt-1">{getLocationLabel(selectedUser)}</p>
                        </div>
                      )}
                    </div>

                    {/* Document Images */}
                    {(selectedUser.documentFront || selectedUser.documentBack) && (
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedUser.documentFront && (
                          <div className="rounded-lg border border-border overflow-hidden">
                            <div className="bg-muted px-4 py-2">
                              <p className="text-xs font-medium">Document Front</p>
                            </div>
                            <div className="p-2">
                              <img
                                src={selectedUser.documentFront}
                                alt="Document Front"
                                className="w-full h-auto rounded object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="px-4 py-2 border-t border-border">
                              <a
                                href={selectedUser.documentFront}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent-500 hover:text-accent-600 underline"
                              >
                                Open in new tab
                              </a>
                            </div>
                          </div>
                        )}
                        {selectedUser.documentBack && (
                          <div className="rounded-lg border border-border overflow-hidden">
                            <div className="bg-muted px-4 py-2">
                              <p className="text-xs font-medium">Document Back</p>
                            </div>
                            <div className="p-2">
                              <img
                                src={selectedUser.documentBack}
                                alt="Document Back"
                                className="w-full h-auto rounded object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="px-4 py-2 border-t border-border">
                              <a
                                href={selectedUser.documentBack}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-accent-500 hover:text-accent-600 underline"
                              >
                                Open in new tab
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Profit Addition Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Add Profit to User</h3>
                <div className="px-4 py-4 rounded-lg border border-border bg-accent-500/5">
                  <p className="text-xs text-muted-foreground mb-2">
                    Add profit to this user's USDT balance and create a transaction history record. Enter a positive number to add profit, or negative to deduct.
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        value={editForm?.profitToAdd || ""}
                        onChange={(e) =>
                          setEditForm((prev) => (prev ? { ...prev, profitToAdd: e.target.value } : null))
                        }
                      />
                    </div>
                    <Badge variant="outline" className="text-xs">
                      USDT
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    This will be recorded as a completed profit transaction when you save changes.
                  </p>
                </div>
              </div>

              {/* Assets Section */}
              <div>
                <h3 className="text-sm font-semibold mb-3">User Assets</h3>
                {editForm && editForm.assets.length > 0 ? (
                  <div className="space-y-3">
                    {editForm.assets.map((asset, index) => (
                      <div key={`${asset.symbol}-${index}`} className="rounded-lg border border-border p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-semibold text-sm">{asset.symbol}</p>
                            {asset.name && <p className="text-xs text-muted-foreground">{asset.name}</p>}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              const newAssets = editForm.assets.filter((_, i) => i !== index);
                              setEditForm({ ...editForm, assets: newAssets });
                            }}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Spot Balance</p>
                            <Input
                              type="number"
                              step="0.00000001"
                              value={asset.spot}
                              onChange={(e) => {
                                const newAssets = [...editForm.assets];
                                newAssets[index] = { ...asset, spot: Number(e.target.value) || 0 };
                                setEditForm({ ...editForm, assets: newAssets });
                              }}
                            />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Funding Balance</p>
                            <Input
                              type="number"
                              step="0.00000001"
                              value={asset.funding || 0}
                              onChange={(e) => {
                                const newAssets = [...editForm.assets];
                                newAssets[index] = { ...asset, funding: Number(e.target.value) || 0 };
                                setEditForm({ ...editForm, assets: newAssets });
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="mt-4 px-4 py-3 rounded-lg bg-accent-500/10 border border-accent-500/20">
                      <p className="text-xs text-muted-foreground">Total Balance (USD)</p>
                      <p className="text-2xl font-semibold mt-1">
                        ${getTotalBalance(selectedUser).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="px-4 py-8 text-center rounded-lg border border-dashed border-border">
                    <p className="text-sm text-muted-foreground">No assets found for this user</p>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Email</p>
                      <p className="text-sm mt-1">{selectedUser.email}</p>
                      {selectedUser.isEmailVerified && (
                        <Badge variant="success" className="text-xs mt-1">
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Member Since</p>
                      <p className="text-sm mt-1">
                        {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4 py-3 rounded-lg border border-border">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="text-sm mt-1">{getLocationLabel(selectedUser)}</p>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="px-4 py-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground">Account Number</p>
                      <Input
                        value={editForm?.accountNumber || ""}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, accountNumber: e.target.value } : null)}
                      />
                    </div>
                    <div className="px-4 py-3 rounded-lg border border-border">
                      <p className="text-xs text-muted-foreground">Routing Number</p>
                      <Input
                        value={editForm?.routingNumber || ""}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, routingNumber: e.target.value } : null)}
                      />
                    </div>
                    <div className="px-4 py-3 rounded-lg border border-border md:col-span-2">
                      <p className="text-xs text-muted-foreground">Reset Password</p>
                      <Input
                        type="password"
                        placeholder="Leave empty to keep current password"
                        value={editForm?.password || ""}
                        onChange={(e) => setEditForm(prev => prev ? { ...prev, password: e.target.value } : null)}
                        autoComplete="new-password"
                        data-form-type="other"
                      />
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Only enter a value if you want to change the user's password
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-border">
                <Button variant="outline" onClick={() => setSelectedUser(null)}>
                  Cancel
                </Button>
                <Button onClick={handleAdminUpdate} disabled={processingId === selectedUser._id}>
                  {processingId === selectedUser._id ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
