import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { X, Trash2, ShoppingBag, ArrowRight, ShieldCheck, Laptop } from 'lucide-react';
import { CartItem } from '../types';
import { soundEngine } from '../utils/soundEngine';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onRemoveItem: (index: number) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onRemoveItem
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [checkedOut, setCheckedOut] = React.useState<boolean>(false);

  useEffect(() => {
    if (!overlayRef.current || !panelRef.current) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      gsap.to(overlayRef.current, {
        opacity: 1,
        duration: 0.4,
        pointerEvents: 'auto',
        ease: 'power2.out'
      });
      gsap.fromTo(
        panelRef.current,
        { x: '100%' },
        { x: '0%', duration: 0.5, ease: 'power3.out' }
      );
    } else {
      document.body.style.overflow = '';
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.35,
        pointerEvents: 'none',
        ease: 'power2.in'
      });
      gsap.to(panelRef.current, {
        x: '100%',
        duration: 0.4,
        ease: 'power3.in'
      });
    }
  }, [isOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.price, 0);

  const handleCheckout = () => {
    soundEngine.playSuccess();
    setCheckedOut(true);
    setTimeout(() => {
      setCheckedOut(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none select-none">
      {/* Dimmed backdrop */}
      <div
        ref={overlayRef}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity"
      />

      {/* Slide-out Drawer Panel */}
      <div
        ref={panelRef}
        className="absolute top-0 right-0 h-full w-full sm:w-[460px] bg-[#09090b] border-l border-white/10 shadow-2xl flex flex-col pointer-events-auto translate-x-full"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-5 h-5 text-white" />
            <h2
              className="font-display text-2xl text-white tracking-wider uppercase"
              style={{ fontFamily: "'Anton', sans-serif" }}
            >
              YOUR CART ({cartItems.length})
            </h2>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            onMouseEnter={() => soundEngine.playHover()}
            className="text-gray-400 hover:text-white p-2 transition-colors interactive rounded-lg hover:bg-white/5"
            aria-label="Close Cart"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4 py-16">
              <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                <Laptop className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-xs font-mono uppercase tracking-widest text-gray-400">
                Your Arai cart is currently empty
              </p>
              <p className="text-[11px] text-gray-600 text-center max-w-xs font-mono">
                Select an Arai Stratus or Nimbus edition from the showcase or configure a custom unit in the Lab.
              </p>
            </div>
          ) : (
            cartItems.map((item, index) => (
              <div
                key={`${item.id}-${index}`}
                className="flex gap-4 bg-white/[0.03] p-4 rounded-xl border border-white/10 transition-all hover:border-white/20"
              >
                {/* Swatch / Thumbnail */}
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center shrink-0 border"
                  style={{
                    backgroundColor: item.primaryColor,
                    borderColor: `${item.accentColor}80`
                  }}
                >
                  <Laptop className="w-7 h-7" style={{ color: item.accentColor }} />
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide">{item.name}</h3>
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">{item.finishName}</p>
                      <p className="text-[10px] font-mono text-gray-500 mt-0.5">
                        {item.ram} • {item.storage} • {item.keyboardLayout}
                      </p>
                      {item.includeStylus && (
                        <span className="inline-block mt-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          + Active EMR Stylus
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        soundEngine.playClick();
                        onRemoveItem(index);
                      }}
                      onMouseEnter={() => soundEngine.playHover()}
                      className="text-gray-500 hover:text-red-400 transition-colors p-1 interactive"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/5 font-mono">
                    <span className="text-[10px] text-gray-500 uppercase">{item.modelCode}</span>
                    <span className="text-sm font-bold text-white" style={{ color: item.accentColor }}>
                      ${item.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout Summary */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-white/10 bg-[#070709] space-y-4">
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span>
                <span className="text-white">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span className="text-emerald-400">FREE (Express)</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-white/10 text-white">
                <span className="font-sans">Total</span>
                <span className="font-sans">${subtotal.toFixed(2)}</span>
              </div>
            </div>

            {checkedOut ? (
              <div className="w-full py-4 rounded-xl bg-emerald-500 text-black font-bold text-center text-xs uppercase tracking-widest font-mono shadow-lg flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Order Placed Successfully!</span>
              </div>
            ) : (
              <button
                onClick={handleCheckout}
                onMouseEnter={() => soundEngine.playHover()}
                className="w-full bg-white text-black py-4 rounded-xl font-bold uppercase tracking-[0.2em] text-xs hover:bg-cyan-400 hover:text-black transition-all duration-300 interactive shadow-xl flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-gray-500 text-center uppercase tracking-widest">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>3-Year Enterprise Warranty • 30-Day Evaluation</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
