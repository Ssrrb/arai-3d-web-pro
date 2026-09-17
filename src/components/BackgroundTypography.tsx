import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ProductVariant } from '../types';

interface AnimatedWordProps {
  text: string;
  delay?: number;
}

const AnimatedWord: React.FC<AnimatedWordProps> = ({ text, delay = 0 }) => {
  const wordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!wordRef.current) return;
    const chars = wordRef.current.querySelectorAll('.char');
    gsap.killTweensOf(chars);
    gsap.fromTo(
      chars,
      {
        y: 110,
        opacity: 0,
        scale: 0.8,
        filter: 'blur(14px)',
        rotateX: -45
      },
      {
        y: 0,
        opacity: 0.3,
        scale: 1,
        filter: 'blur(0px)',
        rotateX: 0,
        duration: 1.3,
        stagger: 0.05,
        ease: 'power4.out',
        delay
      }
    );
  }, [text, delay]);

  return (
    <span
      ref={wordRef}
      className="inline-flex relative"
      style={{ perspective: '1000px' }}
    >
      {text.split('').map((char, i) => (
        <span
          key={`${text}-${i}`}
          className="char inline-block will-change-transform origin-bottom"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

interface BackgroundTypographyProps {
  product: ProductVariant;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}

export const BackgroundTypography: React.FC<BackgroundTypographyProps> = ({
  product,
  scrollRef
}) => {
  const watermarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current || !watermarkRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const maxScroll = scrollHeight - clientHeight;
      const progress = maxScroll > 0 ? scrollTop / maxScroll : 0;

      if (progress > 0.4) {
        watermarkRef.current.style.opacity = '0.08';
        watermarkRef.current.style.transform = `translateY(${(progress - 0.4) * -60}px)`;
      } else {
        watermarkRef.current.style.opacity = '0';
      }
    };

    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', handleScroll, { passive: true });
    }
    return () => {
      if (el) el.removeEventListener('scroll', handleScroll);
    };
  }, [scrollRef]);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
      {/* Primary Big Background Text on Hero */}
      <div className="flex absolute inset-0 flex-row items-center justify-center pt-[18vh] md:pt-0">
        <h1
          key={`title-${product.id}`}
          className="font-display font-black text-[14vw] md:text-[18vw] leading-none text-slate-100 tracking-tight flex flex-row items-center gap-3 md:gap-[6vw]"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          <AnimatedWord text={product.namePart1} delay={0} />
          <AnimatedWord text={product.namePart2} delay={0.2} />
        </h1>
      </div>

      {/* Secondary Dynamic Watermark that appears on scroll */}
      <div
        ref={watermarkRef}
        className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-700 pointer-events-none"
      >
        <h2
          className="font-display text-[22vw] text-slate-100/70 tracking-tight translate-y-[-5vh]"
          style={{ fontFamily: "'Anton', sans-serif" }}
        >
          360°
        </h2>
      </div>
    </div>
  );
};
