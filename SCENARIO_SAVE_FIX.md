# Scenario Save Fix Summary

## Issues Fixed:

1. **Wrong API Endpoint** ✅
   - Changed from `/api/scenario` to `/api/scenarios`
   - The `/api/scenario` endpoint was still in demo mode

2. **Missing Authentication** ✅
   - Added `credentials: 'include'` to the fetch request
   - Updated POST endpoint to use `{ tokenStore: request }` for Stack Auth

3. **Wrong Payload Format** ✅
   - Changed from flat structure to `{ inputs: {...}, results: {...} }`
   - Added `scenarioName` and `description` to the inputs object

4. **Redirect Path** ✅
   - Changed redirect from `/dashboard` to `/en/dashboard` for localization

## How Scenario Saving Now Works:

1. User fills out calculator form and clicks "Calculate"
2. User clicks "Save Scenario" button
3. Modal opens for scenario name and description
4. On save, the calculator sends a POST request to `/api/scenarios` with:
   ```json
   {
     "inputs": {
       ...formData,
       "scenarioName": "User's scenario name",
       "description": "Optional description"
     },
     "results": calculationResults
   }
   ```
5. API validates the user is authenticated via Stack Auth
6. API inserts the scenario into the database
7. User is redirected to `/en/dashboard` to see their saved scenarios

## Testing Steps:

1. Go to Calculator: http://localhost:3000/en/calculator
2. Fill out the form with your mortgage details
3. Click "Calculate"
4. Click "Save Scenario"
5. Enter a name and description
6. Click "Save"
7. You should be redirected to the dashboard
8. The scenario should appear in your scenarios list

## Debug Info:

Check browser console for detailed logs:
- Modal validation
- API payload
- Response status
- Any errors

The save operation now properly authenticates and saves to the database!