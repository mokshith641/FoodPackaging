import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RecommendationWizard } from './components/RecommendationWizard';
import { RecommendationResultsView } from './components/RecommendationResultsView';
import { AIAssistantView } from './components/AIAssistantView';
import { MaterialComparisonView } from './components/MaterialComparisonView';
import { SavedHistoryView } from './components/SavedHistoryView';
import { AdminIngestView } from './components/AdminIngestView';
import { AuthModal } from './components/AuthModal';
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
import { AlertCircle, CheckCircle2, FlaskConical } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUser, setCurrentUser] = useState<User | null>(authStorage.getUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'login' | 'register'>('login');

  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [commodities, setCommodities] = useState<FoodCommodity[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [savedRecs, setSavedRecs] = useState<SavedRecommendationSummary[]>([]);

  // Active evaluation state
  const [selectedCommodityForWizard, setSelectedCommodityForWizard] = useState<FoodCommodity | null>(null);
  const [activeRecommendationResult, setActiveRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [compareCodes, setCompareCodes] = useState<string[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadInitialData();
    checkCurrentUser();
  }, []);

  const checkCurrentUser = async () => {
    if (authStorage.getToken()) {
      try {
        const user = await api.getMe();
        setCurrentUser(user);
      } catch (err) {
        authStorage.removeToken();
        setCurrentUser(null);
      }
    }
  };

  const loadInitialData = async () => {
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
      console.error('Failed to load initial application state:', err);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleOpenAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalInitialMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    showNotification('success', `Welcome, ${user.name}!`);
    // Reload user-specific saved recommendations
    api.getSavedRecommendations().then(setSavedRecs).catch(() => {});
  };

  const handleLogout = async () => {
    await api.logout();
    setCurrentUser(null);
    showNotification('success', 'You have been signed out.');
    // Reload public recommendations
    api.getSavedRecommendations().then(setSavedRecs).catch(() => {});
    if (activeTab === 'ingest') {
      setActiveTab('home');
    }
  };

  // Handle recommendation submission from Wizard
  const handleRecommendationSubmit = async (formData: RecommendationRequest) => {
    setIsLoading(true);
    try {
      const res = await api.createRecommendation(formData);
      setActiveRecommendationResult(res);
      setActiveTab('results');
      showNotification('success', `Evaluated packaging candidates for ${formData.commodity_name}`);
      // Refresh saved recommendations list in background
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
  };

  // Inspect saved recommendation
  const handleViewSavedRecommendation = async (id: number) => {
    setIsLoading(true);
    try {
      const rec = await api.getRecommendationById(id);
      setActiveRecommendationResult(rec);
      setActiveTab('results');
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
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuthModal}
        onLogout={handleLogout}
        onNewRecommendationClick={() => {
          setSelectedCommodityForWizard(null);
          setActiveTab('wizard');
        }}
      />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        initialMode={authModalInitialMode}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg border text-xs font-semibold animate-slideUp ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <DashboardView
            commodities={commodities}
            materials={materials}
            savedRecs={savedRecs}
            onSelectCommodityPreset={handleSelectCommodityPreset}
            onNavigateTab={setActiveTab}
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
            onOpenAuthModal={() => handleOpenAuthModal('login')}
            onViewRecommendation={handleViewSavedRecommendation}
            onDeleteRecommendation={handleDeleteRecommendation}
            onNewEvaluation={() => {
              setSelectedCommodityForWizard(null);
              setActiveTab('wizard');
            }}
          />
        )}

        {activeTab === 'ingest' && (
          <AdminIngestView />
        )}

        {activeTab === 'results' && (
          activeRecommendationResult ? (
            <RecommendationResultsView
              result={activeRecommendationResult}
              onNewEvaluation={() => {
                setSelectedCommodityForWizard(null);
                setActiveTab('wizard');
              }}
              onCompareMaterials={handleCompareMaterials}
            />
          ) : (
            <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <FlaskConical className="w-10 h-10 mx-auto text-slate-400" />
              <h2 className="text-sm font-bold text-slate-800">No active recommendation evaluation</h2>
              <p className="text-xs text-slate-500">Run the recommendation wizard or choose a saved evaluation to view results.</p>
              <button
                onClick={() => setActiveTab('wizard')}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Launch Recommendation Wizard
              </button>
            </div>
          )
        )}
      </main>

      {/* Clean Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PackSci AI</span>
            <span>•</span>
            <span>Intelligent Food Packaging Material Recommendation System</span>
          </div>
          <div className="text-[11px] text-slate-500">
            Validated against USDA FoodData Central, UC Davis Postharvest, and ASTM Barrier Standards.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
