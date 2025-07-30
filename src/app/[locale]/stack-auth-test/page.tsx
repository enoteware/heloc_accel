'use client';

import { useUser, CredentialSignIn, CredentialSignUp, UserButton } from '@stackframe/stack';

export default function StackAuthTestPage() {
  const user = useUser();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Stack Auth Integration Test</h1>
      
      <div className="space-y-8">
        {user ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-green-800 mb-4">
              ✅ User Authenticated
            </h2>
            <div className="space-y-2">
              <p><strong>User ID:</strong> {user.id}</p>
              <p><strong>Display Name:</strong> {user.displayName || 'Not set'}</p>
              <p><strong>Email:</strong> {user.primaryEmail || 'Not set'}</p>
            </div>
            <div className="mt-4">
              <UserButton />
            </div>
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">
              🔐 Authentication Required
            </h2>
            <p className="mb-4">Please sign in to test Stack Auth integration:</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold mb-2">Sign In (Email/Password Only)</h3>
                <CredentialSignIn />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Sign Up (Email/Password Only)</h3>
                <CredentialSignUp />
              </div>
            </div>
          </div>
        )}
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Stack Auth Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Project ID:</strong> {process.env.NEXT_PUBLIC_STACK_PROJECT_ID}</p>
            <p><strong>Handler URL:</strong> /handler/sign-in</p>
            <p><strong>JWKS URL:</strong> https://api.stack-auth.com/api/v1/projects/{process.env.NEXT_PUBLIC_STACK_PROJECT_ID}/.well-known/jwks.json</p>
          </div>
        </div>
      </div>
    </div>
  );
}
