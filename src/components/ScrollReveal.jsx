import React, { useEffect, useRef, useState } from 'react';

export default function ScrollReveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Check if prefers-reduced-motion is active to bypass animation
    const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setIsVisible(true);
      return;
    }

    // Direct check: if the element is already inside the viewport boundaries, show it immediately
    const rect = el.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;
    if (isInViewport) {
      setIsVisible(true);
      return;
    }

    // Fallback observer with a threshold of 0 (triggers as soon as 1 pixel is visible)
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.unobserve(el);
      }
    }, {
      threshold: 0, 
      rootMargin: '0px 0px -20px 0px' // minimal bottom buffer
    });

    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div 
      ref={ref} 
      className={`reveal-item ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
