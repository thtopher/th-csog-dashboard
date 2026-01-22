'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Microsoft logo SVG component
function MicrosoftLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 0H0V11H11V0Z" fill="#F25022"/>
      <path d="M23 0H12V11H23V0Z" fill="#7FBA00"/>
      <path d="M11 12H0V23H11V12Z" fill="#00A4EF"/>
      <path d="M23 12H12V23H23V12Z" fill="#FFB900"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);

  const { login, loginWithMicrosoft, isAuthenticated, isLoading, isDemoMode } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email, password);

    if (result.success) {
      router.push('/');
    } else {
      setError(result.error || 'Login failed');
      setIsSubmitting(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setIsMicrosoftLoading(true);
    try {
      await loginWithMicrosoft();
    } catch {
      setError('Microsoft login failed. Please try again.');
      setIsMicrosoftLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('demo@thirdhorizon.com');
    setPassword('demo');
    setError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-block mb-6">
              <Image
                src="/logo.png"
                alt="Third Horizon Logo"
                width={64}
                height={64}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Third Horizon</h1>
            <p className="text-gray-500 mt-1">CSOG Dashboard</p>
          </div>

          {/* Login Form */}
          <div className="bg-white rounded-xl shadow-sm border p-8">
            {/* Microsoft SSO Button - Primary option when not in demo mode */}
            {!isDemoMode && (
              <>
                <button
                  type="button"
                  onClick={handleMicrosoftLogin}
                  disabled={isMicrosoftLoading}
                  className={cn(
                    'w-full flex items-center justify-center gap-3 rounded-lg border-2 border-gray-200 px-4 py-3 text-sm font-medium text-gray-700',
                    'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  {isMicrosoftLoading ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <MicrosoftLogo className="h-5 w-5" />
                  )}
                  Sign in with Microsoft
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-gray-500">or continue with email</span>
                  </div>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@thirdhorizon.com"
                  required
                  autoComplete="email"
                  className={cn(
                    'w-full rounded-lg border px-4 py-2.5 text-gray-900 placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent',
                    'transition-shadow',
                    error && 'border-red-300'
                  )}
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    className={cn(
                      'w-full rounded-lg border px-4 py-2.5 pr-11 text-gray-900 placeholder:text-gray-400',
                      'focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent',
                      'transition-shadow',
                      error && 'border-red-300'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'w-full rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white',
                  'hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2',
                  'transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {isSubmitting ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    Signing in...
                  </span>
                ) : (
                  'Sign in'
                )}
              </button>
            </form>

            {/* Demo Mode Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Demo access</span>
              </div>
            </div>

            {/* Demo Credentials */}
            <button
              type="button"
              onClick={fillDemoCredentials}
              className={cn(
                'w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700',
                'hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200',
                'transition-colors'
              )}
            >
              Use demo credentials
            </button>

            {/* Demo Hint */}
            <p className="mt-4 text-center text-xs text-gray-400">
              Hint: any email above with password &quot;demo&quot;
            </p>
          </div>

          {/* Demo Users - All Executives */}
          <div className="mt-6 rounded-lg bg-gray-100 p-4">
            <p className="text-xs font-medium text-gray-500 mb-3">Executive Accounts (password: demo)</p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => { setEmail('david@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">David Smith</span>
                <span className="text-gray-500 block">CEO</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('greg@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">Greg Williams</span>
                <span className="text-gray-500 block">President</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('jordana@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">Jordana Choucair</span>
                <span className="text-gray-500 block">COO</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('aisha@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">Aisha Waheed</span>
                <span className="text-gray-500 block">CFO</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('chris@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">Chris Hart</span>
                <span className="text-gray-500 block">CDAO</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('cheryl@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">Cheryl Matochik</span>
                <span className="text-gray-500 block">CGO</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('ashley@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">Ashley DeGarmo</span>
                <span className="text-gray-500 block">CSO</span>
              </button>
              <button
                type="button"
                onClick={() => { setEmail('topher@thirdhorizon.com'); setPassword('demo'); setError(''); }}
                className="text-left px-2 py-1.5 rounded hover:bg-gray-200 transition-colors"
              >
                <span className="font-medium text-gray-900">Topher Rasmussen</span>
                <span className="text-gray-500 block">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-sm text-gray-400">
        Third Horizon Strategies
      </footer>
    </div>
  );
}
