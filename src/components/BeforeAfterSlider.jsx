import React, { useState, useRef, useEffect } from 'react';
import { MoveHorizontal } from 'lucide-react';

export default function BeforeAfterSlider({ 
  beforeImage = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=40&w=800", // dull raw
  afterImage = "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&q=80&w=800", // vivid graded
  aspectRatio = "aspect-video"
}) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const position = (x / rect.width) * 100;
    setSliderPosition(Math.max(0, Math.min(100, position)));
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handlePointerDown = (e) => {
    setIsDragging(true);
    handleMove(e.clientX);
    e.preventDefault();
  };

  useEffect(() => {
    const handlePointerUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
    }

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging]);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${aspectRatio} overflow-hidden border border-[#1a1a24] select-none cursor-ew-resize`}
      onPointerDown={handlePointerDown}
    >
      {/* "AFTER" Image (Vivid / Color Graded) - Base Layer */}
      <img 
        src={afterImage} 
        alt="After color grading and editing" 
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      <div className="absolute right-4 bottom-4 bg-[#08080a] border border-[#1a1a24] px-3 py-1 text-[10px] font-mono tracking-wider text-[#ff5722] pointer-events-none uppercase">
        After: Graded & FX
      </div>

      {/* "BEFORE" Image (Dull / Raw Footage) - Top Overlay Layer */}
      <div 
        className="absolute inset-0 w-full h-full object-cover overflow-hidden pointer-events-none"
        style={{ width: `${sliderPosition}%` }}
      >
        {/* We keep the image size at 100% of the slider container width, and clip it by the parent div width */}
        <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ width: containerRef.current ? `${containerRef.current.getBoundingClientRect().width}px` : '100%' }}>
          <img 
            src={beforeImage} 
            alt="Before color grading and editing" 
            className="absolute inset-0 w-full h-full object-cover filter saturate-50 brightness-75 pointer-events-none"
          />
        </div>
        <div className="absolute left-4 bottom-4 bg-[#08080a] border border-[#1a1a24] px-3 py-1 text-[10px] font-mono tracking-wider text-gray-500 pointer-events-none uppercase">
          Before: Raw LOG
        </div>
      </div>

      {/* Vertical Slider Bar */}
      <div 
        className="absolute top-0 bottom-0 w-[1px] bg-[#ff5722] cursor-ew-resize flex items-center justify-center pointer-events-none"
        style={{ left: `${sliderPosition}%` }}
      >
        {/* Handle Badge */}
        <div className="w-8 h-8 bg-[#08080a] border border-[#ff5722] flex items-center justify-center transform -translate-x-1/2 pointer-events-auto shadow-md">
          <MoveHorizontal className="w-3.5 h-3.5 text-[#ff5722]" />
        </div>
      </div>
    </div>
  );
}
