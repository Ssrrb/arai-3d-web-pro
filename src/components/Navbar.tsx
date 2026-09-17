import React from 'react';
import { Compass, Sparkles, Sliders, Maximize, Minimize } from 'lucide-react';

interface NavbarProps {
  onOpenBlueprint: () => void;
  onOpenGallery: () => void;
  onOpenSpecs: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBlueprint,
  onOpenGallery,
  onOpenSpecs,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <header className="h-14 bg-slate-950/90 border-b border-slate-800/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 shrink-0 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center p-1.5 shadow-sm">
          <img src="/images/arai-icon.svg" alt="Arai" className="w-full h-full object-contain" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-tight text-white">ARAI STRATUS</h1>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-semibold">
              3D Web
            </span>
          </div>
          <p className="text-[11px] text-slate-400 hidden sm:block">12.2" Convertible 2-in-1 Chromebook • Nimbus S1 Concept</p>
        </div>
      </div>

      {/* Navigation and Tool shortcuts */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenBlueprint}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline">CAD Blueprint</span>
          <span className="sm:hidden">CAD</span>
        </button>

        <button
          onClick={onOpenGallery}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Studio Renders</span>
          <span className="sm:hidden">Renders</span>
        </button>

        <button
          onClick={onOpenSpecs}
          className="px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-800 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
        >
          <Sliders className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Specifications</span>
          <span className="sm:hidden">Specs</span>
        </button>

        <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

        <button
          onClick={onToggleFullscreen}
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-800 transition-colors"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
