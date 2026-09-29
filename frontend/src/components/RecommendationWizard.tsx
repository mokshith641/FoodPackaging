import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  Thermometer,
  Droplets,
  Clock,
  Truck,
  Leaf,
  DollarSign,
  Package,
  RotateCcw,
  Search,
  Sliders
} from 'lucide-react';
import { FoodCommodity, RecommendationRequest } from '../types/api';

interface RecommendationWizardProps {
  commodities: FoodCommodity[];
  initialCommodity: FoodCommodity | null;
  onSubmit: (data: RecommendationRequest) => Promise<void>;
  isLoading: boolean;
}

const CATEGORIES = [
  'dry_staple',
  'spice_beverage',
  'nuts_high_fat',
  'snack_fried',
  'bakery_dry',
  'bakery_fresh',
  'dairy_dry',
  'dairy_chilled',
  'fat_oil',
  'meat_fish_chilled',
  'frozen',
  'fresh_produce_fruit',
  'fresh_produce_veg',
  'fresh_produce_leafy',
  'fresh_produce_root_bulb',
  'eggs'
];

export const RecommendationWizard: React.FC<RecommendationWizardProps> = ({
  commodities,
  initialCommodity,
  onSubmit,
  isLoading
}) => {
  // Search query for commodity auto-fill
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCommodityId, setSelectedCommodityId] = useState<number | null>(null);
  const [autoFilled, setAutoFilled] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<RecommendationRequest>({
    commodity_id: null,
    commodity_name: '',
    commodity_category: 'snack_fried',
    moisture_content_pct: 2.0,
    fat_content_pct: 33.0,
    ph: 6.0,
    respiration_rate: null,
    respiration_rate_unit: 'mg_CO2_kg_h',
    target_shelf_life_days: 90,
    storage_type: 'ambient',
    storage_temp_c: 25.0,
    relative_humidity_pct: 60.0,
    transport_condition: 'normal',
    cost_tier: 'balanced',
    sustainability_priority: 'medium',
    product_state: 'fresh',
    package_format: 'pouch',
    user_notes: ''
  });

  // Handle initial commodity passed from preset
  useEffect(() => {
    if (initialCommodity) {
      applyCommodityDefaults(initialCommodity);
    }
  }, [initialCommodity]);

  const applyCommodityDefaults = (comm: FoodCommodity) => {
    setSelectedCommodityId(comm.id);
    setSearchQuery(comm.name);
    setAutoFilled(true);

    let pState = 'fresh';
    if (comm.category.includes('dry') || comm.category.includes('snack') || comm.category.includes('spice') || comm.category.includes('nuts')) {
      pState = 'dried';
    } else if (comm.category === 'frozen') {
      pState = 'frozen';
    } else if (comm.category === 'fat_oil') {
      pState = 'liquid';
    }

    setFormData((prev) => ({
      ...prev,
      commodity_id: comm.id,
      commodity_name: comm.name,
      commodity_category: comm.category,
      moisture_content_pct: comm.moisture_pct ?? prev.moisture_content_pct,
      fat_content_pct: comm.fat_pct ?? prev.fat_content_pct,
      ph: comm.ph ?? prev.ph,
      respiration_rate: comm.resp_rate_mg_co2_kg_h ?? null,
      target_shelf_life_days: comm.base_shelf_life_days ?? prev.target_shelf_life_days,
      storage_type: comm.default_storage_type === 'cool' ? 'chilled' : comm.default_storage_type,
      storage_temp_c: comm.optimal_temp_c ?? prev.storage_temp_c,
      relative_humidity_pct: comm.optimal_rh_pct ?? prev.relative_humidity_pct,
      product_state: pState,
      package_format: comm.category === 'meat_fish_chilled' ? 'vacuum_skin' : 'pouch'
    }));
  };

  const handleSearchSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value, 10);
    if (!isNaN(id)) {
      const comm = commodities.find((c) => c.id === id);
      if (comm) {
        applyCommodityDefaults(comm);
      }
    }
  };

  const handleReset = () => {
    setSelectedCommodityId(null);
    setSearchQuery('');
    setAutoFilled(false);
    setValidationError(null);
    setFormData({
      commodity_id: null,
      commodity_name: '',
      commodity_category: 'dry_staple',
      moisture_content_pct: null,
      fat_content_pct: null,
      ph: null,
      respiration_rate: null,
      respiration_rate_unit: 'mg_CO2_kg_h',
      target_shelf_life_days: 180,
      storage_type: 'ambient',
      storage_temp_c: 25.0,
      relative_humidity_pct: 60.0,
      transport_condition: 'normal',
      cost_tier: 'balanced',
      sustainability_priority: 'medium',
      product_state: 'fresh',
      package_format: 'pouch',
      user_notes: ''
    });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!formData.commodity_name.trim()) {
      setValidationError('Please enter or select a food commodity name.');
      return;
    }

    if (formData.target_shelf_life_days <= 0) {
      setValidationError('Target shelf life must be greater than 0 days.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setValidationError(err.message || 'Failed to generate recommendation.');
    }
  };

  const isRespiringCategory = [
    'fresh_produce_fruit',
    'fresh_produce_veg',
    'fresh_produce_leafy',
    'fresh_produce_root_bulb'
  ].includes(formData.commodity_category);

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FlaskConical className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">
              Packaging Material Recommendation Wizard
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Define your food commodity properties and environmental storage conditions. The engine will evaluate barrier requirements (OTR/WVTR), temperature compatibility, and circularity.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Form</span>
        </button>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800 text-rose-300 text-xs flex items-center gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Step 1: Commodity Selection & Chemical Profile */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-sm text-slate-200">
                Food Commodity & Degradation Attributes
              </h2>
            </div>
            {autoFilled && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-3 h-3" /> Auto-filled from Registry
              </span>
            )}
          </div>

          {/* Quick Registry Auto-fill Selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Search & Auto-fill from Verified Registry (53+ Items)
              </label>
              <div className="relative">
                <select
                  value={selectedCommodityId || ''}
                  onChange={handleSearchSelect}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">-- Choose from standard commodities --</option>
                  {commodities.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.category.replace(/_/g, ' ')})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Commodity Name <span className="text-emerald-400">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.commodity_name}
                onChange={(e) => setFormData({ ...formData, commodity_name: e.target.value })}
                placeholder="e.g., Roasted Coffee, Strawberries, Ghee"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Commodity Category <span className="text-emerald-400">*</span>
              </label>
              <select
                value={formData.commodity_category}
                onChange={(e) => setFormData({ ...formData, commodity_category: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Product Physical State
              </label>
              <select
                value={formData.product_state}
                onChange={(e) => setFormData({ ...formData, product_state: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="fresh">Fresh (Unprocessed/Living)</option>
                <option value="dried">Dried / Low-Moisture</option>
                <option value="liquid">Liquid / Oil</option>
                <option value="frozen">Frozen</option>
                <option value="processed">Processed / Cooked</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Target Shelf Life (Days) <span className="text-emerald-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="3650"
                  step="1"
                  required
                  value={formData.target_shelf_life_days}
                  onChange={(e) => setFormData({ ...formData, target_shelf_life_days: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-3 pr-8 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                />
                <span className="absolute right-2.5 top-2 text-[10px] text-slate-500">days</span>
              </div>
            </div>
          </div>

          {/* Chemical composition inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-slate-800/60">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Moisture Content (%)</label>
                <span className="text-[10px] text-slate-500 font-mono">0 - 100%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.moisture_content_pct ?? ''}
                placeholder="Leave blank if unknown"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    moisture_content_pct: e.target.value === '' ? null : parseFloat(e.target.value)
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">High moisture items need calibrated WVTR</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Fat / Lipid Content (%)</label>
                <span className="text-[10px] text-slate-500 font-mono">0 - 100%</span>
              </div>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.fat_content_pct ?? ''}
                placeholder="Leave blank if unknown"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    fat_content_pct: e.target.value === '' ? null : parseFloat(e.target.value)
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Fat &gt; 15% requires tight OTR barrier</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">pH Level</label>
                <span className="text-[10px] text-slate-500 font-mono">1.0 - 14.0</span>
              </div>
              <input
                type="number"
                min="1"
                max="14"
                step="0.1"
                value={formData.ph ?? ''}
                placeholder="e.g., 6.5 (Leave blank if N/A)"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ph: e.target.value === '' ? null : parseFloat(e.target.value)
                  })
                }
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[10px] text-slate-500 mt-1">Low pH (&lt;4.5) inhibits microbial growth</p>
            </div>
          </div>

          {/* Respiration Rate field (active for fresh produce) */}
          {isRespiringCategory && (
            <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-300">
                    Fresh Produce Postharvest Respiration (EMAP Matching)
                  </span>
                </div>
                <span className="text-[10px] text-slate-400">UC Davis Biological Baseline</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Respiration Rate (mg CO₂ / kg · h at optimal temp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.respiration_rate ?? ''}
                    placeholder="e.g., 25.0 (Auto-calculated if blank)"
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        respiration_rate: e.target.value === '' ? null : parseFloat(e.target.value)
                      })
                    }
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="text-[11px] text-slate-400 flex items-center">
                  <p>
                    Living produce requires breathable or micro-perforated films. High-barrier films will be filtered out to avoid anaerobic fermentation.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Environmental Storage & Supply Chain */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="font-bold text-sm text-slate-200">
              Storage Regime & Environmental Humidity
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Storage Regime
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['ambient', 'chilled', 'frozen'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      let temp = formData.storage_temp_c;
                      if (mode === 'ambient') temp = 25.0;
                      if (mode === 'chilled') temp = 4.0;
                      if (mode === 'frozen') temp = -18.0;
                      setFormData({ ...formData, storage_type: mode, storage_temp_c: temp });
                    }}
                    className={`py-2 text-xs font-medium rounded-lg capitalize transition-colors ${
                      formData.storage_type === mode
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> Temperature
                </label>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  {formData.storage_temp_c}°C ({Math.round((formData.storage_temp_c * 9/5) + 32)}°F)
                </span>
              </div>
              <input
                type="range"
                min="-25"
                max="45"
                step="1"
                value={formData.storage_temp_c}
                onChange={(e) => setFormData({ ...formData, storage_temp_c: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>-25°C (Frozen)</span>
                <span>4°C (Chilled)</span>
                <span>25°C (Ambient)</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" /> Relative Humidity (RH)
                </label>
                <span className="text-xs font-mono text-cyan-300 font-bold">
                  {formData.relative_humidity_pct}%
                </span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={formData.relative_humidity_pct}
                onChange={(e) => setFormData({ ...formData, relative_humidity_pct: parseFloat(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>30% (Dry)</span>
                <span>65% (Normal)</span>
                <span>95% (Produce/Cold)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Logistics, Packaging Format & Prioritization */}
        <div className="glass-panel rounded-xl p-6 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-bold text-sm text-slate-200">
              Supply Chain, Cost & Sustainability Weights
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-indigo-400" /> Transportation
              </label>
              <select
                value={formData.transport_condition}
                onChange={(e) => setFormData({ ...formData, transport_condition: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="normal">Standard Local</option>
                <option value="long_distance">Long Distance (High Tensile)</option>
                <option value="refrigerated">Refrigerated Cold Chain</option>
                <option value="high_humidity">Tropical / High Humidity</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" /> Cost Tier
              </label>
              <select
                value={formData.cost_tier}
                onChange={(e) => setFormData({ ...formData, cost_tier: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="budget">Budget-Oriented (Lowest ₹/kg)</option>
                <option value="balanced">Balanced (Optimal Barrier/Cost)</option>
                <option value="premium">Premium / High Barrier</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5 text-teal-400" /> Sustainability
              </label>
              <select
                value={formData.sustainability_priority}
                onChange={(e) => setFormData({ ...formData, sustainability_priority: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="low">Standard / Barrier First</option>
                <option value="medium">Balanced Recyclability</option>
                <option value="high">High (Recyclable/Compostable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-purple-400" /> Package Format
              </label>
              <select
                value={formData.package_format}
                onChange={(e) => setFormData({ ...formData, package_format: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              >
                <option value="pouch">Flexible Pouch / Pillow Pack</option>
                <option value="vacuum_skin">Vacuum Skin / Shrink Bag</option>
                <option value="tray">Thermoformed Tray / Lid</option>
                <option value="bag">Gusseted Bag / Liner</option>
                <option value="carton">Carton / Overwrap</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Specific Engineering Constraints / Batch Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.user_notes || ''}
              onChange={(e) => setFormData({ ...formData, user_notes: e.target.value })}
              placeholder="e.g. Export shipment requiring nitrogen flushing, light-sensitive carotenoid pigments, one-way degassing valve required for fresh roast."
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-emerald-500/25 transition-all hover:scale-102 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Evaluating Barrier Multi-Criteria...</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4 stroke-[2.5]" />
                <span>Compute Material Recommendations</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
