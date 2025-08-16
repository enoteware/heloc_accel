// Company and Agent Data Types and Demo Storage
// This module provides types and demo storage for company/agent data

export interface CompanySettings {
  id?: number;
  companyName: string;
  companyLogoUrl?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
  companyWebsite?: string;
  companyLicenseNumber?: string;
  companyNmlsNumber?: string;
  companyDescription?: string;
  primaryColor?: string;
  secondaryColor?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Agent {
  id?: number;
  userId?: string;
  firstName: string;
  lastName: string;
  title?: string;
  email: string;
  phone?: string;
  phoneExtension?: string;
  mobilePhone?: string;
  profileImageUrl?: string;
  bio?: string;
  nmlsNumber?: string;
  licenseStates?: string[];
  specialties?: string[];
  yearsExperience?: number;
  isActive: boolean;
  displayOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AgentAvailability {
  id?: number;
  agentId: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  isAvailable: boolean;
}

export interface UserAgentAssignment {
  userId: string;
  agentId: number;
  assignmentType: "primary" | "secondary" | "temporary";
  assignedAt?: Date;
  notes?: string;
}

// Demo Company Data (for demo mode and development)
const DEMO_COMPANY_SETTINGS: CompanySettings = {
  id: 1,
  companyName: "HELOC Accelerator Solutions",
  companyAddress: "123 Financial Plaza, Suite 100\nMortgage City, MC 12345",
  companyPhone: "1-800-HELOC-01",
  companyEmail: "info@helocaccelerator.com",
  companyWebsite: "https://helocaccelerator.com",
  companyLicenseNumber: "ML-123456",
  companyNmlsNumber: "1234567",
  companyDescription:
    "Your trusted partner in mortgage acceleration strategies. We help homeowners save thousands in interest and pay off their mortgages years early.",
  primaryColor: "#2563eb",
  secondaryColor: "#10b981",
};

// Demo Agents Data
const DEMO_AGENTS: Agent[] = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Johnson",
    title: "Senior HELOC Specialist",
    email: "sarah.johnson@helocaccelerator.com",
    phone: "555-0101",
    phoneExtension: "101",
    mobilePhone: "555-555-0101",
    bio: "Sarah has over 15 years of experience in mortgage acceleration strategies and has helped hundreds of families save money on their mortgages. She specializes in HELOC strategies and debt consolidation.",
    nmlsNumber: "123456",
    licenseStates: ["CA", "TX", "FL", "NY"],
    specialties: [
      "HELOC",
      "Mortgage Refinancing",
      "Debt Consolidation",
      "First-Time Buyers",
    ],
    yearsExperience: 15,
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 2,
    firstName: "Michael",
    lastName: "Chen",
    title: "Mortgage Acceleration Advisor",
    email: "michael.chen@helocaccelerator.com",
    phone: "555-0102",
    phoneExtension: "102",
    bio: "Michael brings a unique analytical approach to mortgage acceleration, with a background in financial engineering. He excels at creating customized strategies for complex financial situations.",
    nmlsNumber: "234567",
    licenseStates: ["CA", "WA", "OR", "AZ"],
    specialties: ["HELOC", "Investment Properties", "Cash-Flow Analysis"],
    yearsExperience: 8,
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 3,
    firstName: "Emily",
    lastName: "Rodriguez",
    title: "Home Equity Consultant",
    email: "emily.rodriguez@helocaccelerator.com",
    phone: "555-0103",
    bio: "Emily specializes in helping families maximize their home equity potential. Fluent in English and Spanish, she provides personalized service to diverse communities.",
    nmlsNumber: "345678",
    licenseStates: ["TX", "FL", "CA"],
    specialties: ["HELOC", "Home Equity Loans", "Bilingual Services"],
    yearsExperience: 6,
    isActive: true,
    displayOrder: 3,
  },
];

// Storage keys for demo mode
const STORAGE_KEYS = {
  COMPANY_SETTINGS: "heloc_demo_company_settings",
  AGENTS: "heloc_demo_agents",
  USER_ASSIGNMENTS: "heloc_demo_user_agent_assignments",
};

// Initialize demo data in localStorage
export function initializeDemoCompanyData(): void {
  if (typeof window === "undefined") return;

  // Initialize company settings if not exists
  if (!localStorage.getItem(STORAGE_KEYS.COMPANY_SETTINGS)) {
    localStorage.setItem(
      STORAGE_KEYS.COMPANY_SETTINGS,
      JSON.stringify(DEMO_COMPANY_SETTINGS),
    );
  }

  // Initialize agents if not exists
  if (!localStorage.getItem(STORAGE_KEYS.AGENTS)) {
    localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(DEMO_AGENTS));
  }
}

// Get company settings (demo mode)
export function getDemoCompanySettings(): CompanySettings | null {
  if (typeof window === "undefined") return null;

  const stored = localStorage.getItem(STORAGE_KEYS.COMPANY_SETTINGS);
  return stored ? JSON.parse(stored) : null;
}

// Update company settings (demo mode)
export function updateDemoCompanySettings(
  settings: Partial<CompanySettings>,
): CompanySettings {
  if (typeof window === "undefined")
    throw new Error("Cannot update settings on server side");

  const current = getDemoCompanySettings() || DEMO_COMPANY_SETTINGS;
  const updated = {
    ...current,
    ...settings,
    updatedAt: new Date(),
  };

  localStorage.setItem(STORAGE_KEYS.COMPANY_SETTINGS, JSON.stringify(updated));
  return updated;
}

// Get all agents (demo mode)
export function getDemoAgents(): Agent[] {
  if (typeof window === "undefined") return [];

  const stored = localStorage.getItem(STORAGE_KEYS.AGENTS);
  return stored ? JSON.parse(stored) : [];
}

// Get single agent (demo mode)
export function getDemoAgent(agentId: number): Agent | null {
  const agents = getDemoAgents();
  return agents.find((agent) => agent.id === agentId) || null;
}

// Get active agents (demo mode)
export function getDemoActiveAgents(): Agent[] {
  return getDemoAgents().filter((agent) => agent.isActive);
}

// Get assigned agent for user (demo mode)
export function getDemoUserAgent(userId: string): Agent | null {
  if (typeof window === "undefined") return null;

  // Get user assignments
  const stored = localStorage.getItem(STORAGE_KEYS.USER_ASSIGNMENTS);
  const assignments: UserAgentAssignment[] = stored ? JSON.parse(stored) : [];

  // Find primary assignment for user
  const assignment = assignments.find(
    (a) => a.userId === userId && a.assignmentType === "primary",
  );

  if (!assignment) {
    // If no assignment, randomly assign an active agent
    const activeAgents = getDemoActiveAgents();
    if (activeAgents.length === 0) return null;

    const randomAgent =
      activeAgents[Math.floor(Math.random() * activeAgents.length)];

    // Save the assignment
    assignments.push({
      userId,
      agentId: randomAgent.id!,
      assignmentType: "primary",
      assignedAt: new Date(),
    });
    localStorage.setItem(
      STORAGE_KEYS.USER_ASSIGNMENTS,
      JSON.stringify(assignments),
    );

    return randomAgent;
  }

  return getDemoAgent(assignment.agentId);
}

// Format phone number for display
export function formatPhoneNumber(phone: string, extension?: string): string {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Format as (XXX) XXX-XXXX
  if (cleaned.length === 10) {
    const formatted = `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    return extension ? `${formatted} ext. ${extension}` : formatted;
  }

  // If 11 digits (with country code)
  if (cleaned.length === 11 && cleaned[0] === "1") {
    const formatted = `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    return extension ? `${formatted} ext. ${extension}` : formatted;
  }

  // Return original if can't format
  return extension ? `${phone} ext. ${extension}` : phone;
}

// Get agent's full name
export function getAgentFullName(agent: Agent): string {
  return `${agent.firstName} ${agent.lastName}`;
}

// Get agent's contact info formatted for display
export function getAgentContactInfo(agent: Agent): {
  name: string;
  title: string;
  email: string;
  phone: string;
  mobile?: string;
} {
  return {
    name: getAgentFullName(agent),
    title: agent.title || "Mortgage Advisor",
    email: agent.email,
    phone: formatPhoneNumber(agent.phone || "", agent.phoneExtension),
    mobile: agent.mobilePhone
      ? formatPhoneNumber(agent.mobilePhone)
      : undefined,
  };
}
