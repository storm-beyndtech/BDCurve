import React from "react";
import { motion } from "framer-motion";
import { Search, Bell, Menu, User } from "lucide-react";
import { EnvironmentSwitcher, type Environment } from "./environment-switcher";
import { cn } from "@/lib/utils";

export interface TopNavProps {
  /**
   * Page title
   */
  pageTitle?: string;
  /**
   * Optional page description
   */
  pageDescription?: string;
}

export function TopNav({ pageTitle, pageDescription }: TopNavProps) {
  const [environment, setEnvironment] = React.useState<Environment>("sandbox");
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-border/50 bg-glass-nav backdrop-blur-xl relative overflow-hidden">
      {/* Ultra-subtle grid for that premium layered feel */}
      <div className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.15) 1px, transparent 1px), linear-gradient(to right, rgba(168, 85, 247, 0.15) 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}/>
      <div className="relative flex h-full items-center justify-between gap-4 px-6">
        {/* Left: Page Title & Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Trigger */}
          <button className="lg:hidden p-2 -ml-2 hover:bg-accent/5 rounded-lg transition-colors">
            <Menu className="h-5 w-5"/>
          </button>

          {/* Page Title */}
          {pageTitle && (
            <div>
              <h1 className="text-lg font-semibold">{pageTitle}</h1>
              {pageDescription && (
                <p className="text-xs text-muted-foreground">
                  {pageDescription}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden md:block">
            {searchOpen ? (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 280, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative"
              >
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"/>
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onBlur={() => {
                    if (!searchQuery) setSearchOpen(false);
                  }}
                  autoFocus
                  className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-border bg-card focus:outline-none focus:ring-2 focus:ring-accent-500/50"/>
              </motion.div>
            ) : (
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors"
              >
                <Search className="h-4 w-4 text-muted-foreground"/>
                <span className="text-sm text-muted-foreground">Search</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded border border-border bg-muted/30">
                  âŒ˜K
                </kbd>
              </button>
            )}
          </div>

          {/* Mobile Search */}
          <button className="md:hidden p-2 hover:bg-accent/5 rounded-lg transition-colors">
            <Search className="h-5 w-5"/>
          </button>

          {/* Environment Switcher */}
          <EnvironmentSwitcher
            environment={environment}
            onEnvironmentChange={setEnvironment}
            size="default"/>

          {/* Notifications */}
          <button className="relative p-2 hover:bg-accent/5 rounded-lg transition-colors">
            <Bell className="h-5 w-5"/>
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent-500 rounded-full"/>
          </button>

          {/* Profile */}
          <button className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-accent/5 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white"/>
            </div>
            <span className="hidden lg:inline text-sm font-medium">
              Account
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

/**
 * Compact top nav without page title (for modals or embedded views)
 */
export function TopNavCompact() {
  const [environment, setEnvironment] = React.useState<Environment>("sandbox");

  return (
    <div className="flex items-center justify-between py-3 px-4 border-b border-border">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
          <span className="text-white font-bold text-sm">IG</span>
        </div>
        <span className="font-semibold">Bounding Curve</span>
      </div>

      <EnvironmentSwitcher
        environment={environment}
        onEnvironmentChange={setEnvironment}
        size="sm"/>
    </div>
  );
}

