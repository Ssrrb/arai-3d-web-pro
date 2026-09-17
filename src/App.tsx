import React, { useState, useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ChevronLeft, ChevronRight, ChevronDown, ShoppingBag, Check } from 'lucide-react';
import { ARAI_VARIANTS } from './data/productVariants';
import { ProductVariant, CartItem } from './types';
import { soundEngine } from './utils/soundEngine';
import { CustomCursor } from './components/CustomCursor';
import { HeaderNav } from './components/HeaderNav';
import { BackgroundTypography } from './components/BackgroundTypography';
import { Scene3D } from './components/Scene3D';
import { MetricsSection } from './components/MetricsSection';
import { EngineeringSection } from './components/EngineeringSection';
import { CartDrawer } from './components/CartDrawer';
import { SpecsModal } from './components/SpecsModal';
import { ContactModal } from './components/ContactModal';
import { BusinessModal } from './components/BusinessModal';
import { EducationModal } from './components/EducationModal';
import { BlueprintModal } from './components/BlueprintModal';
import { GalleryModal } from './components/GalleryModal';
import { TourModal } from './components/TourModal';

export function App() {
  const [variants] = useState<ProductVariant[]>(ARAI_VARIANTS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [addedAnimation, setAddedAnimation] = useState<boolean>(false);

  // Modals requested for the header: contacto, detalles, negocios, educacion
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isSpecsOpen, setIsSpecsOpen] = useState<boolean>(false);
  const [isBusinessOpen, setIsBusinessOpen] = useState<boolean>(false);
  const [isEducationOpen, setIsEducationOpen] = useState<boolean>(false);

  // Secondary modals
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);

  // References
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const priceRef = useRef<HTMLDivElement>(null);

  const currentProduct = variants[currentIndex];

  // Initialize Web Audio API on first user gesture
  useEffect(() => {
    const handleFirstClick = () => {
      soundEngine.init();
      window.removeEventListener('click', handleFirstClick);
    };
    window.addEventListener('click', handleFirstClick);
    return () => window.removeEventListener('click', handleFirstClick);
  }, []);

  // GSAP animation for price changes
  useEffect(() => {
    if (!priceRef.current) return;
    gsap.fromTo(
      priceRef.current,
      { y: 18, opacity: 0, filter: 'blur(6px)' },
      { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, ease: 'power2.out' }
    );
  }, [currentProduct.id]);

  // Next variant handler
  const handleNextVariant = () => {
    soundEngine.playClick();
    setCurrentIndex((prev) => (prev + 1) % variants.length);
  };

  // Previous variant handler
  const handlePrevVariant = () => {
    soundEngine.playClick();
    setCurrentIndex((prev) => (prev - 1 + variants.length) % variants.length);
  };

  // Add current variant to cart
  const handleAddToCart = () => {
    soundEngine.playSuccess();
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1200);

    const newItem: CartItem = {
      id: `std-${currentProduct.id}-${Date.now()}`,
      variantId: currentProduct.id,
      name: currentProduct.fullName,
      modelCode: currentProduct.modelCode,
      finishName: currentProduct.finishName,
      primaryColor: currentProduct.primaryColor,
      accentColor: currentProduct.accentColor,
      price: currentProduct.price,
      ram: currentProduct.specs.ram.split(' ')[0] || '8GB',
      storage: currentProduct.specs.storage.split(' ')[0] || '128GB',
      keyboardLayout: 'Spanish ISO (Ñ)',
      includeStylus: currentProduct.id === 2 || currentProduct.id === 5,
      addedAt: Date.now()
    };

    setCartItems((prev) => [...prev, newItem]);
  };

  // Remove cart item
  const handleRemoveCartItem = (index: number) => {
    soundEngine.playClick();
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* Custom Sleek Magnetic Cursor */}
      <CustomCursor accentColor="#000000" />

      {/* Header Modals: Contacto, Detalles, Negocios, Educación */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <SpecsModal
        isOpen={isSpecsOpen}
        onClose={() => setIsSpecsOpen(false)}
      />

      <BusinessModal
        isOpen={isBusinessOpen}
        onClose={() => setIsBusinessOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      <EducationModal
        isOpen={isEducationOpen}
        onClose={() => setIsEducationOpen(false)}
        onOpenContact={() => setIsContactOpen(true)}
      />

      {/* Shopping / Quote Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onRemoveItem={handleRemoveCartItem}
      />

      {/* Auxiliary Engineering Modals */}
      <BlueprintModal
        isOpen={isBlueprintOpen}
        onClose={() => setIsBlueprintOpen(false)}
      />

      <GalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
      />

      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        accentColor="#000000"
      />

      {/* Outer Viewport Frame: Pure White Background as requested */}
      <div
        id="app-root"
        className="relative w-full h-screen flex items-center justify-center overflow-hidden p-0 md:p-4 lg:p-6 select-none bg-white"
      >
        {/* Main Chassis Container Card: Pure White with subtle crisp border */}
        <div className="relative w-full h-full md:max-w-[1600px] md:max-h-[920px] bg-white md:rounded-[2rem] shadow-xl flex flex-col border-0 md:border md:border-slate-200 overflow-hidden">
          {/* Top Navbar with strictly: Contacto, Detalles, Negocios, Educación */}
          <HeaderNav
            product={currentProduct}
            cartCount={cartItems.length}
            onOpenCart={() => setIsCartOpen(true)}
            onOpenSpecs={() => setIsSpecsOpen(true)}
            onOpenBusiness={() => setIsBusinessOpen(true)}
            onOpenEducation={() => setIsEducationOpen(true)}
            onOpenContact={() => setIsContactOpen(true)}
          />

          {/* Persistent Three.js 3D WebGL Canvas: Pure White Background & Authentic Black Model */}
          <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
            <Scene3D
              currentProduct={currentProduct}
              scrollRef={scrollContainerRef}
            />
          </div>

          {/* Scrollable Snap Content Layers */}
          <div
            ref={scrollContainerRef}
            className="relative inset-0 z-30 w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth snap-y snap-mandatory scrollbar-none pointer-events-none"
            style={{ scrollbarWidth: 'none' }}
          >
            {/* HERO SNAP SECTION */}
            <section
              id="hero"
              className="relative w-full h-full min-h-full flex flex-col justify-between snap-start overflow-hidden pointer-events-none"
            >
              {/* Massive Subtle Background Typography */}
              <BackgroundTypography
                product={currentProduct}
                scrollRef={scrollContainerRef}
              />

              {/* Top Left: Interactive 360 Video Tour */}
              <div className="hidden md:flex absolute left-12 top-24 items-center gap-3.5 z-20 pointer-events-auto">
                <button
                  onClick={() => {
                    soundEngine.playClick();
                    setIsTourOpen(true);
                  }}
                  onMouseEnter={() => soundEngine.playHover()}
                  className="interactive group flex items-center gap-3 cursor-pointer bg-white/85 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-sm hover:shadow transition-all"
                  aria-label="Abrir recorrido 360"
                >
                  <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[7px] border-l-white border-b-[4px] border-b-transparent ml-0.5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[11px] font-mono tracking-wider uppercase text-slate-800 font-bold block">
                      Tour 360°
                    </span>
                    <span className="text-[9px] font-mono tracking-wider text-slate-400 block">
                      Video Interactivo
                    </span>
                  </div>
                </button>
              </div>

              {/* Right Vertical Coordinate Indicator */}
              <div className="hidden md:block absolute right-8 top-1/2 -translate-y-1/2 h-36 w-[1px] bg-gradient-to-b from-transparent via-slate-300 to-transparent z-20 pointer-events-none">
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] tracking-widest font-mono whitespace-nowrap text-slate-400 font-semibold">
                  360° CONVERTIBLE // 12.2"
                </span>
              </div>

              {/* Bottom Interactive HUD (Price, Specs, Black Button, Variant Nav) */}
              <div className="w-full px-6 md:px-14 pb-8 md:pb-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-6 mt-auto z-20 pointer-events-none">
                {/* Left: Price & Form Factor Pill */}
                <div className="flex flex-col gap-1.5 w-full md:w-auto text-center md:text-left pointer-events-auto items-center md:items-start">
                  <div
                    ref={priceRef}
                    className="font-sans text-4xl md:text-5xl font-light tracking-tight text-slate-900 drop-shadow-sm font-semibold"
                  >
                    ${currentProduct.price.toFixed(2)}
                  </div>
                  <div className="text-slate-600 text-xs tracking-wider uppercase font-mono flex items-center gap-2">
                    <span>12.2" WUXGA IPS</span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    <span>360° Convertible</span>
                    <span className="w-1 h-1 bg-slate-400 rounded-full" />
                    <span className="text-black font-bold">{currentProduct.finishName}</span>
                  </div>
                </div>

                {/* Center: Sleek Black Add To Cart CTA Button */}
                <div className="w-full md:w-auto md:absolute md:left-1/2 md:-translate-x-1/2 md:bottom-10 pointer-events-auto flex justify-center">
                  <button
                    onClick={handleAddToCart}
                    onMouseEnter={() => soundEngine.playHover()}
                    className="interactive group relative w-full sm:w-auto overflow-hidden rounded-xl px-10 py-4 bg-black text-white hover:bg-slate-800 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-black/10"
                  >
                    <div className="relative z-10 flex items-center justify-center gap-2.5 font-bold text-xs font-mono tracking-widest uppercase">
                      {addedAnimation ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-400" />
                          <span className="text-white">Añadido al Carrito</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4 text-white" />
                          <span className="text-white">Configurar & Añadir</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Right: Circular Variant Carousel Navigators */}
                <div className="pointer-events-auto flex items-center gap-3">
                  <span className="text-[11px] font-mono text-slate-500 mr-2 hidden sm:inline uppercase tracking-widest font-semibold">
                    Edición {currentIndex + 1} / {variants.length}
                  </span>
                  <button
                    onClick={handlePrevVariant}
                    onMouseEnter={() => soundEngine.playHover()}
                    className="interactive group p-3 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md text-slate-700 hover:text-black hover:border-black hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    aria-label="Modelo anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNextVariant}
                    onMouseEnter={() => soundEngine.playHover()}
                    className="interactive group p-3 rounded-xl border border-slate-200 bg-white/90 backdrop-blur-md text-slate-700 hover:text-black hover:border-black hover:bg-slate-50 transition-all shadow-sm active:scale-95"
                    aria-label="Siguiente modelo"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Scroll Down to Specs Indicator */}
                <div
                  className="absolute bottom-2.5 left-1/2 -translate-x-1/2 pointer-events-auto hidden lg:flex items-center gap-1 text-[10px] font-mono tracking-widest text-slate-400 hover:text-slate-800 transition-colors cursor-pointer uppercase font-medium"
                  onClick={() => setIsSpecsOpen(true)}
                >
                  <span>Ver Especificaciones Completas</span>
                  <ChevronDown className="w-3 h-3 animate-bounce" />
                </div>
              </div>
            </section>

            {/* SECTION 2: PERFORMANCE METRICS & CHROMEOS ENGINEERING */}
            <MetricsSection
              product={currentProduct}
              onOpenSpecs={() => setIsSpecsOpen(true)}
            />

            {/* SECTION 3: CAD BLUEPRINT & HARDWARE I/O SUITE */}
            <EngineeringSection
              product={currentProduct}
              onOpenBlueprint={() => setIsBlueprintOpen(true)}
              onOpenGallery={() => setIsGalleryOpen(true)}
              onOpenSpecs={() => setIsSpecsOpen(true)}
            />
          </div>

          {/* Bottom Brand Footer Watermark */}
          <div className="absolute bottom-3 left-8 text-slate-400 text-[10px] font-mono font-semibold z-20 pointer-events-none hidden md:block uppercase tracking-widest">
            Arai Nimbus S1 • Chromebook Convertible 360°
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
