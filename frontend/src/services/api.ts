import {
  FoodCommodity,
  PackagingMaterial,
  RecommendationRequest,
  RecommendationResponse,
  SavedRecommendationSummary,
  AIExplainRequest,
  AIExplainResponse,
  DataSource,
  DataQualityReport,
  SystemHealth,
} from '../types/api';

const API_BASE = '/api/v1';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },

  async getCommodities(params?: { category?: string; search?: string }): Promise<FoodCommodity[]> {
    const query = new URLSearchParams();
    if (params?.category) query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${API_BASE}/commodities?${query.toString()}`);
    return handleResponse<FoodCommodity[]>(res);
  },

  async getCommodityById(id: number): Promise<FoodCommodity> {
    const res = await fetch(`${API_BASE}/commodities/${id}`);
    return handleResponse<FoodCommodity>(res);
  },

  async getMaterials(params?: {
    polymer_family?: string;
    gas_barrier_class?: string;
    recyclability?: string;
    search?: string;
  }): Promise<PackagingMaterial[]> {
    const query = new URLSearchParams();
    if (params?.polymer_family) query.append('polymer_family', params.polymer_family);
    if (params?.gas_barrier_class) query.append('gas_barrier_class', params.gas_barrier_class);
    if (params?.recyclability) query.append('recyclability', params.recyclability);
    if (params?.search) query.append('search', params.search);
    const res = await fetch(`${API_BASE}/materials?${query.toString()}`);
    return handleResponse<PackagingMaterial[]>(res);
  },

  async getMaterialById(id: number): Promise<PackagingMaterial> {
    const res = await fetch(`${API_BASE}/materials/${id}`);
    return handleResponse<PackagingMaterial>(res);
  },

  async createRecommendation(data: RecommendationRequest): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<RecommendationResponse>(res);
  },

  async getSavedRecommendations(): Promise<SavedRecommendationSummary[]> {
    const res = await fetch(`${API_BASE}/recommendations`);
    return handleResponse<SavedRecommendationSummary[]>(res);
  },

  async getRecommendationById(id: number): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/recommendations/${id}`);
    return handleResponse<RecommendationResponse>(res);
  },

  async deleteRecommendation(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/recommendations/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ status: string; message: string }>(res);
  },

  async explainRecommendation(data: AIExplainRequest): Promise<AIExplainResponse> {
    const res = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<AIExplainResponse>(res);
  },

  async getDataSources(): Promise<DataSource[]> {
    const res = await fetch(`${API_BASE}/sources`);
    return handleResponse<DataSource[]>(res);
  },

  async getDataQualityReport(): Promise<DataQualityReport> {
    const res = await fetch(`${API_BASE}/sources/report`);
    return handleResponse<DataQualityReport>(res);
  },
};
