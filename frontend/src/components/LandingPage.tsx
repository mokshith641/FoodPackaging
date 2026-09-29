import React from 'react';
import { Package, LogIn, UserPlus } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister
}) => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 text-slate-900 animate-fadeIn">
      {/* Top Bar with Branding Only */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">PackSci AI</span>
            <p className="text-[11px] text-slate-500 hidden sm:block">
              AI-Based Intelligent Food Packaging Material Recommendation System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onNavigateToLogin}
            className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={onNavigateToRegister}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-xl w-full mx-auto my-auto text-center space-y-6">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-xs mb-2">
          <Package className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Welcome to PackSci AI
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-lg mx-auto">
            Find suitable packaging materials for your food products based on their properties and storage conditions.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 max-w-sm mx-auto">
          <button
            onClick={onNavigateToLogin}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs hover:shadow transition-all cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In</span>
          </button>

          <button
            onClick={onNavigateToRegister}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-300 shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-slate-600" />
            <span>Create Account</span>
          </button>
        </div>
      </main>

      {/* Minimal Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center text-[11px] text-slate-400 pt-6">
        <span>PackSci AI • Intelligent Food Packaging Material Recommendation System</span>
      </footer>
    </div>
  );
};
