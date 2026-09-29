import React, { useState } from 'react';
import {
  BookmarkCheck,
  Trash2,
  Clock,
  FlaskConical,
  Search,
  ArrowRight,
  LogIn,
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
  onOpenAuthModal,
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
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            {currentUser ? `${currentUser.name}'s Recommendations` : 'My Saved Recommendations'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {currentUser
              ? 'Private packaging analyses saved to your personal account.'
              : 'View and manage your recent evaluated food packaging analyses.'}
          </p>
        </div>

        <button
          onClick={onNewEvaluation}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>New Recommendation</span>
        </button>
      </div>

      {/* Guest Notice if not logged in */}
      {!currentUser && (
        <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-900">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Sign in to automatically save evaluations to your account and keep a permanent history across devices.
            </span>
          </div>
          <button
            onClick={onOpenAuthModal}
            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In / Register</span>
          </button>
        </div>
      )}

      {/* Search Filter Bar */}
      <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search saved evaluations by food name, category, or recommended material..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent text-xs text-slate-900 placeholder-slate-400 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* History Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredRecs.length === 0 ? (
          <div className="text-center py-14 text-slate-500 space-y-3">
            <Clock className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-medium">No saved recommendations found.</p>
            <button
              onClick={onNewEvaluation}
              className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors"
            >
              Run an evaluation now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-4 font-semibold">ID & Date</th>
                  <th className="p-4 font-semibold">Commodity</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Storage & Temp</th>
                  <th className="p-4 font-semibold">Shelf Life Target</th>
                  <th className="p-4 font-semibold">Top Material</th>
                  <th className="p-4 font-semibold">Score</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredRecs.map((r) => (
                  <tr
                    key={r.id}
                    onClick={() => onViewRecommendation(r.id)}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="p-4 font-mono text-slate-500 text-[11px]">
                      <div>#{r.id}</div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(r.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {r.commodity_name}
                    </td>
                    <td className="p-4 text-slate-600 capitalize">
                      {r.commodity_category.replace(/_/g, ' ')}
                    </td>
                    <td className="p-4">
                      <span className="capitalize">{r.storage_type}</span> ({r.storage_temp_c}°C)
                    </td>
                    <td className="p-4">{r.target_shelf_life_days} days</td>
                    <td className="p-4 text-emerald-800 font-semibold">
                      {r.top_material_name || 'Evaluated'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200">
                        {r.top_score ? `${r.top_score}/100` : '--'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onViewRecommendation(r.id)}
                          className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <span>Inspect</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(r.id, e)}
                          disabled={deletingId === r.id}
                          className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
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
