import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Copy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface CodeSample {
  /**
   * Language identifier
   */
  language: string;
  /**
   * Display label for tab
   */
  label: string;
  /**
   * Code content
   */
  code: string;
  /**
   * File extension for styling
   */
  extension?: string;
}

export interface CodeSamplesPanelProps {
  /**
   * Panel title
   */
  title?: string;
  /**
   * Panel description
   */
  description?: string;
  /**
   * Array of code samples
   */
  samples: CodeSample[];
  /**
   * Default selected language
   */
  defaultLanguage?: string;
  /**
   * Card variant
   * @default "elevated"
   */
  variant?: "elevated" | "glass" | "default";
  /**
   * Show line numbers
   * @default true
   */
  showLineNumbers?: boolean;
}

export function CodeSamplesPanel({
  title,
  description,
  samples,
  defaultLanguage,
  variant = "elevated",
  showLineNumbers = true,
}: CodeSamplesPanelProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState(
    defaultLanguage || samples[0]?.language || ""
  );
  const [copied, setCopied] = React.useState(false);

  const currentSample = samples.find(
    (sample) => sample.language === selectedLanguage
  );

  const handleCopy = async () => {
    if (currentSample) {
      await navigator.clipboard.writeText(currentSample.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const codeLines = currentSample?.code.split("\n") || [];

  return (
    <Card variant={variant} padding="none">
      {/* Header */}
      {(title || description) && (
        <div className="px-6 py-4 border-b border-border">
          {title && <h3 className="font-semibold mb-1">{title}</h3>}
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      )}

      {/* Language Tabs */}
      <div className="flex items-center justify-between border-b border-border bg-muted/30">
        <div className="flex items-center gap-1 px-4 py-2">
          {samples.map((sample) => (
            <button
              key={sample.language}
              onClick={() => setSelectedLanguage(sample.language)}
              className={cn(
                "relative px-3 py-1.5 text-sm font-medium rounded-lg transition-colors",
                selectedLanguage === sample.language
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {selectedLanguage === sample.language && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-card rounded-lg shadow-sm"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}/>
              )}
              <span className="relative z-10">{sample.label}</span>
            </button>
          ))}
        </div>

        {/* Copy Button */}
        <button
          onClick={handleCopy}
          className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
        >
          <AnimatePresence mode="wait">
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Check className="h-4 w-4 text-green-600"/>
                <span>Copied!</span>
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="flex items-center gap-2"
              >
                <Copy className="h-4 w-4"/>
                <span>Copy</span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Code Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedLanguage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="overflow-x-auto"
        >
          <pre className="p-6 bg-muted/20 font-mono text-sm">
            <code>
              {codeLines.map((line, index) => (
                <div key={index} className="flex">
                  {showLineNumbers && (
                    <span className="inline-block w-8 text-right pr-4 text-muted-foreground select-none">
                      {index + 1}
                    </span>
                  )}
                  <span className="flex-1">{line || "\u00A0"}</span>
                </div>
              ))}
            </code>
          </pre>
        </motion.div>
      </AnimatePresence>
    </Card>
  );
}

/**
 * Compact code sample without full panel styling
 */
export function CodeSampleInline({
  code,
  language = "bash",
}: {
  code: string;
  language?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <pre className="p-4 bg-muted/50 rounded-lg border border-border overflow-x-auto font-mono text-sm">
        <code>{code}</code>
      </pre>

      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-lg bg-card border border-border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent/5"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-600"/>
        ) : (
          <Copy className="h-4 w-4"/>
        )}
      </button>
    </div>
  );
}

/**
 * Helper to create common API code samples
 */
export const createAPISamples = (endpoint: string, method: string = "POST", requestBody?: Record<string, any>): CodeSample[] => {
  const bodyStr = requestBody ? JSON.stringify(requestBody, null, 2) : "{}";

  return [
    {
      language: "javascript",
      label: "JavaScript",
      extension: "js",
      code: `const boundingcurve = require('boundingcurve');

const client = boundingcurve('sk_live_...');

const response = await client.${endpoint.split('/').pop()}({
${requestBody ? Object.entries(requestBody).map(([key, value]) => `  ${key}: ${JSON.stringify(value)},`).join('\n') : '  // Request parameters'}
});

console.log(response);`,
    },
    {
      language: "python",
      label: "Python",
      extension: "py",
      code: `import boundingcurve

client = boundingcurve.Client('sk_live_...')

response = client.${(endpoint.split('/').pop() ?? 'request').replace(/-/g, '_')}(
${requestBody ? Object.entries(requestBody).map(([key, value]) => `    ${key}=${JSON.stringify(value)},`).join('\n') : '    # Request parameters'}
)

print(response)`,
    },
    {
      language: "curl",
      label: "cURL",
      extension: "sh",
      code: `curl -X ${method} https://api.boundingcurve.com${endpoint} \\
  -H "Authorization: Bearer sk_live_..." \\
  -H "Content-Type: application/json" \\
  -d '${bodyStr}'`,
    },
  ];
};

