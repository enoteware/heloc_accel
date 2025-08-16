import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/stack";
import pool from "@/lib/db";
import { ApiResponse } from "@/lib/types";
import { z } from "zod";

const ProfileUpdateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional(),
  phoneNumber: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().optional(),
  dateOfBirth: z.string().optional(),
  ageRange: z.string().optional(),
  householdSize: z.number().int().min(0).optional(),
  maritalStatus: z.string().optional(),
  dependents: z.number().int().min(0).optional(),
});

// GET /api/profile - Get user profile information
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    // Get additional profile data from database if needed
    const client = await pool.connect();
    try {
      let dbProfile: any = {};
      try {
        const result = await client.query(
          "SELECT created_at, updated_at, last_login, first_name, last_name, phone_number, address_line1, address_line2, city, state, postal_code, country, date_of_birth, age_range, household_size, marital_status, dependents FROM users WHERE id = $1",
          [user.id],
        );
        dbProfile = result.rows[0] || {};
      } catch (_err) {
        // Fallback for environments where phone_number column hasn't been migrated yet
        const result = await client.query(
          "SELECT created_at, updated_at, last_login, first_name, last_name FROM users WHERE id = $1",
          [user.id],
        );
        dbProfile = result.rows[0] || {};
      }

      return NextResponse.json<ApiResponse>({
        success: true,
        data: {
          id: user.id,
          email: user.primaryEmail,
          firstName:
            dbProfile.first_name || user.displayName?.split(" ")[0] || "",
          lastName:
            dbProfile.last_name || user.displayName?.split(" ")[1] || "",
          phoneNumber: dbProfile.phone_number || "",
          addressLine1: dbProfile.address_line1 || "",
          addressLine2: dbProfile.address_line2 || "",
          city: dbProfile.city || "",
          state: dbProfile.state || "",
          postalCode: dbProfile.postal_code || "",
          country: dbProfile.country || "",
          dateOfBirth: dbProfile.date_of_birth || null,
          ageRange: dbProfile.age_range || "",
          householdSize: dbProfile.household_size || null,
          maritalStatus: dbProfile.marital_status || "",
          dependents: dbProfile.dependents || null,
          emailVerified: (user as any).emailVerified,
          signedUpAt: user.signedUpAt,
          createdAt: dbProfile.created_at || user.signedUpAt,
          updatedAt: dbProfile.updated_at || user.signedUpAt,
          lastLogin: dbProfile.last_login || null,
        },
        message: "Profile retrieved successfully",
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to retrieve profile",
      },
      { status: 500 },
    );
  }
}

// PUT /api/profile - Update user profile information
export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user from Stack Auth
    const user = await stackServerApp.getUser({ tokenStore: request });

    if (!user) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      );
    }

    const body = await request.json();

    const parse = ProfileUpdateSchema.safeParse(body);
    if (!parse.success) {
      const message = parse.error.issues.map((e) => e.message).join("; ");
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          error: message,
        },
        { status: 400 },
      );
    }

    const {
      firstName,
      lastName,
      email,
      phoneNumber,
      addressLine1,
      addressLine2,
      city,
      state,
      postalCode,
      country,
      dateOfBirth,
      ageRange,
      householdSize,
      maritalStatus,
      dependents,
    } = parse.data;

    // Update profile in database (Stack Auth handles core profile updates)
    const client = await pool.connect();
    try {
      // Upsert core profile fields into users table
      try {
        await client.query(
          `UPDATE users SET
             first_name = $1,
             last_name = $2,
             phone_number = $3,
             address_line1 = $4,
             address_line2 = $5,
             city = $6,
             state = $7,
             postal_code = $8,
             country = $9,
             date_of_birth = $10,
             age_range = $11,
             household_size = $12,
             marital_status = $13,
             dependents = $14,
             updated_at = NOW()
           WHERE id = $15`,
          [
            firstName,
            lastName,
            phoneNumber || null,
            addressLine1 || null,
            addressLine2 || null,
            city || null,
            state || null,
            postalCode || null,
            country || null,
            dateOfBirth || null,
            ageRange || null,
            householdSize ?? null,
            maritalStatus || null,
            dependents ?? null,
            user.id,
          ],
        );
      } catch (_err) {
        // Fallback when phone_number column doesn't exist yet
        await client.query(
          `UPDATE users SET
             first_name = $1,
             last_name = $2,
             updated_at = NOW()
           WHERE id = $3`,
          [firstName, lastName, user.id],
        );
      }

      // Optionally update email if provided and different (handled by auth in real system)
      // Skipping email change to avoid conflicts with auth provider

      return NextResponse.json<ApiResponse>({
        success: true,
        message: "Profile updated successfully",
        data: { firstName, lastName, phoneNumber: phoneNumber || "" },
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        error: "Failed to update profile",
      },
      { status: 500 },
    );
  }
}
