import { NextRequest, NextResponse } from 'next/server'
import { stackServerApp } from '@/stack'
import pool from '@/lib/db'
import { logInfo, logDebug, logError } from '@/lib/debug-logger'

// Test user credentials
const TEST_USER = {
  email: 'enoteware@gmail.com',
  password: 'demo123!!'
}

export async function GET(request: NextRequest) {
  logInfo('Test:StackAuth', 'Stack Auth integration test started')
  
  const results = {
    timestamp: new Date().toISOString(),
    tests: [] as any[],
    summary: {
      total: 0,
      passed: 0,
      failed: 0
    }
  }

  // Test 1: Check Stack Auth configuration
  try {
    const configTest = {
      name: 'Stack Auth Configuration',
      status: 'testing',
      details: {} as any
    }
    
    configTest.details = {
      hasProjectId: !!process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY,
      hasSecretKey: !!process.env.STACK_SECRET_SERVER_KEY,
      tokenStore: 'nextjs-cookie',
      isStackAppConfigured: !!stackServerApp
    }
    
    configTest.status = Object.values(configTest.details).every(v => v === true || typeof v === 'string') ? 'passed' : 'failed'
    results.tests.push(configTest)
    logDebug('Test:StackAuth', 'Configuration test', configTest)
  } catch (error) {
    results.tests.push({
      name: 'Stack Auth Configuration',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 2: Get current user from request
  try {
    const authTest = {
      name: 'Get Current User',
      status: 'testing',
      details: {} as any
    }
    
    const user = await stackServerApp.getUser({ tokenStore: request })
    
    authTest.details = {
      isAuthenticated: !!user,
      userId: user?.id,
      email: user?.primaryEmail,
      displayName: user?.displayName,
      emailVerified: user?.emailVerified
    }
    
    authTest.status = user ? 'passed' : 'failed'
    results.tests.push(authTest)
    logDebug('Test:StackAuth', 'Auth test', authTest)
  } catch (error) {
    results.tests.push({
      name: 'Get Current User',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 3: Database user lookup
  try {
    const dbTest = {
      name: 'Database User Lookup',
      status: 'testing',
      details: {} as any
    }
    
    const client = await pool.connect()
    try {
      // Check if user exists in database
      const userResult = await client.query(
        'SELECT id, email, created_at FROM users WHERE email = $1',
        [TEST_USER.email]
      )
      
      dbTest.details = {
        userExists: userResult.rows.length > 0,
        userId: userResult.rows[0]?.id,
        email: userResult.rows[0]?.email,
        createdAt: userResult.rows[0]?.created_at
      }
      
      // Check user's scenarios
      if (userResult.rows.length > 0) {
        const scenarioResult = await client.query(
          'SELECT COUNT(*) as count FROM scenarios WHERE user_id = $1',
          [userResult.rows[0].id]
        )
        dbTest.details.scenarioCount = parseInt(scenarioResult.rows[0].count)
      }
      
      dbTest.status = userResult.rows.length > 0 ? 'passed' : 'failed'
      results.tests.push(dbTest)
      logDebug('Test:StackAuth', 'Database test', dbTest)
    } finally {
      client.release()
    }
  } catch (error) {
    results.tests.push({
      name: 'Database User Lookup',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Test 4: Test API endpoint with authentication
  try {
    const apiTest = {
      name: 'API Endpoint Test',
      status: 'testing',
      details: {} as any
    }
    
    // Get current user
    const user = await stackServerApp.getUser({ tokenStore: request })
    
    if (user) {
      // Try to fetch scenarios
      const client = await pool.connect()
      try {
        const result = await client.query(
          'SELECT id, name FROM scenarios WHERE user_id = $1 LIMIT 5',
          [user.id]
        )
        
        apiTest.details = {
          userAuthenticated: true,
          userId: user.id,
          scenariosFound: result.rows.length,
          scenarios: result.rows
        }
        
        apiTest.status = 'passed'
      } finally {
        client.release()
      }
    } else {
      apiTest.details = {
        userAuthenticated: false,
        message: 'No authenticated user found'
      }
      apiTest.status = 'failed'
    }
    
    results.tests.push(apiTest)
    logDebug('Test:StackAuth', 'API test', apiTest)
  } catch (error) {
    results.tests.push({
      name: 'API Endpoint Test',
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }

  // Calculate summary
  results.summary.total = results.tests.length
  results.summary.passed = results.tests.filter(t => t.status === 'passed').length
  results.summary.failed = results.tests.filter(t => t.status === 'failed').length

  logInfo('Test:StackAuth', 'Test completed', results.summary)

  return NextResponse.json({
    success: true,
    results
  })
}

// POST endpoint to test authentication flow
export async function POST(request: NextRequest) {
  logInfo('Test:StackAuth', 'Testing authentication flow')
  
  try {
    const body = await request.json()
    const { action } = body
    
    if (action === 'test-save-scenario') {
      // Test saving a scenario with authentication
      const user = await stackServerApp.getUser({ tokenStore: request })
      
      if (!user) {
        return NextResponse.json({
          success: false,
          error: 'Not authenticated'
        }, { status: 401 })
      }
      
      const testScenario = {
        name: `Test Scenario ${Date.now()}`,
        description: 'Created by Stack Auth test endpoint',
        // Add minimal required fields
        current_mortgage_balance: 300000,
        current_interest_rate: 0.045,
        remaining_term_months: 360,
        monthly_payment: 2000,
        monthly_gross_income: 10000,
        monthly_net_income: 7500,
        monthly_expenses: 3000,
        monthly_discretionary_income: 4500
      }
      
      const client = await pool.connect()
      try {
        const result = await client.query(
          `INSERT INTO scenarios (
            user_id, name, description,
            current_mortgage_balance, current_interest_rate,
            remaining_term_months, monthly_payment,
            monthly_gross_income, monthly_net_income,
            monthly_expenses, monthly_discretionary_income
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          RETURNING id, name`,
          [
            user.id,
            testScenario.name,
            testScenario.description,
            testScenario.current_mortgage_balance,
            testScenario.current_interest_rate,
            testScenario.remaining_term_months,
            testScenario.monthly_payment,
            testScenario.monthly_gross_income,
            testScenario.monthly_net_income,
            testScenario.monthly_expenses,
            testScenario.monthly_discretionary_income
          ]
        )
        
        logInfo('Test:StackAuth', 'Test scenario created', {
          scenarioId: result.rows[0].id,
          userId: user.id
        })
        
        return NextResponse.json({
          success: true,
          scenario: result.rows[0]
        })
      } finally {
        client.release()
      }
    }
    
    return NextResponse.json({
      success: false,
      error: 'Unknown action'
    }, { status: 400 })
  } catch (error) {
    logError('Test:StackAuth', 'Test failed', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}