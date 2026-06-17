import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function ScrollRevealText({ text }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const chars = containerRef.current.querySelectorAll('.reveal-char');
    if (chars.length === 0) return;

    gsap.fromTo(chars,
      { opacity: 0.15, color: '#3f3f46' }, // Zinc-700/dimmed start state
      {
        opacity: 1,
        color: '#ffffff', // bright white on scroll reveal
        stagger: 0.015,   // staggered character reveal
        ease: 'none',
        scrollTrigger: {
          trigger: containerRef.current,
          start: 'top 85%',
          end: 'bottom 55%',
          scrub: true,
          invalidateOnRefresh: true
        }
      }
    );
  }, [text]);

  const words = text.split(" ");

  return (
    <span ref={containerRef} className="inline select-none">
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-3">
          {word.split("").map((char, cIdx) => (
            <span 
              key={cIdx} 
              className="reveal-char inline-block"
              style={{ willChange: 'opacity, color' }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}
