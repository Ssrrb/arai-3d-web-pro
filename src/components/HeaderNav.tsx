import React, { useState } from 'react';
import { Laptop, ShoppingBag, Menu, X } from 'lucide-react';
import { soundEngine } from '../utils/soundEngine';
import { ProductVariant } from '../types';

interface HeaderNavProps {
  product: ProductVariant;
  cartCount: number;
  onOpenCart: () => void;
  onOpenSpecs: () => void;
  onOpenBusiness: () => void;
  onOpenEducation: () => void;
  onOpenContact: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  product,
  cartCount,
  onOpenCart,
  onOpenSpecs,
  onOpenBusiness,
  onOpenEducation,
  onOpenContact
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="w-full px-6 md:px-12 py-4 flex items-center justify-between pointer-events-auto select-none border-b border-slate-200/80 bg-white/90 backdrop-blur-md z-40">
      {/* Brand: clean, minimal, no excess text */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            soundEngine.playClick();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 interactive cursor-pointer group"
          aria-label="Arai Inicio"
        >
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm">
            <Laptop className="w-4 h-4" />
          </div>
          <span className="font-bold text-xl tracking-tight text-slate-900 font-sans">
            ARAI
          </span>
        </button>
      </div>

      {/* Navigation items requested strictly: contacto , detalles, negocios, educacion */}
      <nav className="hidden md:flex items-center gap-8 text-xs font-mono uppercase tracking-wider text-slate-700">
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenContact();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          className="hover:text-black font-semibold transition-colors py-1.5"
        >
          Contacto
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenSpecs();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          className="hover:text-black font-semibold transition-colors py-1.5"
        >
          Detalles
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenBusiness();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          className="hover:text-black font-semibold transition-colors py-1.5"
        >
          Negocios
        </button>
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenEducation();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          className="hover:text-black font-semibold transition-colors py-1.5"
        >
          Educación
        </button>
      </nav>

      {/* Right side: Cart & Mobile toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenCart();
          }}
          onMouseEnter={() => soundEngine.playHover()}
          className="relative p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-black hover:border-slate-400 hover:bg-slate-50 transition-all"
          aria-label="Ver carrito"
        >
          <ShoppingBag className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-black text-white flex items-center justify-center text-[10px] font-bold">
              {cartCount}
            </span>
          )}
        </button>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-lg border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50 transition-all"
          aria-label="Menú móvil"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-slate-200 shadow-xl p-6 flex flex-col gap-4 text-xs font-mono uppercase tracking-wider text-slate-800 z-50 animate-in slide-in-from-top-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              setMobileMenuOpen(false);
              onOpenContact();
            }}
            className="text-left py-2 border-b border-slate-100 hover:text-black font-semibold"
          >
            Contacto
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setMobileMenuOpen(false);
              onOpenSpecs();
            }}
            className="text-left py-2 border-b border-slate-100 hover:text-black font-semibold"
          >
            Detalles
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setMobileMenuOpen(false);
              onOpenBusiness();
            }}
            className="text-left py-2 border-b border-slate-100 hover:text-black font-semibold"
          >
            Negocios
          </button>
          <button
            onClick={() => {
              soundEngine.playClick();
              setMobileMenuOpen(false);
              onOpenEducation();
            }}
            className="text-left py-2 hover:text-black font-semibold"
          >
            Educación
          </button>
        </div>
      )}
    </header>
  );
};
