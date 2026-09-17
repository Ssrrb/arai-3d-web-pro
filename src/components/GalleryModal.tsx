import React, { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Download, Sparkles, Image as ImageIcon } from 'lucide-react';
import { GALLERY_ITEMS } from '../data/specsData';

interface GalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryModal: React.FC<GalleryModalProps> = ({ isOpen, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  if (!isOpen) return null;

  const currentItem = GALLERY_ITEMS[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? GALLERY_ITEMS.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === 0 ? 1 : (prev + 1) % GALLERY_ITEMS.length));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[88vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{currentItem.title}</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-amber-950/70 border border-amber-500/30 text-amber-300 font-semibold">
                  {currentItem.tag}
                </span>
              </div>
              <p className="text-xs text-slate-400">Official Product Studio Renders (Cycles Engine)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={currentItem.src}
              download={`${currentItem.id}.webp`}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
              title="Download High-Res Render"
            >
              <Download className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Image Stage */}
        <div className="relative flex-1 bg-black/70 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
          <img
            src={currentItem.src}
            alt={currentItem.title}
            className="max-h-[62vh] max-w-full object-contain rounded-lg drop-shadow-2xl transition-all duration-300"
          />

          {/* Previous / Next Arrow buttons */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md shadow-lg transition-transform hover:scale-105"
            title="Previous Image"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 backdrop-blur-md shadow-lg transition-transform hover:scale-105"
            title="Next Image"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Description caption */}
          <div className="absolute bottom-4 left-6 right-6 max-w-2xl mx-auto bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-xl text-center">
            <p className="text-xs text-slate-200">{currentItem.description}</p>
          </div>
        </div>

        {/* Thumbnails Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <span className="text-xs font-mono text-slate-400">
            Render {currentIndex + 1} of {GALLERY_ITEMS.length}
          </span>

          <div className="flex items-center gap-3 overflow-x-auto py-1">
            {GALLERY_ITEMS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => setCurrentIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                  currentIndex === idx
                    ? 'border-cyan-400 scale-105 shadow-md shadow-cyan-500/20'
                    : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                }`}
              >
                <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-mono hidden sm:inline">12.2" Convertible 2-in-1</span>
        </div>
      </div>
    </div>
  );
};
