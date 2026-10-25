import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Check,
  Trash2,
  Plus,
  AlertTriangle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface APIKey {
  /**
   * Unique identifier
   */
  id: string;
  /**
   * Key name/label
   */
  name: string;
  /**
   * Masked key value
   */
  key: string;
  /**
   * Environment type
   */
  environment: "production" | "sandbox";
  /**
   * Creation date
   */
  createdAt: string;
  /**
   * Last used date
   */
  lastUsed?: string;
  /**
   * Key permissions/scopes
   */
  scopes?: string[];
}

export interface APIKeysPanelProps {
  /**
   * Panel title
   */
  title?: string;
  /**
   * Panel description
   */
  description?: string;
  /**
   * Array of API keys
   */
  keys: APIKey[];
  /**
   * Callback when creating new key
   */
  onCreateKey?: () => void;
  /**
   * Callback when regenerating key
   */
  onRegenerateKey?: (keyId: string) => void;
  /**
   * Callback when deleting key
   */
  onDeleteKey?: (keyId: string) => void;
  /**
   * Card variant
   * @default "elevated"
   */
  variant?: "elevated" | "glass" | "default";
}

function APIKeyItem({
  apiKey,
  onRegenerate,
  onDelete,
}: {
  apiKey: APIKey;
  onRegenerate?: (keyId: string) => void;
  onDelete?: (keyId: string) => void;
}) {
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const maskedKey = apiKey.key.slice(0, 8) + "••••••••••••••••" + apiKey.key.slice(-4);
  const displayKey = revealed ? apiKey.key : maskedKey;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerate = () => {
    if (confirm("Regenerate this API key? The old key will stop working immediately.")) {
      onRegenerate?.(apiKey.id);
    }
  };

  const handleDelete = () => {
    if (showDeleteConfirm) {
      onDelete?.(apiKey.id);
      setShowDeleteConfirm(false);
    } else {
      setShowDeleteConfirm(true);
      setTimeout(() => setShowDeleteConfirm(false), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 border-b border-border last:border-b-0 hover:bg-accent/5 transition-colors"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Key Info */}
        <div className="flex-1 min-w-0 space-y-3">
          {/* Name & Environment */}
          <div className="flex items-center gap-2">
            <h4 className="font-medium">{apiKey.name}</h4>
            <Badge
              variant={
                apiKey.environment === "production" ? "accent" : "default"
              }
              className="text-xs"
            >
              {apiKey.environment === "production" ? "Production" : "Sandbox"}
            </Badge>
          </div>

          {/* Key Value */}
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2 bg-muted/50 rounded-lg font-mono text-sm overflow-x-auto">
              {displayKey}
            </code>

            {/* Toggle Reveal */}
            <button
              onClick={() => setRevealed(!revealed)}
              className="p-2 hover:bg-accent/5 rounded-lg transition-colors"
              title={revealed ? "Hide key" : "Reveal key"}
            >
              {revealed ? (
                <EyeOff className="h-4 w-4"/>
              ) : (
                <Eye className="h-4 w-4"/>
              )}
            </button>

            {/* Copy */}
            <button
              onClick={handleCopy}
              className="p-2 hover:bg-accent/5 rounded-lg transition-colors"
              title="Copy key"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-600"/>
              ) : (
                <Copy className="h-4 w-4"/>
              )}
            </button>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>Created {apiKey.createdAt}</span>
            {apiKey.lastUsed && <span>Last used {apiKey.lastUsed}</span>}
            {apiKey.scopes && apiKey.scopes.length > 0 && (
              <div className="flex items-center gap-1">
                <span>Scopes:</span>
                {apiKey.scopes.map((scope, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {scope}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {onRegenerate && (
            <button
              onClick={handleRegenerate}
              className="p-2 hover:bg-accent/5 rounded-lg transition-colors"
              title="Regenerate key"
            >
              <RefreshCw className="h-4 w-4"/>
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className={cn(
                "p-2 rounded-lg transition-colors",
                showDeleteConfirm
                  ? "bg-red-500/10 hover:bg-red-500/20 text-red-600"
                  : "hover:bg-accent/5"
              )}
              title={showDeleteConfirm ? "Click again to confirm" : "Delete key"}
            >
              {showDeleteConfirm ? (
                <AlertTriangle className="h-4 w-4"/>
              ) : (
                <Trash2 className="h-4 w-4"/>
              )}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function APIKeysPanel({
  title = "API Keys",
  description = "Manage your API keys for production and sandbox environments",
  keys,
  onCreateKey,
  onRegenerateKey,
  onDeleteKey,
  variant = "elevated",
}: APIKeysPanelProps) {
  return (
    <Card variant={variant} padding="none">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 p-6 border-b border-border">
        <div>
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {onCreateKey && (
          <Button
            variant="primary-purple"
            size="sm"
            className="gap-2"
            onClick={onCreateKey}
          >
            <Plus className="h-4 w-4"/>
            New Key
          </Button>
        )}
      </div>

      {/* Keys List */}
      <div>
        {keys.length === 0 ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-muted/50 mb-3">
              <AlertTriangle className="h-6 w-6 text-muted-foreground"/>
            </div>
            <p className="text-sm font-medium mb-1">No API keys</p>
            <p className="text-xs text-muted-foreground mb-4">
              Create your first API key to get started
            </p>
            {onCreateKey && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onCreateKey}
              >
                <Plus className="h-4 w-4"/>
                Create API Key
              </Button>
            )}
          </div>
        ) : (
          <div>
            {keys.map((key) => (
              <APIKeyItem
                key={key.id}
                apiKey={key}
                onRegenerate={onRegenerateKey}
                onDelete={onDeleteKey}/>
            ))}
          </div>
        )}
      </div>

      {/* Footer Warning */}
      {keys.length > 0 && (
        <div className="p-4 bg-muted/30 border-t border-border">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5"/>
            <div className="text-sm">
              <p className="font-medium text-yellow-600 mb-1">
                Keep your API keys secure
              </p>
              <p className="text-muted-foreground text-xs">
                Never share your API keys in publicly accessible areas like
                GitHub, client-side code, or support channels. Regenerate any
                compromised keys immediately.
              </p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}

/**
 * Compact API key display without full panel
 */
export function APIKeyCompact({ apiKey }: { apiKey: APIKey }) {
  const [revealed, setRevealed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const maskedKey = apiKey.key.slice(0, 8) + "••••••••••••••••" + apiKey.key.slice(-4);
  const displayKey = revealed ? apiKey.key : maskedKey;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(apiKey.key);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
      <code className="flex-1 font-mono text-sm truncate">{displayKey}</code>
      <button
        onClick={() => setRevealed(!revealed)}
        className="p-1.5 hover:bg-accent/5 rounded transition-colors"
      >
        {revealed ? <EyeOff className="h-3 w-3"/> : <Eye className="h-3 w-3"/>}
      </button>
      <button
        onClick={handleCopy}
        className="p-1.5 hover:bg-accent/5 rounded transition-colors"
      >
        {copied ? (
          <Check className="h-3 w-3 text-green-600"/>
        ) : (
          <Copy className="h-3 w-3"/>
        )}
      </button>
    </div>
  );
}


