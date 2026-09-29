import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { RecommendationWizard } from './components/RecommendationWizard';
import { RecommendationResultsView } from './components/RecommendationResultsView';
import { MaterialComparisonView } from './components/MaterialComparisonView';
import { CommodityExplorerView } from './components/CommodityExplorerView';
import { MaterialDatabaseView } from './components/MaterialDatabaseView';
import { SavedHistoryView } from './components/SavedHistoryView';
import { SettingsAndProvenanceView } from './components/SettingsAndProvenanceView';
import { api } from './services/api';
import {
  FoodCommodity,
  PackagingMaterial,
  RecommendationRequest,
  RecommendationResponse,
  SavedRecommendationSummary,
  DataSource,
  DataQualityReport,
  SystemHealth
} from './types/api';
import { AlertCircle, CheckCircle2, FlaskConical } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [commodities, setCommodities] = useState<FoodCommodity[]>([]);
  const [materials, setMaterials] = useState<PackagingMaterial[]>([]);
  const [savedRecs, setSavedRecs] = useState<SavedRecommendationSummary[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [qualityReport, setQualityReport] = useState<DataQualityReport | null>(null);

  // Active evaluation state
  const [selectedCommodityForWizard, setSelectedCommodityForWizard] = useState<FoodCommodity | null>(null);
  const [activeRecommendationResult, setActiveRecommendationResult] = useState<RecommendationResponse | null>(null);
  const [compareCodes, setCompareCodes] = useState<string[]>([]);

  // UI state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [h, c, m, r, s, q] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getCommodities().catch(() => []),
        api.getMaterials().catch(() => []),
        api.getSavedRecommendations().catch(() => []),
        api.getDataSources().catch(() => []),
        api.getDataQualityReport().catch(() => null)
      ]);

      if (h) setHealth(h);
      setCommodities(c);
      setMaterials(m);
      setSavedRecs(r);
      setSources(s);
      if (q) setQualityReport(q);
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

  // Handle selecting a commodity preset from Dashboard or Explorer
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        health={health}
        onNewRecommendationClick={() => {
          setSelectedCommodityForWizard(null);
          setActiveTab('wizard');
        }}
      />

      {/* Floating Notification Toast */}
      {notification && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-2xl border text-xs font-medium animate-slideUp ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/90 border-rose-500/40 text-rose-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            commodities={commodities}
            materials={materials}
            savedRecs={savedRecs}
            qualityReport={qualityReport}
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
            <div className="text-center py-16 glass-panel rounded-2xl border border-slate-800 space-y-3">
              <FlaskConical className="w-10 h-10 mx-auto text-slate-500" />
              <h2 className="text-sm font-bold text-slate-300">No active recommendation evaluation</h2>
              <p className="text-xs text-slate-500">Run the wizard or select a saved recommendation to view detailed candidate rankings.</p>
              <button
                onClick={() => setActiveTab('wizard')}
                className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
              >
                Launch Recommendation Wizard
              </button>
            </div>
          )
        )}

        {activeTab === 'comparison' && (
          <MaterialComparisonView
            materials={materials}
            preselectedCodes={compareCodes}
          />
        )}

        {activeTab === 'commodities' && (
          <CommodityExplorerView
            commodities={commodities}
            onSelectCommodityForWizard={handleSelectCommodityPreset}
          />
        )}

        {activeTab === 'materials' && (
          <MaterialDatabaseView
            materials={materials}
            onCompareMaterial={(code) => handleCompareMaterials([code])}
          />
        )}

        {activeTab === 'history' && (
          <SavedHistoryView
            savedRecs={savedRecs}
            onViewRecommendation={handleViewSavedRecommendation}
            onDeleteRecommendation={handleDeleteRecommendation}
            onNewEvaluation={() => {
              setSelectedCommodityForWizard(null);
              setActiveTab('wizard');
            }}
          />
        )}

        {activeTab === 'sources' && (
          <SettingsAndProvenanceView
            health={health}
            sources={sources}
            qualityReport={qualityReport}
            onRefreshHealth={loadInitialData}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">PackSci AI</span>
            <span>•</span>
            <span>Final-Year Engineering Project</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Validated against USDA FoodData Central, UC Davis Postharvest, MatWeb & ASTM standards.
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
