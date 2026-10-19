import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
	LayoutDashboard,
	TrendingUp,
	LineChart,
	ArrowRightLeft,
	Users,
	Settings,
	Eye,
	History,
	Wallet,
	Coins,
	Gem,
	Activity,
	LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { BrandLogo } from "@/components/layout/brand-logo";

interface NavItem {
	label: string;
	href: string;
	icon: LucideIcon;
	badge?: string;
}

interface NavSection {
	title: string;
	items: NavItem[];
}

const navSections: NavSection[] = [
	{
		title: "Overview",
		items: [
			{
				label: "Dashboard",
				href: "/dashboard",
				icon: LayoutDashboard,
			},
			{
				label: "Watchlist",
				href: "/dashboard/watchlist",
				icon: Eye,
			},
		],
	},
	{
		title: "Markets",
		items: [
			{
				label: "Stocks",
				href: "/dashboard/stocks",
				icon: TrendingUp,
			},
			{
				label: "Crypto",
				href: "/dashboard/crypto-markets",
				icon: Coins,
			},
		],
	},
	{
		title: "Trading",
		items: [
			{
				label: "Trade",
				href: "/dashboard/trade",
				icon: ArrowRightLeft,
			},
			{
				label: "Live Trade",
				href: "/dashboard/live-trade",
				icon: Activity,
			},
			{
				label: "Copy Traders",
				href: "/dashboard/traders",
				icon: Users,
			},
		],
	},
	{
		title: "Wallet",
		items: [
			{
				label: "Assets",
				href: "/dashboard/assets",
				icon: Gem,
			},
			{
				label: "Deposit",
				href: "/dashboard/deposit",
				icon: Wallet,
			},
			{
				label: "Withdrawal",
				href: "/dashboard/withdrawal",
				icon: ArrowRightLeft,
			},
		],
	},
	{
		title: "Account",
		items: [
			{
				label: "Transactions",
				href: "/dashboard/transactions",
				icon: History,
			},
			{
				label: "Profile",
				href: "/dashboard/profile",
				icon: Users,
			},
		],
	},
];

export function SidebarNav() {
	const { pathname } = useLocation();
	const { user } = useAuth();

	// Get user's first name or full name
	const displayName = user?.name?.first || user?.name?.full || user?.email?.split("@")[0] || "User";
	const userInitial = displayName.charAt(0).toUpperCase();

	return (
		<aside className="fixed top-4 left-4 bottom-4 z-50 w-72 border border-border/50 bg-card/95 backdrop-blur-xl hidden lg:flex flex-col shadow-2xl rounded-2xl">
			<div className="flex h-full flex-col relative z-10 min-h-0">
				{/* Logo */}
				<div className="flex h-16 items-center border-b border-border/50 px-6 flex-shrink-0">
					<Link to="/dashboard" className="flex items-center">
						<BrandLogo size="sm" />
					</Link>
				</div>

				{/* Navigation - with custom scrollbar */}
				<nav
					className="flex-1 px-3 py-6 space-y-6 overflow-y-auto overflow-x-hidden min-h-0"
					style={{
						scrollbarWidth: "thin",
						scrollbarColor: "rgba(168, 85, 247, 0.3) transparent",
					}}
				>
					{navSections.map((section, idx) => (
						<div key={section.title}>
							{/* Section Header */}
							<div className="px-3 mb-2">
								<h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
									{section.title}
								</h3>
							</div>

							{/* Section Items */}
							<div className="space-y-0.5">
								{section.items.map((item) => {
									const Icon = item.icon;
									const isActive = pathname === item.href;

									return (
										<Link
											key={item.href}
											to={item.href}
											className={cn(
												"relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
												isActive
													? "text-foreground"
													: "text-muted-foreground hover:text-foreground hover:bg-accent/5",
											)}
										>
											{/* Active Indicator */}
											{isActive && (
												<motion.div
													layoutId="sidebar-active-pill"
													className="absolute inset-0 rounded-lg bg-accent-500/10 border border-accent-500/20"
													transition={{
														type: "spring",
														stiffness: 500,
														damping: 35,
													}}
												/>
											)}

											<Icon
												className={cn(
													"h-4.5 w-4.5 relative z-10 transition-colors",
													isActive
														? "text-accent-600"
														: "text-muted-foreground/60 group-hover:text-foreground",
												)}
											/>
											<span className="relative z-10 flex-1">{item.label}</span>

											{item.badge && (
												<span className="ml-auto relative z-10 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-accent-500/10 text-accent-600">
													{item.badge}
												</span>
											)}

											{/* Subtle hover indicator */}
											{!isActive && (
												<div className="absolute inset-y-0 left-0 w-0.5 bg-accent-500/0 group-hover:bg-accent-500/50 rounded-r transition-colors" />
											)}
										</Link>
									);
								})}
							</div>
						</div>
					))}
				</nav>

				{/* Footer - User Profile */}
				<div className="border-t border-border/50 p-3 flex-shrink-0">
					<Link
						to="/dashboard/profile"
						className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/5 transition-colors group"
					>
						<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center ring-2 ring-accent-500/20 flex-shrink-0">
							<span className="text-white text-sm font-semibold">{userInitial}</span>
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-medium truncate group-hover:text-accent-600 transition-colors">
								{displayName}
							</p>
							<p className="text-xs text-muted-foreground/70 truncate">{user?.email || "User Account"}</p>
						</div>
						<Settings className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent-600 transition-colors flex-shrink-0" />
					</Link>
				</div>
			</div>

			{/* Custom scrollbar styles for webkit browsers */}
			<style>{`
				nav::-webkit-scrollbar {
					width: 6px;
				}
				nav::-webkit-scrollbar-track {
					background: transparent;
				}
				nav::-webkit-scrollbar-thumb {
					background: rgba(168, 85, 247, 0.3);
					border-radius: 3px;
				}
				nav::-webkit-scrollbar-thumb:hover {
					background: rgba(168, 85, 247, 0.5);
				}
			`}</style>
		</aside>
	);
}

/**
 * Mobile sidebar with overlay
 */
export function MobileSidebar({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
	const { pathname } = useLocation();
	const { user } = useAuth();

	// Get user's first name or full name
	const displayName = user?.name?.first || user?.name?.full || user?.email?.split("@")[0] || "User";
	const userInitial = displayName.charAt(0).toUpperCase();

	if (!isOpen) return null;

	return (
		<>
			{/* Overlay */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				className="fixed inset-0 z-40 bg-black/50 lg:hidden"
				onClick={onClose}
			/>

			{/* Sidebar */}
			<motion.aside
				initial={{ x: -320 }}
				animate={{ x: 0 }}
				exit={{ x: -320 }}
				transition={{ type: "spring", stiffness: 400, damping: 40 }}
				className="fixed top-4 left-4 bottom-4 z-50 w-64 border border-border/50 bg-card/95 backdrop-blur-xl lg:hidden overflow-hidden rounded-2xl shadow-2xl"
			>
				{/* Subtle diagonal grid pattern for visual depth */}
				<div
					className="absolute inset-0 opacity-30 pointer-events-none"
					style={{
						backgroundImage:
							"linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px), linear-gradient(to right, rgba(168, 85, 247, 0.03) 1px, transparent 1px)",
						backgroundSize: "24px 24px",
						transform: "rotate(-3deg) scale(1.2)",
					}}
				/>
				<div className="flex h-full flex-col relative z-10 min-h-0">
					{/* Logo */}
					<div className="flex h-16 items-center border-b border-border/50 px-6">
						<Link to="/dashboard" className="flex items-center">
							<BrandLogo size="sm" />
						</Link>
					</div>

					{/* Navigation */}
					<nav className="flex-1 px-3 py-6 space-y-6 overflow-y-auto overflow-x-hidden min-h-0">
						{navSections.map((section, idx) => (
							<div key={section.title}>
								{/* Section Header */}
								<div className="px-3 mb-2">
									<h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
										{section.title}
									</h3>
								</div>

								{/* Section Items */}
								<div className="space-y-0.5">
									{section.items.map((item) => {
										const Icon = item.icon;
										const isActive = pathname === item.href;

										return (
											<Link
												key={item.href}
												to={item.href}
												onClick={onClose}
												className={cn(
													"relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 group",
													isActive
														? "text-foreground"
														: "text-muted-foreground hover:text-foreground hover:bg-accent/5",
												)}
											>
												{/* Active Indicator */}
												{isActive && (
													<motion.div
														layoutId="mobile-sidebar-active-pill"
														className="absolute inset-0 rounded-lg bg-accent-500/10 border border-accent-500/20"
														transition={{
															type: "spring",
															stiffness: 500,
															damping: 35,
														}}
													/>
												)}

												<Icon
													className={cn(
														"h-4.5 w-4.5 relative z-10 transition-colors",
														isActive
															? "text-accent-600"
															: "text-muted-foreground/60 group-hover:text-foreground",
													)}
												/>
												<span className="relative z-10 flex-1">{item.label}</span>

												{item.badge && (
													<span className="ml-auto relative z-10 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-accent-500/10 text-accent-600">
														{item.badge}
													</span>
												)}

												{/* Subtle hover indicator */}
												{!isActive && (
													<div className="absolute inset-y-0 left-0 w-0.5 bg-accent-500/0 group-hover:bg-accent-500/50 rounded-r transition-colors" />
												)}
											</Link>
										);
									})}
								</div>
							</div>
						))}
					</nav>

					{/* Footer - User Profile */}
					<div className="border-t border-border/50 p-3 flex-shrink-0">
						<Link
							to="/dashboard/profile"
							onClick={onClose}
							className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-accent/5 transition-colors group"
						>
							<div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center ring-2 ring-accent-500/20 flex-shrink-0">
								<span className="text-white text-sm font-semibold">{userInitial}</span>
							</div>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium truncate group-hover:text-accent-600 transition-colors">
									{displayName}
								</p>
								<p className="text-xs text-muted-foreground/70 truncate">{user?.email || "User Account"}</p>
							</div>
							<Settings className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent-600 transition-colors flex-shrink-0" />
						</Link>
					</div>
				</div>
			</motion.aside>
		</>
	);
}

export function SidebarAvatar({ className }: { className?: string }) {
	const { user } = useAuth();
	const displayName = user?.name?.first || user?.name?.full || user?.email?.split("@")[0] || "User";
	const userInitial = displayName.slice(0, 2).toUpperCase();

	return (
		<div
			className={cn(
				"w-9 h-9 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 text-white text-sm font-semibold inline-flex items-center justify-center ring-2 ring-accent-500/20",
				className,
			)}
			title={displayName}
		>
			{userInitial}
		</div>
	);
}
