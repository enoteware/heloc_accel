"use client";

import { useState, useEffect } from "react";
import { useUser } from "@stackframe/stack";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/design-system/Card";
import { Button } from "@/components/design-system/Button";

export default function AuthTestPage() {
  const user = useUser();
  const [testResults, setTestResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runAuthTest = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/debug/auth-test");
      const data = await response.json();
      setTestResults(data);
    } catch (error) {
      setTestResults({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const testApiCall = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/budgeting/scenarios");
      const data = await response.json();
      setTestResults({
        ...testResults,
        apiTest: {
          status: response.status,
          success: response.ok,
          data: response.ok ? data : null,
          error: !response.ok ? data : null,
        },
      });
    } catch (error) {
      setTestResults({
        ...testResults,
        apiTest: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Auto-run test on page load
    runAuthTest();
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Debug Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Button onClick={runAuthTest} disabled={loading}>
              {loading ? "Testing..." : "Run Auth Test"}
            </Button>
            <Button onClick={testApiCall} disabled={loading || !user}>
              Test API Call
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client-Side User</CardTitle>
              </CardHeader>
              <CardContent>
                {user ? (
                  <div className="space-y-2">
                    <p>
                      <strong>ID:</strong> {user.id}
                    </p>
                    <p>
                      <strong>Email:</strong> {user.primaryEmail}
                    </p>
                    <p>
                      <strong>Display Name:</strong> {user.displayName || "N/A"}
                    </p>
                    <p className="text-green-600">✅ User authenticated</p>
                  </div>
                ) : (
                  <p className="text-red-600">❌ No user found</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Server-Side Test</CardTitle>
              </CardHeader>
              <CardContent>
                {testResults ? (
                  <div className="space-y-2">
                    <p>
                      <strong>Success:</strong>{" "}
                      {testResults.success ? "✅" : "❌"}
                    </p>
                    {testResults.stackAuth?.user ? (
                      <div>
                        <p>
                          <strong>Server User:</strong> ✅
                        </p>
                        <p>
                          <strong>Email:</strong>{" "}
                          {testResults.stackAuth.user.email}
                        </p>
                      </div>
                    ) : (
                      <p>
                        <strong>Server User:</strong> ❌ Not found
                      </p>
                    )}
                    {testResults.stackAuth?.error && (
                      <p className="text-red-600">
                        <strong>Error:</strong> {testResults.stackAuth.error}
                      </p>
                    )}
                  </div>
                ) : (
                  <p>
                    Click "Run Auth Test" to check server-side authentication
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {testResults && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detailed Results</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-96">
                  {JSON.stringify(testResults, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
