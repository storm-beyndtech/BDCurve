import { Link } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/components/providers/auth-provider";
import { BackgroundGrid, SubtleBlurOrbs } from "@/components/marketing/visuals";
import { BrandLogo } from "@/components/layout/brand-logo";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { COUNTRIES } from "@/lib/countries";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import {
	ArrowRight,
	Mail,
	Lock,
	User,
	MapPin,
	CheckCircle2,
	Sparkles,
	Shield,
	Zap,
	Clock,
	Eye,
	EyeOff,
} from "lucide-react";

const steps = [
	{
		icon: Clock,
		title: "Instant Setup",
		description: "Account created in under 2 minutes",
	},
	{
		icon: Zap,
		title: "Immediate Access",
		description: "Start issuing cards and accepting payments instantly",
	},
	{
		icon: Shield,
		title: "Secure by Default",
		description: "Bank-grade encryption and compliance built-in",
	},
];

export default function SignUpPage() {
	const { register } = useAuth();
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [country, setCountry] = useState("US");
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [acceptedLegal, setAcceptedLegal] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);

		if (password !== confirm) {
			setError("Passwords do not match.");
			return;
		}

		if (password.length < 8) {
			setError("Password must be at least 8 characters long.");
			return;
		}

		if (!acceptedLegal) {
			setError("You must accept the Terms and Privacy Policy to create an account.");
			return;
		}

		setLoading(true);
		try {
			await register(name, email, country, password);
		} catch (err) {
			setError((err as Error).message || "Unable to create account. Please try again.");
		} finally {
			setLoading(false);
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
							<ThemeToggle />
							<span className="text-sm text-muted-foreground max-sm:hidden">Already have an account?</span>
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
								<h1 className="text-4xl md:text-5xl font-bold mb-3 tracking-tight">Create your account</h1>
								<p className="text-lg text-muted-foreground">Start accepting global payments in minutes</p>
							</div>

							{/* Form Card */}
							<Card variant="glass" padding="lg" className="shadow-depth-lg">
								<form onSubmit={handleSubmit} className="space-y-5">
									{/* Name Field */}
									<div className="space-y-2">
										<Label htmlFor="name" className="text-sm font-medium">
											Full Name
										</Label>
										<div className="relative">
											<User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input
												id="name"
												type="text"
												required
												value={name}
												onChange={(e) => setName(e.target.value)}
												placeholder="John Doe"
												autoComplete="name"
												className="pl-10"
											/>
										</div>
									</div>

									{/* Email Field */}
									<div className="space-y-2">
										<Label htmlFor="email" className="text-sm font-medium">
											Work Email
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
												autoComplete="email"
												className="pl-10"
											/>
										</div>
									</div>

									{/* Country Field */}
									<div className="space-y-2">
										<Label htmlFor="country" className="text-sm font-medium">
											Country
										</Label>
										<div className="relative">
											<MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
											<select
												id="country"
												required
												value={country}
												onChange={(e) => setCountry(e.target.value)}
												autoComplete="country"
												className="flex h-10 w-full appearance-none rounded-lg border border-border bg-card pl-10 pr-8 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/50 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{COUNTRIES.map((c) => (
													<option key={c.code} value={c.code}>
														{c.name}
													</option>
												))}
											</select>
											<div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
												<svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
												</svg>
											</div>
										</div>
									</div>

									{/* Password Fields */}
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="password" className="text-sm font-medium">
												Password
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
													autoComplete="new-password"
													className="pl-10 pr-10"
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
												>
													{showPassword ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="confirm" className="text-sm font-medium">
												Confirm
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
													autoComplete="new-password"
													className="pl-10 pr-10"
												/>
												<button
													type="button"
													onClick={() => setShowConfirm(!showConfirm)}
													className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
												>
													{showConfirm ? (
														<EyeOff className="h-4 w-4" />
													) : (
														<Eye className="h-4 w-4" />
													)}
												</button>
											</div>
										</div>
									</div>

									{/* Password Requirements */}
									<div className="text-xs text-muted-foreground">Password must be at least 8 characters</div>

									<label className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 p-3 text-sm text-muted-foreground">
										<input
											type="checkbox"
											checked={acceptedLegal}
											onChange={(e) => setAcceptedLegal(e.target.checked)}
											className="mt-0.5 h-4 w-4 rounded border-border text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
										/>
										<span>
											I agree to the{" "}
											<Link to="/legal/terms" className="font-medium text-primary-600 hover:text-primary-700">
												Terms and Conditions
											</Link>{" "}
											and{" "}
											<Link to="/legal/privacy" className="font-medium text-primary-600 hover:text-primary-700">
												Privacy Policy
											</Link>
											.
										</span>
									</label>

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
											"Creating account..."
										) : (
											<>
												<span>Create Account</span>
												<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
											</>
										)}
									</Button>
								</form>

							</Card>

							{/* Footer */}
							<p className="text-center text-sm text-muted-foreground mt-6">
								Need to review the documents first? Open our{" "}
								<Link to="/legal/terms" className="text-primary-600 hover:text-primary-700">
									Terms
								</Link>{" "}
								or{" "}
								<Link to="/legal/privacy" className="text-primary-600 hover:text-primary-700">
									Privacy Policy
								</Link>
								.
							</p>
						</motion.div>

						{/* Right Column - Steps */}
						<motion.div
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
							className="hidden lg:block"
						>
							<div className="space-y-8">
								<div>
									<h2 className="text-3xl font-bold mb-4">
										Join{" "}
										<span className="text-primary-600">
											smart investors
										</span>
									</h2>
									<p className="text-lg text-muted-foreground leading-relaxed">
										Start your investing journey with commission-free trading in minutes. No credit card
										required.
									</p>
								</div>

								<div className="space-y-4">
									{steps.map((step, index) => {
										const Icon = step.icon;
										return (
											<motion.div
												key={step.title}
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
											>
												<Card variant="glass" padding="lg" className="hover:shadow-depth-md transition-all">
													<div className="flex items-start gap-4">
														<div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center flex-shrink-0">
															<Icon className="h-6 w-6 text-primary-600" />
														</div>
														<div>
															<h3 className="font-semibold mb-1">{step.title}</h3>
															<p className="text-sm text-muted-foreground">{step.description}</p>
														</div>
													</div>
												</Card>
											</motion.div>
										);
									})}
								</div>

								{/* What You Get */}
								<Card variant="elevated" padding="lg" className="bg-muted/30">
									<div className="space-y-3">
										<h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
											What you get
										</h3>
										<div className="space-y-2">
											<div className="flex items-start gap-2">
												<CheckCircle2 className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
												<span className="text-sm">Multi-currency accounts in 50+ currencies</span>
											</div>
											<div className="flex items-start gap-2">
												<CheckCircle2 className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
												<span className="text-sm">Virtual & physical card issuing</span>
											</div>
											<div className="flex items-start gap-2">
												<CheckCircle2 className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
												<span className="text-sm">Global payouts in 89 countries</span>
											</div>
											<div className="flex items-start gap-2">
												<CheckCircle2 className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
												<span className="text-sm">Developer-friendly APIs & webhooks</span>
											</div>
											<div className="flex items-start gap-2">
												<CheckCircle2 className="h-4 w-4 text-primary-600 mt-0.5 flex-shrink-0" />
												<span className="text-sm">24/7 support & full documentation</span>
											</div>
										</div>
									</div>
								</Card>
							</div>
						</motion.div>
					</div>
				</div>
			</div>
		</div>
	);
}
