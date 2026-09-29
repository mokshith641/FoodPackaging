import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  Sparkles,
  Info,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Package,
  Thermometer,
  Droplets,
  Clock,
  ArrowRight
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

  useEffect(() => {
    if (initialCommodity) {
      applyCommodityDefaults(initialCommodity);
    }
  }, [initialCommodity]);

  const applyCommodityDefaults = (comm: FoodCommodity) => {
    setSelectedCommodityId(comm.id);
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
      {/* Form Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Packaging Material Recommendation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fill in the product characteristics and environmental requirements to generate evaluated material options.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium border border-slate-200 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {validationError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="space-y-6">
        {/* Step 1: Commodity Selection & Chemical Profile */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="font-bold text-sm text-slate-900">
                Food Commodity & Properties
              </h2>
            </div>
            {autoFilled && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Auto-filled from Database
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Quick Selection from Database
              </label>
              <select
                value={selectedCommodityId || ''}
                onChange={handleSearchSelect}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              >
                <option value="">-- Select a verified food commodity --</option>
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Commodity Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.commodity_name}
                onChange={(e) => setFormData({ ...formData, commodity_name: e.target.value })}
                placeholder="e.g., Roasted Coffee, Strawberries, Ghee"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Commodity Category <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.commodity_category}
                onChange={(e) => setFormData({ ...formData, commodity_category: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Product Physical State
              </label>
              <select
                value={formData.product_state}
                onChange={(e) => setFormData({ ...formData, product_state: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="fresh">Fresh (Unprocessed)</option>
                <option value="dried">Dried / Dehydrated</option>
                <option value="frozen">Frozen</option>
                <option value="liquid">Liquid / Semi-liquid</option>
                <option value="cooked">Cooked / Pasteurized</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Target Shelf Life (Days) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                min="1"
                max="1000"
                required
                value={formData.target_shelf_life_days}
                onChange={(e) => setFormData({ ...formData, target_shelf_life_days: parseInt(e.target.value) || 1 })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Moisture Content (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.moisture_content_pct !== null ? formData.moisture_content_pct : ''}
                onChange={(e) => setFormData({ ...formData, moisture_content_pct: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 14.5"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Fat / Lipid Content (%)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={formData.fat_content_pct !== null ? formData.fat_content_pct : ''}
                onChange={(e) => setFormData({ ...formData, fat_content_pct: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 33.0"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                pH Level (1.0 - 14.0)
              </label>
              <input
                type="number"
                step="0.1"
                min="1"
                max="14"
                value={formData.ph !== null ? formData.ph : ''}
                onChange={(e) => setFormData({ ...formData, ph: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="e.g. 6.2"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {isRespiringCategory && (
            <div className="p-3.5 bg-emerald-50 rounded-lg border border-emerald-200">
              <label className="block text-xs font-semibold text-emerald-900 mb-1">
                Produce Respiration Rate (mg CO₂/kg·h)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.respiration_rate !== null ? formData.respiration_rate : ''}
                onChange={(e) => setFormData({ ...formData, respiration_rate: e.target.value ? parseFloat(e.target.value) : null })}
                placeholder="Auto-calculated from produce type if left blank"
                className="w-full sm:w-1/2 bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none"
              />
              <p className="text-[11px] text-emerald-700 mt-1">
                Fresh produce requires breathable micro-perforated film or high-permeability polymers to avoid anaerobic fermentation.
              </p>
            </div>
          )}
        </div>

        {/* Step 2: Storage & Environmental Conditions */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              2
            </span>
            <h2 className="font-bold text-sm text-slate-900">
              Storage Regime & Environment
            </h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Storage Regime
              </label>
              <div className="flex flex-wrap gap-2">
                {(['ambient', 'chilled', 'frozen'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => {
                      let temp = 25.0;
                      if (mode === 'chilled') temp = 4.0;
                      if (mode === 'frozen') temp = -18.0;
                      setFormData({ ...formData, storage_type: mode, storage_temp_c: temp });
                    }}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      formData.storage_type === mode
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                    }`}
                  >
                    {mode} ({mode === 'ambient' ? '25°C' : mode === 'chilled' ? '4°C' : '-18°C'})
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Thermometer className="w-3.5 h-3.5 text-emerald-600" /> Storage Temperature
                  </span>
                  <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {formData.storage_temp_c}°C ({((formData.storage_temp_c * 9) / 5 + 32).toFixed(0)}°F)
                  </span>
                </div>
                <input
                  type="range"
                  min="-30"
                  max="50"
                  step="1"
                  value={formData.storage_temp_c}
                  onChange={(e) => setFormData({ ...formData, storage_temp_c: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" /> Relative Humidity (RH)
                  </span>
                  <span className="font-mono font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {formData.relative_humidity_pct}% RH
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  step="1"
                  value={formData.relative_humidity_pct}
                  onChange={(e) => setFormData({ ...formData, relative_humidity_pct: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Optimization Priorities & Format */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
              3
            </span>
            <h2 className="font-bold text-sm text-slate-900">
              Optimization Preferences & Format
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cost Tier Preference
              </label>
              <select
                value={formData.cost_tier}
                onChange={(e) => setFormData({ ...formData, cost_tier: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="economy">Economy (Budget-Focused)</option>
                <option value="balanced">Balanced (Cost & Quality)</option>
                <option value="premium">Premium (Maximum Barrier)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Sustainability Priority
              </label>
              <select
                value={formData.sustainability_priority}
                onChange={(e) => setFormData({ ...formData, sustainability_priority: e.target.value as any })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="low">Standard / Conventional</option>
                <option value="medium">Medium (Recyclability Preferred)</option>
                <option value="high">High (Bio-based / Biodegradable)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Package Format
              </label>
              <select
                value={formData.package_format}
                onChange={(e) => setFormData({ ...formData, package_format: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="pouch">Pouch / Sachet</option>
                <option value="tray">Rigid / Semi-Rigid Tray</option>
                <option value="vacuum_skin">Vacuum Skin Pack</option>
                <option value="thermoform">Thermoformed Cup/Blister</option>
                <option value="bag_in_box">Bag-in-Box</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Specific Requirements or Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={formData.user_notes || ''}
              onChange={(e) => setFormData({ ...formData, user_notes: e.target.value })}
              placeholder="e.g. Export shipment via sea freight; requires puncture resistance against sharp edges."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-7 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs shadow-sm transition-all hover:shadow cursor-pointer"
          >
            {isLoading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Evaluating Barrier Kinetics...</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4" />
                <span>Generate Recommendations</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
