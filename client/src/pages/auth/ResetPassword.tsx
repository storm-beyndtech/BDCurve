import { Link, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackgroundGrid, SubtleBlurOrbs } from "@/components/marketing/visuals";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import { ArrowRight, Lock, Mail, KeyRound, Eye, EyeOff, Sparkles } from "lucide-react";
import { apiPut } from "@/lib/api";

export default function ResetPasswordPage() {
  const { code: codeParam } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email || "";
  const [email, setEmail] = useState(emailFromState);
  const [code, setCode] = useState(codeParam || "");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!code.trim()) {
      setError("Reset code is required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await apiPut("/api/auth/reset-password", {
        email,
        newPassword: password,
        code,
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError((err as Error).message || "Unable to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <BackgroundGrid variant="dots" cellSize={40} opacity={0.1} />
        <SubtleBlurOrbs context="marketing" />
      </div>

      <div className="absolute top-0 left-0 right-0 z-50 bg-glass-nav border-b border-glass backdrop-blur-xl">
        <div className="container-wide container-padding">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center group">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
                <BrandLogo size="sm" />
              </motion.div>
            </Link>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Link to="/login">
                <Button variant="outline" size="default">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary-600" />
                </div>
              </div>
              <h1 className="text-3xl font-bold mb-2">Set a new password</h1>
              <p className="text-sm text-muted-foreground">
                Use the reset code from your email to continue.
              </p>
            </div>

            <Card variant="glass" padding="lg" className="shadow-depth-lg">
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code" className="text-sm font-medium">
                    Reset Code
                  </Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="Enter the code from your email"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">
                    New Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm" className="text-sm font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirm"
                      type={showConfirm ? "text" : "password"}
                      required
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      placeholder="••••••••••"
                      className="pl-10 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert>
                    <AlertDescription>Password reset successful. Redirecting...</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full gap-2 group"
                  disabled={loading}
                >
                  {loading ? (
                    "Resetting..."
                  ) : (
                    <>
                      <span>Reset Password</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
