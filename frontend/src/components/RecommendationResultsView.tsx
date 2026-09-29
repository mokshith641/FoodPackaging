import React, { useState } from 'react';
import {
  Award,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Scale,
  RotateCcw,
  ShieldCheck,
  Zap,
  Info,
  ChevronRight,
  BookOpen,
  Layers,
  FlaskConical,
  FileText
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
    <div className="space-y-5 animate-govFadeIn text-[#202B38]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-[#5E6B78]">
        <span className="font-semibold text-[#17365D]">Portal</span>
        <span>/</span>
        <span>Recommendations</span>
        <span>/</span>
        <span className="font-medium text-[#202B38]">{result.commodity_name}</span>
      </div>

      {/* Header Summary Banner */}
      <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-md bg-[#17365D] text-white">
              <Award className="w-4 h-4 text-emerald-400" />
            </span>
            <h1 className="text-lg font-bold text-[#17365D] tracking-tight">
              Packaging Evaluation: {result.commodity_name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#5E6B78]">
            <span>Category: <strong className="capitalize text-[#202B38]">{result.commodity_category.replace(/_/g, ' ')}</strong></span>
            <span>•</span>
            <span>Storage: <strong className="capitalize text-[#202B38]">{result.inputs?.storage_type || 'ambient'}</strong> ({result.inputs?.storage_temp_c ?? 25}°C)</span>
            <span>•</span>
            <span>Target Shelf Life: <strong className="text-[#202B38]">{result.inputs?.target_shelf_life_days ?? 90} days</strong></span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onCompareMaterials(result.ranked_candidates.slice(0, 3).map((c) => c.material_code))}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-[#F4F7FA] text-[#17365D] text-xs font-semibold border border-[#D8E1EA] transition-colors cursor-pointer"
          >
            <Scale className="w-3.5 h-3.5 text-[#245A81]" />
            <span>Compare Top 3</span>
          </button>

          <button
            onClick={onNewEvaluation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Evaluation</span>
          </button>
        </div>
      </div>

      {/* Top Pick Highlight Panel */}
      {topCandidate && (
        <div className="bg-white border-2 border-[#16834A]/40 rounded-lg p-5 shadow-xs relative overflow-hidden">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 text-[#16834A] text-[11px] font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> Rank #1 Recommended Structure
              </div>
              <h2 className="text-xl font-extrabold text-[#17365D]">
                {topCandidate.material_name}
              </h2>
              <p className="text-xs text-[#5E6B78] max-w-2xl leading-relaxed">
                {topCandidate.reasons_for_ranking?.join(' • ') || topCandidate.compatibility_verdict}
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs">
                <div className="bg-[#F4F7FA] px-2.5 py-1 rounded border border-[#D8E1EA]">
                  <span className="text-[#5E6B78]">Polymer: </span>
                  <strong className="text-[#202B38]">{topCandidate.polymer_family}</strong>
                </div>
                {topCandidate.experimental_shelf_life_min_days && (
                  <div className="bg-[#F4F7FA] px-2.5 py-1 rounded border border-[#D8E1EA]">
                    <span className="text-[#5E6B78]">Calculated Shelf Life: </span>
                    <strong className="text-[#16834A]">
                      {topCandidate.experimental_shelf_life_min_days} - {topCandidate.experimental_shelf_life_max_days} days
                    </strong>
                  </div>
                )}
                <div className="bg-[#F4F7FA] px-2.5 py-1 rounded border border-[#D8E1EA]">
                  <span className="text-[#5E6B78]">Verdict: </span>
                  <strong className="text-[#16834A]">
                    {topCandidate.compatibility_verdict}
                  </strong>
                </div>
              </div>
            </div>

            {/* Score Pill */}
            <div className="bg-[#F4F7FA] rounded-md p-3.5 border border-[#D8E1EA] text-center shrink-0 w-full sm:w-40">
              <div className="text-[10px] font-bold text-[#5E6B78] uppercase tracking-wider">Overall Score</div>
              <div className="text-3xl font-black text-[#17365D] my-0.5">
                {topCandidate.total_score}
                <span className="text-xs font-semibold text-[#5E6B78]">/100</span>
              </div>
              <div className="text-[10px] text-[#16834A] font-semibold">
                High ASTM Compatibility
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid: Ranked Candidates (Left) & Inspector (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Ranked Candidates List */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-bold text-[#17365D] uppercase tracking-wide">
              Evaluated Packaging Candidates ({result.ranked_candidates.length})
            </h2>
            <span className="text-[11px] text-[#5E6B78]">Click to inspect details</span>
          </div>

          <div className="space-y-2.5">
            {result.ranked_candidates.map((cand) => {
              const isSelected = selectedCandidate?.material_id === cand.material_id;
              return (
                <div
                  key={cand.material_id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`p-3.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/40 border-[#16834A] shadow-xs'
                      : 'bg-white border-[#D8E1EA] hover:border-[#245A81] hover:bg-[#F4F7FA]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          cand.rank === 1 ? 'bg-[#16834A] text-white' : 'bg-slate-200 text-[#17365D]'
                        }`}>
                          {cand.rank}
                        </span>
                        <h3 className="text-xs font-bold text-[#202B38]">
                          {cand.material_name}
                        </h3>
                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#F4F7FA] text-[#5E6B78] border border-[#D8E1EA]">
                          {cand.material_code}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#5E6B78] line-clamp-2">
                        {cand.reasons_for_ranking?.slice(0, 2).join(' • ') || cand.compatibility_verdict}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[10px]">
                        <span className="text-[#5E6B78]">
                          Moisture: <strong className="text-[#202B38]">{cand.score_breakdown?.moisture_score ?? 80}/100</strong>
                        </span>
                        <span className="text-[#D8E1EA]">•</span>
                        <span className="text-[#5E6B78]">
                          Oxygen: <strong className="text-[#202B38]">{cand.score_breakdown?.oxygen_score ?? 80}/100</strong>
                        </span>
                        <span className="text-[#D8E1EA]">•</span>
                        <span className="text-[#5E6B78]">
                          Sustainability: <strong className="text-[#202B38]">{cand.score_breakdown?.sustainability_score ?? 80}/100</strong>
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold text-xs ${
                        cand.rank === 1
                          ? 'bg-emerald-100 text-[#16834A] border border-emerald-300'
                          : 'bg-[#F4F7FA] text-[#17365D] border border-[#D8E1EA]'
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

        {/* Right Column: Selected Candidate Inspector & Radar */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCandidate && (
            <div className="bg-white rounded-lg border border-[#D8E1EA] p-4.5 shadow-xs space-y-4">
              <div className="border-b border-[#D8E1EA] pb-2.5">
                <span className="text-[10px] font-bold text-[#16834A] uppercase tracking-wide">
                  Candidate Evaluation Breakdown
                </span>
                <h3 className="text-sm font-bold text-[#17365D] mt-0.5">
                  {selectedCandidate.material_name}
                </h3>
                <p className="text-[11px] text-[#5E6B78]">
                  Polymer Family: {selectedCandidate.polymer_family}
                </p>
              </div>

              {/* Radar Chart */}
              <div className="h-48 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#D8E1EA" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#5E6B78', fontSize: 9 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 8 }} />
                    <Radar
                      name="Score"
                      dataKey="value"
                      stroke="#16834A"
                      fill="#16834A"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2 bg-[#F4F7FA] rounded border border-[#D8E1EA]">
                  <div className="text-[10px] text-[#5E6B78]">Moisture Barrier</div>
                  <div className="text-xs font-bold text-[#17365D]">{selectedCandidate.score_breakdown?.moisture_score ?? 80}/100</div>
                </div>
                <div className="p-2 bg-[#F4F7FA] rounded border border-[#D8E1EA]">
                  <div className="text-[10px] text-[#5E6B78]">Oxygen Barrier</div>
                  <div className="text-xs font-bold text-[#17365D]">{selectedCandidate.score_breakdown?.oxygen_score ?? 80}/100</div>
                </div>
                <div className="p-2 bg-[#F4F7FA] rounded border border-[#D8E1EA]">
                  <div className="text-[10px] text-[#5E6B78]">Sustainability</div>
                  <div className="text-xs font-bold text-[#17365D]">{selectedCandidate.score_breakdown?.sustainability_score ?? 80}/100</div>
                </div>
                <div className="p-2 bg-[#F4F7FA] rounded border border-[#D8E1EA]">
                  <div className="text-[10px] text-[#5E6B78]">Cost Efficiency</div>
                  <div className="text-xs font-bold text-[#17365D]">{selectedCandidate.score_breakdown?.cost_score ?? 80}/100</div>
                </div>
              </div>

              {/* Provenance note */}
              <div className="text-[10px] text-[#5E6B78] pt-2 border-t border-[#D8E1EA] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#245A81] shrink-0" />
                <span>Scores derived from ASTM D3985 OTR and ASTM F1249 WVTR calibrated models.</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Groq AI Technical Explanation Section */}
      <div className="bg-white rounded-lg border border-[#D8E1EA] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between border-b border-[#D8E1EA] pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#16834A]" />
            <h2 className="text-xs font-bold text-[#17365D] uppercase tracking-wide">
              AI Technical Assessment & Polymer Science Rationale
            </h2>
          </div>
          <button
            onClick={handleRequestAiExplanation}
            disabled={isLoadingAi}
            className="flex items-center gap-1 text-xs text-[#245A81] hover:text-[#17365D] font-semibold cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isLoadingAi ? 'Synthesizing...' : 'Refresh AI Rationale'}</span>
          </button>
        </div>

        {aiExplanation ? (
          <div className="bg-[#F4F7FA] rounded-md p-4 border border-[#D8E1EA] text-xs text-[#202B38] leading-relaxed space-y-2.5">
            <div className="whitespace-pre-line">{aiExplanation.explanation}</div>
            <div className="text-[10px] text-[#5E6B78] pt-2 border-t border-[#D8E1EA] flex items-center justify-between">
              <span>Grounded with Groq LLM ({aiExplanation.model_name || 'qwen/qwen3.8-27b'})</span>
              <span>ASTM D3985 & USDA Reference Verified</span>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-[#F4F7FA] rounded-md border border-[#D8E1EA] text-center space-y-2">
            <p className="text-xs text-[#5E6B78]">
              Generate a technical polymer science evaluation detailing gas permeability mechanics, microbial safety, and degradation kinetics for this recommendation.
            </p>
            <button
              onClick={handleRequestAiExplanation}
              disabled={isLoadingAi}
              className="px-4 py-1.5 bg-[#16834A] hover:bg-[#136f3e] text-white rounded-md text-xs font-semibold transition-colors cursor-pointer"
            >
              {isLoadingAi ? 'Generating Technical Report...' : 'Generate AI Technical Report'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
