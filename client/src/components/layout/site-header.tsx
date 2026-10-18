import * as React from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowRight, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/toggle-theme";
import { BrandLogo } from "@/components/layout/brand-logo";
import { cn } from "@/lib/utils";
import { productList } from "@/lib/products";

const navigationLinks = [
	{ label: "About", href: "/about" },
	{ label: "Contact", href: "/contact" },
];

export function SiteHeader() {
	const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
	const [productsOpen, setProductsOpen] = React.useState(false);

	// Close mobile menu on navigation
	const handleNavClick = () => {
		setMobileMenuOpen(false);
		setProductsOpen(false);
	};

	return (
		<>
			<motion.header
				className="fixed top-0 left-0 right-0 z-50 bg-glass-nav border-b border-glass backdrop-blur-xl"
				style={{
					backdropFilter: "blur(18px) saturate(170%)",
					WebkitBackdropFilter: "blur(18px) saturate(170%)",
				}}
			>
				<nav className="container-wide container-padding">
					<div className="flex h-16 items-center justify-between">
						{/* Logo */}
						<Link to="/" className="flex items-center group" onClick={handleNavClick}>
							<motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.2 }}>
								<BrandLogo size="sm" />
							</motion.div>
						</Link>

						{/* Desktop Navigation */}
						<div className="hidden lg:flex items-center gap-1">
							{/* Products Dropdown */}
							<div
								className="relative"
								onMouseEnter={() => setProductsOpen(true)}
								onMouseLeave={() => setProductsOpen(false)}
							>
								<button className="px-4 py-2 text-sm font-medium transition-colors duration-200 hover:text-primary-600 flex items-center gap-1">
									Products
									<ChevronDown
										className={cn("h-3.5 w-3.5 transition-transform", productsOpen && "rotate-180")}
									/>
								</button>

								{/* Products Dropdown Menu */}
								<AnimatePresence>
									{productsOpen && (
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											exit={{ opacity: 0, y: 10 }}
											transition={{ duration: 0.2 }}
											className="absolute top-full left-0 mt-2 w-[600px] bg-background/95 backdrop-blur-sm border border-border rounded-2xl shadow-depth-lg p-4"
											style={{
												zIndex: 100,
											}}
										>
											<div className="grid grid-cols-2 gap-2">
												{productList.map((product) => {
													const Icon = product.icon;
													return (
														<Link
															key={product.id}
															to={product.href}
															onClick={handleNavClick}
															className="flex items-start gap-3 p-3 rounded-xl hover:bg-accent/10 transition-colors group"
														>
															<div
																className={cn(
																	"w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
																	product.color === "primary"
																		? "bg-primary-500/10 text-primary-600"
																		: "bg-accent-500/10 text-accent-600",
																)}
															>
																<Icon className="h-5 w-5" />
															</div>
															<div className="flex-1 min-w-0">
																<p className="text-sm font-semibold mb-0.5 group-hover:text-primary-600 transition-colors">
																	{product.name}
																</p>
																<p className="text-xs text-muted-foreground line-clamp-2">
																	{product.tagline}
																</p>
															</div>
														</Link>
													);
												})}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Other Navigation Links */}
							{navigationLinks.map((link) => (
								<Link
									key={link.href}
									to={link.href}
									className="px-4 py-2 text-sm font-medium transition-colors duration-200 hover:text-primary-600"
								>
									{link.label}
								</Link>
							))}
						</div>
						{/* Desktop Actions */}
						<div className="hidden lg:flex items-center gap-3">
							<ThemeToggle />
							<Link to="/login">
								<Button variant="ghost" size="default">
									Sign In
								</Button>
							</Link>
							{/* Premium Glass CTA */}
							<Link to="/signup">
								<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
									<Button
										variant="glass"
										size="default"
										className="gap-2 shadow-depth hover:shadow-depth-md group"
									>
										Get Started
										<ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
									</Button>
								</motion.div>
							</Link>
						</div>

						<div className="flex items-center gap-5 justify-end">
							{/* Mobile Menu Button */}
							<div className="lg:hidden flex items-center gap-2">
								<button
									onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
									className="p-2 rounded-lg hover:bg-accent/10 transition-colors"
									aria-label="Toggle menu"
								>
									{mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
								</button>
							</div>
						</div>
					</div>
				</nav>
			</motion.header>

			{/* Mobile Menu */}
			<motion.div
				className={cn(
					"fixed inset-0 z-40 lg:hidden",
					mobileMenuOpen ? "pointer-events-auto" : "pointer-events-none",
				)}
				initial={false}
				animate={mobileMenuOpen ? "open" : "closed"}
			>
				{/* Backdrop */}
				<motion.div
					className="absolute inset-0 bg-black/20 backdrop-blur-sm"
					variants={{
						open: { opacity: 1 },
						closed: { opacity: 0 },
					}}
					onClick={() => setMobileMenuOpen(false)}
				/>

				{/* Menu Panel */}
				<motion.div
					className="absolute top-16 left-0 right-0 bg-glass-nav border-b border-glass backdrop-blur-xl shadow-depth-lg overflow-y-auto max-h-[calc(100vh-4rem)]"
					variants={{
						open: { y: 0, opacity: 1 },
						closed: { y: -20, opacity: 0 },
					}}
					transition={{ duration: 0.2, ease: "easeOut" }}
				>
					<div className="container-wide container-padding py-6 space-y-4">
						{/* Products Section */}
						<div className="space-y-2">
							<button
								onClick={() => setProductsOpen(!productsOpen)}
								className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-base font-semibold hover:bg-accent/10 transition-colors"
							>
								Products
								<ChevronDown className={cn("h-4 w-4 transition-transform", productsOpen && "rotate-180")} />
							</button>

							<AnimatePresence>
								{productsOpen && (
									<motion.div
										initial={{ height: 0, opacity: 0 }}
										animate={{ height: "auto", opacity: 1 }}
										exit={{ height: 0, opacity: 0 }}
										transition={{ duration: 0.2 }}
										className="overflow-hidden"
									>
										<div className="space-y-1 pl-4">
											{productList.map((product) => {
												const Icon = product.icon;
												return (
													<Link
														key={product.id}
														to={product.href}
														onClick={handleNavClick}
														className="flex items-center gap-3 px-4 py-2.5 rounded-lg hover:bg-accent/10 transition-colors"
													>
														<div
															className={cn(
																"w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
																product.color === "primary"
																	? "bg-primary-500/10 text-primary-600"
																	: "bg-accent-500/10 text-accent-600",
															)}
														>
															<Icon className="h-4 w-4" />
														</div>
														<span className="text-sm font-medium">{product.name}</span>
													</Link>
												);
											})}
										</div>
									</motion.div>
								)}
							</AnimatePresence>
						</div>

						{/* Other Navigation Links */}
						<div className="space-y-1">
							{navigationLinks.map((link, index) => (
								<motion.div
									key={link.href}
									initial={{ opacity: 0, x: -20 }}
									animate={mobileMenuOpen ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
									transition={{ delay: index * 0.05 }}
								>
									<Link
										to={link.href}
										onClick={handleNavClick}
										className="flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium hover:bg-accent/10 transition-colors"
									>
										{link.label}
										<ArrowRight className="h-4 w-4 text-muted-foreground" />
									</Link>
								</motion.div>
							))}
						</div>

						{/* Divider */}
						<div className="h-px bg-border" />

						{/* Actions */}
						<div className="space-y-3">
							<Link to="/login" onClick={handleNavClick}>
								<Button variant="ghost" className="w-full justify-start">
									Sign In
								</Button>
							</Link>

							<Link to="/signup" onClick={handleNavClick}>
								<Button variant="glass" className="w-full gap-2 shadow-depth">
									Get Started
									<ArrowRight className="h-4 w-4" />
								</Button>
							</Link>
						</div>

						{/* Theme Toggle */}
						<div className="pt-2 flex items-center gap-3">
							<ThemeToggle />
						</div>
					</div>
				</motion.div>
			</motion.div>

			{/* Spacer to prevent content jump */}
			<div className="h-16" />
		</>
	);
}
