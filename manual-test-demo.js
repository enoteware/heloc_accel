// Manual test to check the demo account functionality
console.log(`
============================================
MANUAL TESTING GUIDE - HELOC Demo Account
============================================

Please open your browser and go to: http://localhost:3000

1. LOGIN TEST:
   - Click "Sign In" button in the navigation
   - Enter email: enoteware@gmail.com  
   - Enter password: demo123!!
   - Click "Sign In" button
   - You should see "enoteware" in the top right corner

2. CALCULATOR TEST:
   - After login, you should be on the calculator page
   - Look for the calculator form - it should have these fields:
     * Monthly Income
     * Monthly Expenses
     * Mortgage Balance
     * Mortgage Rate
     * Monthly Payment
     * HELOC Limit
     * HELOC Rate
   
   - Fill in some test values:
     * Monthly Income: 8000
     * Monthly Expenses: 3000
     * Mortgage Balance: 250000
     * Mortgage Rate: 6.5
     * Monthly Payment: 1800
     * HELOC Limit: 50000
     * HELOC Rate: 8.5
   
   - Click "Calculate" button
   - You should see charts and results

3. SAVE SCENARIO TEST:
   - After calculating, click "Save Scenario" button
   - Enter a name like "Test Scenario 1"
   - Click Save
   - Check if it saves successfully

4. VIEW SCENARIOS:
   - Click "Scenarios" in the navigation
   - You should see your saved scenario
   - Click on it to load it back

5. LOGOUT TEST:
   - Click on your username "enoteware" in top right
   - Click "Sign Out"
   - You should be logged out and see "Sign In" button again

Please report any issues you encounter!
`);