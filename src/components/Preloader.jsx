import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function Preloader({ onComplete }) {
  const containerRef = useRef(null);
  const wordsRef = useRef(null);
  const topPanelRef = useRef(null);
  const bottomPanelRef = useRef(null);
  const textRef = useRef(null);

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete();
      }
    });

    // Make elements visible (reversing Webflow style visibility hides)
    gsap.set([containerRef.current, textRef.current, topPanelRef.current, bottomPanelRef.current], { visibility: 'visible' });

    // Entrance of logo text
    tl.fromTo(textRef.current, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }
    );

    // Translate words: "Edit" -> "Style" -> "Retain" (52px offsets matches index.css)
    tl.to(wordsRef.current, { y: -52, duration: 0.6, ease: 'power3.inOut', delay: 0.4 });
    tl.to(wordsRef.current, { y: -104, duration: 0.6, ease: 'power3.inOut', delay: 0.4 });

    // Animate out the panels and fade the preloader text
    tl.to(topPanelRef.current, { scaleY: 0, duration: 0.8, ease: 'power4.inOut', delay: 0.2 });
    tl.to(bottomPanelRef.current, { scaleY: 0, duration: 0.8, ease: 'power4.inOut' }, '<');
    tl.to(textRef.current, { opacity: 0, scale: 0.85, duration: 0.4, ease: 'power2.in' }, '<');
    tl.to(containerRef.current, { opacity: 0, pointerEvents: 'none', duration: 0.4 }, '>-0.2');

  }, [onComplete]);

  return (
    <div ref={containerRef} className="preloader fixed inset-0 w-full h-full bg-[#04050a] z-[10000] flex items-center justify-center overflow-hidden">
      {/* Upper and Lower Panel splits */}
      <div ref={topPanelRef} className="line-bar-preload top absolute left-0 w-full h-1/2 bg-[#020306] z-[-1] origin-top"></div>
      <div ref={bottomPanelRef} className="line-bar-preload bottom absolute left-0 w-full h-1/2 bg-[#020306] z-[-1] origin-bottom"></div>

      <div ref={textRef} className="wrap-preloader-logo flex items-center justify-center flex-col select-none">
        <div className="preload-text-wrap flex items-center gap-4 text-white font-bebas text-2xl md:text-4xl uppercase tracking-widest overflow-hidden">
          <span>PRIME EDITS</span>
          <div className="preload-text-list h-[52px] overflow-hidden relative font-bebas">
            <div ref={wordsRef} className="flex flex-col">
              <span className="preload-text-list-item h-[52px] text-[var(--color-cyan)] flex items-center">Edit</span>
              <span className="preload-text-list-item h-[52px] text-[var(--color-cyan)] flex items-center">Style</span>
              <span className="preload-text-list-item h-[52px] text-[var(--color-cyan)] flex items-center">Retain</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
