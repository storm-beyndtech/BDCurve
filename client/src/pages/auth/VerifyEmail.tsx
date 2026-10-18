import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { BackgroundGrid, SubtleBlurOrbs } from "@/components/marketing/visuals";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowRight, Mail, Shield } from "lucide-react";
import { authApi } from "@/lib/auth/api";
import { useAuth } from "@/components/providers/auth-provider";

export default function VerifyEmailPage() {
	const navigate = useNavigate();
	const location = useLocation();
	const { login } = useAuth();
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>("✓ Verification code sent! Check your email (and spam folder).");
	const [loading, setLoading] = useState(false);
	const [resending, setResending] = useState(false);

	// Get registration data from navigation state
	const { email, password, name, countryCode } = location.state || {};

	if (!email || !password) {
		// Redirect back to register if no state
		navigate("/register");
		return null;
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (code.length < 4) {
			setError("Please enter a valid verification code.");
			return;
		}

		setLoading(true);
		try {
			// Register with the code and ALL registration data
			const res = await authApi.register({
				email,
				password,
				code,
				name,
				countryCode,
			});

			// Auto-login after successful registration
			localStorage.setItem("token", res.token);
			await login(email, password);
		} catch (err) {
			setError((err as Error).message || "Invalid verification code. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	const handleResendCode = async () => {
		setResending(true);
		setError(null);
		try {
			await authApi.requestRegistrationCode(email);
			setError("✓ A new verification code has been sent to your email. Check your spam folder if you don't see it.");
		} catch (err) {
			setError((err as Error).message || "Failed to resend code. Please try again.");
		} finally {
			setResending(false);
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-background">
			{/* Background Elements */}
			<div className="absolute inset-0 -z-10">
				<BackgroundGrid variant="dots" cellSize={40} opacity={0.1} />
				<SubtleBlurOrbs context="marketing" />
			</div>

			{/* Top Navigation */}
			<div className="absolute top-0 left-0 right-0 z-50 bg-glass-nav border-b border-glass backdrop-blur-xl">
				<div className="container-wide container-padding">
					<div className="flex h-16 items-center justify-between">
						<Link to="/" className="flex items-center group">
							<motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
								<BrandLogo size="sm" />
							</motion.div>
						</Link>
						<div className="flex items-center gap-4">
							<Link to="/login">
								<Button variant="outline" size="default">
									Sign In
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex min-h-screen items-center justify-center px-6 py-24">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="w-full max-w-md"
				>
					{/* Header */}
					<div className="mb-8 text-center">
						<div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500/10 mb-6">
							<Mail className="h-8 w-8 text-primary-600" />
						</div>
						<h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">
							Check your email
						</h1>
						<p className="text-lg text-muted-foreground">
							We've sent a verification code to
						</p>
						<p className="text-lg font-medium text-foreground mt-1">{email}</p>
					</div>

					{/* Form Card */}
					<Card variant="glass" padding="lg" className="shadow-depth-lg">
						<form onSubmit={handleSubmit} className="space-y-5">
							{/* Code Field */}
							<div className="space-y-2">
								<Label htmlFor="code" className="text-sm font-medium">
									Verification Code
								</Label>
								<div className="relative">
									<Shield className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
									<Input
										id="code"
										type="text"
										required
										value={code}
										onChange={(e) => setCode(e.target.value.toUpperCase())}
										placeholder="Enter code"
										className="pl-10 text-center text-lg tracking-widest font-mono"
										maxLength={10}
										autoFocus
									/>
								</div>
								<p className="text-xs text-muted-foreground text-center">
									Enter the code from your email
								</p>
							</div>

							{/* Error Alert */}
							{error && (
								<Alert variant={error.includes("✓") || error.includes("sent") ? "success" : "destructive"}>
									<AlertDescription>{error}</AlertDescription>
								</Alert>
							)}

							{/* Submit Button */}
							<Button
								type="submit"
								variant="primary"
								size="lg"
								className="w-full gap-2 group"
								disabled={loading}
							>
								{loading ? (
									"Verifying..."
								) : (
									<>
										<span>Verify & Continue</span>
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
									</>
								)}
							</Button>
						</form>

						{/* Divider */}
						<div className="relative my-6">
							<div className="absolute inset-0 flex items-center">
								<div className="w-full border-t border-border" />
							</div>
							<div className="relative flex justify-center text-xs uppercase">
								<span className="bg-card px-2 text-muted-foreground">Didn't receive it?</span>
							</div>
						</div>

						{/* Resend Code */}
						<Button
							variant="outline"
							size="lg"
							className="w-full"
							type="button"
							onClick={handleResendCode}
							disabled={resending}
						>
							{resending ? "Sending..." : "Resend Code"}
						</Button>
					</Card>

					{/* Footer */}
					<div className="text-center mt-6">
						<button
							onClick={() => navigate("/register")}
							className="text-sm text-muted-foreground hover:text-primary-600 transition-colors"
						>
							← Back to registration
						</button>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
