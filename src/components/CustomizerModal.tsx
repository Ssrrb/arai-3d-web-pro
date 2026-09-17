import React, { useState } from 'react';
import { X, ArrowLeft, Check, Sparkles, SlidersHorizontal, Layers, PenTool } from 'lucide-react';
import { ProductVariant, CartItem } from '../types';
import { FINISH_PALETTE, HINGE_COLORS, KEYBOARD_LAYOUTS, MEMORY_TIERS } from '../data/productVariants';
import { Scene3D } from './Scene3D';
import { soundEngine } from '../utils/soundEngine';

interface CustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct: ProductVariant;
  onAddToCart: (item: CartItem) => void;
}

export const CustomizerModal: React.FC<CustomizerModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  onAddToCart
}) => {
  // Customization States
  const [selectedFinish, setSelectedFinish] = useState(FINISH_PALETTE[0]);
  const [selectedHingeColor, setSelectedHingeColor] = useState(HINGE_COLORS[0]);
  const [selectedKeyboard, setSelectedKeyboard] = useState(KEYBOARD_LAYOUTS[0]);
  const [selectedMemory, setSelectedMemory] = useState(MEMORY_TIERS[0]);
  const [includeStylus, setIncludeStylus] = useState<boolean>(true);

  // AI Hardware Lab Prompt
  const [aiPrompt, setAiPrompt] = useState<string>('');
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate customized price
  const basePrice = initialProduct.price;
  const memoryDelta = selectedMemory.priceDelta;
  const stylusDelta = includeStylus ? 35 : 0;
  const totalPrice = basePrice + memoryDelta + stylusDelta;

  const handleAiRecommend = () => {
    if (!aiPrompt.trim()) return;
    soundEngine.playClick();
    setIsGeneratingAi(true);

    setTimeout(() => {
      setIsGeneratingAi(false);
      const promptLower = aiPrompt.toLowerCase();
      if (promptLower.includes('student') || promptLower.includes('school') || promptLower.includes('class')) {
        setSelectedFinish(FINISH_PALETTE[2]); // Military Olive
        setSelectedHingeColor('#10b981');
        setSelectedKeyboard(KEYBOARD_LAYOUTS[0]); // Spanish ISO
        setSelectedMemory(MEMORY_TIERS[0]); // 8GB/128GB
        setIncludeStylus(true);
        setAiRecommendation('Recommended for education: Rugged Olive drop-proof chassis, Spanish ISO with Ñ, and durable EMR stylus.');
      } else if (promptLower.includes('developer') || promptLower.includes('code') || promptLower.includes('cad') || promptLower.includes('linux')) {
        setSelectedFinish(FINISH_PALETTE[3]); // Midnight Carbon
        setSelectedHingeColor('#8b5cf6');
        setSelectedMemory(MEMORY_TIERS[2]); // 16GB/512GB
        setIncludeStylus(true);
        setAiRecommendation('Recommended for developers: 16GB LPDDR5, 512GB NVMe, Linux Debian container support, and Midnight Carbon finish.');
      } else {
        setSelectedFinish(FINISH_PALETTE[0]); // Obsidian MT11015
        setSelectedHingeColor('#06b6d4');
        setSelectedMemory(MEMORY_TIERS[1]); // 8GB/256GB
        setIncludeStylus(true);
        setAiRecommendation('Balanced configuration: Matte Obsidian MT11015, 8GB LPDDR5, 256GB SSD, and active stylus.');
      }
      soundEngine.playSuccess();
    }, 900);
  };

  const handleSaveToCart = () => {
    soundEngine.playSuccess();
    const cartItem: CartItem = {
      id: `custom-${Date.now()}`,
      variantId: initialProduct.id,
      name: `Arai Stratus S1 [Custom]`,
      modelCode: `${initialProduct.modelCode}-CUSTOM`,
      finishName: selectedFinish.name,
      primaryColor: selectedFinish.hex,
      accentColor: selectedHingeColor,
      price: totalPrice,
      ram: selectedMemory.ram,
      storage: selectedMemory.storage,
      keyboardLayout: selectedKeyboard.label,
      includeStylus,
      addedAt: Date.now()
    };
    onAddToCart(cartItem);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-lg select-none">
      <div className="relative w-full h-full md:w-[94vw] md:h-[92vh] max-w-[1550px] bg-[#070709] md:rounded-[2rem] border border-white/10 shadow-2xl flex flex-col md:flex-row overflow-hidden">
        {/* Left Side: Real-time 3D Viewport */}
        <div className="relative flex-1 h-[45vh] md:h-full bg-gradient-to-b from-[#0e131f] to-[#050608] flex items-center justify-center overflow-hidden order-1 md:order-1">
          {/* Watermark */}
          <div className="absolute top-8 right-8 pointer-events-none text-right z-10 hidden sm:block">
            <h1
              className="text-white/15 font-display text-4xl md:text-7xl tracking-widest uppercase leading-none"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              CUSTOM
            </h1>
            <p className="text-white/25 font-mono text-xs tracking-[0.4em] uppercase mt-1">
              ARAI LAB EDITION // 12.2"
            </p>
          </div>

          {/* 3D Scene */}
          <div className="w-full h-full">
            <Scene3D
              currentProduct={initialProduct}
              scrollRef={{ current: null }}
              customFinishHex={selectedFinish.hex}
              customAccentHex={selectedHingeColor}
              isConfiguratorMode={true}
            />
          </div>
        </div>

        {/* Right Side: Customization Sidebar */}
        <div className="w-full md:w-[460px] lg:w-[490px] h-[55vh] md:h-full bg-[#0a0a0c] border-t md:border-t-0 md:border-l border-white/10 flex flex-col order-2 md:order-2 relative z-20 shadow-2xl">
          {/* Top Bar with Back Button */}
          <div className="p-5 md:p-6 pb-4 border-b border-white/10 flex items-center justify-between">
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              onMouseEnter={() => soundEngine.playHover()}
              className="text-gray-400 hover:text-white flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors interactive"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Showcase</span>
            </button>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-gray-300">
              BUILD LAB
            </span>
          </div>

          {/* Scrollable Configuration Controls */}
          <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-6 scrollbar-thin">
            <div>
              <h2
                className="text-white font-display text-2xl md:text-3xl tracking-wide uppercase leading-none mb-1"
                style={{ fontFamily: "'Anton', sans-serif" }}
              >
                DESIGN YOUR
                <br />
                ARAI CONVERTIBLE
              </h2>
              <p className="text-gray-400 text-xs font-mono">
                Engineered In-Mold MT11015 finish, 360° hinges, and regional keyboard.
              </p>
            </div>

            {/* 1. Base Chassis Finish */}
            <div>
              <label className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2.5 block flex justify-between">
                <span>Chassis PBR Finish</span>
                <span className="text-white font-bold">{selectedFinish.name}</span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {FINISH_PALETTE.map((finish) => (
                  <button
                    key={finish.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedFinish(finish);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    title={finish.name}
                    className={`w-9 h-9 rounded-full border-2 transition-all interactive flex items-center justify-center ${
                      selectedFinish.id === finish.id
                        ? 'border-white scale-110 shadow-lg'
                        : 'border-white/20 hover:scale-105'
                    }`}
                    style={{ backgroundColor: finish.hex }}
                  >
                    {selectedFinish.id === finish.id && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Hinge / Accent Line Color */}
            <div>
              <label className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2.5 block flex justify-between">
                <span>360° Hinge Anodizing</span>
                <span className="text-xs font-mono" style={{ color: selectedHingeColor }}>
                  {selectedHingeColor}
                </span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {HINGE_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedHingeColor(color);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`w-7 h-7 rounded-full border-2 transition-all interactive ${
                      selectedHingeColor === color
                        ? 'border-white scale-110 shadow-md'
                        : 'border-white/10 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* 3. Keyboard Layout */}
            <div>
              <label className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2 block">
                Keyboard Layout
              </label>
              <div className="grid grid-cols-1 gap-2">
                {KEYBOARD_LAYOUTS.map((kb) => (
                  <button
                    key={kb.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedKeyboard(kb);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`p-3 rounded-xl border text-left transition-all interactive flex items-center justify-between ${
                      selectedKeyboard.id === kb.id
                        ? 'bg-white/10 border-white text-white'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-bold text-white uppercase">{kb.label}</div>
                      <div className="text-[10px] text-gray-400">{kb.desc}</div>
                    </div>
                    {selectedKeyboard.id === kb.id && (
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedHingeColor }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Memory & Storage Tiers */}
            <div>
              <label className="text-xs text-gray-400 font-mono uppercase tracking-widest mb-2 block">
                Memory & Storage
              </label>
              <div className="grid grid-cols-3 gap-2">
                {MEMORY_TIERS.map((tier) => (
                  <button
                    key={tier.id}
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedMemory(tier);
                    }}
                    onMouseEnter={() => soundEngine.playHover()}
                    className={`p-2.5 rounded-xl border text-center transition-all interactive ${
                      selectedMemory.id === tier.id
                        ? 'bg-white/15 border-white text-white shadow-md'
                        : 'bg-white/[0.02] border-white/10 text-gray-400 hover:border-white/30'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{tier.ram}</div>
                    <div className="text-[10px] text-gray-300 font-mono">{tier.storage}</div>
                    <div className="text-[10px] text-cyan-400 font-mono mt-1">
                      {tier.priceDelta === 0 ? 'Included' : `+$${tier.priceDelta}`}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. Active EMR Stylus */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center gap-2.5">
                <PenTool className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="text-xs font-bold text-white uppercase">Active Digital EMR Pen</div>
                  <div className="text-[10px] text-gray-400">Integrated garage charging + 4096 pressure levels</div>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIncludeStylus(!includeStylus);
                }}
                onMouseEnter={() => soundEngine.playHover()}
                className={`w-11 h-6 rounded-full transition-colors relative interactive ${
                  includeStylus ? 'bg-cyan-500' : 'bg-white/20'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                    includeStylus ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* 6. AI Hardware Recommendation Lab */}
            <div className="p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-mono uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Hardware Advisor</span>
                </label>
                <span className="text-[10px] font-mono text-gray-500">Gemini Assisted</span>
              </div>
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder='Describe your usage (e.g. "Secondary education with math touch exercises" or "Outdoor field diagnostics")'
                className="w-full bg-black/60 border border-white/15 rounded-lg p-2.5 text-xs text-white placeholder-gray-600 outline-none resize-none h-18 mb-2 font-sans"
              />
              <button
                onClick={handleAiRecommend}
                disabled={isGeneratingAi || !aiPrompt.trim()}
                onMouseEnter={() => soundEngine.playHover()}
                className="w-full py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-mono uppercase tracking-wider transition-all disabled:opacity-50 interactive flex items-center justify-center gap-2"
              >
                {isGeneratingAi ? (
                  <>
                    <span className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <span>Analyzing Architectural Requirements...</span>
                  </>
                ) : (
                  <span>Optimize Spec For My Workflow</span>
                )}
              </button>

              {aiRecommendation && (
                <div className="mt-2 text-[11px] text-gray-300 italic border-l-2 border-cyan-400 pl-2 py-0.5">
                  "{aiRecommendation}"
                </div>
              )}
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div className="p-5 md:p-6 border-t border-white/10 bg-[#070709] flex flex-col gap-3">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono uppercase tracking-widest text-gray-400">Estimated Total</span>
              <span
                className="text-2xl font-bold font-sans text-white tracking-wide"
                style={{ color: selectedHingeColor }}
              >
                ${totalPrice.toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleSaveToCart}
              onMouseEnter={() => soundEngine.playHover()}
              className="w-full py-3.5 rounded-xl font-bold uppercase tracking-[0.15em] text-black text-xs transition-all duration-300 interactive shadow-lg hover:brightness-110 flex items-center justify-center gap-2"
              style={{ backgroundColor: selectedHingeColor }}
            >
              <span>Add Custom Build to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
