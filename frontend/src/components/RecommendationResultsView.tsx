import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Scale,
  RotateCcw,
  Clock,
  Thermometer,
  Droplets,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer
} from 'recharts';
import {
  RecommendationResponse,
  CandidateMaterialResult,
  AIExplainResponse
} from '../types/api';
import { api } from '../services/api';

interface RecommendationResultsViewProps {
  result: RecommendationResponse;
  onNewEvaluation: () => void;
  onCompareMaterials: (materialCodes: string[]) => void;
}

export const RecommendationResultsView: React.FC<RecommendationResultsViewProps> = ({
  result,
  onNewEvaluation,
  onCompareMaterials
}) => {
  const [selectedCandidate, setSelectedCandidate] = useState<CandidateMaterialResult>(
    result.ranked_candidates[0] || null
  );
  const [aiExplanation, setAiExplanation] = useState<AIExplainResponse | null>(
    result.ai_explanation
      ? {
          explanation: result.ai_explanation,
          provider: result.ai_model_used || 'Groq AI',
          model_name: 'llama-3.3-70b-versatile',
          generated_at: new Date().toISOString(),
          is_fallback: false
        }
      : null
  );
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const topCandidate = result.ranked_candidates[0] || null;

  // Fetch or regenerate AI explanation
  const handleRequestAiExplanation = async () => {
    setIsLoadingAi(true);
    try {
      const res = await api.explainRecommendation({
        recommendation_id: result.id,
        commodity_name: result.commodity_name,
        commodity_category: result.commodity_category,
        inputs: result.inputs,
        top_candidates: result.ranked_candidates
      });
      setAiExplanation(res);
    } catch (err: any) {
      console.error('Failed to generate AI explanation:', err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Radar chart data for candidate comparison
  const radarData = selectedCandidate
    ? [
        { metric: 'Moisture Barrier', value: selectedCandidate.score_breakdown?.moisture_score ?? 80 },
        { metric: 'Oxygen Barrier', value: selectedCandidate.score_breakdown?.oxygen_score ?? 80 },
        { metric: 'Thermal Barrier', value: selectedCandidate.score_breakdown?.temp_score ?? 80 },
        { metric: 'Mechanical Strength', value: selectedCandidate.score_breakdown?.mechanical_score ?? 80 },
        { metric: 'Sustainability', value: selectedCandidate.score_breakdown?.sustainability_score ?? 80 },
        { metric: 'Cost Efficiency', value: selectedCandidate.score_breakdown?.cost_score ?? 80 }
      ]
    : [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Summary Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Award className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900">
              Packaging Recommendation: {result.commodity_name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-0.5">
            <span className="capitalize font-medium text-slate-700">
              Category: {result.commodity_category.replace(/_/g, ' ')}
            </span>
            <span>•</span>
            <span>Storage: <strong className="capitalize text-slate-700">{result.inputs?.storage_type || 'ambient'}</strong> ({result.inputs?.storage_temp_c ?? 25}°C)</span>
            <span>•</span>
            <span>Target Shelf Life: <strong className="text-slate-700">{result.inputs?.target_shelf_life_days ?? 90} days</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onCompareMaterials(result.ranked_candidates.slice(0, 3).map((c) => c.material_code))}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-slate-600" />
            <span>Compare Top 3</span>
          </button>

          <button
            onClick={onNewEvaluation}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Evaluation</span>
          </button>
        </div>
      </div>

      {/* Top Pick Highlight Card */}
      {topCandidate && (
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300">
                <Award className="w-3.5 h-3.5 text-emerald-700" /> Top Ranked Material (Rank #1)
              </div>
              <h2 className="text-2xl font-extrabold text-slate-900">
                {topCandidate.material_name}
              </h2>
              <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
                {topCandidate.reasons_for_ranking?.join(' • ') || topCandidate.compatibility_verdict}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
                <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                  <span className="text-slate-500">Polymer: </span>
                  <strong className="text-slate-800">{topCandidate.polymer_family}</strong>
                </div>
                {topCandidate.experimental_shelf_life_min_days && (
                  <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                    <span className="text-slate-500">Predicted Shelf Life: </span>
                    <strong className="text-emerald-700">
                      {topCandidate.experimental_shelf_life_min_days} - {topCandidate.experimental_shelf_life_max_days} days
                    </strong>
                  </div>
                )}
                <div className="bg-white px-3 py-1.5 rounded-lg border border-emerald-200 shadow-xs">
                  <span className="text-slate-500">Verdict: </span>
                  <strong className="text-emerald-700">
                    {topCandidate.compatibility_verdict}
                  </strong>
                </div>
              </div>
            </div>

            {/* Score Pill */}
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 text-center shrink-0 shadow-xs sm:w-44">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Overall Score</div>
              <div className="text-4xl font-black text-emerald-700 my-1">
                {topCandidate.total_score}
                <span className="text-sm font-semibold text-slate-400">/100</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium">
                High Compatibility
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Ranked Candidates (Left) & Detailed Analysis / Radar (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Ranked Candidates List */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Evaluated Packaging Candidates ({result.ranked_candidates.length})
            </h2>
            <span className="text-xs text-slate-500">Click a material to inspect properties</span>
          </div>

          <div className="space-y-3">
            {result.ranked_candidates.map((cand) => {
              const isSelected = selectedCandidate?.material_id === cand.material_id;
              return (
                <div
                  key={cand.material_id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/50 border-emerald-500 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          cand.rank === 1 ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {cand.rank}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900">
                          {cand.material_name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          {cand.material_code}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {cand.reasons_for_ranking?.slice(0, 2).join(' • ') || cand.compatibility_verdict}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px]">
                        <span className="text-slate-600 font-medium">
                          Moisture: <strong className="text-slate-900">{cand.score_breakdown?.moisture_score ?? 80}/100</strong>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">
                          Oxygen: <strong className="text-slate-900">{cand.score_breakdown?.oxygen_score ?? 80}/100</strong>
                        </span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-medium">
                          Sustainability: <strong className="text-slate-900">{cand.score_breakdown?.sustainability_score ?? 80}/100</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2.5 py-1 rounded-lg font-bold text-xs ${
                        cand.rank === 1
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {cand.total_score}/100
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Candidate Inspector & Radar Chart */}
        <div className="lg:col-span-5 space-y-6">
          {selectedCandidate && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide">
                  Candidate Evaluation Breakdown
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                  {selectedCandidate.material_name}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Polymer Family: {selectedCandidate.polymer_family}
                </p>
              </div>

              {/* Radar Chart */}
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#475569', fontSize: 10 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 9 }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#059669"
                      fill="#10b981"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">Moisture Barrier</div>
                  <div className="text-base font-bold text-slate-900">{selectedCandidate.score_breakdown?.moisture_score ?? 80}/100</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">Oxygen Barrier</div>
                  <div className="text-base font-bold text-slate-900">{selectedCandidate.score_breakdown?.oxygen_score ?? 80}/100</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">Sustainability</div>
                  <div className="text-base font-bold text-slate-900">{selectedCandidate.score_breakdown?.sustainability_score ?? 80}/100</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="text-[11px] text-slate-500">Cost Efficiency</div>
                  <div className="text-base font-bold text-slate-900">{selectedCandidate.score_breakdown?.cost_score ?? 80}/100</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Groq AI Technical Explanation Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">
              AI Technical Assessment & Packaging Rationale
            </h2>
          </div>
          <button
            onClick={handleRequestAiExplanation}
            disabled={isLoadingAi}
            className="flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingAi ? 'Analyzing...' : 'Refresh AI Analysis'}</span>
          </button>
        </div>

        {aiExplanation ? (
          <div className="bg-emerald-50/50 rounded-xl p-5 border border-emerald-200 text-xs text-slate-800 leading-relaxed space-y-3">
            <div className="whitespace-pre-line">{aiExplanation.explanation}</div>
            <div className="text-[10px] text-emerald-700 pt-2 border-t border-emerald-200/60 flex items-center justify-between">
              <span>Powered by Groq LLM ({aiExplanation.model_name || 'Llama 3.3 70B'})</span>
              <span>Deterministic Validation: ASTM & USDA Standards</span>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
            <Sparkles className="w-6 h-6 text-emerald-600 mx-auto" />
            <p className="text-xs text-slate-600">
              Generate a comprehensive Groq AI technical evaluation explaining the chemical compatibility, barrier mechanics, and degradation risks for this recommendation.
            </p>
            <button
              onClick={handleRequestAiExplanation}
              disabled={isLoadingAi}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              {isLoadingAi ? 'Generating Technical Report...' : 'Generate AI Technical Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
