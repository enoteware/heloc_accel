"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useUser } from "@stackframe/stack";
import { CompanySettings, Agent } from "@/lib/company-data";
import { logError } from "@/lib/debug-logger";

interface CompanyContextType {
  companySettings: CompanySettings | null;
  assignedAgent: Agent | null;
  loading: boolean;
  error: string | null;
  refreshCompanyData: () => Promise<void>;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export function CompanyProvider({ children }: { children: ReactNode }) {
  const user = useUser();
  const session = user ? { user } : null;
  const [companySettings, setCompanySettings] =
    useState<CompanySettings | null>(null);
  const [assignedAgent, setAssignedAgent] = useState<Agent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCompanyData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch company settings from API
      const settingsResponse = await fetch("/api/company");
      if (settingsResponse.status === 503) {
        throw new Error("Database not configured. Please contact support.");
      } else if (!settingsResponse.ok) {
        throw new Error("Failed to fetch company settings");
      }
      const settingsData = await settingsResponse.json();
      if (settingsData.success) {
        setCompanySettings(settingsData.data);
      }

      // Fetch assigned agent if user is logged in
      if (session?.user?.id) {
        try {
          const agentResponse = await fetch(
            `/api/users/${session.user.id}/agent`,
            { credentials: "include" },
          );
          if (agentResponse.ok) {
            const agentData = await agentResponse.json();
            if (agentData.success) {
              setAssignedAgent(agentData.data);
            } else {
              // Explicit no-assignment path: clear any stale state
              setAssignedAgent(null);
            }
          } else if (
            agentResponse.status === 401 ||
            agentResponse.status === 403 ||
            agentResponse.status === 404 ||
            agentResponse.status === 503
          ) {
            // Not authenticated/forbidden/no assignment/database not configured; avoid noisy console errors
            setAssignedAgent(null);
          }
        } catch (e) {
          // Network failure; ignore silently for unauthenticated users
        }
      }
    } catch (err) {
      logError("CompanyContext", "Error fetching company data", err);
      setError(
        err instanceof Error ? err.message : "Failed to load company data",
      );
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Fetch data on mount and when session changes
  useEffect(() => {
    fetchCompanyData();
  }, [fetchCompanyData]);

  const refreshCompanyData = async () => {
    await fetchCompanyData();
  };

  const contextValue: CompanyContextType = {
    companySettings,
    assignedAgent,
    loading,
    error,
    refreshCompanyData,
  };

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error("useCompany must be used within a CompanyProvider");
  }
  return context;
}

// Hook for getting formatted company info
export function useCompanyInfo() {
  const { companySettings, assignedAgent } = useCompany();

  return {
    company: {
      name: companySettings?.companyName || "HELOC Accelerator",
      phone: companySettings?.companyPhone || "1-800-HELOC",
      email: companySettings?.companyEmail || "info@helocaccelerator.com",
      website:
        companySettings?.companyWebsite || "https://helocaccelerator.com",
      address: companySettings?.companyAddress || "",
      nmls: companySettings?.companyNmlsNumber || "",
      license: companySettings?.companyLicenseNumber || "",
    },
    agent: assignedAgent
      ? {
          name: `${assignedAgent.firstName} ${assignedAgent.lastName}`,
          title: assignedAgent.title || "Mortgage Advisor",
          email: assignedAgent.email,
          phone: assignedAgent.phone || "",
          mobile: assignedAgent.mobilePhone || "",
          nmls: assignedAgent.nmlsNumber || "",
          bio: assignedAgent.bio || "",
        }
      : null,
  };
}
