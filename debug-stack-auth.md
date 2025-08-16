# Stack Auth Debug Summary

## Current Status

- Stack Auth is properly integrated and the sign-in page loads correctly
- We have 3 demo users created: demo@example.com, john@example.com, jane@example.com
- Login attempts fail with "Wrong e-mail or password" error

## Possible Issues

1. **Password Hashing**: Stack Auth might be using a different password hashing method when creating users via API
2. **Configuration**: There might be a missing configuration in the Stack Auth setup
3. **API Limitation**: The createUser API might not properly set passwords in certain conditions

## Solutions to Try

### Option 1: Use Stack Auth Dashboard

1. Go to your Stack Auth dashboard
2. Manually reset the password for demo@example.com to "demo123"
3. Test login

### Option 2: Use Forgot Password Flow

1. On the login page, click "Forgot password?"
2. Enter demo@example.com
3. Check your Stack Auth dashboard for the reset link or email configuration

### Option 3: Create Account via UI

1. Use the sign-up form to create a new account
2. This will ensure the password is set correctly through Stack Auth's standard flow

### Option 4: Check Stack Auth Environment Variables

Make sure these are set in your .env.local:

- STACK_PROJECT_ID
- STACK_SECRET_SERVER_KEY
- Any other Stack Auth required variables

## Test Credentials

- Email: demo@example.com
- Password: demo123

## Navigation URLs (Fixed)

- Sign In: http://localhost:3001/en/handler/sign-in
- Sign Up: http://localhost:3001/en/handler/sign-up
- Sign Out: http://localhost:3001/en/sign-out
