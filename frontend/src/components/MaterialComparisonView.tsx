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
    <div className="space-y-4 animate-govFadeIn text-[#202B38]">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-xs text-[#5E6B78]">
        <span className="font-semibold text-[#17365D]">Portal</span>
        <span>/</span>
        <span>Material Comparison Matrix</span>
      </div>

      {/* Header */}
      <div className="bg-white rounded-lg p-5 border border-[#D8E1EA] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-[#17365D] tracking-tight">
            Packaging Material Comparison Matrix
          </h1>
          <p className="text-xs text-[#5E6B78] mt-0.5">
            Compare barrier permeability (OTR / WVTR), thermal sealing properties, cost per kg, and sustainability ratings.
          </p>
        </div>

        <span className="text-xs font-semibold text-[#17365D] bg-[#F4F7FA] px-3 py-1.5 rounded-md border border-[#D8E1EA]">
          Selected: <strong className="text-[#16834A]">{comparedMaterials.length}</strong> of 4 Max
        </span>
      </div>

      {/* Material Selection Pills */}
      <div className="bg-white rounded-lg p-4 border border-[#D8E1EA] shadow-xs space-y-2.5">
        <div className="text-xs font-bold text-[#17365D] uppercase tracking-wide">
          Select Materials to Compare (Click to toggle):
        </div>
        <div className="flex flex-wrap gap-1.5">
          {materials.map((m) => {
            const isSelected = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => handleToggleMaterial(m.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#17365D] text-white shadow-xs'
                    : 'bg-[#F4F7FA] text-[#202B38] hover:bg-slate-200/80 border border-[#D8E1EA]'
                }`}
              >
                <span>{m.material_code}</span>
                <span className="opacity-75">({m.name.split(' ')[0]})</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Grid Table */}
      {comparedMaterials.length > 0 ? (
        <div className="bg-white rounded-lg border border-[#D8E1EA] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F4F7FA] border-b border-[#D8E1EA] text-[#17365D]">
                  <th className="p-3.5 font-bold w-48 uppercase tracking-wider text-[11px]">Specification</th>
                  {comparedMaterials.map((m) => (
                    <th key={m.id} className="p-3.5 font-bold text-[#17365D] border-l border-[#D8E1EA]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-[#16834A] font-mono text-[10px]">{m.material_code}</div>
                          <div className="text-xs font-bold text-[#17365D]">{m.name}</div>
                        </div>
                        <button
                          onClick={() => handleToggleMaterial(m.id)}
                          className="text-[#5E6B78] hover:text-red-600 p-1 cursor-pointer"
                          title="Remove material"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D8E1EA] text-[#202B38]">
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">Polymer Family</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA] font-medium">
                      {m.polymer_family}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">Barrier Class</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA]">
                      <span className="capitalize px-1.5 py-0.5 rounded bg-[#F4F7FA] text-[#245A81] border border-[#D8E1EA] text-[10px] font-medium">
                        {m.gas_barrier_class}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">
                    <div>Oxygen Permeability (OTR)</div>
                    <div className="text-[10px] text-[#5E6B78] font-normal">cm³/m²·day·atm (ASTM D3985)</div>
                  </td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA] font-mono font-bold text-[#17365D]">
                      {m.otr_ref}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">
                    <div>Moisture Permeability (WVTR)</div>
                    <div className="text-[10px] text-[#5E6B78] font-normal">g/m²·day (ASTM F1249)</div>
                  </td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA] font-mono font-bold text-[#17365D]">
                      {m.wvtr_ref}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">
                    <div>Nominal Thickness</div>
                    <div className="text-[10px] text-[#5E6B78] font-normal">microns (µm)</div>
                  </td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA] font-mono">
                      {m.ref_thickness_um ? `${m.ref_thickness_um} µm` : '35–70 µm'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">
                    <div>Estimated Cost (INR / kg)</div>
                  </td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA] font-mono font-semibold text-[#16834A]">
                      {m.cost_inr_per_kg ? `₹${m.cost_inr_per_kg}` : 'N/A'}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">Recyclability Rating</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA]">
                      <span className="capitalize text-[#202B38] font-medium">
                        {m.recyclability.replace(/_/g, ' ')}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="p-3 font-semibold bg-[#F4F7FA]/50">Sustainability Score</td>
                  {comparedMaterials.map((m) => (
                    <td key={m.id} className="p-3 border-l border-[#D8E1EA]">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-[#16834A] font-bold border border-emerald-200 text-xs">
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
        <div className="bg-white rounded-lg border border-[#D8E1EA] p-8 text-center text-[#5E6B78] shadow-xs">
          <Scale className="w-8 h-8 mx-auto text-slate-400 mb-2" />
          <p className="text-xs">No materials selected. Click the buttons above to select materials to compare.</p>
        </div>
      )}

      {/* Comparison Chart */}
      {comparedMaterials.length > 0 && (
        <div className="bg-white rounded-lg border border-[#D8E1EA] p-5 shadow-xs space-y-3">
          <h2 className="text-xs font-bold text-[#17365D] uppercase tracking-wide">
            Permeability (WVTR) vs Sustainability Score
          </h2>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fill: '#5E6B78', fontSize: 10 }} />
                <YAxis tick={{ fill: '#5E6B78', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#D8E1EA', borderRadius: '6px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="WVTR" name="WVTR (g/m²·day - Lower is better)" fill="#245A81" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Sustainability" name="Sustainability (Score out of 100)" fill="#16834A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
