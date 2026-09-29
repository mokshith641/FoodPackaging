import {
  User,
  UserRegisterRequest,
  UserLoginRequest,
  TokenResponse,
  FoodCommodity,
  PackagingMaterial,
  RecommendationRequest,
  RecommendationResponse,
  SavedRecommendationSummary,
  AIExplainRequest,
  AIExplainResponse,
  ChatQueryRequest,
  ChatQueryResponse,
  DocumentIngestRequest,
  DocumentIngestResponse,
  QdrantStatusResponse,
  DataSource,
  SystemHealth,
} from '../types/api';

const BACKEND_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  ''
).trim().replace(/\/$/, '');

const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api/v1` : '/api/v1';

// Token Storage Utilities
const TOKEN_KEY = 'packsci_auth_token';
const USER_KEY = 'packsci_auth_user';

export const authStorage = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
  },
  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  getUser(): User | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser(user: User) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
};

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  const token = authStorage.getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errorDetail = 'API request failed';
    try {
      const err = await res.json();
      errorDetail = err.detail || JSON.stringify(err);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    if (res.status === 401) {
      // Session expired or invalid
      authStorage.removeToken();
    }
    throw new Error(errorDetail);
  }
  return res.json() as Promise<T>;
}

export const api = {
  // Authentication Endpoints
  async register(data: UserRegisterRequest): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<TokenResponse>(res);
    authStorage.setToken(result.access_token);
    authStorage.setUser(result.user);
    return result;
  },

  async login(data: UserLoginRequest): Promise<TokenResponse> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await handleResponse<TokenResponse>(res);
    authStorage.setToken(result.access_token);
    authStorage.setUser(result.user);
    return result;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const user = await handleResponse<User>(res);
    authStorage.setUser(user);
    return user;
  },

  async logout(): Promise<void> {
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
    } finally {
      authStorage.removeToken();
    }
  },

  // Health & System
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse<SystemHealth>(res);
  },

  // Commodities
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

  // Materials
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

  // Recommendations
  async createRecommendation(data: RecommendationRequest): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<RecommendationResponse>(res);
  },

  async getSavedRecommendations(): Promise<SavedRecommendationSummary[]> {
    const res = await fetch(`${API_BASE}/recommendations`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<SavedRecommendationSummary[]>(res);
  },

  async getRecommendationById(id: number): Promise<RecommendationResponse> {
    const res = await fetch(`${API_BASE}/recommendations/${id}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse<RecommendationResponse>(res);
  },

  async deleteRecommendation(id: number): Promise<{ status: string; message: string }> {
    const res = await fetch(`${API_BASE}/recommendations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    return handleResponse<{ status: string; message: string }>(res);
  },

  // Groq AI & RAG Assistant
  async chatAssistant(data: ChatQueryRequest): Promise<ChatQueryResponse> {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<ChatQueryResponse>(res);
  },

  async explainRecommendation(data: AIExplainRequest): Promise<AIExplainResponse> {
    const res = await fetch(`${API_BASE}/ai/explain`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<AIExplainResponse>(res);
  },

  // Qdrant Vector Corpus
  async getQdrantStatus(): Promise<QdrantStatusResponse> {
    const res = await fetch(`${API_BASE}/qdrant/status`);
    return handleResponse<QdrantStatusResponse>(res);
  },

  async ingestDocument(data: DocumentIngestRequest): Promise<DocumentIngestResponse> {
    const res = await fetch(`${API_BASE}/qdrant/ingest`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<DocumentIngestResponse>(res);
  },

  async searchVectorCorpus(query: string, topK: number = 4): Promise<any> {
    const params = new URLSearchParams({ query, top_k: topK.toString() });
    const res = await fetch(`${API_BASE}/qdrant/search?${params.toString()}`);
    return handleResponse<any>(res);
  },

  async getDataSources(): Promise<DataSource[]> {
    const res = await fetch(`${API_BASE}/sources`);
    return handleResponse<DataSource[]>(res);
  },
};
