export interface FoodCommodity {
  id: number;
  commodity_code: string;
  name: string;
  category: string;
  moisture_pct?: number | null;
  fat_pct?: number | null;
  ph?: number | null;
  water_activity?: number | null;
  is_respiring: boolean;
  resp_rate_mg_co2_kg_h?: number | null;
  resp_q10?: number | null;
  resp_class?: string | null;
  ethylene_sensitive: boolean;
  optimal_temp_c?: number | null;
  optimal_rh_pct?: number | null;
  optimal_o2_min?: number | null;
  optimal_o2_max?: number | null;
  optimal_co2_min?: number | null;
  optimal_co2_max?: number | null;
  base_shelf_life_days?: number | null;
  shelf_life_q10?: number | null;
  o2_sensitivity: number;
  moisture_sensitivity: number;
  light_sensitive: boolean;
  moisture_limit_pct?: number | null;
  default_storage_type: string;
  data_confidence: string;
  provenance_notes?: string | null;
  provenance_source_id?: number | null;
}

export interface MaterialSpecification {
  id: number;
  property_name: string;
  property_value?: number | null;
  property_value_text?: string | null;
  unit: string;
  test_standard?: string | null;
  test_temp_c?: number | null;
  test_rh_pct?: number | null;
  is_measured: boolean;
  notes?: string | null;
}

export interface PackagingMaterial {
  id: number;
  material_code: string;
  name: string;
  structure: string;
  polymer_family: string;
  ref_thickness_um: number;
  thickness_min_um?: number | null;
  thickness_max_um?: number | null;
  thickness_scalable: boolean;
  otr_ref: number;
  wvtr_ref: number;
  o2_permeability?: number | null;
  wv_permeability?: number | null;
  co2_to_o2_ratio: number;
  density_g_cc?: number | null;
  tensile_strength_mpa?: number | null;
  heat_seal_temp_c?: number | null;
  sealability: string;
  standalone_pack_ok: boolean;
  transparency: string;
  light_barrier: boolean;
  low_temp_ok: boolean;
  gas_barrier_class: string;
  is_breathable: boolean;
  recyclability: string;
  is_biodegradable: boolean;
  cost_inr_per_kg?: number | null;
  co2e_kg_per_kg?: number | null;
  sustainability_score?: number | null;
  food_contact_approved: boolean;
  notes?: string | null;
  verification_status: string;
  source_url?: string | null;
  specifications: MaterialSpecification[];
}

export interface RecommendationRequest {
  commodity_id?: number | null;
  commodity_name: string;
  commodity_category: string;
  moisture_content_pct?: number | null;
  fat_content_pct?: number | null;
  ph?: number | null;
  respiration_rate?: number | null;
  respiration_rate_unit?: string;
  target_shelf_life_days: number;
  storage_type: string;
  storage_temp_c: number;
  relative_humidity_pct: number;
  transport_condition: string;
  cost_tier: string;
  sustainability_priority: string;
  product_state: string;
  package_format?: string;
  user_notes?: string | null;
}

export interface ScoreBreakdown {
  moisture_score: number;
  oxygen_score: number;
  temp_score: number;
  mechanical_score: number;
  cost_score: number;
  sustainability_score: number;
  weights_applied: Record<string, number>;
}

export interface CandidateMaterialResult {
  material_id: number;
  material_code: string;
  material_name: string;
  structure: string;
  polymer_family: string;
  rank: number;
  total_score: number;
  score_breakdown: ScoreBreakdown;
  compatibility_verdict: string;
  reasons_for_ranking: string[];
  warnings: string[];
  trade_offs: string[];
  technical_specifications: Record<string, any>;
  source_url?: string | null;
  verification_status: string;
  experimental_shelf_life_min_days?: number | null;
  experimental_shelf_life_max_days?: number | null;
  shelf_life_estimation_notes?: string | null;
}

export interface RejectedCandidate {
  material_id: number;
  material_code: string;
  material_name: string;
  rejection_reason: string;
  violated_constraints: string[];
}

export interface RecommendationResponse {
  id?: number | null;
  commodity_name: string;
  commodity_category: string;
  timestamp: string;
  inputs: RecommendationRequest;
  ranked_candidates: CandidateMaterialResult[];
  rejected_candidates: RejectedCandidate[];
  missing_critical_inputs: string[];
  uncertainties: string[];
  engineering_disclaimer: string;
  ai_explanation?: string | null;
  ai_model_used?: string | null;
}

export interface SavedRecommendationSummary {
  id: number;
  commodity_name: string;
  commodity_category: string;
  target_shelf_life_days: number;
  storage_type: string;
  storage_temp_c: number;
  top_material_name?: string | null;
  top_score?: number | null;
  created_at: string;
}

export interface AIExplainRequest {
  recommendation_id?: number | null;
  commodity_name: string;
  commodity_category: string;
  inputs: RecommendationRequest;
  top_candidates: CandidateMaterialResult[];
}

export interface AIExplainResponse {
  explanation: string;
  provider: string;
  model_name: string;
  generated_at: string;
  is_fallback: boolean;
  status_message?: string | null;
}

export interface DataSource {
  id: number;
  source_name: string;
  source_type: string;
  organization: string;
  url?: string | null;
  license?: string | null;
  description?: string | null;
  verification_date?: string | null;
  data_quality_notes?: string | null;
}

export interface MissingFieldStat {
  field_name: string;
  missing_count: number;
  total_count: number;
  percentage_missing: number;
}

export interface DataQualityReport {
  total_commodities: number;
  total_materials: number;
  total_sources: number;
  verified_materials_count: number;
  unverified_materials_count: number;
  commodity_missing_fields: MissingFieldStat[];
  material_missing_fields: MissingFieldStat[];
  provenance_summary: Array<{
    source_name: string;
    organization: string;
    type: string;
    url?: string;
  }>;
  data_integrity_score: number;
  notes: string;
}

export interface SystemHealth {
  status: string;
  service: string;
  version: string;
  database: {
    status: string;
    commodities_count: number;
    materials_count: number;
  };
  ai_service: {
    groq_configured: boolean;
    groq_model: string;
    fallback_available: boolean;
  };
}
