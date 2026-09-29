import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { DashboardView } from './components/DashboardView';
import { RecommendationWizard } from './components/RecommendationWizard';
import { RecommendationResultsView } from './components/RecommendationResultsView';
import { AIAssistantView } from './components/AIAssistantView';
import { MaterialComparisonView } from './components/MaterialComparisonView';
import { SavedHistoryView } from './components/SavedHistoryView';
import { AdminIngestView } from './components/AdminIngestView';
import { api, authStorage } from './services/api';
import {
  FoodCommodity,
  PackagingMaterial,
  RecommendationRequest,
  RecommendationResponse,
  SavedRecommendationSummary,
  SystemHealth,
  User
} from './types/api';
import { AlertCircle, CheckCircle2, FlaskConical, Loader2 } from 'lucide-react';

export function App() {
  // Authentication & Public View State
  const [currentUser, setCurrentUser] = useState<User | null>(authStorage.getUser());
  const [publicView, setPublicView] = useState<'landing' | 'login' | 'register'>('landing');
  const [pendingRedirect, setPendingRedirect] = useState<string | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Authenticated App Tab State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [commodities, setCommodities] = useState<FoodCommodity[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [savedRecs, setSavedRecs] = useState<SavedRecommendationSummary[]>([]);

  // Active recommendation evaluation state
  const [selectedCommodityForWizard, setSelectedCommodityForWizard] = useState<FoodCommodity | null>(null);
  const [activeRecommendationResult, setActiveRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [compareCodes, setCompareCodes] = useState<string[]>([]);

  // UI status state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Initialize session and parse initial hash routing
  useEffect(() => {
    const initAuthAndRouting = async () => {
      setIsAuthChecking(true);
      const token = authStorage.getToken();
      const hash = window.location.hash.replace('#', '');

      let user: User | null = null;
      if (token) {
        try {
          user = await api.getMe();
          setCurrentUser(user);
        } catch {
          authStorage.removeToken();
          setCurrentUser(null);
          user = null;
        }
      }

      if (user) {
        // Authenticated user
        if (['home', 'wizard', 'ai-assistant', 'comparison', 'history', 'ingest', 'results'].includes(hash)) {
          setActiveTab(hash);
        } else {
          setActiveTab('home');
        }
        loadProtectedData();
      } else {
        // Unauthenticated user route protection
        if (hash === 'login') {
          setPublicView('login');
        } else if (hash === 'register') {
          setPublicView('register');
        } else if (['home', 'wizard', 'ai-assistant', 'comparison', 'history', 'ingest'].includes(hash)) {
          setPendingRedirect(hash);
          setPublicView('login');
        } else {
          setPublicView('landing');
        }
      }
      setIsAuthChecking(false);
    };

    initAuthAndRouting();

    // Listen to hash changes for browser back/forward navigation
    const handleHashChange = () => {
      const currentHash = window.location.hash.replace('#', '');
      const hasToken = !!authStorage.getToken();

      if (!hasToken) {
        if (currentHash === 'login') {
          setPublicView('login');
        } else if (currentHash === 'register') {
          setPublicView('register');
        } else if (['home', 'wizard', 'ai-assistant', 'comparison', 'history', 'ingest', 'results'].includes(currentHash)) {
          setPendingRedirect(currentHash);
          setPublicView('login');
        } else {
          setPublicView('landing');
        }
      } else {
        if (['home', 'wizard', 'ai-assistant', 'comparison', 'history', 'ingest', 'results'].includes(currentHash)) {
          setActiveTab(currentHash);
        }
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const loadProtectedData = async () => {
    try {
      const [h, c, m, r] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getCommodities().catch(() => []),
        api.getMaterials().catch(() => []),
        api.getSavedRecommendations().catch(() => []),
      ]);

      if (h) setHealth(h);
      setCommodities(c);
      setMaterials(m);
      setSavedRecs(r);
    } catch (err) {
      console.error('Failed to load application data:', err);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Handle successful login or registration
  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showNotification('success', `Signed in as ${user.name}`);

    // Redirect to requested protected view or default to home/dashboard
    const target = pendingRedirect && ['home', 'wizard', 'ai-assistant', 'comparison', 'history', 'ingest'].includes(pendingRedirect)
      ? pendingRedirect
      : 'home';

    setPendingRedirect(null);
    setActiveTab(target);
    window.location.hash = target;

    // Load full protected dataset
    loadProtectedData();
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error('Error during logout API call:', err);
    } finally {
      authStorage.removeToken();
      setCurrentUser(null);
      setPublicView('landing');
      setActiveTab('home');
      setSelectedCommodityForWizard(null);
      setActiveRecommendationResult(null);
      setSavedRecs([]);
      window.location.hash = '';
      showNotification('success', 'You have been signed out.');
    }
  };

  // Handle recommendation submission from Wizard
  const handleRecommendationSubmit = async (formData: RecommendationRequest) => {
    setIsLoading(true);
    try {
      const res = await api.createRecommendation(formData);
      setActiveRecommendationResult(res);
      setActiveTab('results');
      window.location.hash = 'results';
      showNotification('success', `Evaluated packaging candidates for ${formData.commodity_name}`);
      // Refresh saved recommendations
      api.getSavedRecommendations().then(setSavedRecs).catch(() => {});
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to generate packaging recommendation');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle selecting a commodity preset from Home
  const handleSelectCommodityPreset = (commodity: FoodCommodity) => {
    setSelectedCommodityForWizard(commodity);
    setActiveTab('wizard');
    window.location.hash = 'wizard';
  };

  // Inspect saved recommendation
  const handleViewSavedRecommendation = async (id: number) => {
    setIsLoading(true);
    try {
      const rec = await api.getRecommendationById(id);
      setActiveRecommendationResult(rec);
      setActiveTab('results');
      window.location.hash = 'results';
    } catch (err: any) {
      showNotification('error', `Could not load recommendation #${id}: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete saved recommendation
  const handleDeleteRecommendation = async (id: number) => {
    try {
      await api.deleteRecommendation(id);
      setSavedRecs((prev) => prev.filter((r) => r.id !== id));
      showNotification('success', `Recommendation #${id} deleted.`);
    } catch (err: any) {
      showNotification('error', `Failed to delete: ${err.message}`);
    }
  };

  // Open comparison view with selected materials
  const handleCompareMaterials = (codes: string[]) => {
    setCompareCodes(codes);
    setActiveTab('comparison');
    window.location.hash = 'comparison';
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.location.hash = tab;
  };

  // Initial Auth Loading Screen
  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] flex items-center justify-center text-[#202B38]">
        <div className="flex flex-col items-center gap-2.5">
          <Loader2 className="w-7 h-7 text-[#16834A] animate-spin" />
          <span className="text-xs font-semibold text-[#17365D]">Loading PackSci AI Portal...</span>
        </div>
      </div>
    );
  }

  // ==========================================
  // UNAUTHENTICATED PUBLIC PORTAL
  // Strictly renders only Landing, Login, or Register
  // ==========================================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#F4F7FA] text-[#202B38] font-sans flex flex-col justify-between">
        {/* Floating Notification Toast */}
        {notification && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-md shadow-md border text-xs font-semibold animate-govFadeIn ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-red-50 border-red-300 text-red-900'
            }`}
          >
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#16834A] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {publicView === 'landing' && (
          <LandingPage
            onNavigateToLogin={() => {
              setPublicView('login');
              window.location.hash = 'login';
            }}
            onNavigateToRegister={() => {
              setPublicView('register');
              window.location.hash = 'register';
            }}
          />
        )}

        {publicView === 'login' && (
          <LoginPage
            onSuccess={handleAuthSuccess}
            onNavigateToRegister={() => {
              setPublicView('register');
              window.location.hash = 'register';
            }}
            onNavigateToHome={() => {
              setPublicView('landing');
              window.location.hash = '';
            }}
          />
        )}

        {publicView === 'register' && (
          <RegisterPage
            onSuccess={handleAuthSuccess}
            onNavigateToLogin={() => {
              setPublicView('login');
              window.location.hash = 'login';
            }}
            onNavigateToHome={() => {
              setPublicView('landing');
              window.location.hash = '';
            }}
          />
        )}
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED APPLICATION INTERFACE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#202B38] flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        health={health}
        currentUser={currentUser}
        onOpenAuthModal={() => {}}
        onLogout={handleLogout}
        onNewRecommendationClick={() => {
          setSelectedCommodityForWizard(null);
          setActiveTab('wizard');
          window.location.hash = 'wizard';
        }}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-3.5 py-2.5 rounded-md shadow-md border text-xs font-semibold animate-govFadeIn ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
              : 'bg-red-50 border-red-300 text-red-900'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-[#16834A] shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'home' && (
          <DashboardView
            commodities={commodities}
            materials={materials}
            savedRecs={savedRecs}
            onSelectCommodityPreset={handleSelectCommodityPreset}
            onNavigateTab={handleTabChange}
            onViewRecommendation={handleViewSavedRecommendation}
          />
        )}

        {activeTab === 'wizard' && (
          <RecommendationWizard
            commodities={commodities}
            initialCommodity={selectedCommodityForWizard}
            onSubmit={handleRecommendationSubmit}
            isLoading={isLoading}
          />
        )}

        {activeTab === 'ai-assistant' && (
          <AIAssistantView
            commodities={commodities}
            materials={materials}
            onSelectCommodityForWizard={handleSelectCommodityPreset}
          />
        )}

        {activeTab === 'comparison' && (
          <MaterialComparisonView
            materials={materials}
            preselectedCodes={compareCodes}
          />
        )}

        {activeTab === 'history' && (
          <SavedHistoryView
            savedRecs={savedRecs}
            currentUser={currentUser}
            onOpenAuthModal={() => {}}
            onViewRecommendation={handleViewSavedRecommendation}
            onDeleteRecommendation={handleDeleteRecommendation}
            onNewEvaluation={() => {
              setSelectedCommodityForWizard(null);
              setActiveTab('wizard');
              window.location.hash = 'wizard';
            }}
          />
        )}

        {activeTab === 'ingest' && currentUser?.is_admin && (
          <AdminIngestView />
        )}

        {activeTab === 'results' && (
          activeRecommendationResult ? (
            <RecommendationResultsView
              result={activeRecommendationResult}
              onNewEvaluation={() => {
                setSelectedCommodityForWizard(null);
                setActiveTab('wizard');
                window.location.hash = 'wizard';
              }}
              onCompareMaterials={handleCompareMaterials}
            />
          ) : (
            <div className="text-center py-14 bg-white rounded-lg border border-[#D8E1EA] shadow-xs space-y-2.5">
              <FlaskConical className="w-8 h-8 mx-auto text-[#5E6B78]" />
              <h2 className="text-xs font-bold text-[#17365D]">No active evaluation loaded</h2>
              <p className="text-[11px] text-[#5E6B78]">Run the recommendation form or choose a saved evaluation to view results.</p>
              <button
                onClick={() => {
                  setActiveTab('wizard');
                  window.location.hash = 'wizard';
                }}
                className="px-3.5 py-1.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Launch Evaluation Form
              </button>
            </div>
          )
        )}
      </main>

      {/* Authenticated Public-Sector Footer */}
      <footer className="border-t border-[#D8E1EA] bg-white py-4 text-center text-xs text-[#5E6B78] mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#17365D]">PackSci AI</span>
            <span>•</span>
            <span>AI-Based Intelligent Food Packaging Material Recommendation System for Food Commodities</span>
          </div>
          <div className="text-slate-400">
            Validated against USDA FoodData Central, UC Davis Postharvest, and ASTM Barrier Standards.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
