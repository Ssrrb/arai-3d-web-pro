import React, { useState } from 'react';
import { 
  X, 
  Layers, 
  Monitor, 
  Cpu, 
  Sliders, 
  Maximize2, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  FileText 
} from 'lucide-react';
import { SPEC_CATEGORIES } from '../data/specsData';

interface SpecsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpecsModal: React.FC<SpecsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<string>('dimensions');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Technical Specifications (Detalles Técnicos)</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-semibold">
                  specs.md
                </span>
              </div>
              <p className="text-xs text-slate-400">Arai Stratus 12.2" Convertible 2-in-1 Chromebook / Nimbus S1 Concept</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-slate-800/80 bg-slate-950/40 overflow-x-auto">
          {SPEC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                activeTab === cat.id
                  ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {cat.id === 'dimensions' && <Maximize2 className="w-3.5 h-3.5" />}
              {cat.id === 'display-camera' && <Monitor className="w-3.5 h-3.5" />}
              {cat.id === 'materials' && <Layers className="w-3.5 h-3.5" />}
              {cat.id === 'ports' && <Cpu className="w-3.5 h-3.5" />}
              {cat.id === 'controls' && <Sliders className="w-3.5 h-3.5" />}
              <span>{cat.title}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {SPEC_CATEGORIES.filter((c) => c.id === activeTab).map((category) => (
            <div key={category.id} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono text-cyan-400">
                  {category.title}
                </h4>
                <span className="text-xs text-slate-400">Verified OEM CAD Spec</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {category.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-slate-950/60 border border-slate-800/80 rounded-xl hover:border-slate-700 transition-colors"
                  >
                    <span className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
                      {item.label}
                    </span>
                    <span className="block text-sm font-semibold text-slate-100">
                      {item.value}
                    </span>
                    {item.note && (
                      <span className="block text-xs text-cyan-400/80 mt-1">{item.note}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Original Markdown Reference Section */}
          <div className="mt-8 p-5 bg-slate-950/80 border border-slate-800 rounded-xl">
            <h5 className="text-xs font-mono uppercase font-bold text-slate-300 mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Detalles técnicos para el modelo 3D (Cycles Render Spec)
            </h5>
            <div className="space-y-2 text-xs text-slate-400 leading-relaxed font-mono bg-slate-900/90 p-4 rounded-lg border border-slate-800/60">
              <p>
                <strong className="text-slate-200">• Estructura convertible:</strong> Las bisagras dobles permiten una rotación completa de 360° entre la pantalla y el cuerpo del equipo (Laptop, Stand, Tent, Tablet).
              </p>
              <p>
                <strong className="text-slate-200">• Combinación de texturas PBR:</strong> La cubierta superior e interior presentan un acabado suave IMR negro mate MT11015 (R0.40), mientras que el marco de la pantalla y la cubierta inferior tienen una textura plástica de grano fino (R0.65).
              </p>
              <p>
                <strong className="text-slate-200">• Configuración de Render:</strong> Fondo neutro de estudio con iluminación de tres puntos (Key, Fill, Rim) para resaltar los bordes biselados, los puertos laterales y las texturas del plástico mate.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>Part Number: ARAI-STRATUS-12C-S1</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
