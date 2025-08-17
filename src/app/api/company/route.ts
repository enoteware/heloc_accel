import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { CompanySettings } from "@/lib/company-data";
import { withAdminAuth, getOptionalUser } from "@/lib/api-auth";

// GET /api/company - Get company settings
export async function GET(request: NextRequest) {
  try {
    // Company settings are public information, no authentication required
    // But we'll fetch from database in production

    // If DATABASE_URL is not set, return error
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          success: false,
          error: "Database not configured",
        },
        { status: 503 },
      );
    }

    try {
      const client = await pool.connect();
      try {
        const result = await client.query(
          "SELECT * FROM company_settings ORDER BY id LIMIT 1",
        );

        if (result.rows.length > 0) {
          const settings = result.rows[0];
          return NextResponse.json({
            success: true,
            data: {
              id: settings.id,
              companyName: settings.company_name,
              companyAddress: settings.company_address,
              companyPhone: settings.company_phone,
              companyEmail: settings.company_email,
              companyWebsite: settings.company_website,
              companyLicenseNumber: settings.company_license_number,
              companyNmlsNumber: settings.company_nmls_number,
              companyDescription: settings.company_description,
              primaryColor: settings.primary_color,
              secondaryColor: settings.secondary_color,
            },
          });
        }
      } finally {
        client.release();
      }
    } catch (dbError) {
      console.error("Database connection error:", dbError);
      return NextResponse.json(
        {
          success: false,
          error: "Database connection failed",
        },
        { status: 503 },
      );
    }

    // If no settings in database, return default settings
    const defaultSettings: CompanySettings = {
      id: 1,
      companyName: "HELOC Accelerator Solutions",
      companyAddress: "123 Financial Plaza, Suite 100\nMortgage City, MC 12345",
      companyPhone: "1-800-HELOC-01",
      companyEmail: "info@helocaccelerator.com",
      companyWebsite: "https://helocaccelerator.com",
      companyLicenseNumber: "ML-123456",
      companyNmlsNumber: "1234567",
      companyDescription:
        "Your trusted partner in mortgage acceleration strategies.",
      primaryColor: "#2563eb",
      secondaryColor: "#10b981",
    };

    return NextResponse.json({
      success: true,
      data: defaultSettings,
    });
  } catch (error) {
    console.error("Error fetching company settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch company settings",
      },
      { status: 500 },
    );
  }
}

// PUT /api/company - Update company settings (admin only)
export const PUT = withAdminAuth(async (request: NextRequest, { user }) => {
  try {
    // For now, return a placeholder response until admin roles are fully implemented
    return NextResponse.json(
      {
        success: false,
        error: "Company settings update not yet implemented",
      },
      { status: 501 },
    );

    // When admin roles are implemented, uncomment the following:
    /*
    const body = await request.json()

    const client = await pool.connect()
    try {
      const result = await client.query(
        `INSERT INTO company_settings (
          company_name, company_address, company_phone, company_email,
          company_website, company_license_number, company_nmls_number,
          company_description, primary_color, secondary_color, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (id) DO UPDATE SET
          company_name = $1, company_address = $2, company_phone = $3,
          company_email = $4, company_website = $5, company_license_number = $6,
          company_nmls_number = $7, company_description = $8, primary_color = $9,
          secondary_color = $10, updated_at = NOW()
        RETURNING *`,
        [
          body.companyName, body.companyAddress, body.companyPhone,
          body.companyEmail, body.companyWebsite, body.companyLicenseNumber,
          body.companyNmlsNumber, body.companyDescription, body.primaryColor,
          body.secondaryColor
        ]
      )

      const updated = result.rows[0]
      return NextResponse.json({
        success: true,
        data: {
          id: updated.id,
          companyName: updated.company_name,
          companyAddress: updated.company_address,
          companyPhone: updated.company_phone,
          companyEmail: updated.company_email,
          companyWebsite: updated.company_website,
          companyLicenseNumber: updated.company_license_number,
          companyNmlsNumber: updated.company_nmls_number,
          companyDescription: updated.company_description,
          primaryColor: updated.primary_color,
          secondaryColor: updated.secondary_color,
          updatedAt: updated.updated_at
        }
      })
    } finally {
      client.release()
    }
    */
  } catch (error) {
    console.error("Error updating company settings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update company settings",
      },
      { status: 500 },
    );
  }
});
