import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'

export async function POST(request: NextRequest) {
  console.log('=== TEST SAVE SCENARIO ENDPOINT ===')
  
  try {
    // Check authentication
    const user = await stackServerApp.getUser({ tokenStore: request })
    console.log('User auth check:', {
      authenticated: !!user,
      userId: user?.id,
      email: user?.primaryEmail
    })
    
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        details: 'User must be logged in to save scenarios'
      }, { status: 401 })
    }
    
    // Get the test payload
    const body = await request.json()
    console.log('Request body:', body)
    
    // Create minimal test payload
    const testPayload = {
      inputs: {
        scenarioName: body.scenarioName || 'Test Scenario',
        description: body.description || 'Test description',
        currentMortgageBalance: 300000,
        currentInterestRate: 6.5,
        remainingTermMonths: 360,
        monthlyPayment: 2000,
        helocLimit: 50000,
        helocInterestRate: 8.5,
        monthlyGrossIncome: 10000,
        monthlyNetIncome: 7500,
        monthlyExpenses: 3000,
        monthlyDiscretionaryIncome: 4500
      },
      results: {
        traditional: {
          payoffMonths: 360,
          totalInterest: 150000,
          monthlyPayment: 2000,
          totalPayments: 720000
        },
        heloc: {
          payoffMonths: 240,
          totalInterest: 100000,
          totalMortgageInterest: 80000,
          totalHelocInterest: 20000,
          maxHelocUsed: 30000,
          averageHelocBalance: 15000
        },
        comparison: {
          timeSavedMonths: 120,
          timeSavedYears: 10,
          interestSaved: 50000,
          percentageInterestSaved: 33.33
        }
      }
    }
    
    // Call the actual save endpoint
    const saveResponse = await fetch(`${request.nextUrl.origin}/api/scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': request.headers.get('cookie') || ''
      },
      body: JSON.stringify(testPayload)
    })
    
    const saveResult = await saveResponse.json()
    console.log('Save response:', {
      status: saveResponse.status,
      ok: saveResponse.ok,
      result: saveResult
    })
    
    return NextResponse.json({
      success: saveResponse.ok,
      testDetails: {
        authenticated: true,
        userId: user.id,
        userEmail: user.primaryEmail,
        payloadSent: true,
        saveResponse: {
          status: saveResponse.status,
          data: saveResult
        }
      }
    })
    
  } catch (error) {
    console.error('Test save error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}