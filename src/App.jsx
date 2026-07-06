import React, { useState, useEffect, useRef } from 'react';
import {
  Film, Video, Play, Sparkles, Wand2, ShieldCheck, Zap,
  Layers, Palette, Scissors, ArrowUpRight, ArrowLeft, ArrowRight,
  Phone, Mail, MapPin, Check, Plus, Minus, ChevronDown, Award, Globe,
  Clock, HeartHandshake, Instagram, X, ArrowUp
} from 'lucide-react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import WebGLBackground from './components/WebGLBackground';
import ScrollReveal from './components/ScrollReveal';
import ContactForm from './components/ContactForm';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [timeString, setTimeString] = useState('');
  const [heroEmail, setHeroEmail] = useState('');
  const [activeWordIdx, setActiveWordIdx] = useState(0);
  const [exportProgress, setExportProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Refs for scroll elements and carousel
  const headerRef = useRef(null);
  const carouselRef = useRef(null);
  
  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    if (!preloaderDone) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
      smoothTouch: false
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);

    return () => {
      lenis.destroy();
    };
  }, [preloaderDone]);

  // Entrance animations for the hero elements
  useEffect(() => {
    if (!preloaderDone) return;

    // Header entrance
    if (headerRef.current) {
      gsap.fromTo(headerRef.current,
        { opacity: 0, y: -40 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.1 }
      );
    }

    // Scroll listener for header background
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // Hero entrance animations
    gsap.fromTo(".hero-animate-badge",
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.3 }
    );

    gsap.fromTo(".hero-animate-title span",
      { opacity: 0, y: 40, filter: 'blur(8px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.9, stagger: 0.1, ease: 'power3.out', delay: 0.4 }
    );

    gsap.fromTo(".hero-animate-text",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.8 }
    );

    gsap.fromTo(".hero-animate-cta",
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 0.9 }
    );

    gsap.fromTo(".hero-animate-mockup",
      { opacity: 0, scale: 0.94, y: 30 },
      { opacity: 1, scale: 1, y: 0, duration: 1, ease: 'power3.out', delay: 0.8 }
    );

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [preloaderDone]);

  // Scroll velocity card skewing effect
  useEffect(() => {
    if (!preloaderDone) return;

    let proxy = { skew: 0 };
    const cards = gsap.utils.toArray('.how-card, .showcase-card, .bento-card');
    
    // Quick setters for performance
    const skewSetters = cards.map(card => gsap.quickSetter(card, "skewY", "deg"));
    const clamp = gsap.utils.clamp(-6, 6); // max 6 deg tilt

    const trigger = ScrollTrigger.create({
      onUpdate: (self) => {
        let skew = clamp(self.getVelocity() / -450);
        // Only animate if skew is significant
        if (Math.abs(skew) > Math.abs(proxy.skew)) {
          proxy.skew = skew;
          gsap.to(proxy, {
            skew: 0,
            duration: 0.85,
            ease: "power3.out",
            overwrite: "auto",
            onUpdate: () => {
              skewSetters.forEach(setter => setter(proxy.skew));
            }
          });
        }
      }
    });

    return () => {
      trigger.kill();
    };
  }, [preloaderDone]);

  // Live Mumbai Time Clock
  useEffect(() => {
    const updateTime = () => {
      const options = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      setTimeString(formatter.format(new Date()));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Word highlight cycle animation (Bento Pacing card)
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveWordIdx((prev) => (prev + 1) % 6);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Export progress loop animation (Bento Export card)
  useEffect(() => {
    const interval = setInterval(() => {
      setExportProgress((prev) => {
        if (prev >= 100) return 0;
        return prev + 1;
      });
    }, 45);
    return () => clearInterval(interval);
  }, []);

  // Form input submit -> scrolls to contact brief and injects email
  const handleHeroEmailSubmit = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
      // Injects email into form fields
      const emailField = document.getElementById('contact-email');
      if (emailField) {
        emailField.value = heroEmail;
        // Trigger React state change indirectly by dispatching event
        const event = new Event('input', { bubbles: true });
        emailField.dispatchEvent(event);
      }
    }
  };

  // Carousel click scroll handler
  const handleCarouselScroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth * 0.8;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const editSteps = [
    {
      num: '01',
      icon: '↑',
      title: 'Upload your brief',
      desc: 'Drop your raw camera files, zoom records, overlays, and instructions in our secure cloud folder.'
    },
    {
      num: '02',
      icon: '✦',
      title: 'Pace & Grade',
      desc: 'We structure the timeline, apply retention zooms, grade the color profile, and construct the soundscape.'
    },
    {
      num: '03',
      icon: '→',
      title: 'Render & Dominate',
      desc: 'Review draft edits with frame-accurate links. Once approved, we deliver the master files in a tap.'
    }
  ];

  const portfolioProjects = [
    {
      id: 1,
      title: 'PRISM EDIT',
      category: 'YouTube Content',
      tag: 'Infographics & Pacing',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e1e04e06ea3dca26b231b2_rectangle_52%20(2).webp'
    },
    {
      id: 2,
      title: 'HALO PROMO',
      category: 'Brand Commercial',
      tag: 'VFX & Color Grading',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e1f544419bf0fcfa672549_rectangle_52%20(3).webp'
    },
    {
      id: 3,
      title: 'PULSE BEATS',
      category: 'Vertical Reel',
      tag: 'Kinetic Captions',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e1f55743c0257a03bff33d_freepik_a_natural_candid_waistup_2805125553_1%20(1).webp'
    },
    {
      id: 4,
      title: 'VERTEX SHOTS',
      category: 'YouTube Vlog',
      tag: 'Ambient Film Grading',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e5990498f8925988514684_Pastel%20Knit%20Portrait.png'
    },
    {
      id: 5,
      title: 'ORBIT CORE',
      category: 'Brand Anthem',
      tag: 'Heavy Soundscapes',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e59953b55fe4b963810a36_Glowing%20Pink%20Blossoms.png'
    },
    {
      id: 6,
      title: 'AETHER CUTS',
      category: 'Cinematic Reel',
      tag: 'Pacing Strategy',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e599b187d88393eca45f91_Boxer%20in%20Action.png'
    }
  ];

  const highlightWords = ["Pacing", "Hooks", "Narrative", "Grading", "SFX Mix", "Retention"];

  return (
    <>
      {/* 1. Preloader Screen */}
      <Preloader onComplete={() => setPreloaderDone(true)} />

      {/* 2. Custom Cursor Follower */}
      {preloaderDone && <CustomCursor />}

      <div className={`page-wrap bg-[#04050a] min-h-screen text-white select-none transition-opacity duration-500 ${preloaderDone ? 'opacity-100' : 'opacity-0'}`}>

        {/* 3. Header Navbar (Frosted & Animated) */}
        <header 
          ref={headerRef} 
          className={`fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 transition-all duration-500`}
        >
          <nav 
            className={`flex w-full max-w-5xl items-center justify-between gap-4 rounded-full px-6 py-3 transition-all duration-500 ${
              scrolled 
                ? 'glass-strong border-white/10 bg-black/45 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.85)]' 
                : 'border-transparent bg-transparent'
            }`}
          >
            <a className="text-xl tracking-wider select-none font-bebas flex items-center gap-2" href="#top">
              <span className="inline-block leading-none tracking-widest text-white">
                PRIME EDITS<span className="text-[var(--color-cyan)]">.</span>
              </span>
            </a>
            
            {/* Desktop Navigation Links */}
            <div className="hidden items-center gap-8 md:flex">
              <a href="#how" className="text-xs font-mono uppercase tracking-widest text-fg-dim transition-colors hover:text-fg">How it works</a>
              <a href="#showcase" className="text-xs font-mono uppercase tracking-widest text-fg-dim transition-colors hover:text-fg">Showcase</a>
              <a href="#features" className="text-xs font-mono uppercase tracking-widest text-fg-dim transition-colors hover:text-fg">Features</a>
              <a href="#styles" className="text-xs font-mono uppercase tracking-widest text-fg-dim transition-colors hover:text-fg">Styles</a>
              <a href="#channels" className="text-xs font-mono uppercase tracking-widest text-fg-dim transition-colors hover:text-fg">Platforms</a>
            </div>

            {/* CTA Link */}
            <div className="flex items-center gap-2">
              <a href="#contact" className="btn btn-primary h-9 px-5 text-xs uppercase tracking-wider font-semibold hidden sm:inline-flex cursor-pointer">
                Get Started
              </a>
              
              {/* Mobile Navigation Toggle Button */}
              <button 
                aria-label="Menu" 
                onClick={() => setMenuOpen(!menuOpen)}
                className="grid h-9 w-9 place-items-center rounded-full border border-white/15 md:hidden cursor-pointer"
              >
                <div className="space-y-1">
                  <span className={`block h-0.5 w-4 bg-white transition-transform duration-300 ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></span>
                  <span className={`block h-0.5 w-4 bg-white transition-opacity duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
                  <span className={`block h-0.5 w-4 bg-white transition-transform duration-300 ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></span>
                </div>
              </button>
            </div>
          </nav>

          {/* Mobile Overlay Menu */}
          <div 
            className={`fixed inset-x-0 top-[76px] mx-4 rounded-3xl border border-white/15 bg-black/95 backdrop-blur-xl p-6 transition-all duration-500 z-40 md:hidden ${
              menuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'
            }`}
          >
            <nav className="flex flex-col gap-5 text-sm font-mono uppercase tracking-widest text-center">
              <a href="#how" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[var(--color-cyan)] border-b border-white/5">How it works</a>
              <a href="#showcase" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[var(--color-cyan)] border-b border-white/5">Showcase</a>
              <a href="#features" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[var(--color-cyan)] border-b border-white/5">Features</a>
              <a href="#styles" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[var(--color-cyan)] border-b border-white/5">Styles</a>
              <a href="#channels" onClick={() => setMenuOpen(false)} className="py-2 hover:text-[var(--color-cyan)] border-b border-white/5">Platforms</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="btn btn-primary h-11 w-full py-3 mt-4 text-xs font-semibold cursor-pointer">Get Started</a>
            </nav>
          </div>
        </header>

        <main id="top">
          {/* 4. Hero Section with shader background */}
          <section className="relative isolate min-h-[100svh] overflow-hidden pt-28 flex items-center">
            {/* Background Shader & Repeating Grids */}
            <WebGLBackground className="absolute inset-0 -z-10" />
            <div className="bg-grid pointer-events-none absolute inset-0 -z-[5]"></div>


            <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 px-6 pb-20 pt-10 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="text-center lg:text-left select-none">
                {/* Announcement tag */}
                <div className="hero-animate-badge mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-cyan)]"></span>
                  <span className="text-[10px] font-mono tracking-widest text-fg-dim uppercase">YouTube · Instagram Reels · Promos</span>
                </div>
                
                {/* Hero Title */}
                <h1 className="hero-animate-title h-display text-[clamp(2.8rem,9vw,6rem)] select-none uppercase leading-[0.85]">
                  <span className="mr-[0.16em] inline-block text-gradient">video</span>
                  <span className="mr-[0.16em] inline-block text-gradient">edits</span>
                  <br className="hidden sm:inline" />
                  <span className="mr-[0.16em] inline-block text-gradient">that</span>
                  <span className="mr-[0.16em] inline-block text-accent-gradient">retain</span>
                </h1>
                
                <p className="hero-animate-text mx-auto mt-6 max-w-md text-balance text-sm sm:text-base text-fg-dim lg:mx-0 font-mono tracking-wide leading-relaxed uppercase">
                  // We craft high-retention post-production packages combining fast paced storytelling, dynamic infographics, and color grades that hook user focus.
                </p>

                {/* Hero input submit Waitlist style */}
                <div className="hero-animate-cta mt-9 flex flex-col items-center gap-4 lg:items-start">
                  <div className="w-full max-w-md">
                    <form onSubmit={handleHeroEmailSubmit} className="flex flex-col gap-2 sm:flex-row">
                      <div className="glass flex flex-1 items-center rounded-full px-2 py-1.5 border border-white/5 focus-within:border-white/20">
                        <input 
                          type="email" 
                          placeholder="you@email.com" 
                          required
                          value={heroEmail}
                          onChange={(e) => setHeroEmail(e.target.value)}
                          className="w-full bg-transparent px-4 py-2 text-sm text-white placeholder:text-fg-faint focus:outline-none font-mono" 
                          aria-label="Email address" 
                        />
                      </div>
                      <button type="submit" className="btn btn-primary h-[48px] px-6 text-xs uppercase font-semibold cursor-pointer">
                        Get Started
                      </button>
                    </form>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-fg-faint uppercase">Free first edit trial for channels over 50k subscribers</span>
                  </div>
                </div>
              </div>

              {/* Hero Right Visual Mockup (SVG + CSS editor timeline) */}
              <div className="hero-animate-mockup select-none pointer-events-none z-10 flex justify-center">
                <div className="relative w-[280px] sm:w-[320px] aspect-[9/16] glass rounded-[36px] p-3.5 shadow-3xl border border-white/10 flex flex-col justify-between overflow-hidden">
                  <div className="absolute -inset-10 -z-10 rounded-[60px] opacity-40 blur-3xl bg-gradient-to-tr from-[var(--color-accent)] to-[var(--color-cyan)]"></div>
                  
                  {/* Top phone bar */}
                  <div className="flex justify-between items-center px-4 pt-1 font-mono text-[9px] text-fg-dim">
                    <span>9:41</span>
                    <div className="w-14 h-4 rounded-full bg-black/60 border border-white/5 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-zinc-800"></div>
                    </div>
                    <span>5G</span>
                  </div>

                  {/* Mock Video player container */}
                  <div className="flex-1 my-3 rounded-2xl bg-zinc-950 border border-white/5 overflow-hidden relative flex flex-col justify-end p-4">
                    {/* Background mock grad */}
                    <div className="absolute inset-0 bg-gradient-to-b from-[#141a29]/30 to-[#04050a] z-0"></div>
                    
                    {/* SVG Graphic illustrating a cut */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-85 z-0">
                      <svg width="100%" height="100%" viewBox="0 0 200 300">
                        <defs>
                          <radialGradient id="mockGlow" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" stopColor="#3a86ff" stopOpacity="0.45" />
                            <stop offset="100%" stopColor="#04050a" stopOpacity="0" />
                          </radialGradient>
                        </defs>
                        <rect width="200" height="300" fill="url(#mockGlow)" />
                        {/* Audio visualizer */}
                        <g transform="translate(10, 150)">
                          {Array.from({ length: 18 }).map((_, idx) => {
                            const h = 10 + Math.sin(idx * 0.7) * 20;
                            return (
                              <rect 
                                key={idx} 
                                x={idx * 10} 
                                y={-h / 2} 
                                width="3.5" 
                                height={h} 
                                rx="1.5" 
                                fill={idx < 10 ? "var(--color-cyan)" : "rgba(255, 255, 255, 0.12)"} 
                              />
                            );
                          })}
                        </g>
                      </svg>
                    </div>

                    {/* Captions mockup inside player */}
                    <div className="relative z-10 w-full text-center space-y-2 mb-2">
                      <div className="inline-block glass px-3 py-1 rounded-lg border border-white/10">
                        <span className="text-[10px] font-mono text-[var(--color-cyan)] uppercase tracking-wide">0.24s · keyframe active</span>
                      </div>
                      <h4 className="font-bebas text-3xl uppercase leading-none tracking-wide text-white text-shadow">
                        ye edit next <span className="text-accent-gradient">LEVEL</span> hai 🔥
                      </h4>
                    </div>
                  </div>

                  {/* Mock Video timeline controller */}
                  <div className="h-28 rounded-2xl bg-black/60 border border-white/5 p-3 flex flex-col justify-between font-mono text-[9px] text-fg-dim">
                    <div className="flex justify-between items-center border-b border-white/5 pb-1.5">
                      <span className="text-[8px] text-[var(--color-cyan)] uppercase">editing tracks</span>
                      <span>00:12:04</span>
                    </div>
                    {/* Multitrack track segments */}
                    <div className="space-y-1.5 mt-2">
                      <div className="h-3 rounded bg-[var(--color-accent)]/20 border border-[var(--color-accent)]/35 relative overflow-hidden">
                        <div className="h-full bg-[var(--color-accent)] w-3/5 rounded-l"></div>
                        <div className="absolute right-3 top-0 h-full w-0.5 bg-white"></div>
                      </div>
                      <div className="h-3 rounded bg-[var(--color-cyan)]/25 border border-[var(--color-cyan)]/35 relative overflow-hidden">
                        <div className="h-full bg-[var(--color-cyan)] w-[45%] rounded-l"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom transition gradient fade */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-[#04050a]"></div>
          </section>

          {/* 5. How It Works Section */}
          <section id="how" className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
            <div className="mx-auto max-w-2xl text-center">
              <ScrollReveal>
                <span className="kicker">How it works</span>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <h2 className="h-display mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] text-gradient uppercase">Three steps to <span className="text-accent-gradient">viral</span></h2>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <p className="mt-4 text-fg-dim mx-auto max-w-lg text-sm sm:text-base font-mono uppercase tracking-wide">// From raw files to high retention master cuts — zero friction.</p>
              </ScrollReveal>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3">
              {editSteps.map((step, idx) => (
                <ScrollReveal key={idx} delay={idx * 150}>
                  <div className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl p-7 min-h-[220px] how-card">
                    {/* Glowing background card hover spot */}
                    <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(circle, rgba(58,134,255,0.4), transparent 70%)' }}></div>
                    
                    <div className="flex items-start justify-between">
                      <span className="font-mono text-sm text-[var(--color-cyan)]">{step.num}</span>
                      <span className="grid h-9 w-9 place-items-center rounded-full border border-white/10 text-sm text-white how-icon">{step.icon}</span>
                    </div>

                    <div className="mt-8">
                      <h3 className="font-bebas text-2xl tracking-widest text-white uppercase">{step.title}</h3>
                      <p className="mt-2.5 text-xs sm:text-sm text-fg-dim font-mono leading-relaxed uppercase">{step.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>

          {/* 6. Showcase Section (Interactive Carousel) */}
          <section id="showcase" className="relative overflow-hidden py-24 sm:py-32">
            <div className="mx-auto max-w-5xl px-6">
              <div className="flex items-end justify-between gap-6">
                <div className="max-w-xl">
                  <ScrollReveal>
                    <span className="kicker">In action</span>
                  </ScrollReveal>
                  <ScrollReveal delay={100}>
                    <h2 className="h-display mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] text-gradient uppercase">See it <span className="text-accent-gradient">in action</span></h2>
                  </ScrollReveal>
                  <ScrollReveal delay={200}>
                    <p className="mt-4 text-fg-dim text-sm sm:text-base font-mono uppercase tracking-wide">// Frame cuts from recent clients. High retention metrics across formats.</p>
                  </ScrollReveal>
                </div>
                
                {/* Navigation Buttons for Carousel */}
                <div className="hidden shrink-0 gap-3 md:flex font-mono">
                  <button 
                    onClick={() => handleCarouselScroll('left')} 
                    aria-label="Previous" 
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition-all duration-300 hover:scale-105 hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleCarouselScroll('right')} 
                    aria-label="Next" 
                    className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white transition-all duration-300 hover:scale-105 hover:border-[var(--color-cyan)] hover:text-[var(--color-cyan)] cursor-pointer"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Horizontal snaps list */}
            <div 
              ref={carouselRef}
              className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-4 [scroll-padding-left:1.5rem] sm:px-[max(1.5rem,calc((100vw-64rem)/2))]"
            >
              {portfolioProjects.map((project, idx) => (
                <ScrollReveal key={project.id} delay={idx * 100} className="shrink-0 snap-start">
                  <div 
                    className="relative aspect-[9/16] w-[240px] sm:w-[280px] overflow-hidden rounded-[24px] border border-white/10 shadow-xl group cursor-pointer showcase-card"
                  >
                    <img 
                      alt={project.title} 
                      loading="lazy" 
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                      src={project.image}
                    />
                    {/* Gradient shadow */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-85"></div>
                    
                    {/* Project details card hover display */}
                    <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end gap-1 text-left z-10">
                      <span className="font-mono text-[9px] text-[var(--color-cyan)] uppercase tracking-widest">{project.category}</span>
                      <h4 className="font-bebas text-2xl uppercase tracking-wide text-white">{project.title}</h4>
                      <div className="flex justify-between items-center text-[9px] font-mono text-fg-dim uppercase mt-1">
                        <span>{project.tag}</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-fg-faint group-hover:text-[var(--color-cyan)] transition-colors" />
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
              
              {/* Carousel CTA card */}
              <ScrollReveal delay={portfolioProjects.length * 100} className="shrink-0 snap-start">
                <div className="relative aspect-[9/16] w-[240px] sm:w-[280px] overflow-hidden rounded-[24px] border border-dashed border-white/20 bg-white/5 p-6 flex flex-col justify-center items-center text-center showcase-card">
                  <h4 className="font-bebas text-2xl uppercase tracking-wide text-white mb-2">Got a brief?</h4>
                  <p className="text-xs font-mono text-fg-dim uppercase mb-6 leading-relaxed">Let's craft your custom editing style.</p>
                  <a href="#contact" className="btn btn-primary h-10 px-5 text-xs font-semibold uppercase tracking-wider cursor-pointer">
                    Send details
                  </a>
                </div>
              </ScrollReveal>
            </div>
            
            <p className="mt-4 px-6 text-center font-mono text-[10px] text-fg-faint md:hidden uppercase">← swipe to explore →</p>
          </section>

          <div className="hr-glow mx-auto max-w-5xl"></div>

          {/* 7. Features Section (Bento grid style) */}
          <section id="features" className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
            <div className="max-w-xl">
              <ScrollReveal>
                <span className="kicker">Features</span>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <h2 className="h-display mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] text-gradient uppercase">Optimized for <span className="text-accent-gradient">retention</span></h2>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <p className="mt-4 text-fg-dim text-sm sm:text-base font-mono uppercase tracking-wide">// Strategic timeline variables crafted to capture algorithmic speed.</p>
              </ScrollReveal>
            </div>

            <div className="mt-14 grid auto-rows-[minmax(0,1fr)] grid-cols-1 gap-5 md:grid-cols-6">
              
              {/* Card 1: Pacing Animation (Word highlight loops) */}
              <ScrollReveal className="md:col-span-4" delay={0}>
                <div className="glass flex h-full flex-col gap-6 overflow-hidden rounded-3xl p-7 bento-card">
                  <div>
                    <h3 className="font-bebas text-2xl tracking-widest text-white uppercase">Retention pacing</h3>
                    <p className="mt-2 text-xs sm:text-sm text-fg-dim font-mono uppercase">// Standard pacing loses 45% of viewers by sec 3. We edit to lock them in.</p>
                  </div>
                  
                  <div className="mt-auto">
                    {/* Waveform graphic */}
                    <div className="flex items-end gap-1.5 h-16">
                      {Array.from({ length: 28 }).map((_, idx) => {
                        const h = 15 + Math.sin(idx * 0.4 + activeWordIdx) * 35;
                        const active = idx < (activeWordIdx + 1) * 4;
                        return (
                          <div 
                            key={idx} 
                            className="flex-1 rounded-full transition-all duration-300"
                            style={{
                              height: `${h}px`,
                              background: active ? 'var(--color-cyan)' : 'rgba(255, 255, 255, 0.12)',
                              boxShadow: active ? '0 0 12px rgba(76, 219, 232, 0.45)' : 'none'
                            }}
                          ></div>
                        );
                      })}
                    </div>
                    {/* Word-by-word highlights */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {highlightWords.map((word, idx) => (
                        <span 
                          key={idx}
                          className={`rounded-md px-2.5 py-1 text-[11px] font-mono font-semibold transition-all duration-300 uppercase ${
                            idx === activeWordIdx 
                              ? 'bg-[var(--color-accent)] text-black' 
                              : 'bg-white/5 text-fg-dim'
                          }`}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 2: Depth effect masked behind SVG */}
              <ScrollReveal className="md:col-span-2 md:row-span-2" delay={150}>
                <div className="glass flex h-full flex-col gap-5 overflow-hidden rounded-3xl p-7 bento-card">
                  <div>
                    <h3 className="font-bebas text-2xl tracking-widest text-white uppercase">Visual Depth</h3>
                    <p className="mt-2 text-xs text-fg-dim font-mono uppercase">// Text-behind-subject masks to pull characters into foreground depth.</p>
                  </div>
                  
                  <div className="relative mt-auto flex-1 overflow-hidden rounded-2xl border border-white/5 bg-zinc-950/60 transition-transform duration-500 hover:scale-[1.02]" style={{ minHeight: '280px' }}>
                    <svg viewBox="0 0 320 360" className="absolute inset-0 h-full w-full">
                      <defs>
                        <linearGradient id="dimFig" x1="0" y1="0" x2="1" y2="1">
                          <stop offset="0%" stopColor="#5b9bff"></stop>
                          <stop offset="55%" stopColor="#3a86ff"></stop>
                          <stop offset="100%" stopColor="#14a394"></stop>
                        </linearGradient>
                        <linearGradient id="dimRim" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.55)"></stop>
                          <stop offset="35%" stopColor="rgba(255, 255, 255, 0)"></stop>
                        </linearGradient>
                        <filter id="dimSoft" x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="7"></feGaussianBlur>
                        </filter>
                      </defs>
                      <g>
                        <text x="160" y="185" textAnchor="middle" className="font-bebas transition-all duration-300" style={{ fontSize: '96px', letterSpacing: '1px' }} fill="#ffffff" fillOpacity="0.9">PRIME</text>
                      </g>
                      <g>
                        <ellipse cx="160" cy="352" rx="92" ry="20" fill="#04050a" opacity="0.6" filter="url(#dimSoft)"></ellipse>
                        <path d="M150 246 C150 246 150 232 150 232 C118 226 96 196 96 156 C96 116 124 90 160 90 C196 90 224 116 224 156 C224 196 202 226 170 232 C170 232 170 246 170 246 C232 250 268 286 270 360 L50 360 C52 286 88 250 150 246 Z" fill="url(#dimFig)"></path>
                        <path d="M96 156 C96 116 124 90 160 90 C196 90 224 116 224 156" fill="none" stroke="url(#dimRim)" strokeWidth="2.5" strokeLinecap="round"></path>
                      </g>
                    </svg>
                    <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/50 px-2.5 py-1 text-[8px] font-mono text-[var(--color-cyan)] backdrop-blur">
                      <span className="h-1 w-1 rounded-full bg-[var(--color-cyan)]"></span> tracking active
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 3: Edit Presets list */}
              <ScrollReveal className="md:col-span-2" delay={100}>
                <div className="glass flex h-full flex-col gap-6 overflow-hidden rounded-3xl p-7 bento-card">
                  <div>
                    <h3 className="font-bebas text-2xl tracking-widest text-white uppercase">Detail Precision</h3>
                    <p className="mt-2 text-xs text-fg-dim font-mono uppercase">// Micro assets customized to match your branding elements.</p>
                  </div>
                  
                  <div className="mt-auto flex flex-wrap gap-2.5">
                    {["Zoom Cut", "Film Grade", "Sound FX", "Graphic Overlay", "Speed Ramp"].map((preset, idx) => (
                      <span 
                        key={idx}
                        className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 font-mono text-[10px] text-white uppercase transition-all duration-300 hover:scale-105 hover:bg-[var(--color-cyan)]/15 hover:border-[var(--color-cyan)] cursor-pointer"
                      >
                        {preset}
                      </span>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Card 4: Progress loops */}
              <ScrollReveal className="md:col-span-2" delay={200}>
                <div className="glass flex h-full flex-col gap-6 overflow-hidden rounded-3xl p-7 bento-card">
                  <div>
                    <h3 className="font-bebas text-2xl tracking-widest text-white uppercase">Fluid Workflows</h3>
                    <p className="mt-2 text-xs text-fg-dim font-mono uppercase">// Interactive review updates. Fast feedback turnarounds.</p>
                  </div>
                  
                  <div className="mt-auto rounded-2xl border border-white/10 bg-black/35 p-4 transition-all duration-300 hover:shadow-[0_0_15px_rgba(58,134,255,0.15)]">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--color-accent)] text-black font-semibold text-[10px]">RAW</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-[9px] font-mono"><span className="text-white uppercase">Rendering Edit…</span><span className="text-[var(--color-cyan)] font-bold">{exportProgress}%</span></div>
                        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                          <div className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-cyan)] transition-all duration-150" style={{ width: `${exportProgress}%` }}></div>
                        </div>
                      </div>
                    </div>
                    <p className="mt-2 text-[8px] font-mono text-fg-faint uppercase">Active review draft · frame.io integration</p>
                  </div>
                </div>
              </ScrollReveal>

            </div>

            {/* Bottom 3 cards row */}
            <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <ScrollReveal delay={0}>
                <div className="glass rounded-3xl p-6 bento-card">
                  <h3 className="font-bebas text-xl tracking-widest text-white uppercase">Custom Overlays</h3>
                  <p className="mt-2 text-xs text-fg-dim font-mono leading-relaxed uppercase">// Unique subtitle presets, illustrations, and motion banners.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={100}>
                <div className="glass rounded-3xl p-6 bento-card">
                  <h3 className="font-bebas text-xl tracking-widest text-white uppercase">Fast turnarounds</h3>
                  <p className="mt-2 text-xs text-fg-dim font-mono leading-relaxed uppercase">// Standard delivery within 48h. Keep your channels feed active.</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={200}>
                <div className="glass rounded-3xl p-6 bento-card">
                  <h3 className="font-bebas text-xl tracking-widest text-white uppercase">No registration</h3>
                  <p className="mt-2 text-xs text-fg-dim font-mono leading-relaxed uppercase">// Submit project details and upload video links with no account barrier.</p>
                </div>
              </ScrollReveal>
            </div>
          </section>

          {/* 8. Styles Section (Interactive previews on hover) */}
          <section id="styles" className="relative py-24 sm:py-32">
            <div className="mx-auto max-w-5xl px-6">
              <div className="max-w-xl">
                <ScrollReveal>
                  <span className="kicker">Edit styles</span>
                </ScrollReveal>
                <ScrollReveal delay={100}>
                  <h2 className="h-display mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] text-gradient uppercase">Seven looks. <span className="text-accent-gradient">One goal.</span></h2>
                </ScrollReveal>
                <ScrollReveal delay={200}>
                  <p className="mt-4 text-fg-dim text-sm sm:text-base font-mono uppercase tracking-wide">// Diverse edit strategies designed for specific channels and niches. Hover a style to feel it move.</p>
                </ScrollReveal>
              </div>
            </div>

            {/* Styles Cards Grid */}
            <div className="mx-auto mt-14 grid max-w-5xl grid-cols-1 gap-5 px-6 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Style Card 1: Editorial */}
              <ScrollReveal delay={0}>
                <div 
                  className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl min-h-[250px] transition-all duration-300 cursor-pointer"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(58,134,255,0.08), transparent 70%)' }}></div>
                  <div className="flex-1 flex items-center justify-center bg-black/35 p-6">
                    <div className="text-center font-bebas text-4xl uppercase tracking-wider leading-none transition-transform duration-500 group-hover:scale-105">
                      RETENTION IS <span className="text-[var(--color-cyan)] editorial-word">KING</span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bebas text-xl tracking-wider text-white uppercase">Editorial Hook</h3>
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] opacity-60 group-hover:opacity-100"></span>
                    </div>
                    <p className="mt-1 text-[11px] font-mono text-fg-dim uppercase">Bold headers, magazine grids, styled overlays.</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Style Card 2: Pop Up */}
              <ScrollReveal delay={100}>
                <div 
                  className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl min-h-[250px] transition-all duration-300 cursor-pointer"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(58,134,255,0.08), transparent 70%)' }}></div>
                  <div className="flex-1 flex items-center justify-center bg-black/35 p-6">
                    <div className="flex gap-2">
                      <span className="font-mono text-lg font-bold text-white uppercase popup-word">captions</span>
                      <span className="font-mono text-lg font-bold text-white uppercase popup-word">that</span>
                      <span className="font-mono text-lg font-bold text-white uppercase popup-word text-[var(--color-cyan)]">pop</span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bebas text-xl tracking-wider text-white uppercase">Pop Up</h3>
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] opacity-60 group-hover:opacity-100"></span>
                    </div>
                    <p className="mt-1 text-[11px] font-mono text-fg-dim uppercase">Rapid word-level captions popping on the audio beats.</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Style Card 3: Minimal */}
              <ScrollReveal delay={200}>
                <div 
                  className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl min-h-[250px] transition-all duration-300 cursor-pointer"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(58,134,255,0.08), transparent 70%)' }}></div>
                  <div className="flex-1 flex items-center justify-center bg-black/35 p-6">
                    <div className="font-mono text-sm tracking-widest lowercase minimal-text">
                      clean cuts only
                    </div>
                  </div>
                  <div className="border-t border-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bebas text-xl tracking-wider text-white uppercase">Minimalist</h3>
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] opacity-60 group-hover:opacity-100"></span>
                    </div>
                    <p className="mt-1 text-[11px] font-mono text-fg-dim uppercase">Quiet lowercase labels, out of the way of the speaker frame.</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Style Card 4: Veena / Tall */}
              <ScrollReveal delay={0}>
                <div 
                  className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl min-h-[250px] transition-all duration-300 cursor-pointer"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(58,134,255,0.08), transparent 70%)' }}></div>
                  <div className="flex-1 flex items-center justify-center bg-black/35 p-6">
                    <div className="flex flex-col items-center leading-none text-center">
                      <span className="font-bebas text-3xl text-white uppercase tracking-wider">CINEMATIC</span>
                      <span className="font-bebas text-3xl text-[var(--color-cyan)] uppercase tracking-wider veena-text-1">PACING</span>
                    </div>
                  </div>
                  <div className="border-t border-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bebas text-xl tracking-wider text-white uppercase">Cinematic Pacing</h3>
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] opacity-60 group-hover:opacity-100"></span>
                    </div>
                    <p className="mt-1 text-[11px] font-mono text-fg-dim uppercase">Condensed high impact typography, stacked for drama.</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Style Card 5: Aesthetics / Serif */}
              <ScrollReveal delay={100}>
                <div 
                  className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl min-h-[250px] transition-all duration-300 cursor-pointer"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(58,134,255,0.08), transparent 70%)' }}></div>
                  <div className="flex-1 flex items-center justify-center bg-black/35 p-6">
                    <div className="font-serif-d text-2xl italic text-fg font-light tracking-wide aesthetics-text">
                      a softer kind of grade
                    </div>
                  </div>
                  <div className="border-t border-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bebas text-xl tracking-wider text-white uppercase">Aesthetics</h3>
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] opacity-60 group-hover:opacity-100"></span>
                    </div>
                    <p className="mt-1 text-[11px] font-mono text-fg-dim uppercase">Elegant serif configurations. Soft cinematic grades.</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Style Card 6: 8-bit Monospace */}
              <ScrollReveal delay={200}>
                <div 
                  className="glass group relative flex flex-col justify-between overflow-hidden rounded-3xl min-h-[250px] transition-all duration-300 cursor-pointer"
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" style={{ background: 'radial-gradient(60% 50% at 50% 30%, rgba(58,134,255,0.08), transparent 70%)' }}></div>
                  <div className="flex-1 flex items-center justify-center bg-black/35 p-6">
                    <div className="font-pixel text-[10px] uppercase tracking-widest pixel-text">
                      PIXEL PERFECT ▶
                    </div>
                  </div>
                  <div className="border-t border-white/5 p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bebas text-xl tracking-wider text-white uppercase">8-Bit Retro</h3>
                      <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-cyan)] opacity-60 group-hover:opacity-100"></span>
                    </div>
                    <p className="mt-1 text-[11px] font-mono text-fg-dim uppercase">Arcade font layouts, glitch effects, neon palettes.</p>
                  </div>
                </div>
              </ScrollReveal>

              {/* CTA Card: Try them all */}
              <ScrollReveal delay={100}>
                <div className="glass-strong flex flex-col justify-between rounded-3xl p-7 min-h-[250px] transition-transform duration-300 hover:scale-[1.02]">
                  <span className="kicker">+ more styles</span>
                  <div>
                    <h3 className="font-bebas text-2xl tracking-widest text-white uppercase">Your brand signature</h3>
                    <p className="mt-2 text-xs sm:text-sm text-fg-dim font-mono leading-relaxed uppercase">// We calibrate custom overlays, grading templates, and timings specifically for your identity.</p>
                  </div>
                  <a href="#contact" className="btn btn-primary h-10 px-5 text-xs font-semibold uppercase tracking-wider self-start cursor-pointer">
                    Brief our team
                  </a>
                </div>
              </ScrollReveal>

            </div>
          </section>

          {/* 9. Algorithm Marquee (Platforms list) */}
          <section id="channels" className="relative overflow-hidden py-24 sm:py-32">
            {/* Soft cyan background radial spot */}
            <div className="pointer-events-none absolute left-1/2 top-1/3 -z-10 h-[380px] w-[380px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]" style={{ background: 'radial-gradient(circle, var(--color-cyan), transparent 70%)' }}></div>
            
            <div className="mx-auto max-w-5xl px-6">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <ScrollReveal>
                    <span className="kicker">Channels</span>
                  </ScrollReveal>
                  <ScrollReveal delay={100}>
                    <h2 className="h-display mt-4 text-[clamp(2.2rem,5.5vw,4.5rem)] text-gradient uppercase">Optimized for <span className="text-accent-gradient">every</span> app</h2>
                  </ScrollReveal>
                  <ScrollReveal delay={200}>
                    <p className="mt-4 text-fg-dim text-sm sm:text-base font-mono leading-relaxed uppercase">
                      // Different platforms require different templates. We adjust framing crops, resolution encodes, and graphic assets for YouTube, Shorts, TikTok, and Meta Ads to secure organic retention.
                    </p>
                  </ScrollReveal>
                  
                  {/* Platforms tags */}
                  <ScrollReveal delay={300}>
                    <div className="mt-8 flex flex-wrap gap-2">
                      {["YouTube", "Instagram Reels", "TikTok Shorts", "LinkedIn Video", "Twitter Video", "Meta Ads", "Pinterest Promos"].map((chan, idx) => (
                        <span 
                          key={idx} 
                          className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-mono text-fg-dim uppercase transition-all duration-300 hover:scale-105 hover:bg-white/10 hover:border-white/20 cursor-pointer"
                        >
                          {chan}
                        </span>
                      ))}
                    </div>
                  </ScrollReveal>
                </div>

                {/* Big Metric Display glass panel */}
                <div>
                  <ScrollReveal delay={200}>
                    <div className="glass-strong relative min-h-[220px] rounded-3xl p-8 flex flex-col justify-between bento-card">
                      <div className="flex items-center justify-between">
                        <span className="kicker">Performance metrics</span>
                        <span className="rounded-full bg-[var(--color-cyan)]/10 border border-[var(--color-cyan)]/20 px-3 py-1 font-mono text-[9px] text-[var(--color-cyan)] uppercase">typical results</span>
                      </div>
                      
                      <div className="my-6 text-center">
                        <span className="font-bebas text-7xl sm:text-8xl leading-none text-accent-gradient tracking-wide block">58%</span>
                        <span className="text-[10px] font-mono text-fg-dim uppercase tracking-wider mt-1 block">average client view retention</span>
                      </div>

                      <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[9px] font-mono text-fg-faint uppercase">
                        <span>vs 32% industry benchmark</span>
                        <span>audited views data</span>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </div>

            {/* Horizontal Continuous Marquee */}
            <ScrollReveal delay={300}>
              <div className="relative mt-20 [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)] select-none">
                <div className="marquee-track font-bebas text-4xl sm:text-5xl uppercase tracking-widest text-white/15 cursor-pointer">
                  {Array.from({ length: 2 }).map((_, loopIdx) => (
                    <React.Fragment key={loopIdx}>
                      <span className="mx-7">YouTube</span>
                      <span className="mx-7 text-[var(--color-cyan)]">Reels</span>
                      <span className="mx-7">TikTok</span>
                      <span className="mx-7">LinkedIn Video</span>
                      <span className="mx-7 text-[var(--color-accent)]">Meta Ads</span>
                      <span className="mx-7">Vimeo</span>
                      <span className="mx-7">X Shorts</span>
                      <span className="mx-7 text-[var(--color-cyan)]">Short-form</span>
                      <span className="mx-7">Organic growth</span>
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </ScrollReveal>
          </section>

          {/* 10. CTA Form Section (Brief Submission form wrapped) */}
          <section id="contact" className="relative bg-zinc-950/40 border-t border-white/5 py-24 sm:py-32">
            <div className="mx-auto max-w-3xl px-6">
              <ScrollReveal>
                <ContactForm />
              </ScrollReveal>
            </div>
          </section>
        </main>

        {/* 11. Footer with Mumbai time clock */}
        <footer className="footer bg-[#04050a] border-t border-white/5 py-12">
          <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 max-w-5xl">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2">
                <span className="font-bebas font-black tracking-widest text-lg text-white uppercase">
                  PRIME EDITS<span className="text-[var(--color-cyan)]">.</span>
                </span>
              </div>
              <p className="text-[8px] font-mono text-fg-faint uppercase">
                &copy; {new Date().getFullYear()} PRIME EDITS. ALL RIGHTS RESERVED.
              </p>
            </div>

            {/* Time Clock & Links */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-2 font-mono text-[9px] text-fg-dim uppercase">
                <Clock className="w-3.5 h-3.5 text-[var(--color-cyan)] animate-pulse" />
                <span>mumbai time:</span>
                <span className="text-white font-bold">{timeString}</span>
              </div>
              <div className="flex gap-4 text-[9px] font-mono text-fg-faint uppercase tracking-widest mt-1">
                <a href="#top" className="hover:text-white flex items-center gap-1 transition-transform hover:-translate-y-0.5">
                  Top <ArrowUp className="w-3 h-3" />
                </a>
                <span>/</span>
                <a href="#contact" className="hover:text-white transition-transform hover:-translate-y-0.5">Brief Form</a>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}
