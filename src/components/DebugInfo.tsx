"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useDebugFlag } from "@/hooks/useDebugFlag";

// Deprecated debug component - retained for potential future developer debugging
export default function DebugInfo() {
  const pathname = usePathname();
  const locale = useLocale();
  const isDebugMode = useDebugFlag();

  // Only render if debug flag is present in URL
  if (!isDebugMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-card text-foreground border border-border p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2">🐛 Debug Info</div>
      <div className="space-y-1">
        <div>
          <span className="text-foreground-secondary">Locale:</span> {locale}
        </div>
        <div>
          <span className="text-foreground-secondary">Pathname:</span>{" "}
          {pathname}
        </div>
        <div>
          <span className="text-foreground-secondary">URL:</span>{" "}
          {typeof window !== "undefined" ? (
            <a
              className="safe-link"
              href={window.location.href}
              rel="noreferrer"
            >
              {window.location.href}
            </a>
          ) : (
            "SSR"
          )}
        </div>
        <div>
          <span className="text-foreground-secondary">Env:</span>{" "}
          {process.env.NODE_ENV}
        </div>
      </div>
    </div>
  );
}
