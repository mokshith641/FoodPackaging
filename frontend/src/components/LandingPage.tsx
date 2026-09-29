import React from 'react';
import {
  PackageCheck,
  LogIn,
  UserPlus,
  ShieldCheck,
  FlaskConical,
  Layers,
  ArrowRight,
  Database
} from 'lucide-react';

interface LandingPageProps {
  onNavigateToLogin: () => void;
  onNavigateToRegister: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateToLogin,
  onNavigateToRegister
}) => {
  return (
    <div className="min-h-screen bg-[#F4F7FA] flex flex-col justify-between text-[#202B38] animate-govFadeIn">
      {/* Top Banner & Header */}
      <div>
        {/* Subtle Top Identification Strip */}
        <div className="bg-[#17365D] text-white text-[11px] py-1.5 px-4 sm:px-6 border-b border-[#0f243f]">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="font-medium tracking-wide">
              Scientific Decision-Support Portal • Final-Year Engineering Research Project
            </span>
            <span className="hidden sm:inline text-slate-300">
              ASTM / USDA / UC Davis Reference Data
            </span>
          </div>
        </div>

        {/* Clean Public Header */}
        <header className="bg-white border-b border-[#D8E1EA] py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#17365D] flex items-center justify-center text-white shadow-xs">
                <PackageCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-[#17365D] tracking-tight">PackSci AI</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-100 text-[#245A81] border border-[#D8E1EA]">
                    v2.4
                  </span>
                </div>
                <p className="text-[11px] text-[#5E6B78] font-normal leading-tight hidden sm:block">
                  Intelligent Food Packaging Recommendation System
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onNavigateToLogin}
                className="px-3.5 py-2 rounded-md text-xs font-semibold text-[#17365D] hover:bg-[#F4F7FA] border border-transparent hover:border-[#D8E1EA] transition-colors cursor-pointer"
              >
                Sign In
              </button>
              <button
                onClick={onNavigateToRegister}
                className="px-4 py-2 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Create Account
              </button>
            </div>
          </div>
        </header>
      </div>

      {/* Hero Body */}
      <main className="max-w-4xl w-full mx-auto px-4 sm:px-6 py-10 my-auto text-center">
        {/* Subtle Technical Graphic Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#D8E1EA] text-[#245A81] text-xs font-medium shadow-xs mb-6">
          <FlaskConical className="w-3.5 h-3.5 text-[#16834A]" />
          <span>AI-Based Food Commodity Packaging Intelligence</span>
        </div>

        {/* Primary Headings */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#17365D] tracking-tight leading-snug">
          Find the right packaging for every food.
        </h1>

        <p className="text-sm sm:text-base text-[#5E6B78] max-w-2xl mx-auto mt-3 leading-relaxed">
          An intelligent decision portal for farmers, food businesses, and packaging engineers to evaluate barrier properties, shelf-life kinetics, and sustainable packaging materials.
        </p>

        {/* Technical Feature Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 pt-6 max-w-xl mx-auto text-xs text-[#202B38]">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D8E1EA] rounded-md shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-[#16834A]" />
            <span>ASTM Barrier Modeling (OTR/WVTR)</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D8E1EA] rounded-md shadow-xs">
            <Layers className="w-3.5 h-3.5 text-[#245A81]" />
            <span>Produce Respiration & EMAP</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#D8E1EA] rounded-md shadow-xs">
            <Database className="w-3.5 h-3.5 text-[#17365D]" />
            <span>Qdrant Vector Science Base</span>
          </div>
        </div>

        {/* Public CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-8 max-w-xs sm:max-w-sm mx-auto">
          <button
            onClick={onNavigateToLogin}
            className="w-full sm:w-auto flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Portal</span>
            <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
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

      {/* Public Technical Footer */}
      <footer className="bg-white border-t border-[#D8E1EA] py-4 text-center text-xs text-[#5E6B78]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#17365D]">PackSci AI</span>
            <span>•</span>
            <span>AI-Based Intelligent Food Packaging Material Recommendation System for Food Commodities</span>
          </div>
          <div className="text-slate-400">
            Academic Research Project • USDA / UC Davis / ASTM Standards
          </div>
        </div>
      </footer>
    </div>
  );
};
