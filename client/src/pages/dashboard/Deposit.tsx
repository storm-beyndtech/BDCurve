import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/auth-provider";
import { Wallet, CheckCircle, Copy, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from "sonner";

// Coin type from API
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
  memo?: string;
  key: string; // symbol:network (one entry per admin deposit wallet)
  depositWallets?: { _id: string; network: string; address: string; memo?: string; minDeposit: number; label?: string }[];
}

export default function DepositPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("crypto");

  // Pending deposits state
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(true);

  // Coins from API
  const [coins, setCoins] = useState<CoinData[]>([]);
  const [loadingCoins, setLoadingCoins] = useState(true);

  // Crypto deposit state
  const [cryptoAmount, setCryptoAmount] = useState("");
  const [selectedCoinSymbol, setSelectedCoinSymbol] = useState("");
  const [submittingCrypto, setSubmittingCrypto] = useState(false);

  // Get the selected coin object
  const selectedCoin = coins.find(c => c.key === selectedCoinSymbol);

  // Fetch available coins for deposit
  const fetchCoins = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      console.log("[Deposit] Fetching coins from:", `${API_URL}/api/coins`);

      const response = await fetch(`${API_URL}/api/coins`);
      console.log("[Deposit] Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("[Deposit] Received coins data:", data);

        // Handle both array and object responses
        const coinsArray = Array.isArray(data) ? data : (data?.coins || []);
        console.log("[Deposit] Coins array:", coinsArray.length, "items");

        // Filter only coins with deposit enabled
        // Only offer coins that are enabled AND have an admin-configured address
        // One option per enabled platform deposit wallet (managed in Admin > Wallets)
        const depositCoins: CoinData[] = coinsArray.flatMap((c: CoinData) =>
          (c.depositWallets || []).map((w) => ({ ...c, _id: w._id, network: w.network, address: w.address, memo: w.memo || "", minDeposit: Number(w.minDeposit || 0), key: `${c.symbol}:${w.network}` })),
        );
        console.log("[Deposit] Deposit-enabled coins:", depositCoins.length);

        setCoins(depositCoins);
        // Set default selected coin to first available
        if (depositCoins.length > 0 && !selectedCoinSymbol) {
          setSelectedCoinSymbol(depositCoins[0].key);
        }
      } else {
        console.error("[Deposit] API error:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("[Deposit] Failed to fetch coins:", error);
      toast.error("Failed to load deposit options");
    } finally {
      setLoadingCoins(false);
    }
  };

  // Fetch pending deposits on mount
  const fetchPendingDeposits = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/transaction/deposits`, { headers });
      if (response.ok) {
        const result = await response.json();
        const data = result?.deposits || result || [];
        // Filter for pending deposits belonging to current user
        const userPending = data.filter(
          (d: any) =>
            d.status === "pending" &&
            (d.userId?._id === user?.id || d.userId === user?.id || d.user?._id === user?.id || d.user?.id === user?.id)
        );
        setPendingDeposits(userPending);
      }
    } catch (error) {
      console.error("Failed to fetch pending deposits:", error);
    } finally {
      setLoadingPending(false);
    }
  };

  // Cancel/delete a pending deposit
  const handleCancelDeposit = async (depositId: string) => {
    if (!window.confirm("Are you sure you want to cancel this deposit request?")) {
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/transaction/deposit/${depositId}/cancel`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        toast.success("Deposit request cancelled successfully");
        // Refresh pending deposits
        fetchPendingDeposits();
      } else {
        const error = await response.json();
        toast.error(`Failed to cancel: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Cancel deposit error:", error);
      toast.error("Failed to cancel deposit");
    }
  };

  // Fetch coins and pending deposits when user is available
  useEffect(() => {
    fetchCoins();
    if (user?.id) {
      fetchPendingDeposits();
    }
  }, [user?.id]);

  const handleCryptoDeposit = async () => {
    if (!cryptoAmount || parseFloat(cryptoAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!selectedCoin) {
      toast.error("Please select a coin");
      return;
    }

    // Check minimum deposit
    if (selectedCoin.minDeposit && parseFloat(cryptoAmount) < selectedCoin.minDeposit) {
      toast.error(`Minimum deposit for ${selectedCoin.symbol} is $${selectedCoin.minDeposit}`);
      return;
    }

    setSubmittingCrypto(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_URL}/api/transaction/deposit`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          userId: user?.id,
          amount: parseFloat(cryptoAmount),
          walletId: selectedCoin._id,
          symbol: selectedCoin.symbol,
          network: selectedCoin.network,
          address: selectedCoin.address,
        }),
      });

      if (response.ok) {
        toast.success("Crypto deposit submitted! Admin will approve after blockchain confirmation.");
        setCryptoAmount("");
        fetchPendingDeposits(); // Refresh pending deposits list
      } else {
        const error = await response.json();
        toast.error(`Failed to submit deposit: ${error.message || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Crypto deposit error:", error);
      toast.error("Failed to submit deposit. Please try again.");
    } finally {
      setSubmittingCrypto(false);
    }
  };


  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Address copied to clipboard!");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">Deposit Funds</h1>
        <p className="text-sm text-muted-foreground mt-1">Add funds to your account via crypto</p>
      </div>

      {/* Pending Deposits Section */}
      {!loadingPending && pendingDeposits.length > 0 && (
        <Card variant="glass" padding="lg" className="border-amber-500/20 bg-amber-500/5">
          <CardHeader className="p-0 space-y-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Badge variant="warning">Pending</Badge>
              You have {pendingDeposits.length} pending deposit{pendingDeposits.length > 1 ? "s" : ""}
            </CardTitle>
            <CardDescription>
              You can cancel pending deposits to create new ones
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0 mt-4 space-y-3">
            {pendingDeposits.map((deposit) => (
              <div
                key={deposit._id || deposit.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border bg-card/40"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {deposit.walletData?.coinName || "USD"} {deposit.amount?.toLocaleString()}
                    </span>
                    {deposit.walletData?.network && (
                      <Badge variant="outline" className="text-xs">
                        {deposit.walletData.network}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted on {new Date(deposit.date || deposit.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelDeposit(deposit._id || deposit.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="w-full">

        {/* Crypto Deposit */}
        <Card variant="glass" padding="lg" hover="lift" className="mt-6">
            <CardHeader className="p-0 space-y-2">
              <CardTitle className="text-lg">Crypto Deposit</CardTitle>
              <CardDescription>Send crypto to your wallet address.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 mt-6 space-y-4">
              {loadingCoins ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Loading deposit options...</span>
                </div>
              ) : coins.length === 0 ? (
                <div className="text-center py-8">
                  <p className="font-medium">Crypto deposits are not available yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Deposit addresses haven&apos;t been configured. Please check back soon or contact support.</p>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Select Cryptocurrency</Label>
                    <select
                      value={selectedCoinSymbol}
                      onChange={(e) => setSelectedCoinSymbol(e.target.value)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-3 text-base sm:text-sm"
                    >
                      {coins.map((coin) => (
                        <option key={coin.key} value={coin.key}>
                          {coin.name} ({coin.symbol}) - {coin.network}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label>Amount (USD)</Label>
                    <Input
                      type="number"
                      placeholder={selectedCoin?.minDeposit ? `Min: $${selectedCoin.minDeposit}` : "100.00"}
                      value={cryptoAmount}
                      onChange={(e) => setCryptoAmount(e.target.value)}
                      min={selectedCoin?.minDeposit || 10}
                    />
                    {(selectedCoin?.minDeposit ?? 0) > 0 && (
                      <p className="text-xs text-muted-foreground">Minimum deposit: ${selectedCoin?.minDeposit}</p>
                    )}
                  </div>

                  {/* Platform Wallet Address */}
                  {selectedCoin && (
                    <div key={selectedCoin.key} className="rounded-lg border border-border bg-accent/5 overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                        <span className="text-sm font-medium">Deposit Address</span>
                        <Badge variant="outline">{selectedCoin.network}</Badge>
                      </div>

                      <div className="flex flex-col md:flex-row items-center gap-4 sm:gap-6 p-3 sm:p-4">
                        {/* QR Code */}
                        <div className="shrink-0 flex flex-col items-center gap-2">
                          {selectedCoin.address ? (
                            <div className="p-3 bg-white rounded-lg shadow-sm">
                              <QRCode
                                key={selectedCoin.address}
                                value={selectedCoin.address}
                                size={128}
                                style={{ display: "block" }}
                              />
                            </div>
                          ) : (
                            <div className="w-[166px] h-[166px] rounded-lg border border-dashed border-border flex items-center justify-center text-center p-3 text-xs text-muted-foreground">
                              Address not configured.<br />Contact support.
                            </div>
                          )}
                          <span className="text-xs text-muted-foreground">Scan with your wallet</span>
                        </div>

                        {/* Address + instructions */}
                        <div className="min-w-0 flex-1 space-y-3 w-full">
                          <div>
                            <Label className="text-xs text-muted-foreground mb-1.5 block">
                              Send {selectedCoin.symbol} ({selectedCoin.network}) to:
                            </Label>
                            <div className="flex items-center gap-2">
                              <code className="min-w-0 flex-1 text-xs font-mono bg-muted px-3 py-2.5 rounded-lg break-all leading-relaxed">
                                {selectedCoin.address || "Address not configured"}
                              </code>
                              <Button
                                size="sm"
                                variant="outline"
                                className="shrink-0 h-11 w-11"
                                onClick={() => copyToClipboard(selectedCoin.address || "")}
                                disabled={!selectedCoin.address}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs text-muted-foreground">
                            <p className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 p-2 sm:p-2.5">
                              <span aria-hidden className="shrink-0 text-amber-500 leading-5">&#9888;</span>
                              <span className="min-w-0 flex-1 break-words leading-5">Send only <strong className="text-foreground">{selectedCoin.symbol}</strong> on the <strong className="text-foreground">{selectedCoin.network}</strong> network. Wrong network = permanent loss.</span>
                            </p>
                            {selectedCoin.memo && (
                              <p className="min-w-0 break-words leading-5">Memo / tag (required): <strong className="text-foreground break-all">{selectedCoin.memo}</strong></p>
                            )}
                            {selectedCoin.minDeposit > 0 && (
                              <p className="flex items-start gap-2">
                                <span aria-hidden className="shrink-0 text-blue-500 leading-5">&#8505;</span>
                                <span className="min-w-0 flex-1 break-words leading-5">Minimum deposit: <strong className="text-foreground">${selectedCoin.minDeposit}</strong></span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-3">
                    <p className="text-xs text-blue-600">
                      <strong>Next steps:</strong> After sending crypto, submit this form. We'll detect the transaction on the blockchain and credit your account once confirmed.
                    </p>
                  </div>

                  <Button
                    className="w-full"
                    onClick={handleCryptoDeposit}
                    disabled={submittingCrypto || !cryptoAmount || !selectedCoin?.address}
                  >
                    {submittingCrypto ? "Submitting..." : "I've Sent the Crypto - Submit Deposit"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
      </div>
    </div>
  );
}
