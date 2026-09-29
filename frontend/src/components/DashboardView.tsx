import React from 'react';
import {
  FlaskConical,
  Scale,
  ArrowRight,
  ShieldCheck,
  Layers,
  ChevronRight,
  Bot,
  PackageCheck,
  CheckCircle2,
  SlidersHorizontal,
  BookmarkCheck
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
  // Select 6 representative commodities across categories
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
    <div className="space-y-6 animate-govFadeIn text-[#202B38]">
      {/* Breadcrumb / Section Label */}
      <div className="flex items-center gap-1.5 text-xs text-[#5E6B78]">
        <span className="font-semibold text-[#17365D]">Portal</span>
        <span>/</span>
        <span>Home</span>
      </div>

      {/* Hero Service Section */}
      <section className="bg-white border border-[#D8E1EA] rounded-lg p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#F4F7FA] border border-[#D8E1EA] text-[#245A81] text-xs font-semibold">
              <FlaskConical className="w-3.5 h-3.5 text-[#16834A]" />
              <span>Scientific Packaging Decision Portal</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17365D] tracking-tight">
              Find the Right Packaging for Your Food
            </h1>

            <p className="text-xs sm:text-sm text-[#5E6B78] leading-relaxed">
              Enter food product characteristics and storage conditions to calculate exact barrier requirements (OTR/WVTR). The system evaluates shelf-life kinetics and ranks suitable packaging materials based on ASTM and empirical models.
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              <button
                onClick={() => onNavigateTab('wizard')}
                className="flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
              >
                <FlaskConical className="w-4 h-4" />
                <span>Get Recommendation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onNavigateTab('ai-assistant')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md bg-white hover:bg-[#F4F7FA] text-[#17365D] font-semibold text-xs border border-[#D8E1EA] transition-colors cursor-pointer"
              >
                <Bot className="w-4 h-4 text-[#245A81]" />
                <span>Ask AI Assistant</span>
              </button>

              <button
                onClick={() => onNavigateTab('comparison')}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-md text-[#5E6B78] hover:text-[#17365D] hover:bg-[#F4F7FA] text-xs font-medium transition-colors cursor-pointer"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare Materials</span>
              </button>
            </div>
          </div>

          {/* Tasteful Abstract Packaging / Science Graphic */}
          <div className="hidden md:flex flex-col items-center justify-center p-4 bg-[#F4F7FA] rounded-md border border-[#D8E1EA] shrink-0 w-48 text-center space-y-2">
            <div className="w-12 h-12 rounded-lg bg-[#17365D] flex items-center justify-center text-white shadow-xs">
              <PackageCheck className="w-7 h-7 text-emerald-400" />
            </div>
            <div className="text-[11px] font-bold text-[#17365D]">ASTM & USDA Calibrated</div>
            <div className="text-[10px] text-[#5E6B78] leading-tight">
              Deterministic barrier flux & EMAP gas matching
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Procedure */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-[#D8E1EA] rounded-lg p-4 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-md bg-[#17365D] text-white flex items-center justify-center font-bold text-xs shrink-0">
            1
          </div>
          <div>
            <h2 className="font-bold text-xs text-[#17365D]">Enter food details</h2>
            <p className="text-[11px] text-[#5E6B78] mt-0.5 leading-normal">
              Specify moisture, fat, pH, or pick from 53+ food commodities with calibrated baselines.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#D8E1EA] rounded-lg p-4 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-md bg-[#245A81] text-white flex items-center justify-center font-bold text-xs shrink-0">
            2
          </div>
          <div>
            <h2 className="font-bold text-xs text-[#17365D]">Evaluate packaging requirements</h2>
            <p className="text-[11px] text-[#5E6B78] mt-0.5 leading-normal">
              Engine calculates maximum allowable OTR & WVTR and matches respiration gas kinetics.
            </p>
          </div>
        </div>

        <div className="bg-white border border-[#D8E1EA] rounded-lg p-4 shadow-xs flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-md bg-[#16834A] text-white flex items-center justify-center font-bold text-xs shrink-0">
            3
          </div>
          <div>
            <h2 className="font-bold text-xs text-[#17365D]">Compare suitable materials</h2>
            <p className="text-[11px] text-[#5E6B78] mt-0.5 leading-normal">
              Review ranked polymer structures with shelf-life estimates and technical explanations.
            </p>
          </div>
        </div>
      </section>

      {/* Presets Grid */}
      <section className="bg-white border border-[#D8E1EA] rounded-lg p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between border-b border-[#D8E1EA] pb-3">
          <div>
            <h2 className="text-sm font-bold text-[#17365D]">Standard Food Commodity Presets</h2>
            <p className="text-[11px] text-[#5E6B78]">
              Select a commodity below to launch the evaluation form with prefilled biological parameters.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('wizard')}
            className="text-xs font-semibold text-[#245A81] hover:text-[#17365D] flex items-center gap-1 cursor-pointer"
          >
            <span>Custom Food Input</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {displayPresets.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCommodityPreset(c)}
              className="p-3 rounded-md border border-[#D8E1EA] hover:border-[#245A81] hover:bg-[#F4F7FA] transition-all cursor-pointer group flex items-start justify-between bg-white"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-xs font-bold text-[#202B38] group-hover:text-[#17365D]">
                    {c.name}
                  </h3>
                </div>
                <div className="text-[10px] text-[#5E6B78] capitalize">
                  Category: {c.category.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-2 pt-1 text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-[#F4F7FA] text-[#245A81] border border-[#D8E1EA]">
                    Moisture: {c.moisture_pct !== null ? `${c.moisture_pct}%` : 'N/A'}
                  </span>
                  <span className="px-1.5 py-0.5 rounded bg-[#F4F7FA] text-[#5E6B78] border border-[#D8E1EA] capitalize">
                    {c.default_storage_type}
                  </span>
                </div>
              </div>
              <span className="w-6 h-6 rounded bg-[#F4F7FA] group-hover:bg-[#17365D] group-hover:text-white flex items-center justify-center text-[#5E6B78] transition-colors shrink-0 mt-0.5">
                <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* User's Recent Evaluations Preview */}
      {savedRecs.length > 0 && (
        <section className="bg-white border border-[#D8E1EA] rounded-lg p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#D8E1EA] pb-2.5">
            <div className="flex items-center gap-2">
              <BookmarkCheck className="w-4 h-4 text-[#16834A]" />
              <h2 className="text-xs font-bold text-[#17365D]">Your Recent Evaluations</h2>
            </div>
            <button
              onClick={() => onNavigateTab('history')}
              className="text-xs font-semibold text-[#245A81] hover:text-[#17365D] flex items-center gap-1 cursor-pointer"
            >
              <span>View All Saved History ({savedRecs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-[#D8E1EA]">
            {savedRecs.slice(0, 3).map((r) => (
              <div
                key={r.id}
                onClick={() => onViewRecommendation(r.id)}
                className="py-2.5 flex items-center justify-between hover:bg-[#F4F7FA] px-2 rounded transition-colors cursor-pointer group"
              >
                <div>
                  <span className="text-xs font-bold text-[#202B38] group-hover:text-[#17365D]">
                    {r.commodity_name}
                  </span>
                  <span className="text-[11px] text-[#5E6B78] ml-2">
                    Top Structure: <span className="text-[#16834A] font-semibold">{r.top_material_name || 'Evaluated'}</span> • {r.target_shelf_life_days}d target
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {r.top_score && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#16834A] font-bold text-[11px] border border-emerald-200">
                      Score: {r.top_score}/100
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-[#5E6B78] group-hover:text-[#17365D]" />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
