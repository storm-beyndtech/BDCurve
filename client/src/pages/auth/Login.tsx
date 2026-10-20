import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { BackgroundGrid } from "@/components/marketing/visuals";
import { BrandLogo } from "@/components/layout/brand-logo";
import { AuthSidePanel } from "@/components/auth/auth-side-panel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import {
	ArrowRight,
	Mail,
	Lock,
	Shield,
	CheckCircle2,
	Sparkles,
	Globe,
	Zap,
	Eye,
	EyeOff,
} from "lucide-react";

const benefits = [
	{
		icon: Globe,
		title: "9,000+ Stocks",
		description: "Trade US stocks and international markets",
	},
	{
		icon: Zap,
		title: "Commission-Free",
		description: "Zero commissions on stocks, ETFs, and options",
	},
	{
		icon: Shield,
		title: "FINRA & SIPC Protected",
		description: "Your investments protected up to $500,000",
	},
];

export default function LoginPage() {
	const { login } = useAuth();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			await login(email, password);
		} catch (err) {
			setError((err as Error).message || "Unable to sign in. Please check your credentials.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="relative min-h-screen overflow-hidden bg-background">
			{/* Background Elements */}
			<div className="absolute inset-0 -z-10">
				<BackgroundGrid variant="dots" cellSize={40} opacity={0.1} />
				
			</div>

			{/* Top Navigation */}
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
							<span className="text-sm text-muted-foreground max-sm:hidden">New to Bounding Curve?</span>
							<Link to="/signup">
								<Button variant="outline" size="default">
									Create Account
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</div>

			{/* Main Content */}
			<div className="flex min-h-screen items-center justify-center px-6 py-24">
				<div className="w-full max-w-6xl">
					<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
						{/* Left Column - Form */}
						<motion.div
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6 }}
							className="w-full max-w-md mx-auto lg:mx-0"
						>
							{/* Header */}
							<div className="mb-8">
								<div className="inline-flex items-center gap-2 mb-4">
									<div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center">
										<Sparkles className="h-5 w-5 text-primary-600" />
									</div>
								</div>
								<h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Welcome back</h1>
								<p className="text-lg text-muted-foreground">Sign in to access your trading platform</p>
							</div>

							{/* Form Card */}
							<Card variant="glass" padding="lg" className="shadow-depth-lg">
								<form onSubmit={handleSubmit} className="space-y-5">
									{/* Email Field */}
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

									{/* Password Field */}
									<div className="space-y-2">
										<div className="flex items-center justify-between">
											<Label htmlFor="password" className="text-sm font-medium">
												Password
											</Label>
											<Link
												to="/forgot-password"
												className="text-xs text-primary-600 hover:text-primary-700 font-medium"
											>
												Forgot password?
											</Link>
										</div>
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

									{/* Error Alert */}
									{error && (
										<Alert variant="destructive">
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
											"Signing in..."
										) : (
											<>
												<span>Sign In</span>
												<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
											</>
										)}
									</Button>
								</form>

							</Card>

							{/* Footer */}
							<p className="text-center text-sm text-muted-foreground mt-6">
								By signing in, you agree to our{" "}
								<Link to="/legal/terms" className="text-primary-600 hover:text-primary-700">
									Terms
								</Link>{" "}
								and{" "}
								<Link to="/legal/privacy" className="text-primary-600 hover:text-primary-700">
									Privacy Policy
								</Link>
							</p>
						</motion.div>

						{/* Right Column - Benefits */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="hidden lg:block"
						>
							<AuthSidePanel mode="login" />
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
