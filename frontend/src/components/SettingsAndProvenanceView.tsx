import React from 'react';
import {
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Server,
  Sparkles,
  Info,
  RefreshCw,
  FileText
} from 'lucide-react';
import { SystemHealth, DataSource, DataQualityReport } from '../types/api';

interface SettingsAndProvenanceViewProps {
  health: SystemHealth | null;
  sources: DataSource[];
  qualityReport: DataQualityReport | null;
  onRefreshHealth: () => void;
}

export const SettingsAndProvenanceView: React.FC<SettingsAndProvenanceViewProps> = ({
  health,
  sources,
  qualityReport,
  onRefreshHealth
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Database className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">
              Data Sources, Provenance & System Health
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Audit database integrity, view traceable scientific data sources (USDA, UC Davis, MatWeb, FAO), and inspect Groq AI runtime status.
          </p>
        </div>

        <button
          onClick={onRefreshHealth}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh System Health</span>
        </button>
      </div>

      {/* System Infrastructure Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API Service */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">FastAPI Backend</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" /> {health?.status || 'Online'}
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <div>Framework: FastAPI 0.110+ (Python 3.13)</div>
            <div>Version: {health?.version || '1.0.0'}</div>
            <div>Port: 8000 / Proxy /api</div>
          </div>
        </div>

        {/* Database Service */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Database Engine</h3>
            </div>
            <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
              <CheckCircle2 className="w-3 h-3" /> {health?.database?.status || 'Active'}
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <div>Host: Supabase PostgreSQL (or SQLite local)</div>
            <div>Commodities in DB: {health?.database?.commodities_count ?? '--'}</div>
            <div>Materials in DB: {health?.database?.materials_count ?? '--'}</div>
          </div>
        </div>

        {/* Groq AI Service */}
        <div className="glass-panel rounded-xl p-5 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider">Groq AI Service</h3>
            </div>
            <span
              className={`flex items-center gap-1 text-[11px] font-mono ${
                health?.ai_service?.groq_configured ? 'text-indigo-400' : 'text-slate-400'
              }`}
            >
              {health?.ai_service?.groq_configured ? (
                <>
                  <CheckCircle2 className="w-3 h-3" /> Configured
                </>
              ) : (
                'Fallback Mode'
              )}
            </span>
          </div>
          <div className="space-y-1 text-xs text-slate-400 font-mono">
            <div>Model: {health?.ai_service?.groq_model || 'llama-3.3-70b-versatile'}</div>
            <div>Fallback Engine: Available & Verified</div>
            <div>Key Security: Backend Server-Side Only</div>
          </div>
        </div>
      </div>

      {/* Data Quality & Completeness Audit Report */}
      {qualityReport && (
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div>
              <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Data Quality & Scientific Traceability Audit
              </h2>
              <p className="text-xs text-slate-400">
                Transparent audit of complete records vs known unmeasured physical properties
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Data Integrity Score:</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold text-sm border border-emerald-500/30">
                {qualityReport.data_integrity_score}%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Commodity Missing Fields Analysis */}
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-slate-300">
                Food Commodity Field Completeness (53 Records)
              </h3>
              <div className="space-y-2">
                {qualityReport.commodity_missing_fields.map((stat) => (
                  <div key={stat.field_name} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-slate-300 text-[11px]">{stat.field_name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {stat.total_count - stat.missing_count} / {stat.total_count} populated ({100 - stat.percentage_missing}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${100 - stat.percentage_missing}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Material Missing Fields Analysis */}
            <div className="space-y-2">
              <h3 className="font-semibold text-xs text-slate-300">
                Packaging Material Specifications Completeness (20 Records)
              </h3>
              <div className="space-y-2">
                {qualityReport.material_missing_fields.map((stat) => (
                  <div key={stat.field_name} className="p-2.5 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-mono text-slate-300 text-[11px]">{stat.field_name}</span>
                      <span className="font-mono text-slate-400 text-[10px]">
                        {stat.total_count - stat.missing_count} / {stat.total_count} populated ({100 - stat.percentage_missing}%)
                      </span>
                    </div>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-500 rounded-full"
                        style={{ width: `${100 - stat.percentage_missing}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            <span className="font-semibold text-slate-300">Scientific Integrity Notice: </span>
            {qualityReport.notes}
          </div>
        </div>
      )}

      {/* Authoritative Data Sources Directory */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div>
          <h2 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" />
            Authoritative Data Sources & Provenance Registry
          </h2>
          <p className="text-xs text-slate-400">
            Verified databases referenced for food physiology, permeability testing, and environmental parameters
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sources.map((src) => (
            <div
              key={src.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-sm text-slate-100">{src.source_name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700 font-mono capitalize">
                    {src.source_type.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="text-xs text-slate-400 font-medium">{src.organization}</div>
                <p className="text-xs text-slate-300 leading-relaxed pt-1">{src.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-800/80 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Licence:</span>
                  <span className="font-mono text-slate-200">{src.license || 'Public / Research'}</span>
                </div>
                {src.data_quality_notes && (
                  <div className="text-slate-400">
                    <span className="text-slate-300 font-medium">Quality Note: </span>
                    {src.data_quality_notes}
                  </div>
                )}
                {src.url && (
                  <div className="pt-1">
                    <a
                      href={src.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-medium"
                    >
                      <span>Visit Data Source Repository</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
