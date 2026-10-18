import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export type Environment = "production" | "sandbox";

export interface EnvironmentSwitcherProps {
  /**
   * Current environment
   */
  environment: Environment;
  /**
   * Callback when environment changes
   */
  onEnvironmentChange: (env: Environment) => void;
  /**
   * Size variant
   * @default "default"
   */
  size?: "sm" | "default";
}

const environments: { value: Environment; label: string; color: string }[] = [
  {
    value: "production",
    label: "Production",
    color: "text-accent-600",
  },
  {
    value: "sandbox",
    label: "Sandbox",
    color: "text-yellow-600",
  },
];

export function EnvironmentSwitcher({
  environment,
  onEnvironmentChange,
  size = "default",
}: EnvironmentSwitcherProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const currentEnv = environments.find((env) => env.value === environment);

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-lg border border-border bg-card hover:bg-accent/5 transition-colors",
          size === "sm" ? "px-3 py-1.5" : "px-4 py-2"
        )}
      >
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            environment === "production" ? "bg-accent-500" : "bg-yellow-500"
          )}/>
        <span className={cn("font-medium", size === "sm" ? "text-xs" : "text-sm")}>
          {currentEnv?.label}
        </span>
        <ChevronDown
          className={cn(
            "transition-transform",
            size === "sm" ? "h-3 w-3" : "h-4 w-4",
            isOpen && "rotate-180"
          )}/>
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}/>

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.1 }}
              className="absolute right-0 mt-2 w-56 z-50 rounded-xl border border-border bg-card shadow-depth-lg overflow-hidden"
            >
              <div className="p-2">
                {environments.map((env) => {
                  const isActive = environment === env.value;
                  return (
                    <button
                      key={env.value}
                      onClick={() => {
                        onEnvironmentChange(env.value);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive
                          ? "bg-accent-500/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent/5 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2 h-2 rounded-full",
                            env.value === "production"
                              ? "bg-accent-500"
                              : "bg-yellow-500"
                          )}/>
                        <span>{env.label}</span>
                      </div>
                      {isActive && (
                        <Check className="h-4 w-4 text-accent-600"/>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Description */}
              <div className="border-t border-border p-3 bg-muted/30">
                <p className="text-xs text-muted-foreground">
                  {environment === "production" ? (
                    <>
                      You are using <span className="font-semibold">live API keys</span>{" "}
                      and real transactions.
                    </>
                  ) : (
                    <>
                      You are using <span className="font-semibold">test API keys</span>.
                      No real transactions.
                    </>
                  )}
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Compact inline environment indicator (no dropdown)
 */
export function EnvironmentBadge({ environment }: { environment: Environment }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium border",
        environment === "production"
          ? "bg-accent-500/10 border-accent-500/20 text-accent-600"
          : "bg-yellow-500/10 border-yellow-500/20 text-yellow-600"
      )}
    >
      <div
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          environment === "production" ? "bg-accent-500" : "bg-yellow-500"
        )}/>
      {environment === "production" ? "Production" : "Sandbox"}
    </div>
  );
}


