import React, { useState } from 'react';
import {
  BookmarkCheck,
  Trash2,
  Clock,
  FlaskConical,
  Search,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { SavedRecommendationSummary, User } from '../types/api';

interface SavedHistoryViewProps {
  savedRecs: SavedRecommendationSummary[];
  currentUser: User | null;
  onOpenAuthModal: () => void;
  onViewRecommendation: (id: number) => void;
  onDeleteRecommendation: (id: number) => Promise<void>;
  onNewEvaluation: () => void;
}

export const SavedHistoryView: React.FC<SavedHistoryViewProps> = ({
  savedRecs,
  currentUser,
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
    <div className="space-y-4 animate-govFadeIn text-[#202B38]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-[#5E6B78]">
        <span className="font-semibold text-[#17365D]">Portal</span>
        <span>/</span>
        <span>My Saved Recommendations</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#17365D] tracking-tight">
            {currentUser ? `${currentUser.name}'s Saved Evaluations` : 'My Recommendations'}
          </h1>
          <p className="text-xs text-[#5E6B78] mt-0.5">
            Private packaging evaluations saved to your personal account in PostgreSQL.
          </p>
        </div>

        <button
          onClick={onNewEvaluation}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-[#16834A] hover:bg-[#136f3e] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>New Recommendation</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white rounded-lg p-3 border border-[#D8E1EA] shadow-xs flex items-center gap-2.5">
        <Search className="w-4 h-4 text-[#5E6B78]" />
        <input
          type="text"
          placeholder="Filter saved evaluations by commodity, category, or recommended structure..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-[#202B38] placeholder-slate-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-[#5E6B78] hover:text-[#17365D] cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg border border-[#D8E1EA] shadow-xs overflow-hidden">
        {filteredRecs.length === 0 ? (
          <div className="text-center py-12 text-[#5E6B78] space-y-2.5">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-medium">No saved recommendation records found.</p>
            <button
              onClick={onNewEvaluation}
              className="px-3.5 py-1.5 rounded-md bg-[#F4F7FA] text-[#17365D] border border-[#D8E1EA] text-xs font-semibold hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Run an evaluation now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-[#F4F7FA] text-[#17365D] border-b border-[#D8E1EA]">
                <tr>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">ID & Date</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Commodity</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Category</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Storage & Temp</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Target Life</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Top Recommended Structure</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px]">Score</th>
                  <th className="p-3 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1EA] text-[#202B38]">
                {filteredRecs.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onViewRecommendation(r.id)}
                    className="hover:bg-[#F4F7FA] transition-colors cursor-pointer group"
                  >
                    <td className="p-3 font-mono text-[#5E6B78] text-[11px]">
                      <div>#{r.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-3 font-bold text-[#17365D] group-hover:underline">
                      {r.commodity_name}
                    </td>
                    <td className="p-3 text-[#5E6B78] capitalize">
                      {r.commodity_category.replace(/_/g, ' ')}
                    </td>
                    <td className="p-3">
                      <span className="capitalize">{r.storage_type}</span> ({r.storage_temp_c}°C)
                    </td>
                    <td className="p-3">{r.target_shelf_life_days} days</td>
                    <td className="p-3 text-[#16834A] font-semibold">
                      {r.top_material_name || 'Evaluated'}
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#16834A] font-bold text-xs border border-emerald-200">
                        {r.top_score ? `${r.top_score}/100` : '--'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onViewRecommendation(r.id)}
                          className="px-2 py-1 rounded bg-[#F4F7FA] hover:bg-slate-200 text-[#17365D] border border-[#D8E1EA] text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(r.id, e)}
                          disabled={deletingId === r.id}
                          className="p-1 rounded hover:bg-red-50 text-[#5E6B78] hover:text-red-600 transition-colors cursor-pointer"
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
