import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const TRAIL_IMAGES = [
  'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a4ca02e824eb8b5c90c3_rectangle_15.webp',
  'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a4ca58e005fcc5ab883c_rectangle_11.webp',
  'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a4caaa27d245ccdbb3d1_rectangle_13.webp',
  'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a4ca8219779951f7ed90_rectangle_14.webp',
  'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a4ca777975f60c7f24eb_rectangle_12.webp'
];

export default function HeroImageTrail() {
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const imgIndexRef = useRef(0);
  const zIndexRef = useRef(1);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const mousePosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Set initial visibility on images
    imagesRef.current.forEach(img => {
      if (img) gsap.set(img, { visibility: 'visible' });
    });

    const getMouseDistance = (pos1, pos2) => Math.hypot(pos1.x - pos2.x, pos1.y - pos2.y);

    const onMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mousePosRef.current = { x, y };

      const distance = getMouseDistance(mousePosRef.current, lastMousePosRef.current);

      if (distance > 70) {
        showNextImage(x, y);
        lastMousePosRef.current = { x, y };
      }
    };

    const showNextImage = (x, y) => {
      const idx = imgIndexRef.current;
      const el = imagesRef.current[idx];
      if (!el) return;

      zIndexRef.current += 1;
      imgIndexRef.current = (imgIndexRef.current + 1) % TRAIL_IMAGES.length;

      gsap.killTweensOf(el);

      const imgWidth = 190;
      const imgHeight = 209;

      gsap.timeline()
        .fromTo(el, 
          {
            opacity: 0,
            scale: 0.1,
            x: x - imgWidth / 2,
            y: y - imgHeight / 2,
            zIndex: zIndexRef.current,
            rotation: gsap.utils.random(-12, 12)
          },
          {
            opacity: 1,
            scale: 1,
            x: x - imgWidth / 2,
            y: y - imgHeight / 2,
            duration: 0.35,
            ease: 'power2.out'
          }
        )
        .to(el, {
          opacity: 0,
          scale: 0.2,
          duration: 0.75,
          ease: 'power2.out',
          delay: 0.65
        });
    };

    window.addEventListener('mousemove', onMouseMove);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <div ref={containerRef} className="image_wrap absolute inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-[1]">
      {TRAIL_IMAGES.map((src, idx) => (
        <div 
          key={idx}
          ref={el => imagesRef.current[idx] = el}
          className="content_img-wrap absolute opacity-0 select-none pointer-events-none"
          style={{
            width: '190px',
            height: '209px',
            borderRadius: '12px',
            overflow: 'hidden',
            willChange: 'transform, filter',
            visibility: 'hidden'
          }}
        >
          <img 
            src={src} 
            alt="" 
            className="content_img w-full h-full object-cover pointer-events-none"
          />
        </div>
      ))}
    </div>
  );
}
