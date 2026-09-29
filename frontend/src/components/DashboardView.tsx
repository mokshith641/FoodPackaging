import React from 'react';
import {
  FlaskConical,
  Scale,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Leaf,
  Clock,
  CheckCircle2,
  ChevronRight,
  Apple,
  Bot
} from 'lucide-react';
import {
  FoodCommodity,
  PackagingMaterial,
  SavedRecommendationSummary
} from '../types/api';

interface DashboardViewProps {
  commodities: FoodCommodity[];
  materials: PackagingMaterial[];
  savedRecs: SavedRecommendationSummary[];
  onSelectCommodityPreset: (commodity: FoodCommodity) => void;
  onNavigateTab: (tab: string) => void;
  onViewRecommendation: (id: number) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  commodities,
  materials,
  savedRecs,
  onSelectCommodityPreset,
  onNavigateTab,
  onViewRecommendation
}) => {
  // Select 6 common verified commodity presets
  const popularCommodityNames = [
    'Potato chips',
    'Strawberry',
    'Milk powder (whole)',
    'Chicken (raw, fresh)',
    'Wheat flour (atta)',
    'Roasted coffee beans'
  ];

  const popularPresets = commodities.filter((c) =>
    popularCommodityNames.some((name) => c.name.toLowerCase().includes(name.toLowerCase()))
  ).slice(0, 6);

  const displayPresets = popularPresets.length > 0 ? popularPresets : commodities.slice(0, 6);

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 shadow-xs relative overflow-hidden">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>AI-Driven Materials Engineering</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Find the Optimal Packaging Material for Any Food Product
          </h1>

          <p className="text-base text-slate-600 leading-relaxed">
            Enter your food commodity details, moisture levels, and storage conditions.
            Our system calculates exact barrier requirements (OTR / WVTR), predicts shelf-life,
            and ranks the most cost-effective and sustainable packaging options.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigateTab('wizard')}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-sm transition-all hover:shadow cursor-pointer"
            >
              <FlaskConical className="w-4 h-4" />
              <span>Get Recommendation</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              onClick={() => onNavigateTab('ai-assistant')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              <Bot className="w-4 h-4 text-slate-600" />
              <span>Ask AI Assistant</span>
            </button>

            <button
              onClick={() => onNavigateTab('comparison')}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-sm border border-slate-200 transition-colors cursor-pointer"
            >
              <Scale className="w-4 h-4 text-slate-500" />
              <span>Compare Materials</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3 Step Process Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
            1
          </div>
          <h2 className="font-bold text-base text-slate-900 pt-1">Select or Enter Commodity</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Choose from 53+ pre-calibrated food items or input custom moisture, fat, pH, and target shelf-life.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
            2
          </div>
          <h2 className="font-bold text-base text-slate-900 pt-1">Scientific Barrier Analysis</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Deterministic matching evaluates oxygen transmission (OTR), moisture barrier (WVTR), and respiration rates.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm border border-emerald-200">
            3
          </div>
          <h2 className="font-bold text-base text-slate-900 pt-1">AI-Ranked Solutions</h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            Receive scored candidate materials, estimated shelf-life days, cost tiers, and Groq-powered AI justifications.
          </p>
        </div>
      </section>

      {/* Popular Food Commodities (Quick Presets) */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Popular Food Commodities</h2>
            <p className="text-xs text-slate-500">
              Click any commodity to quickly prefill and test the recommendation engine.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('wizard')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Custom Food Item</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {displayPresets.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCommodityPreset(c)}
              className="p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group flex items-start justify-between"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                  {c.name}
                </h3>
                <p className="text-[11px] text-slate-500 capitalize">
                  {c.category.replace(/_/g, ' ')}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    Moisture: {c.moisture_pct !== null ? `${c.moisture_pct}%` : 'N/A'}
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-600 capitalize">
                    {c.default_storage_type}
                  </span>
                </div>
              </div>
              <span className="w-7 h-7 rounded-full bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center text-slate-400 transition-colors shrink-0">
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Recommendations Preview (If any exist) */}
      {savedRecs.length > 0 && (
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Recent Evaluations</h2>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({savedRecs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {savedRecs.slice(0, 3).map((r) => (
              <div
                key={r.id}
                onClick={() => onViewRecommendation(r.id)}
                className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-lg transition-colors cursor-pointer group"
              >
                <div>
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-emerald-800">
                    {r.commodity_name}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Top Material: <span className="text-emerald-700 font-medium">{r.top_material_name || 'Evaluated'}</span> • {r.target_shelf_life_days} days target
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {r.top_score && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-xs border border-emerald-200">
                      {r.top_score}/100
                    </span>
                  )}
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
