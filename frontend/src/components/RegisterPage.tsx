import React, { useState } from 'react';
import {
  PackageCheck,
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { User } from '../types/api';

interface RegisterPageProps {
  onSuccess: (user: User) => void;
  onNavigateToLogin: () => void;
  onNavigateToHome: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({
  onSuccess,
  onNavigateToLogin,
  onNavigateToHome
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/\d/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strength = getPasswordStrength(password);

  const getStrengthLabel = (s: number) => {
    switch (s) {
      case 0:
      case 1:
        return { label: 'Weak', color: 'bg-red-500', text: 'text-red-600' };
      case 2:
        return { label: 'Fair', color: 'bg-amber-500', text: 'text-amber-600' };
      case 3:
        return { label: 'Good', color: 'bg-[#245A81]', text: 'text-[#245A81]' };
      case 4:
        return { label: 'Strong', color: 'bg-[#16834A]', text: 'text-[#16834A]' };
      default:
        return { label: 'Weak', color: 'bg-slate-300', text: 'text-slate-400' };
    }
  };

  const validateEmail = (val: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!validateEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.register({
        name: trimmedName,
        email: trimmedEmail,
        password,
        confirm_password: confirmPassword
      });
      onSuccess(response.user);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your information and try again.');
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

      {/* Main Register Card */}
      <div className="max-w-md w-full mx-auto my-auto">
        <div className="gov-card p-6 sm:p-8 bg-white border border-[#D8E1EA]">
          <div className="border-b border-[#D8E1EA] pb-4 mb-5 text-center">
            <h1 className="text-xl font-bold text-[#17365D] tracking-tight">Create User Account</h1>
            <p className="text-xs text-[#5E6B78] mt-1">
              Register for academic or enterprise food packaging decision tools
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Full Name <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5E6B78]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Rajesh Kumar"
                  autoComplete="name"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-white border border-[#D8E1EA] rounded-md text-xs text-[#202B38] placeholder:text-slate-400 focus:outline-none focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
              </div>
            </div>

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
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
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

              {/* Password strength bar */}
              {password.length > 0 && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-[#5E6B78]">Strength:</span>
                    <span className={`font-semibold ${getStrengthLabel(strength).text}`}>
                      {getStrengthLabel(strength).label}
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`h-full flex-1 transition-all duration-200 ${
                          strength >= step ? getStrengthLabel(strength).color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Confirm Password <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#5E6B78]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required
                  className={`w-full pl-9 pr-9 py-2 bg-white border rounded-md text-xs text-[#202B38] placeholder:text-slate-400 focus:outline-none transition-all ${
                    confirmPassword && confirmPassword !== password
                      ? 'border-red-300 focus:border-red-500'
                      : confirmPassword && confirmPassword === password
                      ? 'border-[#16834A] focus:border-[#16834A]'
                      : 'border-[#D8E1EA] focus:border-[#245A81]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6B78] hover:text-[#202B38] cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {confirmPassword.length > 0 && confirmPassword === password && (
                <div className="mt-1 flex items-center gap-1 text-[11px] text-[#16834A] font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Passwords match</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-2 px-4 bg-[#16834A] hover:bg-[#136f3e] disabled:opacity-60 text-white text-xs font-bold rounded-md shadow-xs transition-colors cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-[#D8E1EA] text-center">
            <p className="text-xs text-[#5E6B78]">
              Already registered?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-semibold text-[#245A81] hover:text-[#17365D] hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Public Footer */}
      <footer className="max-w-md w-full mx-auto text-center text-[11px] text-[#5E6B78] pt-4">
        <span>PackSci AI • Secure Academic Research Portal</span>
      </footer>
    </div>
  );
};
