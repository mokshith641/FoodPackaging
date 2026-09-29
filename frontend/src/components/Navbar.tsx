import React from 'react';
import {
  Sparkles,
  LayoutDashboard,
  FlaskConical,
  Scale,
  Apple,
  Layers,
  History,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SystemHealth } from '../types/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: SystemHealth | null;
  onNewRecommendationClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  health,
  onNewRecommendationClick
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'wizard', label: 'New Recommendation', icon: FlaskConical },
    { id: 'comparison', label: 'Compare Materials', icon: Scale },
    { id: 'commodities', label: 'Food Commodities', icon: Apple },
    { id: 'materials', label: 'Packaging Database', icon: Layers },
    { id: 'history', label: 'History', icon: History },
    { id: 'sources', label: 'Sources & Health', icon: Database },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Project Title */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <FlaskConical className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
                  PackSci AI
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  v1.0 MVP
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Intelligent Food Packaging Material Recommendation System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Health Indicators */}
          <div className="flex items-center gap-3">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
              <span className="flex h-2 w-2 relative">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    health?.status === 'online' ? 'bg-emerald-400' : 'bg-amber-400'
                  }`}
                ></span>
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    health?.status === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                ></span>
              </span>
              <span className="text-[11px] font-mono text-slate-300">
                {health?.database?.status === 'healthy' ? 'PostgreSQL Active' : 'System Ready'}
              </span>
              {health?.ai_service?.groq_configured ? (
                <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/50">
                  <Sparkles className="w-2.5 h-2.5" /> Groq AI
                </span>
              ) : (
                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                  Rules Engine
                </span>
              )}
            </div>

            <button
              onClick={onNewRecommendationClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all hover:scale-102 cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Evaluate Packaging</span>
            </button>
          </div>
        </div>

        {/* Mobile Submenu Navigation */}
        <div className="flex lg:hidden overflow-x-auto py-2 gap-1 border-t border-slate-800/60 no-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs whitespace-nowrap font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
