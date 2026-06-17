import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hoverText, setHoverText] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if device is touch-based or mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    // Apply global hidden cursor style
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      body, a, button, select, input, textarea, [role="button"] {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Initial setup
    gsap.set([dotRef.current, ringRef.current], { xPercent: -50, yPercent: -50, x: 0, y: 0 });

    const onMouseMove = (e) => {
      const { clientX: x, clientY: y } = e;

      // Tight follow for center dot/badge
      gsap.to(dotRef.current, {
        x: x,
        y: y,
        duration: 0.1,
        ease: 'power2.out'
      });

      // Lerping lag for outer ring
      gsap.to(ringRef.current, {
        x: x,
        y: y,
        duration: 0.35,
        ease: 'power3.out'
      });
    };

    const handleMouseOver = (e) => {
      const target = e.target.closest('.work-card, [data-cursor]');
      if (target) {
        setIsActive(true);
        const text = target.getAttribute('data-cursor-text') || 'View Video';
        setHoverText(text);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('.work-card, [data-cursor]');
      if (target) {
        setIsActive(false);
        setHoverText('');
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      if (document.head.contains(styleEl)) {
        document.head.removeChild(styleEl);
      }
    };
  }, []);

  const isMobile = typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  if (isMobile) return null;

  return (
    <>
      <div 
        ref={dotRef} 
        className={`custom-cursor fixed pointer-events-none z-[9999] flex items-center justify-center text-center font-bold select-none transition-all duration-300 ${isActive ? 'active' : ''}`}
        style={{ left: 0, top: 0 }}
      >
        {isActive && <span className="text-[9px] uppercase tracking-wider text-black select-none pointer-events-none leading-none">{hoverText}</span>}
      </div>
      <div 
        ref={ringRef} 
        className={`custom-cursor-ring fixed pointer-events-none z-[9998] transition-all duration-300 ${isActive ? 'active' : ''}`}
        style={{ left: 0, top: 0 }}
      />
    </>
  );
}
