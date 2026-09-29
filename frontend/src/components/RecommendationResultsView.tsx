import React, { useState } from 'react';
import {
  Sparkles,
  Award,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Info,
  Layers,
  Scale,
  RotateCcw,
  ArrowRight,
  HelpCircle,
  Clock,
  Thermometer,
  Droplets,
  Zap,
  ExternalLink
} from 'lucide-react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
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
          generated_at: result.timestamp,
          is_fallback: false
        }
      : null
  );
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleGenerateAiExplanation = async () => {
    setIsAiLoading(true);
    setAiError(null);
    try {
      const response = await api.explainRecommendation({
        recommendation_id: result.id,
        commodity_name: result.commodity_name,
        commodity_category: result.commodity_category,
        inputs: result.inputs,
        top_candidates: result.ranked_candidates
      });
      setAiExplanation(response);
    } catch (err: any) {
      setAiError(err.message || 'Could not generate AI explanation.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Prepare radar chart data for top 3 candidates
  const radarMetrics = [
    { subject: 'Moisture Barrier', key: 'moisture_score' },
    { subject: 'Oxygen Barrier', key: 'oxygen_score' },
    { subject: 'Thermal Window', key: 'temp_score' },
    { subject: 'Mechanical & Seal', key: 'mechanical_score' },
    { subject: 'Cost Efficiency', key: 'cost_score' },
    { subject: 'Sustainability', key: 'sustainability_score' }
  ];

  const radarData = radarMetrics.map((m) => {
    const obj: any = { metric: m.subject };
    result.ranked_candidates.slice(0, 3).forEach((cand, idx) => {
      obj[`Cand${idx + 1}`] = (cand.score_breakdown as any)[m.key];
    });
    return obj;
  });

  const getVerdictBadge = (verdict: string) => {
    if (verdict.includes('Highly')) {
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    } else if (verdict.includes('Recommended')) {
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
    } else {
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400';
    if (score >= 65) return 'text-cyan-400';
    return 'text-amber-400';
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Executive Results Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold">
              Evaluation ID #{result.id || 'LIVE'}
            </span>
            <span className="text-xs text-slate-400">
              {new Date(result.timestamp).toLocaleDateString()} at{' '}
              {new Date(result.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <span>{result.commodity_name}</span>
            <span className="text-xs font-normal px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300">
              {result.commodity_category.replace(/_/g, ' ')}
            </span>
          </h1>

          <div className="flex flex-wrap gap-4 text-xs text-slate-300 pt-1">
            <div className="flex items-center gap-1.5 font-mono">
              <Clock className="w-3.5 h-3.5 text-indigo-400" /> Target: {result.inputs.target_shelf_life_days} days
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Thermometer className="w-3.5 h-3.5 text-cyan-400" /> {result.inputs.storage_type} ({result.inputs.storage_temp_c}°C)
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <Droplets className="w-3.5 h-3.5 text-teal-400" /> {result.inputs.relative_humidity_pct}% RH
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => onCompareMaterials(result.ranked_candidates.slice(0, 3).map((c) => c.material_code))}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            <Scale className="w-4 h-4 text-cyan-400" />
            <span>Compare Top 3 Side-by-Side</span>
          </button>
          <button
            onClick={onNewEvaluation}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New Evaluation</span>
          </button>
        </div>
      </div>

      {/* Uncertainty & Missing Inputs Banner */}
      {(result.missing_critical_inputs.length > 0 || result.uncertainties.length > 0) && (
        <div className="rounded-xl border border-amber-800/40 bg-amber-950/20 p-4 flex items-start gap-3 text-xs text-slate-300">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Data Completeness & Assumptions Note:</p>
            <p className="text-slate-400">
              {result.uncertainties.join(' ')} Critical fields identified as missing:{' '}
              <span className="font-mono text-amber-400">{result.missing_critical_inputs.join(', ')}</span>.
            </p>
          </div>
        </div>
      )}

      {/* Main Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Ranked Material Candidates Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2 uppercase tracking-wider">
              <Award className="w-4 h-4 text-emerald-400" /> Ranked Packaging Candidates
            </h2>
            <span className="text-xs text-slate-400">
              {result.ranked_candidates.length} candidate materials passed hard constraints
            </span>
          </div>

          <div className="space-y-4">
            {result.ranked_candidates.map((cand) => {
              const isSelected = selectedCandidate?.material_id === cand.material_id;
              return (
                <div
                  key={cand.material_id}
                  onClick={() => setSelectedCandidate(cand)}
                  className={`rounded-2xl p-5 transition-all cursor-pointer border ${
                    isSelected
                      ? 'glass-card-selected'
                      : 'glass-panel hover:border-slate-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm font-mono shadow-md ${
                          cand.rank === 1
                            ? 'bg-gradient-to-tr from-amber-400 to-yellow-600 text-slate-950 shadow-amber-500/20'
                            : cand.rank === 2
                            ? 'bg-slate-300 text-slate-950'
                            : cand.rank === 3
                            ? 'bg-amber-700 text-amber-100'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        #{cand.rank}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-100">{cand.material_name}</h3>
                          <span className="text-[11px] font-mono text-slate-400">({cand.material_code})</span>
                        </div>
                        <div className="text-xs text-slate-400">{cand.structure}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getVerdictBadge(cand.compatibility_verdict)}`}>
                        {cand.compatibility_verdict}
                      </span>
                      <div className="text-right">
                        <div className="text-[10px] uppercase tracking-wider text-slate-400 font-medium">Score</div>
                        <div className={`text-xl font-extrabold font-mono ${getScoreColor(cand.total_score)}`}>
                          {cand.total_score}<span className="text-xs text-slate-400 font-normal">/100</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Subscore Progress Bars Grid */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 my-3.5 pt-1 text-[11px]">
                    <div>
                      <div className="text-slate-400 truncate">Moisture</div>
                      <div className="font-mono font-bold text-slate-200">{cand.score_breakdown.moisture_score}</div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${cand.score_breakdown.moisture_score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Oxygen</div>
                      <div className="font-mono font-bold text-slate-200">{cand.score_breakdown.oxygen_score}</div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${cand.score_breakdown.oxygen_score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Thermal</div>
                      <div className="font-mono font-bold text-slate-200">{cand.score_breakdown.temp_score}</div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${cand.score_breakdown.temp_score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Mechanical</div>
                      <div className="font-mono font-bold text-slate-200">{cand.score_breakdown.mechanical_score}</div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cand.score_breakdown.mechanical_score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Cost</div>
                      <div className="font-mono font-bold text-slate-200">{cand.score_breakdown.cost_score}</div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${cand.score_breakdown.cost_score}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-400 truncate">Circularity</div>
                      <div className="font-mono font-bold text-slate-200">{cand.score_breakdown.sustainability_score}</div>
                      <div className="w-full h-1 bg-slate-800 rounded-full mt-1 overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${cand.score_breakdown.sustainability_score}%` }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Reasons & Key Warnings */}
                  <div className="space-y-1.5 pt-2 border-t border-slate-800/60 text-xs">
                    {cand.reasons_for_ranking.slice(0, 2).map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                    {cand.warnings.map((w, i) => (
                      <div key={i} className="flex items-center gap-2 text-amber-300 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{w}</span>
                      </div>
                    ))}
                  </div>

                  {/* Dual Unit Technical Specs Badge Bar */}
                  <div className="mt-3.5 pt-2 border-t border-slate-800/60 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      WVTR: <strong className="text-slate-200">{cand.technical_specifications.wvtr_g_m2_day}</strong> g/m²·d ({cand.technical_specifications.wvtr_g_100in2_day} g/100in²·d)
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      OTR: <strong className="text-slate-200">{cand.technical_specifications.otr_cc_m2_day_atm}</strong> cc/m²·d·atm
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Recyclability: <strong className="text-emerald-400">{cand.technical_specifications.recyclability?.replace('_', ' ')}</strong>
                    </span>
                    <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      Cost: ₹{cand.technical_specifications.cost_inr_per_kg || '--'}/kg
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Rejected Candidates Drawer */}
          {result.rejected_candidates.length > 0 && (
            <div className="glass-panel rounded-2xl p-5 border border-slate-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400" />
                  <h3 className="font-bold text-sm text-slate-200">
                    Constrained / Rejected Packaging Candidates ({result.rejected_candidates.length})
                  </h3>
                </div>
                <span className="text-xs text-slate-400">Filtered by hard constraint satisfaction</span>
              </div>

              <div className="space-y-2">
                {result.rejected_candidates.map((rej) => (
                  <div key={rej.material_id} className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-rose-300">{rej.material_name} ({rej.material_code})</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-900/40 text-rose-300">
                        {rej.violated_constraints[0] || 'Constraint Violated'}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{rej.rejection_reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Radar Comparison, Experimental Shelf-Life, AI Explainer */}
        <div className="space-y-6">
          {/* Radar Chart for Top Candidates */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800">
            <h3 className="font-bold text-sm text-slate-200 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" /> Multi-Criteria Radar Comparison
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#334155" />
                  <PolarAngleAxis dataKey="metric" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 9 }} />
                  <Radar name="#1 Candidate" dataKey="Cand1" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                  {result.ranked_candidates.length > 1 && (
                    <Radar name="#2 Candidate" dataKey="Cand2" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
                  )}
                  {result.ranked_candidates.length > 2 && (
                    <Radar name="#3 Candidate" dataKey="Cand3" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.15} />
                  )}
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#cbd5e1' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Experimental Shelf Life Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="font-bold text-sm text-slate-200">
                  Experimental Shelf-Life Estimation
                </h3>
              </div>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Kinetic Model
              </span>
            </div>

            {selectedCandidate?.experimental_shelf_life_min_days ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-center">
                <div className="text-xs text-slate-400">Estimated Longevity Range</div>
                <div className="text-3xl font-extrabold font-mono text-emerald-400">
                  {selectedCandidate.experimental_shelf_life_min_days} – {selectedCandidate.experimental_shelf_life_max_days} <span className="text-sm font-normal text-slate-400">days</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  vs Target: <strong className="text-slate-200">{result.inputs.target_shelf_life_days} days</strong>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400">
                Baseline kinetic data insufficient for numeric estimate. Real-time storage trials required.
              </div>
            )}

            <div className="p-3 rounded-lg bg-slate-900/70 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">Mandatory Validation Assays Required:</p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-400">
                <li>ASTM F88 / ASTM F2096 package seal hermeticity & bubble leak testing</li>
                <li>Microbial total viable count & yeast/mould challenge testing</li>
                <li>Accelerated shelf-life testing (ASLT) at temperature abuse regimes</li>
              </ul>
            </div>
          </div>

          {/* AI Explanation / Groq LLM Assistant */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <h3 className="font-bold text-sm text-slate-200">
                  Groq AI Packaging Scientist
                </h3>
              </div>
              {aiExplanation && (
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
                  {aiExplanation.is_fallback ? 'Deterministic Fallback' : aiExplanation.model_name}
                </span>
              )}
            </div>

            {!aiExplanation ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Generate a technical polymer science breakdown explaining the critical spoilage mechanisms, trade-offs, and validation steps for this candidate ranking.
                </p>
                <button
                  onClick={handleGenerateAiExplanation}
                  disabled={isAiLoading}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isAiLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                      <span>Consulting Groq LLM...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate AI Technical Analysis</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 max-h-96 overflow-y-auto space-y-3 leading-relaxed whitespace-pre-wrap font-sans">
                  {aiExplanation.explanation}
                </div>
                <button
                  onClick={handleGenerateAiExplanation}
                  disabled={isAiLoading}
                  className="w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium border border-slate-700 transition-colors"
                >
                  {isAiLoading ? 'Regenerating...' : 'Regenerate Analysis'}
                </button>
              </div>
            )}

            {aiError && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-800 text-rose-300 text-xs">
                {aiError}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mandatory Engineering Disclaimer Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          {result.engineering_disclaimer}
        </p>
      </div>
    </div>
  );
};
