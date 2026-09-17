import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Download, Maximize2, Compass, Layers } from 'lucide-react';

interface BlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BlueprintModal: React.FC<BlueprintModalProps> = ({ isOpen, onClose }) => {
  const [scale, setScale] = useState<number>(1);
  const [theme, setTheme] = useState<'blueprint' | 'dark' | 'light'>('blueprint');

  if (!isOpen) return null;

  const handleZoom = (delta: number) => {
    setScale((prev) => Math.min(Math.max(0.5, prev + delta), 3.5));
  };

  const handleReset = () => {
    setScale(1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">07_Dimensioned_Blueprint.svg</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-semibold">
                  CAD Vector
                </span>
              </div>
              <p className="text-xs text-slate-400">Arai Stratus / Nimbus S1 Convertible 12.2" Engineering Schematic</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Theme switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setTheme('blueprint')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  theme === 'blueprint' ? 'bg-cyan-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Blueprint
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  theme === 'dark' ? 'bg-slate-700 text-white font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Dark CAD
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                  theme === 'light' ? 'bg-slate-200 text-slate-900 font-semibold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Draft Light
              </button>
            </div>

            {/* Download */}
            <a
              href="/blueprints/07_Dimensioned_Blueprint.svg"
              download="07_Dimensioned_Blueprint.svg"
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Download Vector SVG"
            >
              <Download className="w-4 h-4" />
            </a>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Blueprint Canvas Viewport */}
        <div 
          className={`relative flex-1 overflow-auto flex items-center justify-center p-6 select-none transition-colors duration-200 ${
            theme === 'blueprint' 
              ? 'bg-[#002244] [background-image:radial-gradient(#0284c7_1px,transparent_1px)] [background-size:24px_24px]'
              : theme === 'dark'
              ? 'bg-[#0f172a] [background-image:radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]'
              : 'bg-[#f8fafc] [background-image:radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]'
          }`}
        >
          <div 
            className="transition-transform duration-150 ease-out origin-center max-w-full max-h-full flex items-center justify-center"
            style={{ transform: `scale(${scale})` }}
          >
            <img
              src="/blueprints/07_Dimensioned_Blueprint.svg"
              alt="Arai Stratus Dimensioned Blueprint"
              className={`max-w-none w-auto h-auto max-h-[72vh] object-contain drop-shadow-2xl ${
                theme === 'blueprint' ? 'brightness-110 contrast-125' : ''
              }`}
            />
          </div>

          {/* Floating Zoom Controls */}
          <div className="absolute bottom-5 right-5 flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 backdrop-blur-md p-1.5 rounded-xl shadow-xl">
            <button
              onClick={() => handleZoom(0.25)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono text-cyan-400 px-2 font-medium">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={() => handleZoom(-0.25)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleReset}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors ml-1 border-l border-slate-800 pl-2"
              title="Reset Zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Dimension Callouts Footnote */}
          <div className="absolute bottom-5 left-5 hidden sm:flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 backdrop-blur-md">
            <span>Overall: <strong className="text-cyan-400">326.50 × 229.00 mm</strong></span>
            <span>•</span>
            <span>Profile: <strong className="text-cyan-400">13.40 mm</strong></span>
            <span>•</span>
            <span>Screen: <strong className="text-cyan-400">12.2" WUXGA Touch</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
