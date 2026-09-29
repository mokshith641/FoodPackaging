import React from 'react';
import { PackageCheck, ArrowRight, UserPlus } from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister
}) => {
  return (
    <div className="min-h-screen bg-white flex flex-col justify-between text-[#202B38] animate-govFadeIn">
      {/* Clean Public Header */}
      <header className="bg-white border-b border-[#D8E1EA] py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#17365D] flex items-center justify-center text-white shadow-xs">
              <PackageCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="font-bold text-base text-[#17365D] tracking-tight">PackSci AI</span>
              <p className="text-[11px] text-[#5E6B78] font-normal leading-tight hidden sm:block">
                Intelligent Food Packaging Recommendation System
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onNavigateToLogin}
              className="px-3.5 py-1.5 rounded-md text-xs font-semibold text-[#17365D] hover:bg-[#F4F7FA] border border-transparent hover:border-[#D8E1EA] transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={onNavigateToRegister}
              className="px-4 py-1.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Create Account
            </button>
          </div>
        </div>
      </header>

      {/* Centered Hero Section */}
      <main className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-12 my-auto text-center space-y-6">
        {/* Tasteful Packaging/Science Icon */}
        <div className="w-14 h-14 mx-auto rounded-xl bg-[#F4F7FA] border border-[#D8E1EA] flex items-center justify-center text-[#17365D] shadow-xs">
          <PackageCheck className="w-7 h-7 text-[#16834A]" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#17365D] tracking-tight leading-tight">
          Find the right packaging for every food.
        </h1>

        {/* Supporting Text */}
        <p className="text-sm sm:text-base text-[#5E6B78] max-w-2xl mx-auto leading-relaxed">
          Get suitable food packaging recommendations based on food properties, storage conditions, shelf-life requirements, cost, and sustainability.
        </p>

        {/* Primary and Secondary Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-xs sm:max-w-sm mx-auto">
          <button
            onClick={onNavigateToLogin}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onNavigateToRegister}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-white hover:bg-[#F4F7FA] text-[#17365D] font-semibold text-xs border border-[#D8E1EA] shadow-xs transition-colors cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-[#245A81]" />
            <span>Create Account</span>
          </button>
        </div>
      </main>

      {/* Slim Clean Footer */}
      <footer className="bg-white border-t border-[#D8E1EA] py-4 text-xs text-[#5E6B78]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-[#17365D]">PackSci AI</span>
          <span className="text-[#5E6B78]">AI-Based Intelligent Food Packaging Material Recommendation System</span>
        </div>
      </footer>
    </div>
  );
};
