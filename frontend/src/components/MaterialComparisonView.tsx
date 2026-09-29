import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Leaf
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { PackagingMaterial } from '../types/api';

interface MaterialComparisonViewProps {
  materials: PackagingMaterial[];
  preselectedCodes?: string[];
  onSelectForEvaluation?: (material: PackagingMaterial) => void;
}

export const MaterialComparisonView: React.FC<MaterialComparisonViewProps> = ({
  materials,
  preselectedCodes = []
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    if (materials.length > 0 && selectedIds.length === 0) {
      if (preselectedCodes.length > 0) {
        const matches = materials.filter((m) => preselectedCodes.includes(m.material_code));
        setSelectedIds(matches.map((m) => m.id).slice(0, 4));
      } else {
        // Default select 3 standard materials (LDPE, Met-BOPP/CPP, PET/Al/PE)
        const defaultMats = materials.filter((m) => ['M01', 'M10', 'M12'].includes(m.material_code));
        setSelectedIds(defaultMats.map((m) => m.id));
      }
    }
  }, [materials, preselectedCodes]);

  const handleToggleMaterial = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      if (selectedIds.length >= 4) {
        alert('You can compare a maximum of 4 packaging materials simultaneously.');
        return;
      }
      setSelectedIds([...selectedIds, id]);
    }
  };

  const comparedMaterials = materials.filter((m) => selectedIds.includes(m.id));

  // Chart data for comparing properties
  const chartData = comparedMaterials.map((m) => ({
    name: m.material_code,
    fullName: m.name,
    WVTR: m.wvtr_ref,
    Cost: m.cost_inr_per_kg || 0,
    Sustainability: m.sustainability_score || 0
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Side-by-Side Packaging Material Comparison
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare barrier permeability (OTR / WVTR), thermal sealing properties, cost per kg, and sustainability scores.
          </p>
        </div>

        <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
          Comparing {comparedMaterials.length} of 4 Max Materials
        </span>
      </div>

      {/* Material Selection Pills */}
      <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="text-xs font-semibold text-slate-700">
          Select Materials to Compare (Click to toggle):
        </div>
        <div className="flex flex-wrap gap-2">
          {materials.map((m) => {
            const isSelected = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => handleToggleMaterial(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <span>{m.material_code}</span>
                <span className="opacity-80">({m.name.split(' ')[0]})</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid */}
      {comparedMaterials.length > 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                  <th className="p-4 font-semibold w-48">Specification / Property</th>
                  {comparedMaterials.map((m) => (
                    <th key={m.id} className="p-4 font-bold text-slate-900 border-l border-slate-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-emerald-700 font-mono text-[11px]">{m.material_code}</div>
                          <div className="text-xs font-bold text-slate-900">{m.name}</div>
                        </div>
                        <button
                          onClick={() => handleToggleMaterial(m.id)}
                          className="text-slate-400 hover:text-red-500 p-1"
                          title="Remove material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                <tr>
                  <td className="p-4 font-semibold bg-slate-50/50">Polymer Family</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-4 border-l border-slate-200 font-medium">
                      {m.polymer_family}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold bg-slate-50/50">Gas Barrier Class</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-4 border-l border-slate-200">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {m.gas_barrier_class}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold bg-slate-50/50">
                    <div>Oxygen Permeability (OTR)</div>
                    <div className="text-[10px] text-slate-400 font-normal">cm³/m²·day·atm</div>
                  </td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-4 border-l border-slate-200 font-mono font-bold text-slate-900">
                      {m.otr_ref}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold bg-slate-50/50">
                    <div>Water Vapor Trans. (WVTR)</div>
                    <div className="text-[10px] text-slate-400 font-normal">g/m²·day</div>
                  </td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-4 border-l border-slate-200 font-mono font-bold text-slate-900">
                      {m.wvtr_ref}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold bg-slate-50/50">
                    <div>Approx. Cost (INR / kg)</div>
                  </td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-4 border-l border-slate-200 font-mono font-medium text-emerald-700">
                      {m.cost_inr_per_kg ? `₹${m.cost_inr_per_kg}` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold bg-slate-50/50">Recyclability & Circularity</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-4 border-l border-slate-200">
                      <span className="capitalize text-slate-700 font-medium">
                        {m.recyclability.replace(/_/g, ' ')}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-4 font-semibold bg-slate-50/50">Sustainability Score</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-4 border-l border-slate-200">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs">
                        {m.sustainability_score}/100
                      </span>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 shadow-xs">
          <Scale className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs">No materials selected. Click the buttons above to select materials to compare.</p>
        </div>
      )}

      {/* Comparison Chart */}
      {comparedMaterials.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900">
            Water Vapor Permeability (WVTR) vs Sustainability Score
          </h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11 }} />
                <YAxis tick={{ fill: '#475569', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="WVTR" name="WVTR (g/m²·day - Lower is better)" fill="#0284c7" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Sustainability" name="Sustainability Score (out of 100)" fill="#16a34a" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
