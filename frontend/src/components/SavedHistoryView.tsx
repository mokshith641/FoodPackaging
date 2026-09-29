import React, { useState } from 'react';
import {
  History,
  Trash2,
  ExternalLink,
  Clock,
  FlaskConical,
  CheckCircle2,
  Search,
  ArrowRight
} from 'lucide-react';
import { SavedRecommendationSummary } from '../types/api';

interface SavedHistoryViewProps {
  savedRecs: SavedRecommendationSummary[];
  onViewRecommendation: (id: number) => void;
  onDeleteRecommendation: (id: number) => Promise<void>;
  onNewEvaluation: () => void;
}

export const SavedHistoryView: React.FC<SavedHistoryViewProps> = ({
  savedRecs,
  onViewRecommendation,
  onDeleteRecommendation,
  onNewEvaluation
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredRecs = savedRecs.filter((r) =>
    r.commodity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.commodity_category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.top_material_name && r.top_material_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete recommendation #${id}?`)) {
      setDeletingId(id);
      try {
        await onDeleteRecommendation(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Saved Recommendation History</h1>
          </div>
          <p className="text-xs text-slate-400">
            Historical evaluations persisted in PostgreSQL with complete candidate rankings, subscore breakdowns, and Groq AI explanations.
          </p>
        </div>

        <button
          onClick={onNewEvaluation}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
        >
          <FlaskConical className="w-4 h-4 stroke-[2.5]" />
          <span>New Recommendation</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Filter saved evaluations by commodity or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-slate-200"
          >
            Clear
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {filteredRecs.length === 0 ? (
          <div className="text-center py-12 text-slate-400 space-y-3">
            <Clock className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-xs">No saved recommendation analyses found.</p>
            <button
              onClick={onNewEvaluation}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/30 transition-colors"
            >
              Run an evaluation now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5 font-medium">ID & Timestamp</th>
                  <th className="p-3.5 font-medium">Commodity</th>
                  <th className="p-3.5 font-medium">Category</th>
                  <th className="p-3.5 font-medium">Storage & Temp</th>
                  <th className="p-3.5 font-medium">Shelf Life Target</th>
                  <th className="p-3.5 font-medium">Top Recommended Material</th>
                  <th className="p-3.5 font-medium">Score</th>
                  <th className="p-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRecs.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onViewRecommendation(r.id)}
                    className="hover:bg-slate-900/50 transition-colors cursor-pointer group"
                  >
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      <div>#{r.id}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(r.created_at).toLocaleDateString()} {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="p-3.5 font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                      {r.commodity_name}
                    </td>
                    <td className="p-3.5 text-slate-400 capitalize">
                      {r.commodity_category.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3.5 font-mono">
                      <span className="capitalize">{r.storage_type}</span> ({r.storage_temp_c}°C)
                    </td>
                    <td className="p-3.5 font-mono">{r.target_shelf_life_days} days</td>
                    <td className="p-3.5 text-emerald-400 font-medium">
                      {r.top_material_name || 'Evaluated'}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono text-[11px] font-bold border border-emerald-500/30">
                        {r.top_score ? `${r.top_score}/100` : '--'}
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onViewRecommendation(r.id)}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(r.id, e)}
                          disabled={deletingId === r.id}
                          className="p-1.5 rounded hover:bg-rose-950/60 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete recommendation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
