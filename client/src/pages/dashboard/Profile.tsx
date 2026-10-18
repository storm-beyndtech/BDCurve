import { useState, useEffect } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { Shield, Smartphone, User, Mail, Upload, X, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import QRCode from "react-qr-code";

const toIsoDateInput = (value?: string) => {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
};

export default function ProfilePage() {
  const { user } = useAuth();

  // MFA state
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [mfaLoading, setMfaLoading] = useState(true);
  // setup flow
  const [mfaSetupMode, setMfaSetupMode] = useState(false);
  const [mfaOtpauthUrl, setMfaOtpauthUrl] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [mfaSubmitting, setMfaSubmitting] = useState(false);
  // disable flow
  const [mfaDisableMode, setMfaDisableMode] = useState(false);

  // KYC Upload State
  const [showKycForm, setShowKycForm] = useState(false);
  const [documentFront, setDocumentFront] = useState<File | null>(null);
  const [documentBack, setDocumentBack] = useState<File | null>(null);
  const [kycFirstName, setKycFirstName] = useState(user?.name?.first || user?.firstName || "");
  const [kycLastName, setKycLastName] = useState(user?.name?.last || user?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = useState(toIsoDateInput(user?.dateOfBirth || user?.dob || ""));
  const [phone, setPhone] = useState(user?.phone || "");
  const [documentType, setDocumentType] = useState("passport");
  const [documentNumber, setDocumentNumber] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      setKycFirstName(user.name?.first || user.firstName || "");
      setKycLastName(user.name?.last || user.lastName || "");
      setDateOfBirth(toIsoDateInput(user.dateOfBirth || user.dob || ""));
      setPhone(user.phone || "");
    }
  }, [user]);

  // Fetch MFA status on mount
  useEffect(() => {
    const fetchMfaStatus = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_URL}/api/auth/mfa/status`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          setMfaEnabled(data.mfaEnabled ?? false);
        }
      } catch {
        // silently fail — status is best-effort
      } finally {
        setMfaLoading(false);
      }
    };
    fetchMfaStatus();
  }, []);

  const handleMfaSetup = async () => {
    setMfaSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/mfa/setup`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMfaOtpauthUrl(data.otpauthUrl);
      setMfaSetupMode(true);
      setMfaCode("");
    } catch (err: any) {
      toast.error(err.message || "Failed to start MFA setup");
    } finally {
      setMfaSubmitting(false);
    }
  };

  const handleMfaVerify = async () => {
    if (mfaCode.length !== 6) {
      toast.error("Enter the 6-digit code from your authenticator app");
      return;
    }
    setMfaSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/mfa/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ token: mfaCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMfaEnabled(true);
      setMfaSetupMode(false);
      setMfaOtpauthUrl("");
      setMfaCode("");
      toast.success("2FA enabled successfully");
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setMfaSubmitting(false);
    }
  };

  const handleMfaDisable = async () => {
    if (mfaCode.length !== 6) {
      toast.error("Enter your current 6-digit authenticator code to confirm");
      return;
    }
    setMfaSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/auth/mfa/disable`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ token: mfaCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setMfaEnabled(false);
      setMfaDisableMode(false);
      setMfaCode("");
      toast.success("2FA disabled");
    } catch (err: any) {
      toast.error(err.message || "Failed to disable MFA");
    } finally {
      setMfaSubmitting(false);
    }
  };

  const handleKycSubmit = async () => {
    if (!documentFront || !documentBack || !documentNumber || !kycFirstName || !kycLastName || !dateOfBirth || !phone) {
      toast.error("Please fill in all fields and upload both document images");
      return;
    }

    setUploading(true);
    setUploadProgress(10);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const formData = new FormData();
      formData.append("documentFront", documentFront);
      formData.append("documentBack", documentBack);
      formData.append("userId", user?.id || "");
      formData.append("firstName", kycFirstName);
      formData.append("lastName", kycLastName);
      formData.append("dateOfBirth", dateOfBirth);
      formData.append("phone", phone);
      formData.append("country", user?.countryCode || "US");
      formData.append("documentType", documentType);
      formData.append("documentNumber", documentNumber);

      setUploadProgress(30);

      const token = localStorage.getItem("token");
      const headers: HeadersInit = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      setUploadProgress(50);

      const response = await fetch(`${API_URL}/api/auth/complete-kyc`, {
        method: "PUT",
        headers,
        body: formData,
      });

      setUploadProgress(80);

      if (response.ok) {
        setUploadProgress(100);
        toast.success("KYC documents submitted successfully! Admin will review your submission.");

        // Reset form
        setShowKycForm(false);
        setDocumentFront(null);
        setDocumentBack(null);
        setDocumentNumber("");
        // Keep user info fields populated for potential resubmission
      } else {
        const error = await response.json();
        toast.error(`Failed to submit KYC: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      toast.error("Failed to submit KYC documents. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Get status badge variant
  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return <Badge variant="success">Active</Badge>;
      case "suspended":
        return <Badge variant="destructive">Suspended</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="outline">{status || "Unknown"}</Badge>;
    }
  };

  const getKycBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "verified":
        return <Badge variant="success">Verified</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      default:
        return <Badge variant="outline">Not Submitted</Badge>;
    }
  };

  // Format member since date
  const formatMemberSince = (date: string | Date | undefined) => {
    if (!date) return "Unknown";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Profile & Security</h1>
        <p className="text-sm text-muted-foreground mt-1">Update profile, KYC, and MFA preferences.</p>
      </div>

      {/* Account Overview Section */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="glass" padding="lg">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Account Status</p>
            <div className="flex items-center gap-2">
              {getStatusBadge(user?.accountStatus || "active")}
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="lg">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">KYC Status</p>
            <div className="flex items-center gap-2">
              {getKycBadge(user?.kycStatus || "not submitted")}
            </div>
          </div>
        </Card>

        <Card variant="glass" padding="lg">
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Member Since</p>
            <p className="text-sm font-medium">{formatMemberSince(user?.createdAt)}</p>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card variant="glass" padding="lg" hover="lift">
          <CardHeader className="p-0 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              Profile
            </div>
            <CardTitle className="text-lg">Identity</CardTitle>
            <CardDescription>Profile is reserved for personal account details and security settings.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6 space-y-4">
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Full Name</p>
              <p className="mt-1 text-sm font-medium">
                {user?.name?.full || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Not set"}
              </p>
            </div>
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="mt-1 text-sm font-medium">{user?.email || "Not set"}</p>
              <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <div className="rounded-lg border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Onboarding Status</p>
              <p className="mt-1 text-sm font-medium">{user?.onboardingCompleted ? "Completed" : "Incomplete"}</p>
            </div>
          </CardContent>
        </Card>

        <Card variant="glass" padding="lg" hover="lift">
          <CardHeader className="p-0 space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              Compliance
            </div>
            <CardTitle className="text-lg">KYC & MFA</CardTitle>
            <CardDescription>Submit documents and secure your account.</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6 space-y-4">
            <div className="rounded-lg border border-border px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">KYC status</p>
                  <p className="text-xs text-muted-foreground">Upload identity documents for verification</p>
                </div>
                {getKycBadge(user?.kycStatus || "not submitted")}
              </div>

              {!showKycForm ? (
                <Button size="sm" onClick={() => setShowKycForm(true)} className="gap-2">
                  <Upload className="h-4 w-4" />
                  Submit documents
                </Button>
              ) : (
                <div className="space-y-4 pt-3 border-t border-border">
                  {/* Document Front Upload */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Document Front (ID, Passport, etc.)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => setDocumentFront(e.target.files?.[0] || null)}
                        className="text-xs"
                      />
                      {documentFront && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {documentFront.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Document Back Upload */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Document Back</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => setDocumentBack(e.target.files?.[0] || null)}
                        className="text-xs"
                      />
                      {documentBack && (
                        <div className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="h-3.5 w-3.5" />
                          {documentBack.name}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">First Name</Label>
                    <Input
                      placeholder="First name"
                      value={kycFirstName}
                      onChange={(e) => setKycFirstName(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Last Name</Label>
                    <Input
                      placeholder="Last name"
                      value={kycLastName}
                      onChange={(e) => setKycLastName(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Date of Birth</Label>
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      className="text-sm"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Phone Number</Label>
                    <Input
                      type="tel"
                      placeholder="+1234567890"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* Document Type */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Document Type</Label>
                    <select
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="passport">Passport</option>
                      <option value="drivers_license">Driver's License</option>
                      <option value="national_id">National ID</option>
                    </select>
                  </div>

                  {/* Document Number */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium">Document Number</Label>
                    <Input
                      placeholder="e.g., ABC123456789"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="text-sm"
                    />
                  </div>

                  {/* Upload Progress */}
                  {uploading && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Uploading...</span>
                        <span className="font-medium">{uploadProgress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-accent-500 transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={handleKycSubmit}
                      disabled={uploading}
                      className="flex-1 gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      {uploading ? "Uploading..." : "Submit KYC"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowKycForm(false);
                        setDocumentFront(null);
                        setDocumentBack(null);
                        setDocumentNumber("");
                      }}
                      disabled={uploading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    Accepted formats: JPG, PNG. Max file size: 5MB per image.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border px-4 py-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-muted-foreground">TOTP via authenticator app</p>
                </div>
                {mfaLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <Badge variant={mfaEnabled ? "success" : "outline"}>{mfaEnabled ? "Enabled" : "Disabled"}</Badge>
                )}
              </div>

              {/* Setup flow: show QR + input */}
              {mfaSetupMode && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Smartphone className="h-4 w-4 shrink-0" />
                    Scan this QR code with Google Authenticator, Authy, or any TOTP app.
                  </p>
                  <div className="flex justify-center py-2">
                    <div className="p-3 bg-white rounded-lg shadow-sm inline-block">
                      <QRCode value={mfaOtpauthUrl} size={160} />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Enter 6-digit code to confirm</Label>
                    <Input
                      placeholder="000000"
                      maxLength={6}
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                      className="font-mono tracking-widest text-center text-lg"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleMfaVerify} disabled={mfaSubmitting}>
                      {mfaSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify & Enable"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setMfaSetupMode(false); setMfaCode(""); }} disabled={mfaSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Disable flow */}
              {mfaDisableMode && (
                <div className="space-y-3 pt-2 border-t border-border">
                  <p className="text-xs text-muted-foreground">Enter your current authenticator code to disable 2FA.</p>
                  <Input
                    placeholder="000000"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                    className="font-mono tracking-widest text-center text-lg"
                  />
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" className="flex-1" onClick={handleMfaDisable} disabled={mfaSubmitting}>
                      {mfaSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Disable"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setMfaDisableMode(false); setMfaCode(""); }} disabled={mfaSubmitting}>
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {/* Idle state buttons */}
              {!mfaSetupMode && !mfaDisableMode && (
                <Button
                  size="sm"
                  variant={mfaEnabled ? "outline" : "primary"}
                  disabled={mfaLoading || mfaSubmitting}
                  onClick={mfaEnabled ? () => setMfaDisableMode(true) : handleMfaSetup}
                >
                  {mfaSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
                  {mfaEnabled ? "Disable 2FA" : "Enable 2FA"}
                </Button>
              )}
            </div>

            <div className="rounded-lg border border-border px-4 py-3 space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                Notifications
              </div>
              <p className="text-xs text-muted-foreground">
                Admin can send compliance emails; you can opt-in/out once backend is wired.
              </p>
              <Button size="sm" variant="ghost">
                Manage preferences
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
