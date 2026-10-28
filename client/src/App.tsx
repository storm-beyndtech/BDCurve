import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { TawkWidget } from "@/components/support/tawk-widget";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ScrollToTop } from "@/components/routing/scroll-to-top";

// Marketing Layout
import MarketingLayout from "@/layouts/MarketingLayout";

// Marketing Pages
import HomePage from "@/pages/Home";
const AboutPage = lazy(() => import("@/pages/About"));
const ContactPage = lazy(() => import("@/pages/Contact"));
const DemoPage = lazy(() => import("@/pages/Demo"));
const ProductsPage = lazy(() => import("@/pages/Products"));
const ProductsStocksPage = lazy(() => import("@/pages/products/Stocks"));
const ProductsEtfsPage = lazy(() => import("@/pages/products/Etfs"));
const ProductsOptionsPage = lazy(() => import("@/pages/products/Options"));
const ProductsCryptoPage = lazy(() => import("@/pages/products/Crypto"));
const ProductsCommoditiesPage = lazy(() => import("@/pages/products/Commodities"));
const TermsPage = lazy(() => import("@/pages/legal/Terms"));
const PrivacyPage = lazy(() => import("@/pages/legal/Privacy"));

// Auth Pages
const LoginPage = lazy(() => import("@/pages/auth/Login"));
const RegisterPage = lazy(() => import("@/pages/auth/Register"));
const SignupPage = lazy(() => import("@/pages/auth/Signup"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmail"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPassword"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPassword"));

// Dashboard Layout & Pages
import DashboardLayout from "@/layouts/DashboardLayout";
const DashboardHomePage = lazy(() => import("@/pages/dashboard/Dashboard"));
const DashboardDepositPage = lazy(() => import("@/pages/dashboard/Deposit"));
const DashboardOnboardingPage = lazy(() => import("@/pages/dashboard/Onboarding"));
const DashboardProfilePage = lazy(() => import("@/pages/dashboard/Profile"));
const DashboardTransactionsPage = lazy(() => import("@/pages/dashboard/Transactions"));
const DashboardWithdrawalPage = lazy(() => import("@/pages/dashboard/Withdrawal"));
const DashboardWatchlistPage = lazy(() => import("@/pages/dashboard/Watchlist"));
const DashboardStockDetailsPage = lazy(() => import("@/pages/dashboard/StockDetails"));
const DashboardTradePage = lazy(() => import("@/pages/dashboard/Trade"));
const DashboardMarketsPage = lazy(() => import("@/pages/dashboard/Markets"));
const DashboardStocksPage = lazy(() => import("@/pages/dashboard/Stocks"));
const DashboardCryptoMarketsPage = lazy(() => import("@/pages/dashboard/CryptoMarkets"));
const DashboardAssetsPage = lazy(() => import("@/pages/dashboard/Assets"));
const DashboardTradersPage = lazy(() => import("@/pages/dashboard/Traders"));
const DashboardLiveTradePage = lazy(() => import("@/pages/dashboard/LiveTrade"));

// Admin Layout & Pages
import AdminLayout from "@/layouts/AdminLayout";
const AdminHomePage = lazy(() => import("@/pages/admin/Admin"));
const AdminDepositsPage = lazy(() => import("@/pages/admin/Deposits"));
const AdminEmailsPage = lazy(() => import("@/pages/admin/Emails"));
const AdminKycPage = lazy(() => import("@/pages/admin/Kyc"));
const AdminWalletsPage = lazy(() => import("@/pages/admin/Wallets"));
const AdminUsersPage = lazy(() => import("@/pages/admin/Users"));
const AdminWithdrawalsPage = lazy(() => import("@/pages/admin/Withdrawals"));
const AdminAnalyticsPage = lazy(() => import("@/pages/admin/Analytics"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/Settings"));
const AdminTransactionsPage = lazy(() => import("@/pages/admin/Transactions"));
const AdminManageTraderPage = lazy(() => import("@/pages/admin/ManageTrader"));
const AdminLiveTradesPage = lazy(() => import("@/pages/admin/LiveTrades"));
// DISABLED: Seedphrases page removed to prevent social engineering flags
// const AdminSeedphrasesPage = lazy(() => import("@/pages/admin/Seedphrases"));

function RouteFallback() {
	return (
		<div className="flex min-h-[60vh] items-center justify-center" role="status" aria-label="Loading">
			<div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent" />
		</div>
	);
}

function App() {
	return (
		<Router>
			<AuthProvider>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					<ToastProvider />
					<TawkWidget />
					<ScrollToTop>
						<Suspense fallback={<RouteFallback />}>
						<Routes>
							{/* Marketing Routes */}
							<Route element={<MarketingLayout />}>
								<Route path="/" element={<HomePage />} />
								<Route path="/about" element={<AboutPage />} />
								<Route path="/contact" element={<ContactPage />} />
								<Route path="/demo" element={<DemoPage />} />
								<Route path="/products" element={<ProductsPage />} />
								<Route path="/products/stocks" element={<ProductsStocksPage />} />
								<Route path="/products/etfs" element={<ProductsEtfsPage />} />
								<Route path="/products/options" element={<ProductsOptionsPage />} />
								<Route path="/products/crypto" element={<ProductsCryptoPage />} />
								<Route path="/products/commodities" element={<ProductsCommoditiesPage />} />
								<Route path="/legal/terms" element={<TermsPage />} />
								<Route path="/legal/privacy" element={<PrivacyPage />} />
							</Route>

							{/* Auth Routes */}
							<Route path="/login" element={<LoginPage />} />
							<Route path="/register" element={<RegisterPage />} />
							<Route path="/signup" element={<SignupPage />} />
							<Route path="/verify-email" element={<VerifyEmailPage />} />
							<Route path="/forgot-password" element={<ForgotPasswordPage />} />
							<Route path="/reset-password" element={<ResetPasswordPage />} />

							{/* Dashboard Routes */}
							<Route element={<DashboardLayout />}>
								<Route path="/dashboard" element={<DashboardHomePage />} />
								<Route path="/dashboard/assets" element={<DashboardAssetsPage />} />
								<Route path="/dashboard/watchlist" element={<DashboardWatchlistPage />} />
								<Route path="/dashboard/stocks" element={<DashboardStocksPage />} />
								<Route path="/dashboard/stocks/:symbol" element={<DashboardStockDetailsPage />} />
								<Route path="/dashboard/crypto-markets" element={<DashboardCryptoMarketsPage />} />
								<Route path="/dashboard/crypto/:symbol" element={<DashboardStockDetailsPage />} />
								<Route path="/dashboard/trade" element={<DashboardTradePage />} />
								<Route path="/dashboard/markets" element={<DashboardMarketsPage />} />
								<Route path="/dashboard/deposit" element={<DashboardDepositPage />} />
								<Route path="/dashboard/onboarding" element={<DashboardOnboardingPage />} />
								<Route path="/dashboard/profile" element={<DashboardProfilePage />} />
								<Route path="/dashboard/transactions" element={<DashboardTransactionsPage />} />
								<Route path="/dashboard/withdrawal" element={<DashboardWithdrawalPage />} />
								<Route path="/dashboard/traders" element={<DashboardTradersPage />} />
								<Route path="/dashboard/live-trade" element={<DashboardLiveTradePage />} />
							</Route>

							{/* Admin Routes */}
							<Route element={<AdminLayout />}>
								<Route path="/admin" element={<AdminHomePage />} />
								<Route path="/admin/deposits" element={<AdminDepositsPage />} />
								<Route path="/admin/wallets" element={<AdminWalletsPage />} />
								<Route path="/admin/emails" element={<AdminEmailsPage />} />
								<Route path="/admin/kyc" element={<AdminKycPage />} />
								<Route path="/admin/users" element={<AdminUsersPage />} />
								<Route path="/admin/transactions" element={<AdminTransactionsPage />} />
								<Route path="/admin/withdrawals" element={<AdminWithdrawalsPage />} />
								<Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
								<Route path="/admin/settings" element={<AdminSettingsPage />} />
								<Route path="/admin/traders" element={<AdminManageTraderPage />} />
								<Route path="/admin/live-trades" element={<AdminLiveTradesPage />} />
								{/* DISABLED: Seedphrases route removed to prevent social engineering flags */}
							</Route>
						</Routes>
						</Suspense>
					</ScrollToTop>
				</ThemeProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
