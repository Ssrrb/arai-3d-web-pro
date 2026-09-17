import React from 'react';
import { ProductVariant } from '../types';
import { soundEngine } from '../utils/soundEngine';
import { ShieldCheck, Cpu, BatteryCharging, Sparkles, Layers } from 'lucide-react';

interface MetricsSectionProps {
  product: ProductVariant;
  onOpenSpecs: () => void;
}

export const MetricsSection: React.FC<MetricsSectionProps> = ({ product, onOpenSpecs }) => {
  return (
    <div
      id="metrics"
      className="relative w-full h-full min-h-full flex items-center px-6 md:px-16 py-16 pointer-events-none snap-start overflow-hidden select-none"
    >
      {/* Background Architectural Grid Lines */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-white/10" />
        <div className="absolute left-1/4 top-0 bottom-0 w-[1px] bg-white/5" />
        <div className="absolute left-2/4 top-0 bottom-0 w-[1px] bg-white/5" />
        <div className="absolute left-3/4 top-0 bottom-0 w-[1px] bg-white/5" />
        <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-white/5" />
      </div>

      {/* Content Container */}
      <div className="w-full h-full relative z-10 pointer-events-auto flex flex-col md:flex-row items-center justify-between gap-8 my-auto">
        {/* Left Column: Heading & 3 Key Metrics */}
        <div className="w-full md:w-5/12 flex flex-col justify-center gap-8 pl-2 md:pl-0">
          <div>
            <div
              className="text-xs font-mono mb-2 flex items-center gap-2 tracking-widest uppercase font-bold"
              style={{ color: product.accentColor }}
            >
              <span className="w-2 h-2 rounded-full animate-ping" style={{ backgroundColor: product.accentColor }} />
              PERFORMANCE & ENGINEERING
            </div>
            <h2
              className="font-display text-5xl sm:text-6xl md:text-7xl text-white leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              CONVERTIBLE
              <br />
              DUAL 360°
            </h2>
          </div>

          <div className="space-y-6">
            {/* Metric 1 */}
            <div className="border-l-2 border-white/20 pl-5 transition-all duration-300 hover:border-white">
              <div className="text-4xl font-bold text-white mb-0.5 flex items-baseline gap-2">
                <span>360°</span>
                <span className="text-xs font-mono font-normal text-gray-400 uppercase">Dual Spindle</span>
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-widest mb-1.5 font-mono">
                Reinforced Biaxial Hinges
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Engineered for 25,000+ folding cycles with precision torque retention across Laptop, Tent, Stand, and Tablet modes.
              </p>
            </div>

            {/* Metric 2 */}
            <div className="border-l-2 border-white/20 pl-5 transition-all duration-300 hover:border-white">
              <div className="text-4xl font-bold text-white mb-0.5 flex items-baseline gap-2">
                <span>12.2"</span>
                <span className="text-xs font-mono font-normal text-gray-400 uppercase">WUXGA Touch</span>
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-widest mb-1.5 font-mono">
                10-Point Multitouch & 1MP Glass Webcam
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Vibrant 1920x1200 IPS panel with scratch-resistant glass, dark matte anti-reflective bezel, and centered optical webcam.
              </p>
            </div>

            {/* Metric 3 */}
            <div className="border-l-2 border-white/20 pl-5 transition-all duration-300 hover:border-white">
              <div className="text-4xl font-bold text-white mb-0.5 flex items-baseline gap-2">
                <span>12 hrs</span>
                <span className="text-xs font-mono font-normal text-gray-400 uppercase">Fast 45W PD</span>
              </div>
              <div className="text-xs text-gray-300 uppercase tracking-widest mb-1.5 font-mono">
                All-Day Autonomous Power
              </div>
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                Dual USB-C 3.1 Gen 1 with Power Delivery and DisplayPort out, providing up to 80% charge in just 45 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Hardware Architecture Highlights */}
        <div className="w-full md:w-5/12 flex flex-col gap-4">
          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <ShieldCheck className="w-5 h-5 text-white" style={{ color: product.accentColor }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider uppercase">
                  Spanish ISO Keyboard with "Ñ"
                </h4>
                <p className="text-[11px] font-mono text-gray-400">ChromeOS distribution & spill-resistant pocket</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Optimized for regional educational and business workflows. Features warm white key legends, inverted punctuation (¡, ¿), and ergonomic low-profile scissor switches.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md shadow-2xl">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                <Layers className="w-5 h-5 text-white" style={{ color: product.accentColor }} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-wider uppercase">
                  IMR MT11015 & Micrograin Base
                </h4>
                <p className="text-[11px] font-mono text-gray-400">In-Mold Roller top cover (R0.40) & high-traction bottom</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Engineered with a 0.20mm perimeter parting line between palmrest and base, centered 114.6 x 60.6 mm precision touchpad, and integrated stylus garage.
            </p>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenSpecs();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className="interactive mt-2 w-full py-3.5 px-6 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white text-xs font-mono uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <span>Explore All 24+ Hardware Specs</span>
            <span style={{ color: product.accentColor }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
};
