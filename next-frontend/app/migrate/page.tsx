'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';

export default function MigratePage() {
  const [adminPassword, setAdminPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMigration = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/auth/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminPassword }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Migration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Member Authentication Migration</h1>
          <p className="text-gray-600 mt-2">
            Migrate legacy members.json to the new authentication system
          </p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🚀 Migration Process</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ Create email addresses for all members (name@myband.local format)</p>
            <p>✅ Generate temporary passwords for each member</p>
            <p>✅ Set up role-based authentication system</p>
            <p>✅ Force password change on first login</p>
            <p>✅ Preserve existing availability data</p>
          </div>
        </Card>

        {!result && (
          <Card className="p-6">
            <form onSubmit={handleMigration} className="space-y-4">
              <div>
                <label htmlFor="adminPassword" className="block text-sm font-medium mb-1">
                  Admin Password
                </label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="Enter admin password"
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Default: admin123 (set ADMIN_PASSWORD in environment variables)
                </p>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Migrating...' : 'Start Migration'}
              </Button>
            </form>
          </Card>
        )}

        {error && (
          <Card className="p-6 mt-6 border-red-200 bg-red-50">
            <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Migration Failed</h3>
            <p className="text-red-700">{error}</p>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="p-6 border-green-200 bg-green-50">
              <h3 className="text-lg font-semibold text-green-800 mb-2">✅ Migration Successful!</h3>
              <div className="text-green-700 space-y-1">
                <p>{result.message}</p>
                <p>Total members migrated: {result.summary.totalMembers}</p>
                <p>Passwords generated: {result.summary.passwordsGenerated}</p>
              </div>
            </Card>

            {result.passwords && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">🔑 Generated Passwords</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Share these passwords with your members. They will be required to change them on first login.
                </p>
                
                <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                  <div className="space-y-2 text-sm font-mono">
                    {result.passwords.map((member: any, index: number) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-white rounded border">
                        <div>
                          <span className="font-semibold">{member.name}</span>
                          <br />
                          <span className="text-gray-500">{member.email}</span>
                        </div>
                        <div className="text-blue-600 font-bold">
                          {member.password}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="text-sm text-yellow-800">
                    <strong>Important:</strong> These passwords are also saved in <code>data/initial-passwords.json</code> for your records.
                    Make sure to secure this file and delete it after distribution.
                  </p>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">📝 Next Steps</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <div>
                    <strong>Distribute passwords:</strong> Share the login credentials with each member via secure channels
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <div>
                    <strong>Test login system:</strong> Go to <a href="/login" className="text-blue-600 underline">/login</a> to test member authentication
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <div>
                    <strong>Update your app:</strong> Integrate the new authentication system into your main pages
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <div>
                    <strong>Secure files:</strong> Move or delete the password files after distribution
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
