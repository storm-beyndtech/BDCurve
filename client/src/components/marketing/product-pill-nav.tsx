import * as React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { productList } from "@/lib/products";
import { cn } from "@/lib/utils";

export function ProductPillNav() {
  const { pathname } = useLocation();

  return (
    <nav className="relative">
      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center justify-center gap-2 p-2 bg-glass-card border-glass rounded-pill shadow-depth backdrop-blur-xl">
        {productList.map((product) => {
          const isActive = pathname === product.href;
          const Icon = product.icon;

          return (
            <Link
              key={product.id}
              to={product.href}
              className={cn(
                "relative px-4 py-2 rounded-pill text-sm font-medium transition-colors duration-300",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative z-10 flex items-center gap-2">
                <Icon className="h-4 w-4"/>
                <span>{product.name}</span>
              </span>

              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary-500/10 rounded-pill"
                  layoutId="productPill"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}/>
              )}
            </Link>
          );
        })}
      </div>

      {/* Mobile/Tablet Navigation */}
      <div className="lg:hidden">
        <div className="flex overflow-x-auto gap-2 pb-4 scrollbar-hide">
          {productList.map((product) => {
            const isActive = pathname === product.href;
            const Icon = product.icon;

            return (
              <Link
                key={product.id}
                to={product.href}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-pill text-sm font-medium whitespace-nowrap transition-all duration-300",
                  isActive
                    ? "bg-primary-500/10 text-foreground"
                    : "bg-glass-card border-glass text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4"/>
                <span>{product.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}

/**
 * Compact version for page headers
 */
export function ProductPillNavCompact() {
  const { pathname } = useLocation();

  return (
    <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-hide">
      {productList.map((product) => {
        const isActive = pathname === product.href;

        return (
          <Link
            key={product.id}
            to={product.href}
            className={cn(
              "px-3 py-1.5 rounded-pill text-xs font-medium whitespace-nowrap transition-all duration-300",
              isActive
                ? "bg-primary-500/10 text-foreground"
                : "bg-glass-card border-glass text-muted-foreground hover:text-foreground"
            )}
          >
            {product.name}
          </Link>
        );
      })}
    </div>
  );
}


