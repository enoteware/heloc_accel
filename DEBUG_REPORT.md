# HELOC Accelerator Debug Report

## Executive Summary

✅ **Application Status**: Healthy  
❌ **API Issues**: User ID mismatch between Stack Auth and local database  
🎯 **Root Cause**: Stack Auth external user IDs don't match local PostgreSQL user UUIDs  
⚡ **Impact**: 500 errors on POST /api/scenario and GET /api/budgeting/scenarios  

## Environment Analysis

### ✅ Infrastructure Health
- **Development Server**: Running successfully on http://localhost:3001
- **Database Connection**: Connected to NEON PostgreSQL ✅
- **Stack Auth Configuration**: Properly configured ✅
- **Environment Variables**: All required variables set ✅

### ✅ Database Schema Status
- **users** table: ✅ (5 users)
- **scenarios** table: ✅ (1 scenario)  
- **budget_scenarios** table: ✅ (1 budget scenario)
- **income_scenarios** table: ✅ (2 income scenarios)
- **expense_scenarios** table: ✅ (2 expense scenarios)

### ✅ Authentication System
- **Stack Auth Integration**: Working correctly
- **API Protection**: Properly rejects unauthenticated requests with 401
- **JWT Tokens**: Stack Auth handling token management

## Root Cause Analysis

### 🔍 The Core Issue: User ID Mismatch

**Problem**: Stack Auth manages users externally with its own user IDs, but the local PostgreSQL database has completely different UUIDs for users.

**Example**:
```
Stack Auth User Login:
- user.id = "clx1y2z3a4b5c6d7e8f9" (Stack Auth format)

Local Database Query:
- SELECT * FROM scenarios WHERE user_id = "clx1y2z3a4b5c6d7e8f9"

Local Database Reality:
- user_id = "7190217b-d9a1-436e-b6a4-78025c25f76a" (PostgreSQL UUID)

Result: No match found → 500 errors
```

### 🚨 Affected API Endpoints

1. **POST /api/scenario**
   - Tries to INSERT with Stack Auth user.id
   - Fails because user.id doesn't exist in local users table
   - Error: "Failed to save scenario"

2. **GET /api/scenario**  
   - Tries to SELECT scenarios WHERE user_id = Stack Auth ID
   - Returns empty results (200 with no data)

3. **GET /api/budgeting/scenarios**
   - Joins budget_scenarios → scenarios → users with Stack Auth user.id  
   - Fails with "Failed to fetch budget scenarios"

4. **POST /api/budgeting/scenarios**
   - Same user ID mismatch issue

### 🔬 Technical Details

**Current API Flow**:
```typescript
// Stack Auth provides this user object:
const user = await stackServerApp.getUser({ tokenStore: request });
// user.id = "stack_auth_external_id"

// API tries to query database with this ID:
const result = await client.query(
  'SELECT * FROM scenarios WHERE user_id = $1',
  [user.id] // ← This ID doesn't exist in local database
);
```

**Local Database Users**:
```
admin@helocaccel.com    → 7190217b-d9a1-436e-b6a4-78025c25f76a
demo@example.com        → 05220763-c747-4dee-91eb-485b29763325
john@example.com        → 1a459be6-d9d4-4836-bf04-5f8b8d42122b
jane@example.com        → 97e8ecba-5dab-415f-ac51-27b06548740a
demo@helocaccelerator.com → c65660f9-6507-4f18-a151-6afb19bc072b
```

## Solutions & Recommendations

### 🎯 Recommended Solution: User Sync Middleware

**Approach**: Create a user synchronization layer that maps Stack Auth users to local database users.

#### Phase 1: Database Schema Update
```sql
-- Add Stack Auth ID column to users table
ALTER TABLE users ADD COLUMN stack_auth_id VARCHAR(255) UNIQUE;

-- Create index for performance
CREATE INDEX idx_users_stack_auth_id ON users(stack_auth_id);
```

#### Phase 2: User Sync Middleware
```typescript
// Create middleware that:
1. Gets Stack Auth user on API requests
2. Looks up local user by stack_auth_id
3. If not found, creates local user with Stack Auth details
4. Returns local user UUID for database operations
```

#### Phase 3: API Route Updates
```typescript
// Modify API routes to use local user UUID instead of Stack Auth ID
const localUser = await getOrCreateLocalUser(stackAuthUser);
const scenarios = await client.query(
  'SELECT * FROM scenarios WHERE user_id = $1',
  [localUser.id] // ← Now uses local UUID
);
```

### 🔧 Alternative Solutions

#### Option B: Direct Stack Auth Integration
- Remove local users table dependency
- Store Stack Auth user.id directly in scenarios.user_id
- Change user_id columns from UUID to VARCHAR
- **Pros**: Simpler architecture
- **Cons**: Loses local user profile capabilities

#### Option C: Hybrid Mapping Table  
- Create user_mappings table (stack_auth_id → local_user_id)
- Keep existing schema
- **Pros**: Clean separation of concerns
- **Cons**: Additional table complexity

## Implementation Plan

### 🚀 Quick Fix (1-2 hours)
1. Add `stack_auth_id` column to users table
2. Create user sync utility function
3. Update scenario API routes to use local user lookup
4. Test with authenticated user flow

### 🔍 Testing Requirements

**Manual Browser Testing Needed**:
1. Navigate to http://localhost:3001
2. Complete Stack Auth login flow
3. Access calculator page (/en/calculator)
4. Try to save a scenario (test POST /api/scenario)
5. Access budgeting page (/en/budgeting)  
6. Check for budget scenarios (test GET /api/budgeting/scenarios)
7. Monitor browser console and network tab for errors

**Expected Results After Fix**:
- ✅ Successful scenario creation
- ✅ Scenario list retrieval
- ✅ Budget scenario functionality
- ✅ No 500 errors in API calls

## Key Files to Modify

1. **Database Migration**: `database/migrations/002_add_stack_auth_sync.sql`
2. **User Sync Utility**: `src/lib/user-sync.ts`  
3. **API Routes**: Update all routes in `src/app/api/` to use user sync
4. **Auth Middleware**: Enhance `src/lib/api-auth.ts`

## Conclusion

The HELOC Accelerator application is architecturally sound with a working database, proper authentication, and complete schema. The 500 errors are caused by a straightforward user ID mismatch between Stack Auth (external) and local PostgreSQL UUIDs.

**Impact**: This affects all authenticated user operations but doesn't impact application security or data integrity.

**Resolution Time**: 1-2 hours with the recommended user sync middleware approach.

**Priority**: High - blocks core user functionality after authentication.

---

*Debug completed on 2025-08-17 using database connection testing, API endpoint analysis, and user ID mismatch identification.*