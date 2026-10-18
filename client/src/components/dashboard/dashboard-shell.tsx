import React from "react";
import { SidebarNav } from "./sidebar-nav";
import { TopNav } from "./top-nav";

export interface DashboardShellProps {
  children: React.ReactNode;
  /**
   * Page title displayed in top-nav
   */
  pageTitle?: string;
  /**
   * Optional page description
   */
  pageDescription?: string;
}

export function DashboardShell({
  children,
  pageTitle,
  pageDescription,
}: DashboardShellProps) {
  return (
    <div className="min-h-screen bg-background dashboard-grid-bg flex">
      {/* Sidebar */}
      <SidebarNav/>

      {/* Main Content Area - Takes remaining space */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Top Navigation */}
        <TopNav pageTitle={pageTitle} pageDescription={pageDescription}/>

        {/* Page Content - Layered grid for depth */}
        <main className="relative flex-1">
          {/* Subtle overlay grid for layered effect */}
          <div className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              backgroundImage: 'linear-gradient(rgba(168, 85, 247, 0.02) 1px, transparent 1px), linear-gradient(to right, rgba(168, 85, 247, 0.02) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }}/>
          <div className="relative px-6 md:px-8 lg:px-10 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

/**
 * Compact dashboard shell for embedded views or modals
 */
export function DashboardShellCompact({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container-wide container-padding py-6">{children}</div>
    </div>
  );
}


