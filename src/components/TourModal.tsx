import React, { useState } from 'react';
import { X, Play, Shield, Compass, RotateCcw, Monitor, Box, Video } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { Viewer3D } from './Viewer3D';

interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  accentColor: string;
}

export const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose, accentColor }) => {
  const [activeTab, setActiveTab] = useState<'3d' | 'brief'>('3d');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none">
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[880px] bg-[#090a0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <h3
              className="font-display text-lg sm:text-xl text-white tracking-wider uppercase"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              ARAI 360° CONVERTIBLE // CAD INSPECTOR & BRIEF
            </h3>
          </div>

          <div className="flex items-center gap-3">
            {/* Mode Switcher */}
            <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-1 gap-1">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('3d');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === '3d' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Box className="w-3.5 h-3.5" />
                <span>3D CAD Studio</span>
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setActiveTab('brief');
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  activeTab === 'brief' ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'
                }`}
              >
                <Video className="w-3.5 h-3.5" />
                <span>Video Brief</span>
              </button>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors interactive"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="relative flex-1 w-full overflow-hidden bg-black/80 flex flex-col">
          {activeTab === '3d' ? (
            <div className="relative w-full h-full">
              <Viewer3D />
            </div>
          ) : (
            <div className="relative w-full h-full flex flex-col justify-between overflow-y-auto">
              {/* Video / Visual Simulation */}
              <div className="relative aspect-video w-full bg-black/80 flex items-center justify-center overflow-hidden border-b border-white/10 flex-1">
                <img
                  src="/images/image4.webp"
                  alt="Arai Stratus S1 Studio Perspective"
                  className="w-full h-full object-cover opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090a0f] via-transparent to-black/40" />

                {/* Center Play Overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
                  <div
                    className="w-16 h-16 rounded-full border border-white/30 bg-black/50 backdrop-blur-md flex items-center justify-center text-white mb-4 shadow-2xl hover:scale-110 transition-transform cursor-pointer interactive"
                    onClick={() => soundEngine.playSuccess()}
                  >
                    <Play className="w-6 h-6 ml-1 fill-white" />
                  </div>
                  <span className="font-display text-2xl md:text-3xl text-white tracking-wider uppercase">
                    PRECISION IN MOTION
                  </span>
                  <p className="text-xs font-mono text-gray-300 max-w-md mt-2">
                    Explore the 360° dual-stage biaxial steel mechanism, Spanish ISO layout with dedicated Ñ, and 12.2" WUXGA multitouch assembly.
                  </p>
                </div>
              </div>

              {/* Feature Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#06070a]">
                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase mb-1 font-mono">
                    <RotateCcw className="w-4 h-4" style={{ color: accentColor }} />
                    <span>360° Friction Hinge</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                    Tested for &gt;25,000 cycles. Holds steady in Laptop, Tent, Stand, and Tablet orientation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase mb-1 font-mono">
                    <Monitor className="w-4 h-4" style={{ color: accentColor }} />
                    <span>12.2" WUXGA IPS</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                    1920x1200 resolution, 10-point capacitive glass, dark matte bezel and optical HD webcam.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center gap-2 text-xs font-bold text-white uppercase mb-1 font-mono">
                    <Shield className="w-4 h-4" style={{ color: accentColor }} />
                    <span>IMR MT11015 PBR</span>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                    In-Mold Roller top cover, micrograin base with 0.20mm perimeter parting precision.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
