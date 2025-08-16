"use client";

import { useEffect } from "react";
import { setupConsoleInterceptor } from "@/lib/console-interceptor";

export default function ConsoleInterceptor() {
  useEffect(() => {
    setupConsoleInterceptor();
  }, []);

  return null;
}
