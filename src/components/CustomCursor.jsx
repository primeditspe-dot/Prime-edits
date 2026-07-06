import React, { useEffect, useRef, useState } from 'react';

export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [hoverText, setHoverText] = useState('');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    // Check if device is touch-based or mobile
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) return;

    // Apply global hidden cursor style for all interactive elements
    const styleEl = document.createElement('style');
    styleEl.innerHTML = `
      body, a, button, select, input, textarea, [role="button"], label, .showcase-card, .how-card, .bento-card {
        cursor: none !important;
      }
    `;
    document.head.appendChild(styleEl);

    // Position coordinates
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const dot = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: window.innerWidth / 2, y: window.innerHeight / 2 };

    const onMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    let rafId = 0;
    const tick = () => {
      // Lerp center dot (fast follow)
      dot.x += (mouse.x - dot.x) * 0.28;
      dot.y += (mouse.y - dot.y) * 0.28;

      // Lerp outer ring (lagged smooth follow)
      ring.x += (mouse.x - ring.x) * 0.12;
      ring.y += (mouse.y - ring.y) * 0.12;

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${dot.x}px, ${dot.y}px, 0) translate(-50%, -50%)`;
      }
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ring.x}px, ${ring.y}px, 0) translate(-50%, -50%)`;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);

    // Expand cursor hover listener for links, buttons, and custom triggers
    const handleMouseOver = (e) => {
      const target = e.target.closest('a, button, [role="button"], .showcase-card, .how-card, .bento-card, [data-cursor]');
      if (target) {
        setIsActive(true);
        const text = target.getAttribute('data-cursor-text') || 'View';
        setHoverText(text);
      }
    };

    const handleMouseOut = (e) => {
      const target = e.target.closest('a, button, [role="button"], .showcase-card, .how-card, .bento-card, [data-cursor]');
      if (target) {
        setIsActive(false);
        setHoverText('');
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
      cancelAnimationFrame(rafId);
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
