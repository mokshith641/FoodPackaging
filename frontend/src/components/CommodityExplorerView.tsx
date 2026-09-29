import React, { useState } from 'react';
import {
  Apple,
  Search,
  Filter,
  Info,
  CheckCircle2,
  X,
  Thermometer,
  Droplets,
  Clock,
  Leaf,
  FlaskConical
} from 'lucide-react';
import { FoodCommodity } from '../types/api';

interface CommodityExplorerViewProps {
  commodities: FoodCommodity[];
  onSelectCommodityForWizard: (commodity: FoodCommodity) => void;
}

export const CommodityExplorerView: React.FC<CommodityExplorerViewProps> = ({
  commodities,
  onSelectCommodityForWizard
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeModalCommodity, setActiveModalCommodity] = useState<FoodCommodity | null>(null);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(commodities.map((c) => c.category)))];

  const filteredCommodities = commodities.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.commodity_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'all' || c.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Apple className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Food Commodity Explorer</h1>
          </div>
          <p className="text-xs text-slate-400">
            Browse authentic nutritional, physiological, respiration, and storage parameters compiled from USDA FoodData Central, UC Davis Postharvest, and FAO.
          </p>
        </div>

        <span className="text-xs font-mono text-emerald-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          {filteredCommodities.length} Commodities Found
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by commodity name or code (e.g., Mango, C001, Lentils)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'all'
                    ? 'All Categories'
                    : cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Commodities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCommodities.map((c) => (
          <div
            key={c.id}
            className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-emerald-500/40 transition-all hover:scale-101 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div>
                  <h3 className="font-bold text-sm text-slate-100 group-hover:text-emerald-300 transition-colors">
                    {c.name}
                  </h3>
                  <span className="text-[11px] font-mono text-slate-400">{c.commodity_code}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700 font-medium capitalize">
                  {c.category.replace(/_/g, ' ')}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-3 gap-2 my-3 text-[11px]">
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Moisture</div>
                  <div className="font-mono font-bold text-slate-200">
                    {c.moisture_pct !== null && c.moisture_pct !== undefined ? `${c.moisture_pct}%` : '--'}
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">Fat</div>
                  <div className="font-mono font-bold text-slate-200">
                    {c.fat_pct !== null && c.fat_pct !== undefined ? `${c.fat_pct}%` : '--'}
                  </div>
                </div>
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">pH</div>
                  <div className="font-mono font-bold text-slate-200">
                    {c.ph !== null && c.ph !== undefined ? c.ph : '--'}
                  </div>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Storage Regime:</span>
                  <span className="font-mono text-slate-200 capitalize">{c.default_storage_type} ({c.optimal_temp_c ?? 25}°C)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Base Shelf Life:</span>
                  <span className="font-mono text-slate-200">{c.base_shelf_life_days ?? '--'} days</span>
                </div>
                {c.is_respiring && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span>Respiration Rate:</span>
                    <span className="font-mono font-semibold">{c.resp_rate_mg_co2_kg_h} mg CO₂/kg·h</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80 mt-3">
              <button
                onClick={() => setActiveModalCommodity(c)}
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Inspect Specs
              </button>
              <button
                onClick={() => onSelectCommodityForWizard(c)}
                className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                title="Use in Recommendation Wizard"
              >
                <FlaskConical className="w-3.5 h-3.5" />
                <span>Evaluate</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Commodity Details Modal */}
      {activeModalCommodity && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setActiveModalCommodity(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Apple className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{activeModalCommodity.name}</h2>
                <span className="text-xs font-mono text-slate-400">
                  {activeModalCommodity.commodity_code} • {activeModalCommodity.category.replace(/_/g, ' ')}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Moisture</div>
                <div className="font-mono font-bold text-slate-200">
                  {activeModalCommodity.moisture_pct ?? 'N/A'}%
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Fat Content</div>
                <div className="font-mono font-bold text-slate-200">
                  {activeModalCommodity.fat_pct ?? 'N/A'}%
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">pH</div>
                <div className="font-mono font-bold text-slate-200">
                  {activeModalCommodity.ph ?? 'N/A'}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Water Activity (aw)</div>
                <div className="font-mono font-bold text-slate-200">
                  {activeModalCommodity.water_activity ?? 'N/A'}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-300 border-t border-slate-800 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Optimal Storage Temperature:</span>
                <span className="font-mono font-bold">{activeModalCommodity.optimal_temp_c ?? 'N/A'}°C</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Optimal Relative Humidity:</span>
                <span className="font-mono font-bold">{activeModalCommodity.optimal_rh_pct ?? 'N/A'}%</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Ethylene Sensitivity:</span>
                <span className="font-bold">{activeModalCommodity.ethylene_sensitive ? 'Yes (High)' : 'No'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Respiration Rate (T_opt):</span>
                <span className="font-mono font-bold">
                  {activeModalCommodity.resp_rate_mg_co2_kg_h ? `${activeModalCommodity.resp_rate_mg_co2_kg_h} mg CO₂/kg·h (Q10=${activeModalCommodity.resp_q10})` : 'Non-respiring'}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Data Confidence / Provenance:</span>
                <span className="font-mono text-emerald-400 capitalize">{activeModalCommodity.data_confidence}</span>
              </div>
            </div>

            {activeModalCommodity.provenance_notes && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Technical Notes: </span>
                {activeModalCommodity.provenance_notes}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  onSelectCommodityForWizard(activeModalCommodity);
                  setActiveModalCommodity(null);
                }}
                className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Send to Recommendation Wizard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
