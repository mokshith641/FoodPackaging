import React, { useState } from 'react';
import {
  PackageCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types/api';

interface LoginPageProps {
  onSuccess: (user: User) => void;
  onNavigateToRegister: () => void;
  onNavigateToHome: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToHome
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.login({
        email: trimmedEmail,
        password
      });
      onSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 text-[#202B38] animate-govFadeIn">
      {/* Top navigation */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <button
          onClick={onNavigateToHome}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245A81] hover:text-[#17365D] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#17365D] flex items-center justify-center text-white shadow-xs">
            <PackageCheck className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <span className="font-bold text-xs text-[#17365D]">PackSci AI</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="gov-card p-6 sm:p-8 bg-white border border-[#D8E1EA]">
          <div className="border-b border-[#D8E1EA] pb-4 mb-5 text-center">
            <h1 className="text-xl font-bold text-[#17365D] tracking-tight">Sign In to Portal</h1>
            <p className="text-xs text-[#5E6B78] mt-1">
              Enter your credentials to access the packaging recommendation system
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Email Address <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5E6B78]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.com"
                  autoComplete="email"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8E1EA] rounded-md text-xs text-[#202B38] placeholder:text-slate-400 focus:outline-none focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5E6B78]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  className="w-full pl-9 pr-9 py-2 bg-white border border-[#D8E1EA] rounded-md text-xs text-[#202B38] placeholder:text-slate-400 focus:outline-none focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6B78] hover:text-[#202B38] cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 bg-[#16834A] hover:bg-[#136f3e] disabled:opacity-60 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#D8E1EA] text-center">
            <p className="text-xs text-[#5E6B78]">
              New user?{' '}
              <button
                type="button"
                onClick={onNavigateToRegister}
                className="font-semibold text-[#245A81] hover:text-[#17365D] hover:underline cursor-pointer"
              >
                Create an Account
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Public Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-[#5E6B78] pt-4">
        <span>PackSci AI • Secure Technical Service Authentication</span>
      </footer>
    </div>
  );
};
