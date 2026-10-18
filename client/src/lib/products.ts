import { LucideIcon, TrendingUp, PieChart, BarChart3, Bitcoin, Gem } from "lucide-react";

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  color: "primary" | "accent";
  href: string;
  features: string[];
  useCases: UseCase[];
  stats?: ProductStat[];
}

export interface UseCase {
  title: string;
  description: string;
  benefits: string[];
}

export interface ProductStat {
  label: string;
  value: string;
  description: string;
}

export const products: Record<string, Product> = {
  stocks: {
    id: "stocks",
    name: "Stocks",
    tagline: "Trade 9,000+ stocks commission-free",
    description:
      "Access thousands of US-listed stocks with commission-free trading. From blue-chip companies to emerging growth stocks, build your portfolio with fractional shares starting at just $1.",
    icon: TrendingUp,
    color: "primary",
    href: "/products/stocks",
    features: [
      "9,000+ US stocks available",
      "Commission-free trading",
      "Fractional shares from $1",
      "Extended-hours trading",
      "AI-powered stock insights",
      "Real-time market data",
    ],
    useCases: [
      {
        title: "Long-Term Wealth Building",
        description:
          "Build a diversified portfolio of quality stocks for long-term growth. Invest in established companies with strong fundamentals and consistent performance.",
        benefits: [
          "Compound returns over time",
          "Dividend income potential",
          "Portfolio diversification",
        ],
      },
      {
        title: "Growth Investing",
        description:
          "Focus on high-growth companies in emerging sectors like technology, biotech, and clean energy for maximum capital appreciation.",
        benefits: [
          "Access to innovative companies",
          "Higher return potential",
          "Sector rotation opportunities",
        ],
      },
      {
        title: "Income Generation",
        description:
          "Build a dividend-focused portfolio for regular income. Invest in dividend aristocrats and high-yield stocks for consistent cash flow.",
        benefits: [
          "Regular dividend payments",
          "Passive income stream",
          "Lower volatility stocks",
        ],
      },
    ],
    stats: [
      {
        label: "Stocks Available",
        value: "9,000+",
        description: "US-listed securities",
      },
      {
        label: "Minimum Investment",
        value: "$1",
        description: "Start with fractional shares",
      },
      {
        label: "Trading Hours",
        value: "4AM-8PM",
        description: "Extended hours for Premium members",
      },
    ],
  },

  etfs: {
    id: "etfs",
    name: "ETFs",
    tagline: "Diversified investing made simple",
    description:
      "Trade thousands of exchange-traded funds commission-free. Access instant diversification across sectors, geographies, and asset classes with a single investment.",
    icon: PieChart,
    color: "accent",
    href: "/products/etfs",
    features: [
      "Thousands of ETFs available",
      "Sector and theme-based funds",
      "International market access",
      "Bond and commodity ETFs",
      "Fractional ETF shares",
      "Advanced ETF screener",
    ],
    useCases: [
      {
        title: "Instant Diversification",
        description:
          "Gain exposure to entire markets, sectors, or strategies with a single ETF. Perfect for beginners and busy investors who want broad market exposure.",
        benefits: [
          "Lower risk through diversification",
          "One-trade portfolio building",
          "Professional management",
        ],
      },
      {
        title: "Strategic Asset Allocation",
        description:
          "Build a balanced portfolio across stocks, bonds, and alternative assets. Use ETFs to implement sophisticated investment strategies.",
        benefits: [
          "Easy rebalancing",
          "Tax-efficient investing",
          "Low expense ratios",
        ],
      },
      {
        title: "Thematic Investing",
        description:
          "Invest in specific themes and trends like AI, clean energy, genomics, or emerging markets with specialized ETFs.",
        benefits: [
          "Access to mega-trends",
          "Focused exposure",
          "Innovation access",
        ],
      },
    ],
    stats: [
      {
        label: "ETFs Available",
        value: "1,000s",
        description: "Across all asset classes",
      },
      {
        label: "Expense Ratios",
        value: "As low as 0.03%",
        description: "Low-cost index funds",
      },
      {
        label: "Commissions",
        value: "$0",
        description: "Commission-free ETF trading",
      },
    ],
  },

  options: {
    id: "options",
    name: "Options",
    tagline: "Options trading with rebates",
    description:
      "Advanced options trading with unique rebate program. Earn $0.06-$0.18 per contract while accessing powerful strategies for income, hedging, and speculation.",
    icon: BarChart3,
    color: "primary",
    href: "/products/options",
    features: [
      "Earn rebates per contract",
      "$0 commissions on options",
      "Advanced strategy builder",
      "Multi-leg order support",
      "Options chain visualization",
      "Rolling and adjustment tools",
    ],
    useCases: [
      {
        title: "Income Generation",
        description:
          "Generate consistent income through covered calls and cash-secured puts. Perfect for investors looking to enhance returns on existing holdings.",
        benefits: [
          "Monthly premium income",
          "Enhance stock returns",
          "Lower cost basis",
        ],
      },
      {
        title: "Portfolio Hedging",
        description:
          "Protect your portfolio against market downturns with protective puts and collar strategies. Manage risk while maintaining upside potential.",
        benefits: [
          "Downside protection",
          "Insurance for holdings",
          "Risk management",
        ],
      },
      {
        title: "Leveraged Trading",
        description:
          "Use options for directional bets with defined risk. Control large positions with small capital through calls and puts.",
        benefits: [
          "Leverage without margin",
          "Defined risk trades",
          "Lower capital requirement",
        ],
      },
    ],
    stats: [
      {
        label: "Rebates",
        value: "$0.06-$0.18",
        description: "Per contract, tier-based",
      },
      {
        label: "Commissions",
        value: "$0",
        description: "No per-contract fees",
      },
      {
        label: "Strategies",
        value: "20+",
        description: "From basic to advanced",
      },
    ],
  },

  crypto: {
    id: "crypto",
    name: "Crypto",
    tagline: "Trade 40+ cryptocurrencies 24/7",
    description:
      "Buy, sell, and trade cryptocurrency around the clock. From Bitcoin and Ethereum to emerging altcoins, access the digital asset revolution with true ownership and no transfer fees.",
    icon: Bitcoin,
    color: "accent",
    href: "/products/crypto",
    features: [
      "40+ cryptocurrencies",
      "24/7 trading availability",
      "True crypto ownership",
      "No deposit/withdrawal fees",
      "Staking rewards (ETH, SOL)",
      "Recurring crypto purchases",
    ],
    useCases: [
      {
        title: "Long-Term Crypto Investing",
        description:
          "Build a position in Bitcoin, Ethereum, and other established cryptocurrencies for long-term wealth creation in the digital economy.",
        benefits: [
          "Early adoption advantage",
          "Portfolio diversification",
          "Inflation hedge potential",
        ],
      },
      {
        title: "Active Crypto Trading",
        description:
          "Take advantage of crypto volatility with 24/7 trading. Buy dips, take profits, and trade altcoins around the clock.",
        benefits: [
          "24/7 market access",
          "High volatility opportunities",
          "No trading restrictions",
        ],
      },
      {
        title: "Staking Income",
        description:
          "Earn passive income by staking Ethereum and Solana. Generate yields while holding your crypto long-term.",
        benefits: [
          "Passive income generation",
          "Network participation",
          "Compound your holdings",
        ],
      },
    ],
    stats: [
      {
        label: "Cryptocurrencies",
        value: "40+",
        description: "Major coins and altcoins",
      },
      {
        label: "Trading Hours",
        value: "24/7",
        description: "Never stop trading",
      },
      {
        label: "Transfer Fees",
        value: "$0",
        description: "Free deposits and withdrawals",
      },
    ],
  },

  commodities: {
    id: "commodities",
    name: "Commodities",
    tagline: "Diversify with gold, silver, oil & more",
    description:
      "Access commodity markets through commission-free ETFs and futures. Hedge inflation, diversify your portfolio, and capitalize on global supply and demand dynamics.",
    icon: Gem,
    color: "primary",
    href: "/products/commodities",
    features: [
      "Gold, silver, oil access",
      "Commodity ETFs commission-free",
      "Futures trading available",
      "Inflation hedge options",
      "Energy and agriculture exposure",
      "Industrial metals trading",
    ],
    useCases: [
      {
        title: "Inflation Protection",
        description:
          "Protect your portfolio from inflation with gold, silver, and other hard assets that historically maintain value during inflationary periods.",
        benefits: [
          "Hedge against inflation",
          "Store of value preservation",
          "Currency devaluation protection",
        ],
      },
      {
        title: "Portfolio Diversification",
        description:
          "Add commodities to reduce correlation with stocks and bonds. Commodities often perform well when traditional assets struggle.",
        benefits: [
          "Low correlation to stocks",
          "Risk reduction",
          "Alternative asset exposure",
        ],
      },
      {
        title: "Thematic Commodity Trading",
        description:
          "Capitalize on global trends like energy transition (copper, lithium), economic growth (industrial metals), or geopolitical events (oil, natural gas).",
        benefits: [
          "Macro trend exposure",
          "Supply/demand dynamics",
          "Global growth plays",
        ],
      },
    ],
    stats: [
      {
        label: "Commodity Access",
        value: "ETFs + Futures",
        description: "Multiple access points",
      },
      {
        label: "ETF Commissions",
        value: "$0",
        description: "Commission-free commodity ETFs",
      },
      {
        label: "Asset Types",
        value: "4+",
        description: "Metals, energy, agriculture, more",
      },
    ],
  },
};

export const productList = Object.values(products);

export function getProductById(id: string): Product | undefined {
  return products[id];
}

export function getProductsByCategory(category: "primary" | "accent"): Product[] {
  return productList.filter((product) => product.color === category);
}
