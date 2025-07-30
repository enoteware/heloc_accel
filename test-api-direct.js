// Test the scenarios API directly

async function testAPI() {
  console.log('Testing Scenarios API...\n');
  
  // Test data
  const testData = {
    inputs: {
      scenarioName: 'API Test Scenario',
      description: 'Testing direct API call',
      currentMortgageBalance: 350000,
      currentInterestRate: 6.5,
      remainingTermMonths: 360,
      monthlyPayment: 2212,
      propertyValue: 500000,
      monthlyGrossIncome: 10000,
      monthlyNetIncome: 7500,
      monthlyExpenses: 4500,
      monthlyDiscretionaryIncome: 3000,
      helocLimit: 100000,
      helocInterestRate: 8.5
    },
    results: {
      traditional: {
        payoffMonths: 360,
        totalInterest: 446320,
        monthlyPayment: 2212,
        totalPayments: 796320
      },
      heloc: {
        payoffMonths: 180,
        totalInterest: 223160,
        totalMortgageInterest: 200000,
        totalHelocInterest: 23160,
        maxHelocUsed: 50000,
        averageHelocBalance: 25000,
        schedule: []
      },
      comparison: {
        timeSavedMonths: 180,
        timeSavedYears: 15,
        interestSaved: 223160,
        percentageInterestSaved: 50,
        monthlyPaymentDifference: 0
      }
    }
  };
  
  try {
    // First, check if API is reachable
    console.log('1. Checking API health...');
    const healthResponse = await fetch('http://localhost:3000/api/health');
    const health = await healthResponse.json();
    console.log('✅ API Health:', health);
    
    // Try to GET scenarios (should fail without auth)
    console.log('\n2. Testing GET /api/scenarios (no auth)...');
    const getResponse = await fetch('http://localhost:3000/api/scenarios');
    const getData = await getResponse.json();
    console.log('Response:', getData);
    
    // Try to POST a scenario (should fail without auth)
    console.log('\n3. Testing POST /api/scenarios (no auth)...');
    const postResponse = await fetch('http://localhost:3000/api/scenarios', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    const postData = await postResponse.json();
    console.log('Response:', postData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Run with Node.js
if (typeof window === 'undefined') {
  testAPI();
}