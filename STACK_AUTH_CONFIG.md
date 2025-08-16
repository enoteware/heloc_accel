# Stack Auth Configuration

## OAuth Providers Disabled

This project is configured to use **credential-based authentication only** (email/password). OAuth providers (Google, GitHub, etc.) are intentionally hidden from the UI.

### Configuration Details

#### 1. Components Used

- **CredentialSignIn**: Email/password sign-in only
- **CredentialSignUp**: Email/password sign-up only
- **No OAuth components**: OAuthButton, OAuthButtonGroup are not used

#### 2. Handler Configuration

```typescript
// src/app/[locale]/handler/[...stack]/page.tsx
<StackHandler
  fullPage
  app={stackServerApp}
  routeProps={props}
  componentProps={{
    SignIn: {
      firstTab: 'password'  // Forces password tab as default
    },
    SignUp: {
      firstTab: 'password'  // Forces password tab as default
    }
  }}
/>
```

#### 3. Stack Server App Configuration

```typescript
// src/stack.ts
export const stackServerApp = new StackServerApp({
  tokenStore: "nextjs-cookie",
  urls: {
    signIn: "/handler/sign-in",
    signUp: "/handler/sign-up",
    afterSignIn: "/dashboard",
    afterSignUp: "/dashboard",
  },
});
```

### Available Authentication URLs

- **Sign In**: `/en/handler/sign-in` or `/es/handler/sign-in`
- **Sign Up**: `/en/handler/sign-up` or `/es/handler/sign-up`
- **Test Page**: `/en/stack-auth-test` or `/es/stack-auth-test`

### Environment Variables

```bash
# Stack Auth Configuration
NEXT_PUBLIC_STACK_PROJECT_ID=c2703617-7657-42f1-a605-bfd458957b9b
NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY=pck_h96hra61jtpv8wvft4hhps813ea8tq1vm1q0mwtjd7xx0
STACK_SECRET_SERVER_KEY=ssk_387hy9annqv6tv2kqyehjjm0cw0nhkcmkqfdtv4ty3yvg
```

### To Enable OAuth (Future)

If you want to enable OAuth providers in the future:

1. **Enable providers in Stack Auth Dashboard**
2. **Update components** to use `SignIn` and `SignUp` instead of `CredentialSignIn`/`CredentialSignUp`
3. **Remove `firstTab: 'password'`** from handler configuration
4. **Add OAuth buttons** using `OAuthButton` or `OAuthButtonGroup` components

### Security Notes

- All authentication is handled server-side by Stack Auth
- JWT tokens are stored in secure HTTP-only cookies
- NEON PostgreSQL database integration for user data
- SSL/TLS encryption for all authentication flows
