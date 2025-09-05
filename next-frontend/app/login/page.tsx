'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MemberLogin from '@/components/member-login';
import ChangePassword from '@/components/change-password';
import { UserContext } from '@/lib/types';

export default function LoginPage() {
  const [user, setUser] = useState<UserContext | null>(null);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = (userContext: UserContext) => {
    setUser(userContext);
    setError(null);
    
    if (userContext.mustChangePassword) {
      setShowPasswordChange(true);
      setMessage('Please change your password to continue');
    } else {
      setMessage('Login successful! Redirecting...');
      // Redirect to main app after a short delay
      setTimeout(() => {
        router.push('/availability');
      }, 1500);
    }
  };

  const handlePasswordChangeSuccess = () => {
    setShowPasswordChange(false);
    setMessage('Password updated successfully! Redirecting...');
    // Redirect to main app after a short delay
    setTimeout(() => {
      router.push('/availability');
    }, 1500);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setMessage(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {message && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-center">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-800 text-center">
            {error}
          </div>
        )}

        {!showPasswordChange ? (
          <MemberLogin onLogin={handleLogin} onError={handleError} />
        ) : (
          user && (
            <ChangePassword
              email={user.email}
              isFirstTime={user.mustChangePassword}
              onSuccess={handlePasswordChangeSuccess}
              onError={handleError}
            />
          )
        )}

        <div className="mt-6 text-center">
          <a 
            href="/availability" 
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Continue as guest (view-only)
          </a>
        </div>
      </div>
    </div>
  );
}
