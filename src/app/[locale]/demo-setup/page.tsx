'use client';

import { useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/design-system/Button';
import { Card } from '@/components/design-system/Card';

export default function DemoSetupPage() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const checkUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/demo-users');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error checking users:', error);
      setStatus({ error: 'Failed to check users' });
    }
    setLoading(false);
  };

  const createUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/demo-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create' })
      });
      const data = await response.json();
      setStatus(data);
      
      // Refresh the user list
      setTimeout(checkUsers, 1000);
    } catch (error) {
      console.error('Error creating users:', error);
      setStatus({ error: 'Failed to create users' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Demo Account Setup</h1>
        
        <Card className="mb-8">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Demo Accounts</h2>
            <p className="text-gray-600 mb-4">
              The following demo accounts should be available:
            </p>
            <ul className="space-y-2 mb-6">
              <li className="font-mono text-sm">
                Email: demo@example.com | Password: demo123
              </li>
              <li className="font-mono text-sm">
                Email: john@example.com | Password: password123
              </li>
              <li className="font-mono text-sm">
                Email: jane@example.com | Password: password123
              </li>
            </ul>
            
            <div className="flex gap-4">
              <Button 
                onClick={checkUsers} 
                disabled={loading}
                variant="secondary"
              >
                Check Users
              </Button>
              <Button 
                onClick={createUsers} 
                disabled={loading}
              >
                Create/Update Users
              </Button>
              <Button 
                onClick={() => router.push('/handler/sign-in')}
                variant="outline"
              >
                Go to Login
              </Button>
            </div>
          </div>
        </Card>

        {status && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Status</h3>
              <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
                {JSON.stringify(status, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        <div className="mt-8 text-sm text-gray-600">
          <h3 className="font-semibold mb-2">Note:</h3>
          <p>
            If the passwords don&apos;t work, you may need to:
          </p>
          <ol className="list-decimal list-inside mt-2 space-y-1">
            <li>Use the Stack Auth dashboard to manually reset passwords</li>
            <li>Use the &quot;Forgot Password&quot; feature on the login page</li>
            <li>Delete and recreate the users in the Stack Auth dashboard</li>
          </ol>
        </div>
      </div>
    </div>
  );
}