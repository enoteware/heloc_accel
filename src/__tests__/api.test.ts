/**
 * Integration tests for API endpoints
 * These tests verify the API endpoints work correctly with proper authentication,
 * validation, and database operations.
 */

import { NextRequest } from "next/server";

// Helper function to create a NextRequest with properly mocked json() method
function createMockRequest(
  url: string,
  options: { method: string; headers?: Headers; body?: any },
) {
  const request = new NextRequest(url, {
    method: options.method,
    headers: options.headers,
    body:
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body),
  });

  // Mock the json() method to return the parsed body data
  if (options.body) {
    const bodyData =
      typeof options.body === "string"
        ? JSON.parse(options.body)
        : options.body;
    request.json = jest.fn().mockResolvedValue(bodyData);
  }

  return request;
}

// Mock Stack app to avoid importing ESM modules in tests
jest.mock("@/stack", () => ({
  stackServerApp: {
    getUser: jest.fn().mockResolvedValue({
      id: "user-123",
      primaryEmail: "test@example.com",
      displayName: "Test User",
    }),
  },
}));

// Mock the database pool used by API routes before importing them
jest.mock("@/lib/db", () => {
  const query = jest.fn();
  const mockClient = { query, release: jest.fn() };
  return {
    __esModule: true,
    default: { connect: jest.fn().mockResolvedValue(mockClient) },
    __queryMock: query,
  };
});
const { __queryMock: mockQuery } = require("@/lib/db");

// Mock auth wrappers to avoid importing Stack Auth in tests
let __currentAuthUser: any = {
  id: "stack-user-123",
  primaryEmail: "test@example.com",
  localUser: { id: "user-123" },
};
jest.mock("@/lib/api-auth", () => ({
  withAuth:
    (handler: any) =>
    async (request: any, ...rest: any[]) =>
      __currentAuthUser
        ? handler(request, { user: __currentAuthUser }, ...rest)
        : require("next/server").NextResponse.json(
            { success: false, error: "Authentication required" },
            { status: 401 },
          ),
  __setAuthUser: (u: any) => {
    __currentAuthUser = u;
  },
}));

jest.mock("@/auth", () => ({
  auth: jest.fn() as jest.MockedFunction<any>,
}));

jest.mock("crypto", () => ({
  randomBytes: jest.fn(() => ({
    toString: jest.fn(() => "mock-token-123456789"),
  })),
}));

jest.mock("bcryptjs", () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

// Import auth after mocking to get the mocked version
import { auth } from "@/auth";

// Import API routes after mocking
import {
  GET as getScenarios,
  POST as createScenario,
} from "../app/api/scenario/route";
import {
  GET as getScenario,
  DELETE as deleteScenario,
} from "../app/api/scenario/[id]/route";
import { POST as shareScenario } from "../app/api/scenario/[id]/share/route";
// Mock shared route database to avoid pg import
jest.mock("@/lib/database", () => ({ query: jest.fn() }));
const { query: mockDbQuery } = require("@/lib/database");
import { GET as getSharedScenario } from "../app/api/shared/[token]/route";
import {
  GET as getProfile,
  PUT as updateProfile,
} from "../app/api/profile/route";
import { PUT as changePassword } from "../app/api/profile/password/route";

// Get mocked auth function
const mockedAuth = auth as unknown as jest.MockedFunction<() => Promise<any>>;

// Mock user for authentication
const mockUser = {
  id: "user-123",
  email: "test@example.com",
  firstName: "Test",
  lastName: "User",
};

const mockSession = {
  user: mockUser,
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
};

describe("API Integration Tests", () => {
  beforeAll(() => {
    process.env.DATABASE_URL =
      process.env.DATABASE_URL || "postgres://user:pass@localhost:5432/testdb";
  });
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset DB mocks between tests to avoid cross-test leakage
    if (typeof mockQuery?.mockReset === "function") mockQuery.mockReset();
    if (typeof require("@/lib/database").query?.mockReset === "function") {
      require("@/lib/database").query.mockReset();
    }
    mockedAuth.mockResolvedValue(mockSession);
  });

  describe("Scenario API", () => {
    describe("GET /api/scenario", () => {
      test("should return user scenarios successfully", async () => {
        const mockScenarios = [
          {
            id: "scenario-1",
            name: "Test Scenario",
            description: "Test Description",
            current_mortgage_balance: 200000,
            current_interest_rate: 0.065,
            remaining_term_months: 300,
            monthly_payment: 1500,
            created_at: new Date("2024-01-01"),
            updated_at: new Date("2024-01-01"),
            traditional_payoff_months: 300,
            heloc_payoff_months: 180,
            interest_saved: 50000,
          },
        ];

        mockQuery.mockResolvedValueOnce({ rows: mockScenarios });

        const request = new NextRequest("http://localhost:3000/api/scenario", {
          headers: new Headers(),
        });
        const response = await getScenarios(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data).toHaveLength(1);
        expect(data.data[0].name).toBe("Test Scenario");
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("SELECT"),
          [mockUser.id],
        );
      });

      test("should handle authentication error", async () => {
        // make withAuth return 401 for this test
        const { __setAuthUser } = require("@/lib/api-auth");
        __setAuthUser(null);

        const request = new NextRequest("http://localhost:3000/api/scenario", {
          headers: new Headers(),
        });
        const response = await getScenarios(request);
        const data = await response.json();

        expect(response.status).toBe(401);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Authentication required");

        // reset auth user for subsequent tests
        __setAuthUser({
          id: "stack-user-123",
          primaryEmail: "test@example.com",
          localUser: { id: "user-123" },
        });
      });

      test("should handle database error", async () => {
        mockQuery.mockRejectedValueOnce(new Error("Database error"));

        const request = new NextRequest("http://localhost:3000/api/scenario", {
          headers: new Headers(),
        });
        const response = await getScenarios(request);
        const data = await response.json();

        expect(response.status).toBe(500);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Failed to retrieve scenarios");
      });
    });

    describe("POST /api/scenario", () => {
      test("should create scenario successfully", async () => {
        const mockScenarioData = {
          name: "New Scenario",
          description: "New Description",
          currentMortgageBalance: 250000,
          currentInterestRate: 0.065, // route expects decimal form
          remainingTermMonths: 360,
          monthlyPayment: 1800,
          helocLimit: 60000,
          helocInterestRate: 0.07,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4000,
          monthlyDiscretionaryIncome: 2000,
          propertyValue: 400000, // Add required field
          propertyTaxMonthly: 500,
          insuranceMonthly: 150,
          pmiMonthly: 0,
        };

        const mockInsertResult = {
          rows: [
            {
              id: "new-scenario-id",
              name: "New Scenario",
              created_at: new Date(),
              updated_at: new Date(),
            },
          ],
        };

        mockQuery.mockResolvedValueOnce(mockInsertResult);

        const request = createMockRequest(
          "http://localhost:3000/api/scenario",
          {
            method: "POST",
            headers: new Headers({ "content-type": "application/json" }),
            body: mockScenarioData,
          },
        );

        const response = await createScenario(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.success).toBe(true);
        expect(data.data.scenario.id).toBe("new-scenario-id");
        expect(mockQuery).toHaveBeenCalledWith(
          expect.stringContaining("INSERT INTO scenarios"),
          expect.arrayContaining([mockUser.id, "New Scenario"]),
        );
      });

      test("should validate required fields", async () => {
        const invalidData = {
          name: "", // Empty name should fail validation
          currentMortgageBalance: 250000,
        };

        const request = new NextRequest("http://localhost:3000/api/scenario", {
          method: "POST",
          headers: new Headers({ "content-type": "application/json" }),
          body: JSON.stringify(invalidData),
        });

        const response = await createScenario(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("required");
      });

      test("should validate numeric fields", async () => {
        const invalidData = {
          name: "Test Scenario",
          description: "Test Description",
          currentMortgageBalance: -100000, // Negative balance should fail
          currentInterestRate: 0.065,
          remainingTermMonths: 360,
          monthlyPayment: 1800,
          helocLimit: 60000,
          helocInterestRate: 0.07,
          monthlyGrossIncome: 8000,
          monthlyNetIncome: 6000,
          monthlyExpenses: 4000,
          monthlyDiscretionaryIncome: 2000,
          propertyValue: 400000,
          propertyTaxMonthly: 500,
          insuranceMonthly: 150,
          pmiMonthly: 0,
        };

        const request = createMockRequest(
          "http://localhost:3000/api/scenario",
          {
            method: "POST",
            headers: new Headers({ "content-type": "application/json" }),
            body: invalidData,
          },
        );

        const response = await createScenario(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("Invalid calculator inputs");
      });
    });

    describe("GET /api/scenario/[id]", () => {
      test("should return specific scenario", async () => {
        const mockScenario = {
          id: "scenario-1",
          name: "Test Scenario",
          description: "Test Description",
          current_mortgage_balance: 200000,
          created_at: new Date("2024-01-01"),
          updated_at: new Date("2024-01-01"),
        };

        mockQuery.mockResolvedValueOnce({ rows: [mockScenario] });

        const response = await getScenario(
          new NextRequest("http://localhost:3000/api/scenario/scenario-1", {
            headers: new Headers(),
          }),
          { params: Promise.resolve({ id: "scenario-1" }) },
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.id).toBe("scenario-1");
      });

      test("should return 404 for non-existent scenario", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const response = await getScenario(
          new NextRequest("http://localhost:3000/api/scenario/non-existent", {
            headers: new Headers(),
          }),
          { params: Promise.resolve({ id: "non-existent" }) },
        );
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Scenario not found or access denied");
      });
    });

    describe("DELETE /api/scenario/[id]", () => {
      test("should delete scenario successfully", async () => {
        // Mock scenario exists check
        mockQuery.mockResolvedValueOnce({ rows: [{ id: "scenario-1" }] });
        // Mock delete operation
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const response = await deleteScenario(
          new NextRequest("http://localhost:3000/api/scenario/scenario-1", {
            method: "DELETE",
            headers: new Headers(),
          }),
          { params: Promise.resolve({ id: "scenario-1" }) },
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.message).toBe("Scenario deleted successfully");
      });

      test("should return 404 for non-existent scenario", async () => {
        mockQuery.mockResolvedValueOnce({ rows: [] });

        const response = await deleteScenario(
          new NextRequest("http://localhost:3000/api/scenario/non-existent", {
            method: "DELETE",
            headers: new Headers(),
          }),
          { params: Promise.resolve({ id: "non-existent" }) },
        );
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Scenario not found or access denied");
      });
    });
  });

  describe("Scenario Sharing API", () => {
    describe("POST /api/scenario/[id]/share", () => {
      test("should enable sharing successfully", async () => {
        const mockScenario = {
          id: "scenario-1",
          is_public: false,
          public_share_token: null,
        };

        mockQuery.mockResolvedValueOnce({ rows: [mockScenario] });
        mockQuery.mockResolvedValueOnce({
          rows: [
            { is_public: true, public_share_token: "mock-token-123456789" },
          ],
        }); // Update query returns updated scenario

        const request = new NextRequest(
          "http://localhost:3000/api/scenario/scenario-1/share",
          {
            method: "POST",
            body: JSON.stringify({ isPublic: true }),
          },
        );

        const response = await shareScenario(request, {
          params: Promise.resolve({ id: "scenario-1" }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.shareUrl).toContain("mock-token-123456789");
        expect(data.data.isPublic).toBe(true);
      });

      test("should disable sharing successfully", async () => {
        const mockScenario = {
          id: "scenario-1",
          is_public: true,
          public_share_token: "existing-token",
        };

        mockQuery.mockResolvedValueOnce({ rows: [mockScenario] });
        mockQuery.mockResolvedValueOnce({
          rows: [{ is_public: false, public_share_token: null }],
        }); // Update query returns updated scenario

        const request = new NextRequest(
          "http://localhost:3000/api/scenario/scenario-1/share",
          {
            method: "POST",
            body: JSON.stringify({ isPublic: false }),
          },
        );

        const response = await shareScenario(request, {
          params: Promise.resolve({ id: "scenario-1" }),
        });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.isPublic).toBe(false);
      });
    });

    describe("GET /api/shared/[token]", () => {
      test("should return shared scenario successfully", async () => {
        const mockSharedScenario = {
          id: "scenario-1",
          name: "Shared Scenario",
          description: "Shared Description",
          current_mortgage_balance: 200000,
          created_at: new Date("2024-01-01"),
          updated_at: new Date("2024-01-01"),
          first_name: "John",
          last_name: "Doe",
        };

        mockDbQuery.mockResolvedValueOnce({ rows: [mockSharedScenario] });

        const response = await getSharedScenario(
          new NextRequest("http://localhost:3000/api/shared/valid-token", {
            headers: new Headers(),
          }),
          { params: Promise.resolve({ token: "valid-token" }) },
        );
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.name).toBe("Shared Scenario");
        expect(data.data.shared_by).toBe("John Doe");
      });

      test("should return 404 for invalid token", async () => {
        mockDbQuery.mockResolvedValueOnce({ rows: [] });

        const response = await getSharedScenario(
          new NextRequest("http://localhost:3000/api/shared/invalid-token", {
            headers: new Headers(),
          }),
          { params: Promise.resolve({ token: "invalid-token" }) },
        );
        const data = await response.json();

        expect(response.status).toBe(404);
        expect(data.success).toBe(false);
        expect(data.error).toBe(
          "Shared scenario not found or no longer available",
        );
      });
    });
  });

  describe("Profile API", () => {
    describe("GET /api/profile", () => {
      test("should return user profile successfully", async () => {
        const mockProfile = {
          id: "user-123",
          email: "test@example.com",
          first_name: "Test",
          last_name: "User",
          created_at: new Date("2024-01-01"),
          updated_at: new Date("2024-01-01"),
          last_login: new Date("2024-01-02"),
          email_verified: true,
        };

        mockQuery.mockResolvedValueOnce({ rows: [mockProfile] });

        const request = new NextRequest("http://localhost:3000/api/profile", {
          headers: new Headers(),
        });
        const response = await getProfile(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.email).toBe("test@example.com");
        expect(data.data.firstName).toBe("Test");
        expect(data.data.lastName).toBe("User");
      });
    });

    describe("PUT /api/profile", () => {
      test("should update profile successfully", async () => {
        const updateData = {
          firstName: "Updated",
          lastName: "Name",
          email: "updated@example.com",
        };

        // Mock email uniqueness check
        mockQuery.mockResolvedValueOnce({ rows: [] });
        // Mock update operation
        mockQuery.mockResolvedValueOnce({
          rows: [
            {
              id: "user-123",
              email: "updated@example.com",
              first_name: "Updated",
              last_name: "Name",
              updated_at: new Date(),
            },
          ],
        });

        const request = createMockRequest("http://localhost:3000/api/profile", {
          method: "PUT",
          headers: new Headers({ "content-type": "application/json" }),
          body: updateData,
        });

        const response = await updateProfile(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
        expect(data.data.firstName).toBe("Updated");
        expect(data.data.lastName).toBe("Name");
      });

      test("should validate email format", async () => {
        const invalidData = {
          firstName: "Test",
          lastName: "User",
          email: "invalid-email",
        };

        const request = createMockRequest("http://localhost:3000/api/profile", {
          method: "PUT",
          headers: new Headers({ "content-type": "application/json" }),
          body: invalidData,
        });

        const response = await updateProfile(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("email");
      });

      // Note: Current profile route doesn't implement email uniqueness check
      // This test is commented out until that feature is added
      test.skip("should check email uniqueness", async () => {
        const updateData = {
          firstName: "Test",
          lastName: "User",
          email: "existing@example.com",
        };

        // Mock email already exists
        mockQuery.mockResolvedValueOnce({ rows: [{ id: "other-user" }] });

        const request = new NextRequest("http://localhost:3000/api/profile", {
          method: "PUT",
          headers: new Headers({ "content-type": "application/json" }),
          body: JSON.stringify(updateData),
        });

        const response = await updateProfile(request);
        const data = await response.json();

        expect(response.status).toBe(409);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Email address is already in use");
      });
    });

    describe("PUT /api/profile/password", () => {
      test("should redirect to Stack Auth for password changes", async () => {
        const passwordData = {
          currentPassword: "oldpassword123",
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        };

        const request = new NextRequest(
          "http://localhost:3000/api/profile/password",
          {
            method: "PUT",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(passwordData),
          },
        );

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain(
          "Password changes must be done through Stack Auth",
        );
        expect(data.data.redirectUrl).toBeDefined();
      });

      // Note: Current password route redirects to Stack Auth instead of handling locally
      // These tests are skipped until local password handling is implemented
      test.skip("should validate password confirmation", async () => {
        const passwordData = {
          currentPassword: "oldpassword123",
          newPassword: "NewPassword123!",
          confirmPassword: "DifferentPassword123!",
        };

        const request = new NextRequest(
          "http://localhost:3000/api/profile/password",
          {
            method: "PUT",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(passwordData),
          },
        );

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe("New password and confirmation do not match");
      });

      test.skip("should validate password strength", async () => {
        const passwordData = {
          currentPassword: "oldpassword123",
          newPassword: "weak", // Too weak
          confirmPassword: "weak",
        };

        const request = new NextRequest(
          "http://localhost:3000/api/profile/password",
          {
            method: "PUT",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(passwordData),
          },
        );

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toContain("must be at least 8 characters");
      });

      test.skip("should verify current password", async () => {
        const passwordData = {
          currentPassword: "wrongpassword",
          newPassword: "NewPassword123!",
          confirmPassword: "NewPassword123!",
        };

        // Mock current user lookup
        mockQuery.mockResolvedValueOnce({
          rows: [
            {
              password_hash: "$2a$12$mockhashedpassword",
            },
          ],
        });

        // Mock bcrypt compare to return false for wrong current password
        const bcrypt = require("bcryptjs");
        jest.spyOn(bcrypt, "compare").mockResolvedValueOnce(false);

        const request = new NextRequest(
          "http://localhost:3000/api/profile/password",
          {
            method: "PUT",
            headers: new Headers({ "content-type": "application/json" }),
            body: JSON.stringify(passwordData),
          },
        );

        const response = await changePassword(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.success).toBe(false);
        expect(data.error).toBe("Current password is incorrect");
      });
    });
  });
});
