# Debug Tools Documentation

This document describes the debug tools available in the HELOC Accelerator application to help troubleshoot authentication and other issues.

## Overview

We've implemented a comprehensive debugging system with the following components:

1. **Debug Logger** (`/src/lib/debug-logger.ts`)
2. **Debug Log Viewer** (`/src/components/DebugLogViewer.tsx`)
3. **Debug Panel** (`/src/components/DebugPanel.tsx`)
4. **API Client with Logging** (`/src/lib/api-client.ts`)
5. **Network Interceptor** (`/src/lib/network-interceptor.ts`)
6. **Debug API Endpoints**
7. **Test Page** (`/src/app/[locale]/debug-test/page.tsx`)

## Debug Tools

### 1. Debug Log Viewer
- **Location**: Bottom right corner button (📋 Debug Logs)
- **Features**:
  - View all application logs
  - Filter by level (info, warn, error, debug)
  - Filter by category
  - Auto-refresh
  - Export logs to JSON
  - Clear logs

### 2. Debug Panel
- **Location**: Bottom right corner button (🔧 Debug)
- **Features**:
  - **Auth Tab**: Shows authentication status, cookies, and environment
  - **System Tab**: Shows system info, database status, and log summary
  - **User Tab**: Shows current user details from client-side

### 3. Debug API Endpoints

#### `/api/debug/auth`
- Shows detailed authentication information
- Includes cookies, headers, and Stack Auth status
- Example: `curl http://localhost:3001/api/debug/auth`

#### `/api/debug/status`
- Shows system status including:
  - Node.js version and memory usage
  - Database connection status
  - Log statistics
- Example: `curl http://localhost:3001/api/debug/status`

#### `/api/test/stack-auth`
- Comprehensive Stack Auth integration test
- Tests configuration, authentication, and database access
- Example: `curl http://localhost:3001/api/test/stack-auth`

### 4. Network Interceptor
- Automatically logs all fetch requests
- Captures request/response details
- Includes timing information
- Integrated with debug logger

### 5. API Client
- Wrapper around fetch with automatic logging
- Use `apiClient` or `api` exports from `/src/lib/api-client.ts`
- Example:
  ```typescript
  import { api } from '@/lib/api-client'
  
  const data = await api.get('/api/scenarios')
  const result = await api.post('/api/scenarios', { inputs, results })
  ```

## How to Use

### 1. Access Debug Test Page
Navigate to: `http://localhost:3001/en/debug-test`

This page provides:
- Current user information
- Buttons to run individual tests
- Test results display
- Access to all debug tools

### 2. Enable Debug Tools on Any Page
The debug tools are available on:
- Calculator page (`/calculator`)
- Dashboard page (`/dashboard`)
- Debug test page (`/debug-test`)

### 3. Debugging Authentication Issues

1. Open the Debug Panel (purple button)
2. Check the Auth tab for:
   - Authentication status
   - Stack Auth cookies
   - Environment variables
3. Check the Debug Log Viewer for any error messages
4. Run the Stack Auth test from the debug test page

### 4. Debugging API Issues

1. Open the Debug Log Viewer
2. Filter by category "API:Client" or "API:Scenarios"
3. Look for request/response details
4. Check status codes and error messages

### 5. Exporting Debug Data

1. Open Debug Log Viewer
2. Click "Export" button
3. Save the JSON file for analysis

## Common Issues and Solutions

### Authentication Not Working
1. Check Debug Panel > Auth tab
2. Verify Stack Auth cookies are present
3. Check environment variables are set correctly
4. Run Stack Auth test for detailed diagnostics

### Scenarios Not Loading
1. Check Debug Log Viewer for API errors
2. Verify authentication status
3. Check database connection in System tab
4. Look for SQL errors in logs

### Save Scenario Failing
1. Enable Debug Log Viewer
2. Try saving a scenario
3. Check for validation errors
4. Verify API endpoint responses

## Development Tips

### Adding Debug Logs
```typescript
import { logInfo, logError, logDebug } from '@/lib/debug-logger'

// Info log
logInfo('CategoryName', 'Operation started', { data })

// Error log
logError('CategoryName', 'Operation failed', error)

// Debug log (more verbose)
logDebug('CategoryName', 'Detailed info', { complexData })
```

### Categories to Use
- `Dashboard`: Dashboard operations
- `Calculator`: Calculator operations
- `SaveScenario`: Scenario saving
- `API:Scenarios`: Scenarios API
- `API:Client`: API client operations
- `Auth`: Authentication operations
- `Network`: Network requests

## Production Considerations

The debug tools are designed to be development-only features. In production:
1. Debug Panel is only visible with specific flag
2. Debug endpoints should be disabled
3. Logging can be configured for different levels
4. Sensitive data is sanitized in logs