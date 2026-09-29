import React, { useState } from 'react';
import {
  PackageCheck,
  Home,
  FlaskConical,
  Scale,
  BookmarkCheck,
  Bot,
  LogOut,
  UploadCloud,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { SystemHealth, User } from '../types/api';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  health: SystemHealth | null;
  currentUser: User | null;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
  onLogout: () => void;
  onNewRecommendationClick: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
  onNewRecommendationClick
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'wizard', label: 'Get Recommendation', icon: FlaskConical },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Bot },
    { id: 'comparison', label: 'Compare Materials', icon: Scale },
    { id: 'history', label: 'My Recommendations', icon: BookmarkCheck },
  ];

  if (currentUser?.is_admin) {
    navItems.push({ id: 'ingest', label: 'Knowledge Base', icon: UploadCloud });
  }

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-[#D8E1EA] shadow-xs">
      {/* Top Navy Government-Style Strip */}
      <div className="bg-[#17365D] text-white text-[11px] py-1 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <span className="font-medium tracking-wide">
            PackSci AI • Food Packaging Decision Portal
          </span>
          <span className="hidden sm:inline text-slate-300">
            ASTM / USDA Calibrated Engineering Platform
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-15">
          {/* Brand Logo & Name */}
          <div
            className="flex items-center gap-2.5 cursor-pointer group shrink-0"
            onClick={() => handleNavClick('home')}
          >
            <div className="w-8 h-8 rounded-md bg-[#17365D] flex items-center justify-center text-white shadow-xs group-hover:bg-[#245A81] transition-colors">
              <PackageCheck className="w-4.5 h-4.5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base text-[#17365D] tracking-tight">
                  PackSci AI
                </span>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-[#245A81] border border-[#D8E1EA]">
                  Research
                </span>
              </div>
              <p className="text-[11px] text-[#5E6B78] font-normal leading-none hidden sm:block">
                Intelligent Food Packaging Recommendation System
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#17365D] text-white font-semibold shadow-xs'
                      : 'text-[#202B38] hover:text-[#17365D] hover:bg-[#F4F7FA]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-[#5E6B78]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions & Account Menu */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onNewRecommendationClick}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Get Recommendation</span>
            </button>

            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-[#F4F7FA] hover:bg-slate-200/70 border border-[#D8E1EA] text-xs font-semibold text-[#17365D] cursor-pointer transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-[#17365D] text-white flex items-center justify-center font-bold text-[10px]">
                    {currentUser.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#5E6B78]" />
                </button>

                {showUserMenu && (
                  <div
                    className="absolute right-0 mt-1.5 w-52 bg-white rounded-md border border-[#D8E1EA] shadow-md py-1 z-50 animate-govSlideDown"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <div className="px-3.5 py-2 border-b border-[#D8E1EA]">
                      <p className="text-xs font-bold text-[#17365D] truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-[#5E6B78] truncate">{currentUser.email}</p>
                    </div>

                    <button
                      onClick={() => handleNavClick('history')}
                      className="w-full text-left px-3.5 py-2 text-xs text-[#202B38] hover:bg-[#F4F7FA] flex items-center gap-2 cursor-pointer"
                    >
                      <BookmarkCheck className="w-4 h-4 text-[#245A81]" />
                      <span>My Recommendations</span>
                    </button>

                    {currentUser.is_admin && (
                      <button
                        onClick={() => handleNavClick('ingest')}
                        className="w-full text-left px-3.5 py-2 text-xs text-[#202B38] hover:bg-[#F4F7FA] flex items-center gap-2 cursor-pointer"
                      >
                        <UploadCloud className="w-4 h-4 text-[#245A81]" />
                        <span>Knowledge Base</span>
                      </button>
                    )}

                    <div className="border-t border-[#D8E1EA] my-1"></div>

                    <button
                      onClick={onLogout}
                      className="w-full text-left px-3.5 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center gap-2 cursor-pointer font-medium"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-md text-[#5E6B78] hover:text-[#17365D] hover:bg-[#F4F7FA] border border-[#D8E1EA] cursor-pointer"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-4.5 h-4.5" /> : <Menu className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#D8E1EA] py-2 px-1 space-y-1 bg-white animate-govSlideDown">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium cursor-pointer ${
                    isActive
                      ? 'bg-[#17365D] text-white font-semibold'
                      : 'text-[#202B38] hover:bg-[#F4F7FA]'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-[#5E6B78]'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
