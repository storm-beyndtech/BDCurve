import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { BackgroundGrid } from "@/components/marketing/visuals";
import { BrandLogo } from "@/components/layout/brand-logo";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import { apiPost } from "@/lib/api";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [countdown, setCountdown] = useState(2);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await apiPost("/api/auth/reset-password-code", { email });
      setSent(true);
    } catch (err) {
      setError((err as Error).message || "Unable to send reset code.");
    } finally {
      setLoading(false);
    }
  };

  // Auto-redirect after 2 seconds when code is sent
  useEffect(() => {
    if (sent) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/reset-password", { state: { email } });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [sent, navigate, email]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="absolute inset-0 -z-10">
        <BackgroundGrid variant="dots" cellSize={40} opacity={0.1} />
        
      </div>

      <div className="absolute top-0 left-0 right-0 z-50 bg-background/95 border-b border-border">
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
              <h1 className="text-3xl font-bold mb-2">Reset your password</h1>
              <p className="text-sm text-muted-foreground">
                We’ll email you a reset code to continue.
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

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {sent && (
                  <Alert>
                    <AlertDescription>
                      Reset code sent! Redirecting to password reset form in {countdown} second{countdown !== 1 ? 's' : ''}...
                    </AlertDescription>
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
                    "Sending..."
                  ) : (
                    <>
                      <span>Send Reset Code</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link to="/reset-password" className="text-sm text-primary-600 hover:text-primary-700">
                  Already have a code? Reset password
                </Link>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
