import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Leaf,
  X,
  Scale
} from 'lucide-react';
import { PackagingMaterial } from '../types/api';

interface MaterialDatabaseViewProps {
  materials: PackagingMaterial[];
  onCompareMaterial: (code: string) => void;
}

export const MaterialDatabaseView: React.FC<MaterialDatabaseViewProps> = ({
  materials,
  onCompareMaterial
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFamily, setSelectedFamily] = useState<string>('all');
  const [selectedRecyclability, setSelectedRecyclability] = useState<string>('all');
  const [activeModalMaterial, setActiveModalMaterial] = useState<PackagingMaterial | null>(null);

  const polymerFamilies = ['all', ...Array.from(new Set(materials.map((m) => m.polymer_family)))];
  const recyclabilityTypes = ['all', ...Array.from(new Set(materials.map((m) => m.recyclability)))];

  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.material_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.structure.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFamily = selectedFamily === 'all' || m.polymer_family === selectedFamily;
    const matchesRecyc = selectedRecyclability === 'all' || m.recyclability === selectedRecyclability;
    return matchesSearch && matchesFamily && matchesRecyc;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-white">Packaging Material Database</h1>
          </div>
          <p className="text-xs text-slate-400">
            Standard barrier properties, ASTM test standards, sealability, and life-cycle carbon metrics for industrial films, laminates, and bio-polymers.
          </p>
        </div>

        <span className="text-xs font-mono text-cyan-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-700">
          {filteredMaterials.length} Materials in Registry
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel rounded-xl p-4 border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by material name, code, or structure (e.g., BOPP, EVOH, M10, Laminate)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <select
              value={selectedFamily}
              onChange={(e) => setSelectedFamily(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {polymerFamilies.map((fam) => (
                <option key={fam} value={fam}>
                  {fam === 'all'
                    ? 'All Polymer Families'
                    : fam.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>

            <select
              value={selectedRecyclability}
              onChange={(e) => setSelectedRecyclability(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {recyclabilityTypes.map((rec) => (
                <option key={rec} value={rec}>
                  {rec === 'all'
                    ? 'All Recyclability'
                    : rec.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Materials Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaterials.map((m) => (
          <div
            key={m.id}
            className="glass-panel rounded-xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all hover:scale-101 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {m.name}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400 font-semibold">{m.material_code}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-900 text-slate-300 border border-slate-700 font-medium capitalize">
                  {m.polymer_family.replace(/_/g, ' ')}
                </span>
              </div>

              <div className="text-xs text-slate-400 mt-2 font-mono">{m.structure}</div>

              {/* Barrier Dual Specs */}
              <div className="grid grid-cols-2 gap-2 my-3 text-[11px]">
                <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">WVTR (38°C, 90% RH)</div>
                  <div className="font-mono font-bold text-emerald-400">
                    {m.wvtr_ref} <span className="text-[10px] text-slate-400 font-normal">g/m²·d</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {Math.round((m.wvtr_ref / 15.500031) * 1000) / 1000} g/100in²·d
                  </div>
                </div>

                <div className="bg-slate-900/70 p-2.5 rounded border border-slate-800">
                  <div className="text-slate-400 text-[10px]">OTR (23°C, 0% RH)</div>
                  <div className="font-mono font-bold text-cyan-400">
                    {m.otr_ref} <span className="text-[10px] text-slate-400 font-normal">cc/m²·d</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {Math.round((m.otr_ref / 15.500031) * 1000) / 1000} cc/100in²·d
                  </div>
                </div>
              </div>

              {/* Properties and Circularity */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Sealability:</span>
                  <span className="font-medium text-slate-200 capitalize">{m.sealability.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Recyclability:</span>
                  <span className="font-medium text-emerald-400 capitalize">{m.recyclability.replace(/_/g, ' ')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Indicative Cost:</span>
                  <span className="font-mono font-bold text-slate-200">₹{m.cost_inr_per_kg || 'N/A'}/kg</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80 mt-3">
              <button
                onClick={() => setActiveModalMaterial(m)}
                className="flex-1 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700 transition-colors cursor-pointer"
              >
                Datasheet & Specs
              </button>
              <button
                onClick={() => onCompareMaterial(m.material_code)}
                className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
                title="Add to Comparison Matrix"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Compare</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Material Specification Modal */}
      {activeModalMaterial && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setActiveModalMaterial(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{activeModalMaterial.name}</h2>
                <span className="text-xs font-mono text-cyan-400">
                  {activeModalMaterial.material_code} • {activeModalMaterial.structure}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Ref Thickness</div>
                <div className="font-mono font-bold text-slate-200">
                  {activeModalMaterial.ref_thickness_um} µm
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Density</div>
                <div className="font-mono font-bold text-slate-200">
                  {activeModalMaterial.density_g_cc || 'N/A'} g/cm³
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Tensile Strength</div>
                <div className="font-mono font-bold text-slate-200">
                  {activeModalMaterial.tensile_strength_mpa || 'N/A'} MPa
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Carbon Footprint</div>
                <div className="font-mono font-bold text-slate-200">
                  ~{activeModalMaterial.co2e_kg_per_kg || 'N/A'} kg/kg
                </div>
              </div>
            </div>

            {/* Test Specifications List */}
            {activeModalMaterial.specifications && activeModalMaterial.specifications.length > 0 && (
              <div className="space-y-2 text-xs border-t border-slate-800 pt-3">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  ASTM / ISO Standardized Test Specifications
                </h4>
                <div className="space-y-2">
                  {activeModalMaterial.specifications.map((spec) => (
                    <div key={spec.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-semibold text-slate-200">{spec.property_name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Standard: {spec.test_standard || 'Standard test'} • Temp: {spec.test_temp_c ?? 23}°C
                        </div>
                      </div>
                      <div className="font-mono font-bold text-cyan-400">
                        {spec.property_value} {spec.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeModalMaterial.notes && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-400">
                <span className="font-semibold text-slate-300">Datasheet Notes: </span>
                {activeModalMaterial.notes}
              </div>
            )}

            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              {activeModalMaterial.source_url ? (
                <a
                  href={activeModalMaterial.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                >
                  <span>MatWeb Reference</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              ) : <span></span>}

              <button
                onClick={() => {
                  onCompareMaterial(activeModalMaterial.material_code);
                  setActiveModalMaterial(null);
                }}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-colors cursor-pointer"
              >
                Add to Comparison Matrix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
