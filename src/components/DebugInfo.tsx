"use client";

import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useDebugFlag } from "@/hooks/useDebugFlag";

export default function DebugInfo() {
  const pathname = usePathname();
  const locale = useLocale();
  const isDebugMode = useDebugFlag();

  // Only render if debug flag is present in URL
  if (!isDebugMode) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-xs">
      <div className="font-bold mb-2 text-green-400">🐛 Debug Info</div>
      <div className="space-y-1">
        <div>
          <span className="text-blue-300">Locale:</span> {locale}
        </div>
        <div>
          <span className="text-blue-300">Pathname:</span> {pathname}
        </div>
        <div>
          <span className="text-blue-300">URL:</span>{" "}
          {typeof window !== "undefined" ? window.location.href : "SSR"}
        </div>
        <div>
          <span className="text-blue-300">Env:</span> {process.env.NODE_ENV}
        </div>
      </div>
    </div>
  );
}
