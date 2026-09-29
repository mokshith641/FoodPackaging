import React, { useState, useEffect } from 'react';
import {
  Scale,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Leaf,
  Layers,
  ArrowRight
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

  // Chart data for comparing OTR (log scaled representation) and WVTR
  const barrierChartData = comparedMaterials.map((m) => ({
    name: m.material_code,
    fullName: m.name,
    WVTR: m.wvtr_ref,
    Cost: m.cost_inr_per_kg || 0,
    CarbonFootprint: m.co2e_kg_per_kg || 0,
    SustainabilityScore: m.sustainability_score || 0
  }));

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">
              Side-by-Side Packaging Material Comparison
            </h1>
          </div>
          <p className="text-xs text-slate-400">
            Compare barrier permeability (OTR/WVTR), sealability, mechanical tensile strength, unit cost, and carbon footprint across polymer families.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          Comparing {comparedMaterials.length} of 4 Max Materials
        </span>
      </div>

      {/* Material Selection Pills */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-2">
        <div className="text-xs font-semibold text-slate-300">
          Select Materials to Compare (Click to toggle):
        </div>
        <div className="flex flex-wrap gap-2">
          {materials.map((m) => {
            const isSelected = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => handleToggleMaterial(m.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border border-slate-800 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <span>{m.material_code}</span>
                <span className="text-[11px] text-slate-400 font-normal truncate max-w-[120px]">{m.name}</span>
                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 ml-1" />}
              </button>
            );
          })}
        </div>
      </div>

      {comparedMaterials.length === 0 ? (
        <div className="text-center py-12 glass-panel rounded-2xl border border-slate-800 text-slate-400 space-y-2">
          <Layers className="w-8 h-8 mx-auto text-slate-500" />
          <p className="text-xs">No materials selected for comparison.</p>
          <p className="text-[11px] text-slate-500">Please select at least 2 materials above to generate the comparison matrix.</p>
        </div>
      ) : (
        <>
          {/* Comparison Matrix Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800 text-slate-300">
                    <th className="p-3.5 font-bold uppercase tracking-wider text-[11px] w-48 sticky left-0 bg-slate-900 z-10">
                      Property / Parameter
                    </th>
                    {comparedMaterials.map((m) => (
                      <th key={m.id} className="p-3.5 font-bold text-slate-100 min-w-[200px] border-l border-slate-800/60">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-cyan-400">{m.material_code}</span>
                          <button
                            onClick={() => handleToggleMaterial(m.id)}
                            className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                            title="Remove from comparison"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="text-xs font-bold text-slate-100 mt-1">{m.name}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{m.structure}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {/* Category / Family */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Polymer Family</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 font-medium capitalize">
                        {m.polymer_family.replace(/_/g, ' ')}
                      </td>
                    ))}
                  </tr>

                  {/* Reference Thickness */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Reference Thickness</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 font-mono">
                        {m.ref_thickness_um} µm ({m.thickness_min_um || m.ref_thickness_um} – {m.thickness_max_um || m.ref_thickness_um} µm)
                      </td>
                    ))}
                  </tr>

                  {/* WVTR Dual Units */}
                  <tr className="bg-slate-900/30">
                    <td className="p-3 font-semibold text-slate-300 sticky left-0 bg-slate-950/80">
                      WVTR (38°C, 90% RH)
                    </td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 font-mono">
                        <strong className="text-emerald-400">{m.wvtr_ref}</strong> g/(m²·d)
                        <div className="text-[10px] text-slate-400 font-normal">
                          {roundNum(m.wvtr_ref / 15.500031)} g/(100 in²·d)
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* OTR Dual Units */}
                  <tr className="bg-slate-900/30">
                    <td className="p-3 font-semibold text-slate-300 sticky left-0 bg-slate-950/80">
                      OTR (23°C, 0% RH)
                    </td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 font-mono">
                        <strong className="text-cyan-400">{m.otr_ref}</strong> cc/(m²·d·atm)
                        <div className="text-[10px] text-slate-400 font-normal">
                          {roundNum(m.otr_ref / 15.500031)} cc/(100 in²·d)
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Breathable / Gas Barrier Class */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Barrier Classification</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 capitalize">
                        {m.gas_barrier_class} {m.is_breathable && <span className="text-emerald-400 font-bold">(Breathable)</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Tensile Strength */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Tensile Strength (ASTM D882)</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 font-mono">
                        {m.tensile_strength_mpa ? `${m.tensile_strength_mpa} MPa` : 'N/A'}
                      </td>
                    ))}
                  </tr>

                  {/* Sealability */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Heat Sealability</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60">
                        <span className="capitalize">{m.sealability.replace(/_/g, ' ')}</span>
                        {m.heat_seal_temp_c && <span className="text-slate-400 font-mono ml-1">({m.heat_seal_temp_c}°C)</span>}
                      </td>
                    ))}
                  </tr>

                  {/* Low Temperature Freezer Suitability */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Freezer Temp Stability (&lt;0°C)</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60">
                        {m.low_temp_ok ? (
                          <span className="text-emerald-400 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Stable
                          </span>
                        ) : (
                          <span className="text-rose-400 flex items-center gap-1 font-medium">
                            <XCircle className="w-3.5 h-3.5" /> Brittle at &lt;0°C
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Recyclability & Carbon Footprint */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Circularity & Carbon Footprint</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60">
                        <div className="font-semibold text-emerald-400 capitalize">
                          {m.recyclability.replace(/_/g, ' ')}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ~{m.co2e_kg_per_kg || '--'} kg CO₂e / kg resin
                        </div>
                      </td>
                    ))}
                  </tr>

                  {/* Indicative Cost */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Indicative Cost (INR)</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 font-mono font-bold text-slate-200">
                        ₹{m.cost_inr_per_kg || 'N/A'} / kg
                      </td>
                    ))}
                  </tr>

                  {/* Engineering Notes */}
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 sticky left-0 bg-slate-950/80">Engineering Notes</td>
                    {comparedMaterials.map((m) => (
                      <td key={m.id} className="p-3 border-l border-slate-800/60 text-[11px] text-slate-400 leading-relaxed">
                        {m.notes || 'Standard industrial polymer specification.'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Graphical Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="font-bold text-sm text-slate-200 mb-3">
                Water Vapor Permeability (WVTR) Comparison
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barrierChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                    />
                    <Bar dataKey="WVTR" name="WVTR (g/m²·day)" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-5 border border-slate-800">
              <h3 className="font-bold text-sm text-slate-200 mb-3">
                Raw Material Cost (₹/kg) vs Carbon Footprint
              </h3>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barrierChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px', color: '#f8fafc' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px' }} />
                    <Bar dataKey="Cost" name="Cost (₹/kg)" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="CarbonFootprint" name="CO₂e (kg/kg)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

function roundNum(val: number): number {
  return Math.round(val * 1000) / 1000;
}
