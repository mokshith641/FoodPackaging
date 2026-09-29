import React, { useState, useEffect } from 'react';
import {
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  Info
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
      setValidationError(err.message || 'Failed to generate packaging recommendation.');
    }
  };

  const isRespiringCategory = [
    'fresh_produce_fruit',
    'fresh_produce_veg',
    'fresh_produce_leafy',
    'fresh_produce_root_bulb'
  ].includes(formData.commodity_category);

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-govFadeIn text-[#202B38]">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-1.5 text-xs text-[#5E6B78]">
        <span className="font-semibold text-[#17365D]">Portal</span>
        <span>/</span>
        <span>Recommendation Form</span>
      </div>

      {/* Form Title Card */}
      <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#17365D] tracking-tight">
            Packaging Material Evaluation Form
          </h1>
          <p className="text-xs text-[#5E6B78] mt-0.5">
            Fill in the food commodity details and target conditions to generate deterministic ASTM barrier recommendations.
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#F4F7FA] hover:bg-slate-200 text-[#17365D] text-xs font-semibold border border-[#D8E1EA] transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#245A81]" />
          <span>Reset Form</span>
        </button>
      </div>

      {validationError && (
        <div className="p-3.5 rounded-md bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{validationError}</span>
        </div>
      )}

      <form onSubmit={handleSubmitForm} className="space-y-4">
        {/* SECTION A: Food Details */}
        <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#D8E1EA] pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded bg-[#17365D] text-white text-xs font-bold flex items-center justify-center">
                A
              </span>
              <h2 className="font-bold text-xs text-[#17365D] uppercase tracking-wide">
                Food Details
              </h2>
            </div>
            {autoFilled && (
              <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-[#16834A] border border-emerald-200 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" /> Database Calibrated
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Select from Verified Database
              </label>
              <select
                value={selectedCommodityId || ''}
                onChange={handleSearchSelect}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
              >
                <option value="">-- Choose commodity to auto-fill --</option>
                {commodities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.category.replace(/_/g, ' ')})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Commodity Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.commodity_name}
                onChange={(e) => setFormData({ ...formData, commodity_name: e.target.value })}
                placeholder="e.g., Strawberry, Wheat Flour, Roasted Coffee"
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Category
              </label>
              <select
                value={formData.commodity_category}
                onChange={(e) => setFormData({ ...formData, commodity_category: e.target.value })}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ').toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Physical Product State
              </label>
              <select
                value={formData.product_state}
                onChange={(e) => setFormData({ ...formData, product_state: e.target.value })}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all capitalize"
              >
                <option value="fresh">Fresh / Perishable</option>
                <option value="dried">Dried / Low Moisture</option>
                <option value="frozen">Frozen</option>
                <option value="liquid">Liquid / Oil</option>
                <option value="processed">Processed / Cooked</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Moisture Content (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.moisture_content_pct ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      moisture_content_pct: e.target.value === '' ? null : parseFloat(e.target.value)
                    })
                  }
                  placeholder="e.g., 2.0"
                  className="w-full bg-white border border-[#D8E1EA] rounded-md pl-3 pr-8 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6B78] text-xs pointer-events-none">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Fat Content (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.fat_content_pct ?? ''}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fat_content_pct: e.target.value === '' ? null : parseFloat(e.target.value)
                    })
                  }
                  placeholder="e.g., 33.0"
                  className="w-full bg-white border border-[#D8E1EA] rounded-md pl-3 pr-8 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6B78] text-xs pointer-events-none">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Acidity (pH Level)
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="14"
                value={formData.ph ?? ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ph: e.target.value === '' ? null : parseFloat(e.target.value)
                  })
                }
                placeholder="e.g., 6.0"
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
              />
            </div>

            {isRespiringCategory && (
              <div>
                <label className="block text-xs font-semibold text-[#202B38] mb-1">
                  Respiration Rate (mg CO₂ / kg·h)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={formData.respiration_rate ?? ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        respiration_rate: e.target.value === '' ? null : parseFloat(e.target.value)
                      })
                    }
                    placeholder="e.g., 25.0"
                    className="w-full bg-white border border-[#D8E1EA] rounded-md pl-3 pr-20 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                  />
                  <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5E6B78] text-[10px] pointer-events-none">
                    mg CO₂/kg·h
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SECTION B: Storage and Environmental Conditions */}
        <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D8E1EA] pb-2.5">
            <span className="w-5 h-5 rounded bg-[#245A81] text-white text-xs font-bold flex items-center justify-center">
              B
            </span>
            <h2 className="font-bold text-xs text-[#17365D] uppercase tracking-wide">
              Storage & Environmental Conditions
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Storage Regime
              </label>
              <select
                value={formData.storage_type}
                onChange={(e) => setFormData({ ...formData, storage_type: e.target.value })}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all capitalize"
              >
                <option value="ambient">Ambient (15°C – 30°C)</option>
                <option value="chilled">Chilled / Refrigerated (0°C – 8°C)</option>
                <option value="frozen">Frozen (&lt; -18°C)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Storage Temperature (°C) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  required
                  value={formData.storage_temp_c}
                  onChange={(e) => setFormData({ ...formData, storage_temp_c: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-[#D8E1EA] rounded-md pl-3 pr-8 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6B78] text-xs pointer-events-none">
                  °C
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Relative Humidity (%)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={formData.relative_humidity_pct}
                  onChange={(e) => setFormData({ ...formData, relative_humidity_pct: parseFloat(e.target.value) })}
                  className="w-full bg-white border border-[#D8E1EA] rounded-md pl-3 pr-8 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#5E6B78] text-xs pointer-events-none">
                  %
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Target Shelf Life (Days) <span className="text-red-600">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="1095"
                  required
                  value={formData.target_shelf_life_days}
                  onChange={(e) => setFormData({ ...formData, target_shelf_life_days: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-white border border-[#D8E1EA] rounded-md pl-3 pr-12 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
                />
                <span className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#5E6B78] text-xs pointer-events-none">
                  days
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Transportation Conditions
              </label>
              <select
                value={formData.transport_condition}
                onChange={(e) => setFormData({ ...formData, transport_condition: e.target.value })}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all capitalize"
              >
                <option value="normal">Normal / Standard Logistics</option>
                <option value="refrigerated">Cold Chain / Insulated Reefer</option>
                <option value="rough">Rough / Rural Road Transit</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION C: Budget and Sustainability Preferences */}
        <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-[#D8E1EA] pb-2.5">
            <span className="w-5 h-5 rounded bg-[#16834A] text-white text-xs font-bold flex items-center justify-center">
              C
            </span>
            <h2 className="font-bold text-xs text-[#17365D] uppercase tracking-wide">
              Budget & Sustainability Preferences
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Packaging Format
              </label>
              <select
                value={formData.package_format}
                onChange={(e) => setFormData({ ...formData, package_format: e.target.value })}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all capitalize"
              >
                <option value="pouch">Flexible Pouch / Pillow Bag</option>
                <option value="standup_pouch">Stand-up Barrier Pouch</option>
                <option value="tray_lidded">Rigid Tray with Lidding Film</option>
                <option value="vacuum_skin">Vacuum Skin Packaging (VSP)</option>
                <option value="bottle">Bottle / Jar Container</option>
                <option value="carton">Aseptic Carton / Brick</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Cost Tier Preference
              </label>
              <select
                value={formData.cost_tier}
                onChange={(e) => setFormData({ ...formData, cost_tier: e.target.value })}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all capitalize"
              >
                <option value="economy">Economy (Lowest Unit Cost)</option>
                <option value="balanced">Balanced Cost & Performance</option>
                <option value="premium">Premium Barrier (High Protection)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#202B38] mb-1">
                Sustainability Priority
              </label>
              <select
                value={formData.sustainability_priority}
                onChange={(e) => setFormData({ ...formData, sustainability_priority: e.target.value })}
                className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all capitalize"
              >
                <option value="standard">Standard Conventional Polymers</option>
                <option value="medium">Recyclable Monomaterial Priority</option>
                <option value="high_biodegradable">Bio-based / Compostable Priority</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#202B38] mb-1">
              Additional Engineering Notes (Optional)
            </label>
            <input
              type="text"
              value={formData.user_notes || ''}
              onChange={(e) => setFormData({ ...formData, user_notes: e.target.value })}
              placeholder="e.g., Sensitive to lipid oxidation; requires nitrogen flushing capability"
              className="w-full bg-white border border-[#D8E1EA] rounded-md px-3 py-1.5 text-xs text-[#202B38] focus:border-[#245A81] focus:ring-1 focus:ring-[#245A81] transition-all"
            />
          </div>
        </div>

        {/* Form Submission Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="px-4 py-2 rounded-md bg-white hover:bg-[#F4F7FA] text-[#17365D] border border-[#D8E1EA] text-xs font-semibold transition-colors cursor-pointer"
          >
            Reset Fields
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 rounded-md bg-[#16834A] hover:bg-[#136f3e] disabled:opacity-60 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Evaluating ASTM Barrier Models...</span>
              </>
            ) : (
              <>
                <FlaskConical className="w-4 h-4" />
                <span>Generate Recommendation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
