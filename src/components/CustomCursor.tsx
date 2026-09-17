import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface CustomCursorProps {
  accentColor?: string;
}

export const CustomCursor: React.FC<CustomCursorProps> = ({ accentColor = '#06b6d4' }) => {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (!dotRef.current || !ringRef.current) return;

    // Quick setters for instant response
    const setDotX = gsap.quickTo(dotRef.current, 'x', { duration: 0.001 });
    const setDotY = gsap.quickTo(dotRef.current, 'y', { duration: 0.001 });
    const setRingX = gsap.quickTo(ringRef.current, 'x', { duration: 0.2, ease: 'power3.out' });
    const setRingY = gsap.quickTo(ringRef.current, 'y', { duration: 0.2, ease: 'power3.out' });

    const handleMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);
      setDotX(e.clientX);
      setDotY(e.clientY);
      setRingX(e.clientX);
      setRingY(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      const isInteractive =
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.closest('button') !== null ||
        target.closest('a') !== null ||
        target.classList.contains('interactive');

      setIsHovered(isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  useEffect(() => {
    if (!ringRef.current || !dotRef.current) return;

    if (isHovered) {
      gsap.to(ringRef.current, {
        scale: 2.6,
        opacity: 0.25,
        backgroundColor: accentColor,
        borderColor: accentColor,
        duration: 0.3
      });
      gsap.to(dotRef.current, {
        scale: 0.5,
        backgroundColor: 'transparent',
        duration: 0.3
      });
    } else {
      gsap.to(ringRef.current, {
        scale: 1,
        opacity: 0.4,
        backgroundColor: 'transparent',
        borderColor: 'rgba(255,255,255,0.7)',
        duration: 0.3
      });
      gsap.to(dotRef.current, {
        scale: 1,
        backgroundColor: '#ffffff',
        duration: 0.3
      });
    }
  }, [isHovered, accentColor]);

  return (
    <>
      <style>{`
        @media (pointer: fine) {
          body, a, button, input, select, textarea {
            cursor: none !important;
          }
        }
      `}</style>
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 w-2 h-2 rounded-full pointer-events-none z-[9999] mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{ backgroundColor: '#ffffff' }}
      />
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 w-8 h-8 rounded-full border border-white/60 pointer-events-none z-[9998] mix-blend-difference -translate-x-1/2 -translate-y-1/2 will-change-transform transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </>
  );
};
