// Test API Authentication
console.log(`
Testing Dashboard API Authentication
=====================================

Please open your browser and:

1. Make sure you're logged in at http://localhost:3000
2. Open the browser console (F12)
3. Run this command in the console:

fetch('/api/test-auth', { credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log('Auth Status:', data))

4. If authenticated, test the scenarios API:

fetch('/api/scenarios', { credentials: 'include' })
  .then(r => r.json())
  .then(data => console.log('Scenarios:', data))

Expected results:
- Auth Status should show authenticated: true
- Scenarios should return an array of your saved scenarios

If you see "Unauthorized" errors, try:
1. Logging out and logging back in
2. Check browser cookies for Stack Auth tokens
3. Make sure you're on http://localhost:3000 (not 127.0.0.1)
`);