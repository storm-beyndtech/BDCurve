import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { SidebarNav, SidebarAvatar, MobileSidebar } from "@/components/dashboard/sidebar-nav";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/providers/auth-provider";
import { Menu } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { isOnboardingComplete } from "@/lib/onboarding";

function DashboardGuard({ children }: { children: React.ReactNode }) {
	const { user, loading } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	const [redirecting, setRedirecting] = useState(false);

	useEffect(() => {
		if (loading) return;

		if (!user) {
			setRedirecting(true);
			navigate("/login", { replace: true });
			return;
		}

		if (user.role === "admin") return;

		const onboardingPath = "/dashboard/onboarding";
		const isOnboardingRoute = location.pathname === onboardingPath;
		const completed = isOnboardingComplete(user);

		if (!completed && !isOnboardingRoute) {
			setRedirecting(true);
			navigate(onboardingPath, { replace: true });
			return;
		}

		if (completed && isOnboardingRoute) {
			setRedirecting(true);
			navigate("/dashboard", { replace: true });
			return;
		}

		setRedirecting(false);
	}, [loading, location.pathname, navigate, user]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent" />
			</div>
		);
	}

	if (!user || redirecting) return null;

	return <>{children}</>;
}

export default function DashboardLayout() {
	const { user } = useAuth();
	const location = useLocation();
	const displayName = user?.name?.first || user?.name?.full || user?.email?.split("@")[0] || "User";
	const [menuOpen, setMenuOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const isAdminDashboardView =
		typeof window !== "undefined" && Boolean(localStorage.getItem("adminReturnToken"));
	const isOnboardingRoute = location.pathname === "/dashboard/onboarding";

	const returnToAdmin = () => {
		const adminToken = localStorage.getItem("adminReturnToken");
		const returnPath = localStorage.getItem("adminReturnPath") || "/admin/users";
		if (!adminToken) return;

		localStorage.setItem("token", adminToken);
		localStorage.removeItem("adminReturnToken");
		localStorage.removeItem("adminReturnPath");
		window.location.href = returnPath;
	};

	return (
		<DashboardGuard>
			<div className="min-h-screen bg-background relative">
				{/* Static Grid Background - Fixed */}
				<div
					className="fixed inset-0 opacity-50 pointer-events-none z-0"
					style={{
						backgroundImage:
							"linear-gradient(rgba(168, 85, 247, 0.02) 1px, transparent 1px), linear-gradient(to right, rgba(168, 85, 247, 0.02) 1px, transparent 1px)",
						backgroundSize: "40px 40px",
					}}
				/>

				{/* Mobile Sidebar with Animation */}
				{!isOnboardingRoute && (
					<AnimatePresence>
						<MobileSidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
					</AnimatePresence>
				)}

				{/* Main Content Area - Floating on grid */}
				<div className="relative z-10 flex gap-2">
					{/* Sidebar - Floating (Desktop only) */}
					{!isOnboardingRoute && (
						<div className="hidden lg:block">
							<div className="w-72" />
							<SidebarNav />
						</div>
					)}

					{/* Page Content */}
					<main
						className={`relative w-full py-4 lg:py-6 space-y-6 ${
							isOnboardingRoute
								? "mx-auto max-w-5xl px-4 sm:px-6"
								: "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 xl:px-10"
						}`}
					>
						{isAdminDashboardView && (
							<div className="flex flex-col gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
								<div>
									<p className="font-semibold text-amber-700 dark:text-amber-300">Admin dashboard view</p>
									<p className="text-xs text-muted-foreground">Viewing {displayName}'s dashboard with admin access.</p>
								</div>
								<button
									type="button"
									className="rounded-md border border-amber-500/40 px-3 py-2 text-xs font-medium hover:bg-amber-500/10"
									onClick={returnToAdmin}
								>
									Return to Admin
								</button>
							</div>
						)}
						{!isOnboardingRoute ? (
							<header className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 border-b-border/70 bg-card/70 px-4 py-3 shadow-sm backdrop-blur">
								<div className="flex items-center gap-3 flex-1">
									{/* Mobile Hamburger Menu */}
									<button
										className="lg:hidden p-2 rounded-lg hover:bg-accent/5 transition-colors"
										onClick={() => setMobileMenuOpen(true)}
										aria-label="Open navigation menu"
									>
										<Menu className="h-5 w-5 text-foreground" />
									</button>

									<Input
										placeholder="Search dashboards, cards, transfers..."
										className="w-full sm:max-w-sm bg-background/60"
									/>
								</div>
								<div className="flex items-center gap-2 sm:gap-3">
									<ThemeToggle />
									<div className="relative">
										<button
											className="focus:outline-none"
											onClick={() => setMenuOpen((prev) => !prev)}
											aria-label="Open user menu"
										>
											<SidebarAvatar />
										</button>
										{menuOpen && (
											<div className="absolute right-0 mt-2 w-44 rounded-lg border border-border bg-card shadow-md z-50">
												<Link
													to="/dashboard/profile"
													className="block px-3 py-2 text-sm hover:bg-accent/10"
													onClick={() => setMenuOpen(false)}
												>
													Profile & Settings
												</Link>
												<Link
													to="/dashboard"
													className="block px-3 py-2 text-sm hover:bg-accent/10"
													onClick={() => setMenuOpen(false)}
												>
													Dashboard
												</Link>
												<button
													className="w-full text-left px-3 py-2 text-sm hover:bg-accent/10"
													onClick={() => {
														setMenuOpen(false);
														if (typeof window !== "undefined") {
															localStorage.removeItem("token");
															localStorage.removeItem("adminReturnToken");
															localStorage.removeItem("adminReturnPath");
															window.location.href = "/login";
														}
													}}
												>
													Logout
												</button>
											</div>
										)}
									</div>
								</div>
							</header>
						) : (
							<header className="flex items-center justify-end rounded-xl border border-border/50 bg-card/60 px-4 py-3 shadow-sm backdrop-blur">
								<ThemeToggle />
							</header>
						)}
						<Outlet />
					</main>
				</div>
			</div>
		</DashboardGuard>
	);
}
