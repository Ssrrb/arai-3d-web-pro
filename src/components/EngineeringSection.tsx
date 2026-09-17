import React from 'react';
import { ProductVariant } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { Compass, Image, Cpu, Maximize2, Usb, ArrowUpRight } from 'lucide-react';

interface EngineeringSectionProps {
  product: ProductVariant;
  onOpenBlueprint: () => void;
  onOpenGallery: () => void;
  onOpenSpecs: () => void;
}

export const EngineeringSection: React.FC<EngineeringSectionProps> = ({
  product,
  onOpenBlueprint,
  onOpenGallery,
  onOpenSpecs
}) => {
  return (
    <div
      id="engineering"
      className="relative w-full h-full min-h-full flex items-center px-6 md:px-16 py-16 pointer-events-none snap-start overflow-hidden select-none"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10" />
        <div className="absolute left-1/3 top-0 bottom-0 w-[1px] bg-white/5" />
        <div className="absolute left-2/3 top-0 bottom-0 w-[1px] bg-white/5" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5" />
      </div>

      <div className="w-full h-full relative z-10 pointer-events-auto flex flex-col justify-center my-auto gap-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div
              className="text-xs font-mono mb-1 flex items-center gap-2 tracking-widest uppercase font-bold"
              style={{ color: product.accentColor }}
            >
              <Compass className="w-4 h-4" />
              CAD SCHEMATICS & PERIPHERAL SUITE
            </div>
            <h2
              className="font-display text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              PRECISION CAD // 326.5 MM
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenBlueprint();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="interactive px-4 py-2 rounded-lg bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-gray-200 transition-all flex items-center gap-1.5 shadow-lg"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Open 2D Vector CAD</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenGallery();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="interactive px-4 py-2 rounded-lg border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs uppercase tracking-wider font-mono transition-all flex items-center gap-1.5"
            >
              <Image className="w-3.5 h-3.5" />
              <span>Studio Renders</span>
            </button>
          </div>
        </div>

        {/* Port Architecture & Dimensions Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left I/O Suite */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono tracking-widest uppercase text-gray-400">Left Side I/O</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">USB 3.1</span>
            </div>
            <ul className="space-y-3 text-xs text-gray-300 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>1x USB-C 3.1 Gen 1 (PD + DP)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>3.5 mm Combined Audio/Mic Jack</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>Kensington Security Slot</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>Soft White Power LED Indicator</span>
              </li>
            </ul>
          </div>

          {/* Right I/O & Stylus */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono tracking-widest uppercase text-gray-400">Right Side I/O</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">High-Speed</span>
            </div>
            <ul className="space-y-3 text-xs text-gray-300 font-mono">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>1x USB-C 3.1 Gen 1 (PD + DP)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>1x USB 3.1 Type-A (Deep Blue)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>1x Full-Size HDMI Video Output</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: product.accentColor }} />
                <span>MicroSD Slot & Stylus Garage</span>
              </li>
            </ul>
          </div>

          {/* Form Factor Dimensions */}
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono tracking-widest uppercase text-gray-400">Dimensions & Weight</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-white">Chassis</span>
              </div>
              <div className="space-y-2 font-mono text-xs text-gray-300">
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Width</span>
                  <span className="text-white font-bold">326.50 mm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Depth</span>
                  <span className="text-white font-bold">229.00 mm</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5">
                  <span className="text-gray-500">Thickness</span>
                  <span className="text-white font-bold">13.40 mm</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500">Total Mass</span>
                  <span className="text-white font-bold">1.25 kg (2.75 lbs)</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <span>Platform: Arai Nimbus / Stratus</span>
              <span className="text-white font-bold" style={{ color: product.accentColor }}>
                2-in-1 360°
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
