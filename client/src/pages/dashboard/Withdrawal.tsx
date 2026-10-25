import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { AlertCircle, TrendingDown, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface CoinData {
  _id: string;
  symbol: string;
  name: string;
  network: string;
  address: string;
  deposit: boolean;
  withdraw: boolean;
  minDeposit: number;
  minWithdraw: number;
  withdrawalFee: number;
}

export default function WithdrawalPage() {
  const { user } = useAuth();
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);

  const selectedCoin = coins.find((c) => c.symbol === selectedCoinSymbol);

  const fetchCoins = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const response = await fetch(`${API_URL}/api/coins`);
      if (response.ok) {
        const data = await response.json();
        const coinsArray = Array.isArray(data) ? data : data?.coins || [];
        const withdrawCoins = coinsArray.filter((c: CoinData) => c.withdraw === true);
        setCoins(withdrawCoins);
        if (withdrawCoins.length > 0) {
          setSelectedCoinSymbol(withdrawCoins[0].symbol);
        }
      }
    } catch (error) {
      console.error("Failed to fetch coins:", error);
      toast.error("Failed to load withdrawal options");
    } finally {
      setLoadingCoins(false);
    }
  };

  useEffect(() => {
    fetchCoins();
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchBalanceAndWithdrawals(true);
    }
  }, [user?.id]);

  const fetchBalanceAndWithdrawals = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const userRes = await fetch(`${API_URL}/api/auth/users/${user?.id}`, { headers });
      const userData = await userRes.json();
      const assets = userData?.user?.assets || userData?.assets || [];

      const stableSymbols = ["USDT", "USDC"];
      const balance = assets
        .filter((a: any) => stableSymbols.includes(a.symbol))
        .reduce((sum: number, a: any) => sum + (a.spot || 0) + (a.funding || 0), 0);
      setAvailableBalance(balance);

      const withdrawalsRes = await fetch(`${API_URL}/api/transaction/withdrawals`, { headers });
      const withdrawalsData = await withdrawalsRes.json();
      const list = Array.isArray(withdrawalsData?.withdrawals)
        ? withdrawalsData.withdrawals
        : Array.isArray(withdrawalsData)
        ? withdrawalsData
        : [];
      setPendingWithdrawals(list.filter((w: any) => w.status === "pending" || w.status === "processing"));
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      if (isInitial) setLoading(false);
      else setRefreshing(false);
    }
  };

  const calculateFee = () => {
    if (!selectedCoin || !amount || parseFloat(amount) <= 0) return 0;
    return (parseFloat(amount) * (selectedCoin.withdrawalFee || 0)) / 100;
  };

  const handleWithdrawal = async () => {
    const withdrawalAmount = parseFloat(amount);
    const fee = calculateFee();
    const total = withdrawalAmount + fee;

    if (!amount || withdrawalAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedCoin) {
      toast.error("Please select a coin");
      return;
    }

    if (!walletAddress || walletAddress.length < 20) {
      toast.error("Please enter a valid wallet address");
      return;
    }

    if (total > availableBalance) {
      toast.error(`Insufficient balance. You need $${total.toFixed(2)} (including $${fee.toFixed(2)} fee)`);
      return;
    }

    const minWithdraw = selectedCoin.minWithdraw || 10;
    if (withdrawalAmount < minWithdraw) {
      toast.error(`Minimum withdrawal amount is $${minWithdraw}`);
      return;
    }

    setSubmitting(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const response = await fetch(`${API_URL}/api/transaction/withdraw`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user?.id,
          amount: withdrawalAmount,
          symbol: selectedCoin.symbol,
          address: walletAddress,
          network: selectedCoin.network,
        }),
      });

      if (response.ok) {
        toast.success("Withdrawal request submitted! We'll process it within 24 hours.");
        setAmount("");
        setWalletAddress("");
        await fetchBalanceAndWithdrawals();
      } else {
        const error = await response.json();
        toast.error(`Failed to submit withdrawal: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Withdrawal error:", error);
      toast.error("Failed to submit withdrawal. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Badge variant="warning">Pending</Badge>;
      case "processing":
        return <Badge variant="outline">Processing</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "failed":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-accent-500 border-r-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading withdrawal information...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Withdraw Funds</h1>
        <p className="text-sm text-muted-foreground mt-1">Withdraw crypto to your external wallet</p>
      </div>

      {/* Balance Display */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              Available Balance
              {refreshing && <Loader2 className="h-3 w-3 animate-spin" />}
            </p>
            <p className="text-2xl font-semibold mt-1 text-green-600">${availableBalance.toLocaleString()}</p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Pending Withdrawals</p>
            <p className="text-2xl font-semibold mt-1 text-orange-600">{pendingWithdrawals.length}</p>
          </div>
        </Card>
        <Card variant="glass" padding="lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Network Fee</p>
            <p className="text-2xl font-semibold mt-1">
              {selectedCoin ? `${selectedCoin.withdrawalFee}%` : "—"}
            </p>
          </div>
        </Card>
      </div>

      {/* Withdrawal Form */}
      <Card variant="glass" padding="lg" hover="lift">
        <CardHeader className="p-0 space-y-2">
          <CardTitle className="text-lg">Request Withdrawal</CardTitle>
          <CardDescription>Send funds from your account to your crypto wallet</CardDescription>
        </CardHeader>
        <CardContent className="p-0 mt-6 space-y-4">
          {loadingCoins ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-sm text-muted-foreground">Loading withdrawal options...</span>
            </div>
          ) : coins.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No withdrawal options available at this time.</p>
              <p className="text-xs text-muted-foreground mt-1">Please contact support if you need assistance.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Select Coin</Label>
                <select
                  value={selectedCoinSymbol}
                  onChange={(e) => setSelectedCoinSymbol(e.target.value)}
                  className="w-full rounded-lg border border-border bg-card px-3 py-3 text-base sm:text-sm"
                >
                  {coins.map((coin) => (
                    <option key={coin.symbol} value={coin.symbol}>
                      {coin.name} ({coin.symbol}) — {coin.network}
                    </option>
                  ))}
                </select>
                {selectedCoin && (
                  <p className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                    <span>Network: <span className="font-medium">{selectedCoin.network}</span></span>
                    <span>Min withdrawal: ${selectedCoin.minWithdraw}</span>
                    <span>Fee: {selectedCoin.withdrawalFee}%</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Amount (USD)</Label>
                <Input
                  type="number"
                  placeholder={selectedCoin ? `Min: $${selectedCoin.minWithdraw}` : "100.00"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedCoin?.minWithdraw || 10}
                  max={availableBalance}
                />
                <p className="text-xs text-muted-foreground">
                  Minimum: ${selectedCoin?.minWithdraw || 10} | Available: ${availableBalance.toLocaleString()}
                </p>
              </div>

              <div className="space-y-2">
                <Label>
                  Your {selectedCoin?.symbol || "Coin"} Wallet Address
                  {selectedCoin && <span className="text-muted-foreground"> ({selectedCoin.network})</span>}
                </Label>
                <Input
                  placeholder="Enter your wallet address..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="font-mono text-base sm:text-sm"
                />
                <p className="flex items-start gap-1.5 text-xs text-red-600"><span aria-hidden className="shrink-0">&#9888;</span><span className="min-w-0 flex-1 break-words">Double-check the address! Sending to wrong address = permanent loss of funds.</span>
                </p>
              </div>

              {/* Fee Breakdown */}
              {amount && parseFloat(amount) > 0 && (
                <div className="rounded-lg border border-dashed border-border px-4 py-3 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Withdrawal Amount</span>
                    <span className="font-semibold">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      Network Fee ({selectedCoin?.withdrawalFee || 0}%)
                    </span>
                    <span className="font-semibold">${calculateFee().toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="font-medium">Total Deducted</span>
                    <span className="font-bold text-lg">
                      ${(parseFloat(amount) + calculateFee()).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Remaining Balance</span>
                    {availableBalance - parseFloat(amount) - calculateFee() < 0 ? (
                      <span className="text-red-600 font-medium">Insufficient balance</span>
                    ) : (
                      <span className="text-green-600">
                        ${(availableBalance - parseFloat(amount) - calculateFee()).toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Warning Box */}
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 sm:p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
                  <div className="min-w-0 flex-1 space-y-1 break-words">
                    <p className="text-sm font-medium text-amber-600">Important Notice</p>
                    <ul className="text-xs text-amber-600/80 space-y-1 list-disc pl-4">
                      <li>Withdrawals are processed within 24 hours</li>
                      <li>Verify the network matches your wallet</li>
                      <li>Minimum withdrawal: ${selectedCoin?.minWithdraw || 10}</li>
                      <li>Network fees are non-refundable</li>
                      <li>Contact support if not received within 48 hours</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button className="w-full" onClick={handleWithdrawal} disabled={submitting}>
                {submitting ? "Submitting..." : "Request Withdrawal"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Pending Withdrawals */}
      {pendingWithdrawals.length > 0 && (
        <Card variant="glass" padding="lg" hover="lift">
          <CardHeader className="p-0 space-y-2">
            <CardTitle className="text-lg">Pending Withdrawals</CardTitle>
            <CardDescription>Withdrawals currently being processed</CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-6">
            <div className="space-y-3">
              {pendingWithdrawals.map((withdrawal) => (
                <div
                  key={withdrawal._id}
                  className="flex items-center justify-between px-4 py-3 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      <TrendingDown className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">
                        {withdrawal.currency} {withdrawal.amount.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {withdrawal.network} - {new Date(withdrawal.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {getStatusBadge(withdrawal.status)}
                    {withdrawal.status === "processing" && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Processing
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
