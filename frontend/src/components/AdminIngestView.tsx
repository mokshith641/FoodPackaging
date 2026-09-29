import React, { useState, useEffect } from 'react';
import {
  Database,
  FileText,
  Upload,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ExternalLink,
  BookOpen,
  Layers,
  ArrowRight
} from 'lucide-react';
import { api } from '../services/api';
import { QdrantStatusResponse } from '../types/api';

export const AdminIngestView: React.FC = () => {
  const [statusInfo, setStatusInfo] = useState<QdrantStatusResponse | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [docType, setDocType] = useState('academic_research');
  const [pageNumber, setPageNumber] = useState<number | ''>('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Semantic search test
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadStatus();
  }, []);

  const loadStatus = async () => {
    try {
      const res = await api.getQdrantStatus();
      setStatusInfo(res);
    } catch (err: any) {
      console.error('Failed to load Qdrant status:', err);
    }
  };

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const res = await api.ingestDocument({
        title,
        content,
        source_url: sourceUrl || undefined,
        doc_type: docType,
        page_number: pageNumber === '' ? null : Number(pageNumber)
      });
      setSuccessMessage(`Successfully ingested "${title}" (${res.chunks_ingested} chunk vectors indexed).`);
      setTitle('');
      setContent('');
      setSourceUrl('');
      setPageNumber('');
      loadStatus();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to ingest document into Qdrant.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.searchVectorCorpus(searchQuery, 3);
      setSearchResults(res.results || []);
    } catch (err: any) {
      console.error('Vector search test error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">
              Qdrant Vector Database & Literature Ingestion
            </h1>
            <p className="text-xs text-slate-500">
              Manage scientific food packaging papers, ASTM standards, and barrier reference embeddings.
            </p>
          </div>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Qdrant Status: {statusInfo?.status || 'Online'}</span>
        </span>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Collection Name</div>
          <div className="text-sm font-bold font-mono text-slate-900 mt-1">
            {statusInfo?.collection_name || 'food_packaging_corpus'}
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Embedding Model</div>
          <div className="text-sm font-bold text-slate-900 mt-1">
            {statusInfo?.embedding_model || 'bge-small-en-v1.5'} ({statusInfo?.embedding_dim || 384}d)
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Indexed Points / Chunks</div>
          <div className="text-sm font-bold text-emerald-700 mt-1">
            {statusInfo?.points_count !== undefined ? `${statusInfo.points_count} Vectors` : 'Indexed'}
          </div>
        </div>
      </div>

      {/* Ingestion Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Upload className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-sm text-slate-900">
            Ingest Packaging Research Document / Technical Reference
          </h2>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleIngest} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Document / Study Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., ASTM F1249 WVTR Modulated Infrared Sensor Analysis"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Document Classification
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-600"
              >
                <option value="academic_research">Academic Peer-Reviewed Paper</option>
                <option value="industry_standard">ASTM / ISO Technical Standard</option>
                <option value="datasheet">Commercial Barrier Film Datasheet</option>
                <option value="government_guide">USDA / FAO Regulatory Guideline</option>
                <option value="sustainability_report">Circularity & Life-Cycle Report</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Source URL or DOI (Optional)
              </label>
              <input
                type="url"
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://doi.org/10.1016/..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Page / Section Number (Optional)
              </label>
              <input
                type="number"
                value={pageNumber}
                onChange={(e) => setPageNumber(e.target.value ? parseInt(e.target.value) : '')}
                placeholder="e.g., 4"
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Document Text Content <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Paste research text, barrier kinetics findings, gas permeability equations, or shelf-life experimental data..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 font-mono text-[11px]"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Embedding & Upserting Vectors...</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                <span>Ingest Document into Qdrant</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Semantic Search Test */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Search className="w-4 h-4 text-emerald-600" />
          <h2 className="font-bold text-sm text-slate-900">
            Test Semantic Retrieval on Indexed Corpus
          </h2>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleTestSearch()}
            placeholder="e.g. potato chips lipid oxidation, strawberry MAP equilibrium..."
            className="flex-1 bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
          />
          <button
            onClick={handleTestSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="text-xs font-semibold text-slate-700">Top Retrieved Vector Chunks:</div>
            {searchResults.map((r, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{r.document_title}</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-mono text-[10px] font-semibold border border-emerald-200">
                    Score: {r.score}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-3">
                  {r.content}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
