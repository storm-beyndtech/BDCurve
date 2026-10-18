import React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Settings,
  Mail,
  DollarSign,
  CreditCard,
  ShieldCheck,
  ArrowRightLeft,
  BarChart3,
  LogOut,
  LucideIcon,
  UserCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

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

export const adminNavSections: NavSection[] = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Approvals",
    items: [
      {
        label: "Deposits",
        href: "/admin/deposits",
        icon: DollarSign,
      },
      {
        label: "Withdrawals",
        href: "/admin/withdrawals",
        icon: CreditCard,
      },
      {
        label: "KYC",
        href: "/admin/kyc",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        label: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        label: "Transactions",
        href: "/admin/transactions",
        icon: ArrowRightLeft,
      },
      {
        label: "Wallets",
        href: "/admin/wallets",
        icon: CreditCard,
      },
    ],
  },
  {
    title: "Trading",
    items: [
      {
        label: "Traders",
        href: "/admin/traders",
        icon: UserCircle2,
      },
    ],
  },
  {
    title: "System",
    items: [
      {
        label: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
      },
      {
        label: "Emails",
        href: "/admin/emails",
        icon: Mail,
      },
      {
        label: "Settings",
        href: "/admin/settings",
        icon: Settings,
      },
    ],
  },
];

export function AdminSidebarNav({ className = "", hideOnMobile = true }: { className?: string; hideOnMobile?: boolean }) {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "fixed top-4 left-4 bottom-4 z-50 w-64 border border-border/50 bg-card/95 backdrop-blur-xl overflow-hidden rounded-2xl shadow-2xl",
        hideOnMobile ? "hidden lg:block" : "",
        className
      )}
    >
      {/* Subtle diagonal grid pattern for visual depth */}
      <div className="absolute inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.03) 1px, transparent 1px), linear-gradient(to right, rgba(168, 85, 247, 0.03) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          transform: 'rotate(-3deg) scale(1.2)'
        }}/>
      <div className="flex h-full flex-col relative z-10">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-border/50 px-6">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="relative w-auto h-6">
              <img
                src="/logo2.png"
                alt="Bounding Curve Admin"
                width={90}
                height={24}
                className="h-full w-auto object-contain dark:invert"
              />
            </div>
            <span className="text-xs font-medium text-accent-500">ADMIN</span>
          </Link>
        </div>

        {/* Navigation - with custom scrollbar */}
        <nav
          className="flex-1 px-3 py-6 space-y-6 overflow-y-auto overflow-x-hidden"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(168, 85, 247, 0.3) transparent'
          }}
        >
          {adminNavSections.map((section, idx) => (
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
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/5"
                      )}
                    >
                      {/* Active Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="admin-sidebar-active-pill"
                          className="absolute inset-0 rounded-lg bg-accent-500/10 border border-accent-500/20"
                          transition={{
                            type: "spring",
                            stiffness: 500,
                            damping: 35,
                          }}/>
                      )}

                      <Icon
                        className={cn(
                          "h-4.5 w-4.5 relative z-10 transition-colors",
                          isActive
                            ? "text-accent-600"
                            : "text-muted-foreground/60 group-hover:text-foreground"
                        )}/>
                      <span className="relative z-10 flex-1">{item.label}</span>

                      {item.badge && (
                        <span className="ml-auto relative z-10 inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium rounded-full bg-accent-500/10 text-accent-600">
                          {item.badge}
                        </span>
                      )}

                      {/* Subtle hover indicator */}
                      {!isActive && (
                        <div className="absolute inset-y-0 left-0 w-0.5 bg-accent-500/0 group-hover:bg-accent-500/50 rounded-r transition-colors"/>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer - Admin Profile */}
        <div className="border-t border-border/50 p-3 mt-auto">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center ring-2 ring-accent-500/20">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.name?.full || "Admin"}
              </p>
              <p className="text-xs text-muted-foreground/70 truncate">
                Administrator
              </p>
            </div>
            <button
              onClick={logout}
              className="p-2 hover:bg-accent/5 rounded-lg transition-colors group"
              title="Logout"
            >
              <LogOut className="h-4 w-4 text-muted-foreground/50 group-hover:text-accent-600 transition-colors"/>
            </button>
          </div>
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
