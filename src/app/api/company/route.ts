import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { getDemoCompanySettings, updateDemoCompanySettings } from '@/lib/company-data'
import type { CompanySettings } from '@/lib/company-data'

// GET /api/company - Get company settings
export async function GET(request: NextRequest) {
  try {
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (isDemoMode) {
      // Return demo company settings
      const settings = getDemoCompanySettings()
      return NextResponse.json({
        success: true,
        data: settings
      })
    }

    // In production, would fetch from database
    // For now, return sample data
    const settings: CompanySettings = {
      id: 1,
      companyName: 'HELOC Accelerator Solutions',
      companyAddress: '123 Financial Plaza, Suite 100\nMortgage City, MC 12345',
      companyPhone: '1-800-HELOC-01',
      companyEmail: 'info@helocaccelerator.com',
      companyWebsite: 'https://helocaccelerator.com',
      companyLicenseNumber: 'ML-123456',
      companyNmlsNumber: '1234567',
      companyDescription: 'Your trusted partner in mortgage acceleration strategies.',
      primaryColor: '#2563eb',
      secondaryColor: '#10b981'
    }

    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch company settings'
      },
      { status: 500 }
    )
  }
}

// PUT /api/company - Update company settings (admin only)
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    
    // In production, would check for admin role
    // For now, allow if authenticated
    if (!session?.user) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized'
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === 'true'

    if (isDemoMode) {
      // Update demo company settings
      const updated = updateDemoCompanySettings(body)
      return NextResponse.json({
        success: true,
        data: updated
      })
    }

    // In production, would update in database
    // For now, return the input as if it was saved
    return NextResponse.json({
      success: true,
      data: {
        ...body,
        updatedAt: new Date()
      }
    })
  } catch (error) {
    console.error('Error updating company settings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update company settings'
      },
      { status: 500 }
    )
  }
}