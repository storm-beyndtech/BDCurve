import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { EmailHealthCard } from "@/components/admin/email-health-card";
import { Mail, Send, Users, User, CheckCircle, AlertCircle, Clock } from "lucide-react";

const API_URL = (import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:5000" : "")).replace(/\/$/, "");

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description: string;
}

interface EmailLog {
  _id: string;
  to: string;
  subject: string;
  template: string;
  status: "sent" | "failed" | "pending";
  error?: string;
  sentAt: string;
}

export default function EmailManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [emailLogs, setEmailLogs] = useState<EmailLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Email form state
  const [emailType, setEmailType] = useState<"individual" | "bulk">("individual");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "verified">("all");

  useEffect(() => {
    fetchUsers();
    fetchEmailLogs();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/auth/users?limit=1000`, { headers });
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmailLogs = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/admin/email-logs?limit=50`, { headers });
      if (response.ok) {
        const data = await response.json();
        setEmailLogs(data.logs || data || []);
      }
    } catch (error) {
      console.error("Failed to fetch email logs:", error);
      // Don't show error to user - endpoint may not exist yet
    }
  };

  const handleSendIndividual = async () => {
    if (!recipientEmail || !subject || !message) {
      alert("Please fill in all fields");
      return;
    }

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/admin/send-email`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          to: recipientEmail,
          subject,
          message,
          type: "custom",
        }),
      });

      if (response.ok) {
        alert("Email sent successfully!");
        setRecipientEmail("");
        setSubject("");
        setMessage("");
        await fetchEmailLogs();
      } else {
        const error = await response.json();
        alert(`Failed to send email: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Email send error:", error);
      alert("Failed to send email. This feature requires backend implementation.");
    } finally {
      setSending(false);
    }
  };

  const handleSendBulk = async () => {
    if (!subject || !message) {
      alert("Please fill in subject and message");
      return;
    }

    let recipients: string[] = [];

    if (selectedUsers.length > 0) {
      recipients = selectedUsers;
    } else {
      // Filter users based on selected criteria
      let filteredUsers = users;
      if (filterStatus === "active") {
        filteredUsers = users.filter((u) => u.accountStatus === "active");
      } else if (filterStatus === "verified") {
        filteredUsers = users.filter((u) => u.kycStatus === "approved");
      }
      recipients = filteredUsers.map((u) => u.email);
    }

    if (recipients.length === 0) {
      alert("No recipients selected");
      return;
    }

    const confirm = window.confirm(
      `You are about to send this email to ${recipients.length} users. Continue?`
    );

    if (!confirm) return;

    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const response = await fetch(`${API_URL}/api/admin/send-bulk-email`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          recipients,
          subject,
          message,
          type: "bulk",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(
          `Bulk email sent successfully to ${result.sent || recipients.length} recipients!`
        );
        setSubject("");
        setMessage("");
        setSelectedUsers([]);
        await fetchEmailLogs();
      } else {
        const error = await response.json();
        alert(`Failed to send bulk email: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Bulk email send error:", error);
      alert("Failed to send bulk email. This feature requires backend implementation.");
    } finally {
      setSending(false);
    }
  };

  const getFilteredUsers = () => {
    if (filterStatus === "all") return users;
    if (filterStatus === "active") return users.filter((u) => u.accountStatus === "active");
    if (filterStatus === "verified") return users.filter((u) => u.kycStatus === "approved");
    return users;
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAllFiltered = () => {
    const filteredUserIds = getFilteredUsers().map((u) => u._id);
    setSelectedUsers(filteredUserIds);
  };

  const clearSelection = () => {
    setSelectedUsers([]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading email management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Email Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Send emails to users and view email history</p>
      </div>

      <EmailHealthCard />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Total Users</p>
            <p className="text-2xl font-semibold mt-1">{users.length}</p>
          </div>
        </Card>
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
            <p className="text-xs text-muted-foreground">Verified Users</p>
            <p className="text-2xl font-semibold mt-1 text-blue-600">
              {users.filter((u) => u.kycStatus === "approved").length}
            </p>
          </div>
        </Card>
      </div>

      {/* Email Type Selector */}
      <Card variant="glass" padding="lg">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEmailType("individual")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              emailType === "individual"
                ? "bg-accent-500/10 border border-accent-500/20 text-foreground"
                : "border border-border text-muted-foreground hover:bg-accent/5"
            }`}
          >
            <User className="h-4 w-4" />
            Individual Email
          </button>
          <button
            onClick={() => setEmailType("bulk")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
              emailType === "bulk"
                ? "bg-accent-500/10 border border-accent-500/20 text-foreground"
                : "border border-border text-muted-foreground hover:bg-accent/5"
            }`}
          >
            <Users className="h-4 w-4" />
            Bulk Email
          </button>
        </div>
      </Card>

      {/* Email Composer */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2 mb-6">
          <CardTitle className="text-lg">
            {emailType === "individual" ? "Send Individual Email" : "Send Bulk Email"}
          </CardTitle>
          <CardDescription>
            {emailType === "individual"
              ? "Send a custom email to a specific user"
              : "Send a custom email to multiple users"}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 space-y-4">
          {emailType === "individual" ? (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Recipient Email</label>
                <Input
                  type="email"
                  placeholder="user@example.com"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea
                  className="w-full min-h-[200px] rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  placeholder="Email message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendIndividual}
                disabled={sending || !recipientEmail || !subject || !message}
                className="gap-2 w-full md:w-auto"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : "Send Email"}
              </Button>
            </>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-2 block">Recipient Filter</label>
                <div className="flex items-center gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value as any)}
                    className="flex-1 rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  >
                    <option value="all">All Users ({users.length})</option>
                    <option value="active">
                      Active Users ({users.filter((u) => u.accountStatus === "active").length})
                    </option>
                    <option value="verified">
                      Verified Users ({users.filter((u) => u.kycStatus === "approved").length})
                    </option>
                  </select>
                  <Button size="sm" variant="outline" onClick={selectAllFiltered}>
                    Select All
                  </Button>
                  {selectedUsers.length > 0 && (
                    <Button size="sm" variant="outline" onClick={clearSelection}>
                      Clear ({selectedUsers.length})
                    </Button>
                  )}
                </div>
              </div>

              {selectedUsers.length > 0 && (
                <div className="p-3 rounded-lg bg-accent-500/10 border border-accent-500/20">
                  <p className="text-sm">
                    <strong>{selectedUsers.length}</strong> recipient(s) selected
                  </p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Subject</label>
                <Input
                  placeholder="Email subject..."
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Message</label>
                <textarea
                  className="w-full min-h-[200px] rounded-lg border border-border bg-card px-3 py-2 text-sm"
                  placeholder="Email message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSendBulk}
                disabled={sending || !subject || !message}
                className="gap-2 w-full md:w-auto"
              >
                <Send className="h-4 w-4" />
                {sending ? "Sending..." : `Send to ${selectedUsers.length || getFilteredUsers().length} Users`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Logs */}
      {emailLogs.length > 0 && (
        <Card variant="glass" padding="lg" hover="lift">
          <CardHeader className="p-0 space-y-2">
            <CardTitle className="text-lg">Email History</CardTitle>
            <CardDescription>Recent email sending activity</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
            <div className="space-y-3">
              {emailLogs.map((log) => (
                <div
                  key={log._id}
                  className="flex items-start justify-between px-4 py-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {log.status === "sent" && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {log.status === "failed" && <AlertCircle className="h-4 w-4 text-red-600" />}
                      {log.status === "pending" && <Clock className="h-4 w-4 text-orange-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{log.subject}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">To: {log.to}</p>
                      {log.error && (
                        <p className="text-xs text-red-600 mt-1">Error: {log.error}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        log.status === "sent"
                          ? "success"
                          : log.status === "failed"
                          ? "destructive"
                          : "warning"
                      }
                      className="text-xs"
                    >
                      {log.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(log.sentAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-600">Email Backend Integration Required</p>
            <p className="text-xs text-blue-600/80 mt-1">
              The email sending functionality requires backend endpoints:
              <br />
              - POST /api/admin/send-email (individual)
              <br />
              - POST /api/admin/send-bulk-email (bulk)
              <br />- GET /api/admin/email-logs (history)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

