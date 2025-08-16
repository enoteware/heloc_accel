# Manual Test Instructions for HELOC Calculator

If you prefer to run the test manually or if the automated test doesn't work, follow these steps:

## Prerequisites

1. Make sure the application is running on http://localhost:3005
2. Install Playwright: `npm install -D @playwright/test`
3. Install browsers: `npx playwright install`

## Running the Automated Test

### Option 1: Using the test runner script

```bash
./run-e2e-test.sh
```

### Option 2: Direct Playwright command

```bash
npx playwright test tests/e2e/heloc-calculator-test.ts --headed --project=chromium
```

### Option 3: Debug mode with step-by-step execution

```bash
npx playwright test tests/e2e/heloc-calculator-test.ts --debug
```

## Manual Browser Testing Steps

If you want to test manually in your browser:

1. **Homepage Check**
   - Open http://localhost:3005
   - Open browser console (F12) and check for any JavaScript errors
   - Look for any red errors in the console

2. **Navigate to Calculator**
   - Click on "Calculator" link or "Get Started" button
   - URL should change to http://localhost:3005/calculator

3. **Fill Calculator Form**

   ```
   Home Value: 400000
   Current Mortgage Balance: 250000
   Current Interest Rate: 6.5
   Years Remaining: 25
   Current Monthly Payment: 2100
   Monthly Income: 8000
   Monthly Expenses: 4000
   HELOC Interest Rate: 8.5
   HELOC Credit Limit: 50000
   ```

4. **Calculate Results**
   - Click "Calculate" button
   - Results should appear showing both Traditional Mortgage and HELOC Strategy

5. **Save Scenario**
   - Click "Save Scenario" button
   - Enter name: "Test Scenario"
   - Click Save/Confirm

6. **Check Scenarios List**
   - Navigate to "Scenarios" or "My Scenarios" page
   - Verify "Test Scenario" appears in the list

## What to Look For

### Console Errors (High Priority)

- JavaScript errors (red text in console)
- Failed network requests (404, 500 errors)
- CORS errors
- Missing dependencies

### UI Issues (Medium Priority)

- Forms not submitting
- Buttons not clickable
- Missing elements
- Layout broken
- Results not displaying

### Functional Issues (High Priority)

- Calculations not working
- Save functionality broken
- Navigation issues
- Data not persisting

## Viewing Test Results

After running the automated test:

1. **Screenshots**: Check `tests/e2e/screenshots/` folder
2. **Test Report**: View `tests/e2e/screenshots/test-report.json`
3. **Videos**: Check `test-results/` folder
4. **Trace Viewer**: Run `npx playwright show-trace`

## Common Issues and Solutions

### Port 3005 not accessible

- Make sure to run the app with: `PORT=3005 npm run dev`
- Or update the test to use your current port

### Playwright not installed

```bash
npm install -D @playwright/test
npx playwright install
```

### Test timeouts

- Increase timeouts in the test file
- Check if the app is running slowly
- Look for infinite loops or heavy computations

### Authentication issues

- The test assumes no authentication is required
- If auth is needed, update the test to log in first
