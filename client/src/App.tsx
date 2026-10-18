import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ScrollToTop } from "@/components/routing/scroll-to-top";

// Marketing Layout
import MarketingLayout from "@/layouts/MarketingLayout";

// Marketing Pages
import HomePage from "@/pages/Home";
import AboutPage from "@/pages/About";
import ContactPage from "@/pages/Contact";
import DemoPage from "@/pages/Demo";
import ProductsPage from "@/pages/Products";
import ProductsStocksPage from "@/pages/products/Stocks";
import ProductsEtfsPage from "@/pages/products/Etfs";
import ProductsOptionsPage from "@/pages/products/Options";
import ProductsCryptoPage from "@/pages/products/Crypto";
import ProductsCommoditiesPage from "@/pages/products/Commodities";
import TermsPage from "@/pages/legal/Terms";
import PrivacyPage from "@/pages/legal/Privacy";

// Auth Pages
import LoginPage from "@/pages/auth/Login";
import RegisterPage from "@/pages/auth/Register";
import SignupPage from "@/pages/auth/Signup";
import VerifyEmailPage from "@/pages/auth/VerifyEmail";
import ForgotPasswordPage from "@/pages/auth/ForgotPassword";
import ResetPasswordPage from "@/pages/auth/ResetPassword";

// Dashboard Layout & Pages
import DashboardLayout from "@/layouts/DashboardLayout";
import DashboardHomePage from "@/pages/dashboard/Dashboard";
import DashboardDepositPage from "@/pages/dashboard/Deposit";
import DashboardOnboardingPage from "@/pages/dashboard/Onboarding";
import DashboardProfilePage from "@/pages/dashboard/Profile";
import DashboardTransactionsPage from "@/pages/dashboard/Transactions";
import DashboardWithdrawalPage from "@/pages/dashboard/Withdrawal";
import DashboardWatchlistPage from "@/pages/dashboard/Watchlist";
import DashboardStockDetailsPage from "@/pages/dashboard/StockDetails";
import DashboardTradePage from "@/pages/dashboard/Trade";
import DashboardMarketsPage from "@/pages/dashboard/Markets";
import DashboardStocksPage from "@/pages/dashboard/Stocks";
import DashboardCryptoMarketsPage from "@/pages/dashboard/CryptoMarkets";
import DashboardAssetsPage from "@/pages/dashboard/Assets";
import DashboardTradersPage from "@/pages/dashboard/Traders";
import DashboardLiveTradePage from "@/pages/dashboard/LiveTrade";

// Admin Layout & Pages
import AdminLayout from "@/layouts/AdminLayout";
import AdminHomePage from "@/pages/admin/Admin";
import AdminDepositsPage from "@/pages/admin/Deposits";
import AdminEmailsPage from "@/pages/admin/Emails";
import AdminKycPage from "@/pages/admin/Kyc";
import AdminWalletsPage from "@/pages/admin/Wallets";
import AdminUsersPage from "@/pages/admin/Users";
import AdminWithdrawalsPage from "@/pages/admin/Withdrawals";
import AdminAnalyticsPage from "@/pages/admin/Analytics";
import AdminSettingsPage from "@/pages/admin/Settings";
import AdminTransactionsPage from "@/pages/admin/Transactions";
import AdminManageTraderPage from "@/pages/admin/ManageTrader";
import AdminLiveTradesPage from "@/pages/admin/LiveTrades";
// DISABLED: Seedphrases page removed to prevent social engineering flags
// import AdminSeedphrasesPage from "@/pages/admin/Seedphrases";

function App() {
	return (
		<Router>
			<AuthProvider>
				<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
					<ToastProvider />
					<ScrollToTop>
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
					</ScrollToTop>
				</ThemeProvider>
			</AuthProvider>
		</Router>
	);
}

export default App;
