const cryptoLogoMap: Record<string, string> = {
  BTC: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
  ETH: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
  BNB: "https://cryptologos.cc/logos/bnb-bnb-logo.png",
  SOL: "https://cryptologos.cc/logos/solana-sol-logo.png",
  ATOM: "https://cryptologos.cc/logos/cosmos-atom-logo.png",
  XRP: "https://cryptologos.cc/logos/xrp-xrp-logo.png",
  ADA: "https://cryptologos.cc/logos/cardano-ada-logo.png",
  DOGE: "https://cryptologos.cc/logos/dogecoin-doge-logo.png",
  AVAX: "https://cryptologos.cc/logos/avalanche-avax-logo.png",
  USDT: "https://cryptologos.cc/logos/tether-usdt-logo.png",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
  DOT: "https://cryptologos.cc/logos/polkadot-new-dot-logo.png",
  MATIC: "https://cryptologos.cc/logos/polygon-matic-logo.png",
  LINK: "https://cryptologos.cc/logos/chainlink-link-logo.png",
  UNI: "https://cryptologos.cc/logos/uniswap-uni-logo.png",
};

const dedupe = (items: string[]) => Array.from(new Set(items.filter(Boolean)));

export const getLogoCandidates = (
  symbol: string,
  companyName?: string,
  type: "stock" | "crypto" = "stock"
): string[] => {
  const cleanSymbol = symbol?.toUpperCase() || "";
  if (!cleanSymbol) return [];

  if (type === "crypto") {
    const primary = cryptoLogoMap[cleanSymbol];
    const secondary = `https://assets.coincap.io/assets/icons/${cleanSymbol.toLowerCase()}@2x.png`;
    const fallbackDomain = `${cleanSymbol.toLowerCase()}.com`;
    const tertiary = `https://www.google.com/s2/favicons?domain=${fallbackDomain}&sz=128`;
    return dedupe([primary, secondary, tertiary]);
  }

  const domain = getDomainForSymbol(cleanSymbol, companyName) || `${cleanSymbol.toLowerCase()}.com`;
  const primary = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
  const secondary = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  const tertiary = `https://api.faviconkit.com/${domain}/64`;

  return dedupe([primary, secondary, tertiary]);
};

/**
 * Utility functions for getting stock and crypto logos
 */
export const getStockLogo = (symbol: string, companyName?: string): string => {
  const [primary] = getLogoCandidates(symbol, companyName, "stock");
  return primary || getFallbackLogo();
};

export const getCryptoLogo = (symbol: string): string => {
  const [primary] = getLogoCandidates(symbol, undefined, "crypto");
  return primary || getFallbackLogo();
};

export const getPlaceholderInitials = (symbol: string, companyName?: string): string => {
  const source = companyName || symbol || "";
  const parts = source.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return (symbol || "??").slice(0, 2).toUpperCase();
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
};

/**
 * Get the primary domain for a stock symbol
 */
const getDomainForSymbol = (symbol: string, companyName?: string): string | null => {
  // Map of common stock tickers to their domains
  const domainMap: Record<string, string> = {
    AAPL: "apple.com",
    GOOGL: "google.com",
    GOOG: "google.com",
    MSFT: "microsoft.com",
    AMZN: "amazon.com",
    TSLA: "tesla.com",
    META: "meta.com",
    FB: "meta.com",
    NVDA: "nvidia.com",
    AMD: "amd.com",
    NFLX: "netflix.com",
    DIS: "disney.com",
    BABA: "alibaba.com",
    V: "visa.com",
    MA: "mastercard.com",
    JPM: "jpmorganchase.com",
    BAC: "bankofamerica.com",
    WMT: "walmart.com",
    JNJ: "jnj.com",
    PG: "pg.com",
    UNH: "unitedhealthgroup.com",
    HD: "homedepot.com",
    KO: "coca-cola.com",
    PEP: "pepsico.com",
    INTC: "intel.com",
    CSCO: "cisco.com",
    VZ: "verizon.com",
    T: "att.com",
    PYPL: "paypal.com",
    ADBE: "adobe.com",
    CRM: "salesforce.com",
    ORCL: "oracle.com",
    IBM: "ibm.com",
    QCOM: "qualcomm.com",
    TXN: "ti.com",
    AVGO: "broadcom.com",
    COST: "costco.com",
    NKE: "nike.com",
    MCD: "mcdonalds.com",
    SBUX: "starbucks.com",
    BA: "boeing.com",
    CAT: "caterpillar.com",
    GE: "ge.com",
    MMM: "3m.com",
    HON: "honeywell.com",
    UPS: "ups.com",
    FDX: "fedex.com",
    WFC: "wellsfargo.com",
    GS: "goldmansachs.com",
    MS: "morganstanley.com",
    AXP: "americanexpress.com",
    BLK: "blackrock.com",
    SCHW: "schwab.com",
    C: "citigroup.com",
    USB: "usbank.com",
    PNC: "pnc.com",
    TFC: "truist.com",
    SPGI: "spglobal.com",
    CME: "cmegroup.com",
    ICE: "theice.com",
    MCO: "moodys.com",
    AIG: "aig.com",
    MET: "metlife.com",
    PRU: "prudential.com",
    ALL: "allstate.com",
    TRV: "travelers.com",
    PGR: "progressive.com",
    CB: "chubb.com",
    AMP: "ampf.com",
  };

  return domainMap[symbol] || null;
};

/**
 * Get a fallback logo (generic icon)
 */
export const getFallbackLogo = (): string => {
  return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cline x1='12' y1='8' x2='12' y2='16'/%3E%3Cline x1='8' y1='12' x2='16' y2='12'/%3E%3C/svg%3E";
};
