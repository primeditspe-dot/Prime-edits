import React, { useState, useEffect, useRef } from 'react';
import {
  Film, Video, Play, Sparkles, Wand2, ShieldCheck, Zap,
  Layers, Palette, Scissors, ArrowUpRight,
  Phone, Mail, MapPin, Check, Plus, Minus, ChevronDown, Award, Globe,
  Clock, HeartHandshake, Instagram, X
} from 'lucide-react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Preloader from './components/Preloader';
import CustomCursor from './components/CustomCursor';
import HeroImageTrail from './components/HeroImageTrail';
import ContactForm from './components/ContactForm';
import ScrollRevealText from './components/ScrollRevealText';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [preloaderDone, setPreloaderDone] = useState(false);
  const [activeServiceIndex, setActiveServiceIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProcessIndex, setActiveProcessIndex] = useState(0);
  const [timeString, setTimeString] = useState('');

  // Refs for ScrollTrigger
  const serviceSectionRef = useRef(null);
  const workSectionRef = useRef(null);
  const trackRef = useRef(null);
  const revealTextRef = useRef(null);
  const heroTextRef = useRef(null);

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

  // Scroll Animations: Reveal text & Hero parallax
  useEffect(() => {
    if (!preloaderDone) return;

    // Reveal and zoom text ("coming ahead") as user scrolls
    if (revealTextRef.current) {
      // Entrance fade & slide-up (triggers once)
      gsap.fromTo(revealTextRef.current,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 1.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: revealTextRef.current,
            start: 'top 90%',
            toggleActions: 'play none none none'
          }
        }
      );

      // Parallax scale-up ("coming ahead" on Z-axis) on scroll scrub
      gsap.fromTo(revealTextRef.current,
        { scale: 0.92, transformOrigin: 'center center' },
        {
          scale: 1.12,
          ease: 'none',
          scrollTrigger: {
            trigger: revealTextRef.current,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        }
      );
    }

    // Hero Text Parallax & Fade
    if (heroTextRef.current) {
      gsap.to(heroTextRef.current, {
        y: -100,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    // Sticky Scroll Services Image Transition
    if (serviceSectionRef.current) {
      ScrollTrigger.create({
        trigger: serviceSectionRef.current,
        start: 'top top',
        end: '+=200%',
        scrub: true,
        pin: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const progress = self.progress;
          // Split into 4 segments corresponding to the 4 services
          const idx = Math.min(3, Math.floor(progress * 4));
          setActiveServiceIndex(idx);
        }
      });
    }

    // Horizontal scroll timeline in Latest Projects
    if (workSectionRef.current && trackRef.current) {
      gsap.to(trackRef.current, {
        x: () => -(trackRef.current.scrollWidth - window.innerWidth),
        ease: 'none',
        scrollTrigger: {
          trigger: workSectionRef.current,
          start: 'top top',
          end: () => "+=" + (trackRef.current.scrollWidth - window.innerWidth),
          scrub: true,
          pin: true,
          invalidateOnRefresh: true
        }
      });
    }

    return () => {
      ScrollTrigger.getAll().forEach(t => t.kill());
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

  const services = [
    {
      title: 'youtube video editing',
      tag: '01 / YouTube Pacing',
      image: 'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1acdfcfc3d13ebf6cde40_rectangle_57.webp',
      desc: 'Infographics, smooth zoom cuts, sound design overlays, and high retention pacing built specifically for the YouTube algorithm.'
    },
    {
      title: 'vertical shorts / reels',
      tag: '02 / Micro Content',
      image: 'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a4ca02e824eb8b5c90c3_rectangle_15.webp',
      desc: 'Cinematic crop formatting, kinetic captions, emoji triggers, and fast cuts designed to capture and hold visual attention under 60 seconds.'
    },
    {
      title: 'cinematic brand promos',
      tag: '03 / Production Grade',
      image: 'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1acdfd95021a6dffd97ed_rectangle_57%20(2).webp',
      desc: 'Sleek motion designs, heavy soundscapes, sound effects libraries, and commercial grading to elevate products and campaigns.'
    },
    {
      title: 'color grading & vfx',
      tag: '04 / Post Finish',
      image: 'https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1ace0e59b442d4899fd54_rectangle_57%20(1).webp',
      desc: 'Cinematic film grades, greenscreen replacements, custom tracker banners, and transition edits to pull everything together.'
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
      category: 'Commercial',
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
      category: 'YouTube Vlogs',
      tag: 'Ambient Grading',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e5990498f8925988514684_Pastel%20Knit%20Portrait.png'
    },
    {
      id: 5,
      title: 'ORBIT CORE',
      category: 'Brand Anthem',
      tag: 'Commercial Grade',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e59953b55fe4b963810a36_Glowing%20Pink%20Blossoms.png'
    },
    {
      id: 6,
      title: 'AETHER CUTS',
      category: 'Cinematic Reel',
      tag: 'Sound Design Finish',
      image: 'https://cdn.prod.website-files.com/69e1af55cd74a45f4117081c/69e599b187d88393eca45f91_Boxer%20in%20Action.png'
    }
  ];

  const processes = [
    {
      num: '01',
      title: 'Discovery & Brief',
      desc: 'We start by aligning with your brand identity, pacing requirements, channels reference, and B-roll files.'
    },
    {
      num: '02',
      title: 'Structural Rough Cut',
      desc: 'We assemble the best takes, pacing them cleanly to construct a highly engaging, retention-focused foundation.'
    },
    {
      num: '03',
      title: 'Dynamic Overlays',
      desc: 'We integrate key captions, infographics, zooms, text tracking, and visual assets to hook user focus.'
    },
    {
      num: '04',
      title: 'Sound Design Finish',
      desc: 'Apply custom audio enhancement, background scores, foley cuts, and SFX layers to keep viewers listening.'
    },
    {
      num: '05',
      title: 'Review & Revisions',
      desc: 'We host interactive review streams to get your direct feedback, updating assets in quick feedback loops.'
    },
    {
      num: '06',
      title: 'Final Master Delivery',
      desc: 'Export the clean edit at high render formats (ProRes/MP4), ready to upload and drive organic growth.'
    }
  ];

  const testimonials = [
    {
      quote: "The retention on our YouTube cuts jumped from 35% to 58% in the first week. Prime Edits completely transformed our pacing structure.",
      author: "Aditya Magdum",
      role: "Founder, Magdum Infra",
      image: "https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1dc1c9cd84fc00ac771b9_rectangle_27%20(4).webp"
    },
    {
      quote: "Outstanding speed and aesthetic grading. They understood our brand vision and delivered promos that outperformed all our paid campaigns.",
      author: "Vedant Sutar",
      role: "Founder, Sutar Motors",
      image: "https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1dc1bdfd09ef94be9178c_rectangle_27%20(6).webp"
    },
    {
      quote: "Amazing Captions and vertical layouts. Our Reels are regularly hitting the explore page and driving thousands of new organic followers.",
      author: "Shravani D.",
      role: "Founder, Pulse Beats",
      image: "https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1dc1b4ba4ba2059820bd8_rectangle_27%20(5).webp"
    },
    {
      quote: "Great soundscapes and infographical elements. They masterfully took complex files and made a polished summary video.",
      author: "Chinmay Babar",
      role: "Founder, NoWap",
      image: "https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1dc1bce56233410b70cd2_rectangle_27%20(7).webp"
    }
  ];

  const faqs = [
    {
      q: "How long does editing take?",
      a: "Standard turnarounds are 24-48 hours for Short-form content (Reels/Shorts) and 3-5 business days for longer-form YouTube videos or Promotional campaigns, depending on complexity."
    },
    {
      q: "How many revisions are included?",
      a: "We include 2 rounds of revisions for the Basic package, 5 for Standard, and Unlimited revisions for our Premium tier. We want to make sure you get exactly the video you envisioned."
    },
    {
      q: "What file formats do you accept?",
      a: "We accept all standard video formats, including MP4, MOV, AVI, ProRes, and RAW camera files. You can upload directly via our client portal or send links from Google Drive/Dropbox."
    },
    {
      q: "How do payments work?",
      a: "For project-based contracts, we require a 50% deposit upfront and 50% upon final approval before watermarks are removed. Monthly retainers are billed at the beginning of each billing cycle."
    }
  ];

  return (
    <>
      {/* 1. Preloader Screen */}
      <Preloader onComplete={() => setPreloaderDone(true)} />

      {/* 2. Custom Cursor Follower */}
      {preloaderDone && <CustomCursor />}

      <div className={`page-wrap bg-black min-h-screen text-white overflow-hidden font-sans select-none transition-opacity duration-500 ${preloaderDone ? 'opacity-100' : 'opacity-0'}`}>

        {/* 3. Header Navbar */}
        <header className="navbar fixed top-0 left-0 w-full z-50 transition-all duration-300">
          <div className="container-navbar mx-auto px-6 md:px-12 h-20 flex items-center justify-between border-b border-[#1a1a24] bg-black/60 backdrop-blur-md">

            <a href="#hero" className="brand flex items-center gap-2.5">
              <img src="/logo.svg" alt="Prime Edits Logo" className="h-8 w-auto filter drop-shadow-[0_0_8px_rgba(255,87,34,0.2)]" />
              <span className="font-sans font-black tracking-widest text-base text-white uppercase">PRIME EDITS</span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="nav-menu hidden md:flex items-center gap-8 font-sans text-xs uppercase tracking-widest font-semibold text-gray-400">
              <a href="#hero" className="hover:text-white transition-colors">Home</a>
              <a href="#about-us" className="hover:text-white transition-colors">About</a>
              <a href="#service" className="hover:text-white transition-colors">Service</a>
              <a href="#work" className="hover:text-white transition-colors">Project</a>
              <a href="#testimonial" className="hover:text-white transition-colors">Testimonial</a>
            </nav>

            {/* CTA Button */}
            <div className="hidden md:block">
              <a href="#contact" className="button-primary text-xs uppercase tracking-wider font-bold">
                Get Started
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="menu-toggle md:hidden flex flex-col justify-center items-end gap-1.5 w-6 h-6 focus:outline-none"
            >
              <span className={`w-6 h-0.5 bg-white transition-transform ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-4 h-0.5 bg-white transition-opacity ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-6 h-0.5 bg-white transition-transform ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </button>
          </div>

          {/* Mobile Overlay Menu */}
          <div className={`nav-menu-phone fixed top-20 left-0 w-full h-[calc(100vh-80px)] bg-black/95 backdrop-blur-lg border-t border-[#1a1a24] transition-all duration-500 z-40 ${menuOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}>
            <nav className="flex flex-col p-8 gap-6 text-xl uppercase font-extrabold tracking-widest text-center">
              <a href="#hero" onClick={() => setMenuOpen(false)} className="hover:text-[#ff5722] py-4 border-b border-[#1a1a24]">Home</a>
              <a href="#about-us" onClick={() => setMenuOpen(false)} className="hover:text-[#ff5722] py-4 border-b border-[#1a1a24]">About</a>
              <a href="#service" onClick={() => setMenuOpen(false)} className="hover:text-[#ff5722] py-4 border-b border-[#1a1a24]">Service</a>
              <a href="#work" onClick={() => setMenuOpen(false)} className="hover:text-[#ff5722] py-4 border-b border-[#1a1a24]">Project</a>
              <a href="#testimonial" onClick={() => setMenuOpen(false)} className="hover:text-[#ff5722] py-4 border-b border-[#1a1a24]">Testimonial</a>
              <a href="#contact" onClick={() => setMenuOpen(false)} className="button-primary py-4 mt-8 w-full text-center">Get Started</a>
            </nav>
          </div>
        </header>

        {/* 4. Hero Section */}
        <section id="hero" className="section hero-section home relative w-full h-screen flex items-center justify-center bg-black overflow-hidden select-none">
          <div className="absolute inset-0 bg-black/40 z-[2]" />

          {/* Parallax Background Image */}
          <img
            src="/hero-bg.png"
            alt="Hero Background"
            className="absolute inset-0 w-full h-full object-cover opacity-50 scale-105 select-none pointer-events-none"
          />

          {/* Mouse-move Image Trail Container */}
          <HeroImageTrail />

          {/* Hero Content Text */}
          <div ref={heroTextRef} className="container mx-auto px-6 md:px-12 z-[3] flex flex-col items-center text-center relative select-none">
            <h1 className="text-[12vw] leading-none font-sans font-black tracking-tighter text-white select-none pointer-events-none">
              PRIME EDITS
            </h1>
            <p className="max-w-xl text-xs md:text-sm text-gray-400 font-mono tracking-wider mt-6 leading-relaxed select-none pointer-events-none uppercase">
              // We create high-retention video cuts and cinematic visual content that help ambitious creators stand out through bold design, fast pacing, and sound design intensity.
            </p>
          </div>
        </section>

        {/* 5. About Us Section */}
        <section id="about-us" className="section section-padding bg-black border-t border-[#1a1a24] py-24 md:py-36">
          <div className="container mx-auto px-6 md:px-12">
            <div className="about-us-contain flex flex-col md:flex-row md:items-start justify-between gap-12">

              {/* Left Column: Heading and Tag */}
              <div className="w-full md:w-1/2 flex flex-col gap-6">
                <div className="section-tag flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5722] font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#ff5722]" />
                  <span>About Us</span>
                </div>
                <h2 ref={revealTextRef} className="text-3xl md:text-5xl font-black font-sans uppercase leading-tight tracking-tight text-white select-none">
                  <ScrollRevealText text="Prime Edits is a premium post-production studio crafting bold, high-retention video assets with strategic pacing and refined edit signatures." />
                </h2>
              </div>

              {/* Right Column: Paragraph and Overlapping Grid */}
              <div className="w-full md:w-5/12 flex flex-col gap-10">
                <p className="text-sm md:text-base text-gray-500 font-mono leading-relaxed uppercase">
                  Crafting scalable editing workflows that combine pacing strategy, custom color grading, and heavy soundscapes to elevate visual creators and drive meaningful channel growth.
                </p>

                {/* Xenith Overlapping Image Layout */}
                <div className="about-image-wrapper flex items-end gap-6 self-start relative mt-4">
                  <div className="about-image-left shrink-0">
                    <img
                      src="https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a5aa196cd4a6b598dbf9_rectangle_32.webp"
                      loading="lazy"
                      width="160"
                      height="210"
                      alt="Grid 1"
                      className="about-image small border border-[#1a1a24] object-cover scale-95"
                    />
                  </div>
                  <div className="about-image-right shrink-0">
                    <img
                      src="https://cdn.prod.website-files.com/69afdc27b122b092c4b692ca/69e1a5aa0624c74b1cb65e01_rectangle_33.webp"
                      loading="lazy"
                      width="180"
                      height="230"
                      alt="Grid 2"
                      className="about-image large border border-[#1a1a24] object-cover"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 6. Sticky Scrolling Services Section */}
        <section ref={serviceSectionRef} id="service" className="section service-section relative w-full h-screen bg-black">
          <div className="relative w-full h-full overflow-hidden flex flex-col md:flex-row border-t border-[#1a1a24]">

            {/* Background overlapping images panel (Left side) */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-zinc-950">
              {services.map((service, idx) => (
                <img
                  key={idx}
                  src={service.image}
                  alt={service.title}
                  className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out ${idx === activeServiceIndex ? 'opacity-50 scale-100' : 'opacity-0 scale-95'}`}
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black via-black/40 to-transparent z-[2]" />
            </div>

            {/* Content list panel (Right side) */}
            <div className="w-full md:w-1/2 h-1/2 md:h-full flex flex-col justify-center p-8 md:p-20 bg-black z-10">
              <div className="section-tag flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5722] font-mono mb-8">
                <div className="w-2 h-2 rounded-full bg-[#ff5722]" />
                <span>Our Services</span>
              </div>

              {/* Service Details with smooth transitions */}
              <div className="relative h-[250px] md:h-[300px]">
                {services.map((service, idx) => (
                  <div
                    key={idx}
                    className={`absolute inset-0 flex flex-col justify-start transition-all duration-500 ${idx === activeServiceIndex ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}
                  >
                    <span className="font-mono text-xs text-zinc-600 tracking-wider mb-2">{service.tag}</span>
                    <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-white mb-6">
                      {service.title}
                    </h3>
                    <p className="max-w-md text-sm md:text-base text-gray-500 font-mono leading-relaxed uppercase">
                      {service.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Dots Progress indicators */}
              <div className="flex gap-3 mt-8">
                {services.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 transition-all duration-300 rounded-full ${idx === activeServiceIndex ? 'w-8 bg-[#ff5722]' : 'w-2 bg-zinc-800'}`}
                  />
                ))}
              </div>
            </div>

          </div>
        </section>

        {/* 7. Horizontal Scroll Latest Projects Section */}
        <section ref={workSectionRef} id="work" className="section relative w-full h-screen bg-black">
          <div className="relative w-full h-full flex flex-col justify-center overflow-hidden border-t border-[#1a1a24]">

            {/* Header section tag and title */}
            <div className="container mx-auto px-6 md:px-12 pt-24 shrink-0">
              <div className="section-tag flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5722] font-mono mb-4">
                <div className="w-2 h-2 rounded-full bg-[#ff5722]" />
                <span>Our Work</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black font-sans uppercase tracking-tight text-white mb-12">
                Latest Projects
              </h2>
            </div>

            {/* Horizontal Track container */}
            <div ref={trackRef} className="flex gap-8 px-6 md:px-12 items-center w-max h-[420px] md:h-[480px]">

              {portfolioProjects.map((project, idx) => (
                <div
                  key={project.id}
                  className="work-card relative w-[320px] md:w-[420px] h-full bg-[#0a0a0d] border border-[#1a1a24] overflow-hidden group shrink-0"
                  data-cursor
                  data-cursor-text="Play Video"
                >
                  {/* Hover visual scale effect */}
                  <div className="w-full h-2/3 overflow-hidden border-b border-[#1a1a24]">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                    />
                  </div>

                  <div className="p-6 h-1/3 flex flex-col justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-zinc-600 uppercase tracking-widest block mb-1">
                        {project.category}
                      </span>
                      <h4 className="text-xl font-bold font-sans uppercase tracking-wide text-white group-hover:text-[#ff5722] transition-colors">
                        {project.title}
                      </h4>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-mono text-gray-500 uppercase">
                      <span>{project.tag}</span>
                      <ArrowUpRight className="w-4 h-4 text-zinc-600 group-hover:text-[#ff5722] transition-colors" />
                    </div>
                  </div>
                </div>
              ))}

              {/* Xenith CTA Ending card inside horizontal scroll */}
              <div className="cta-card-wrapper w-[320px] md:w-[420px] h-full flex flex-col justify-center items-center p-8 bg-[#0a0a0d] border border-dashed border-[#ff5722]/30 shrink-0 select-none">
                <p className="text-center font-sans font-black text-2xl md:text-3xl uppercase tracking-tighter mb-6">
                  Got a creative brief?
                </p>
                <a href="#contact" className="button-primary text-xs uppercase tracking-wider font-bold">
                  Let's Talk
                </a>
              </div>

            </div>
          </div>
        </section>

        {/* 8. Process Section */}
        <section id="how-we-work" className="section section-padding bg-black border-t border-[#1a1a24] py-24 md:py-36">
          <div className="container mx-auto px-6 md:px-12">
            <div className="section-contain flex flex-col gap-16">

              <div className="header-section">
                <div className="section-tag flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5722] font-mono mb-4">
                  <div className="w-2 h-2 rounded-full bg-[#ff5722]" />
                  <span>How We Work</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight text-white">
                  Our Edit Process
                </h2>
              </div>

              {/* Process Cards layout matching Xenith minus/plus reveal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {processes.map((proc, idx) => (
                  <div
                    key={idx}
                    onMouseEnter={() => setActiveProcessIndex(idx)}
                    className={`process-card p-8 border bg-[#0a0a0d] transition-all duration-300 flex flex-col gap-6 cursor-pointer ${activeProcessIndex === idx ? 'border-[#ff5722] bg-[#ff5722]/5' : 'border-[#1a1a24]'
                      }`}
                  >
                    <div className="process-header-wrap flex justify-between items-center">
                      <span className="font-mono text-xs text-[#ff5722] font-bold">{proc.num}</span>
                      <div className="process-icon-wrapper text-zinc-600 transition-colors">
                        {activeProcessIndex === idx ? (
                          <Minus className="w-4 h-4 text-[#ff5722]" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </div>
                    </div>

                    <h3 className="text-lg font-bold font-sans uppercase tracking-wide text-white">
                      {proc.title}
                    </h3>

                    <p className={`text-xs text-gray-500 font-mono leading-relaxed transition-all duration-300 uppercase ${activeProcessIndex === idx ? 'opacity-100 max-h-40' : 'opacity-40'
                      }`}>
                      {proc.desc}
                    </p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 9. Testimonial Section */}
        <section id="testimonial" className="section section-padding bg-black border-t border-[#1a1a24] py-24 md:py-36">

          {/* Continuous Ticker marquee banner */}
          <div className="marquee-container w-full select-none overflow-hidden mb-16">
            <div className="marquee-content flex">
              {[...Array(3)].map((_, loopIdx) => (
                <div key={loopIdx} className="flex shrink-0">
                  <span className="marquee-item">High Retention</span>
                  <span className="marquee-item marquee-item-highlight">Design Excellence</span>
                  <span className="marquee-item">Cinematic Grading</span>
                  <span className="marquee-item marquee-item-highlight">Pacing Strategy</span>
                </div>
              ))}
            </div>
          </div>

          <div className="container mx-auto px-6 md:px-12">
            <div className="section-contain flex flex-col gap-12">

              <div className="header-section flex flex-col gap-4">
                <div className="section-tag flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5722] font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#ff5722]" />
                  <span>Testimonial</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight text-white">
                  What Clients Say
                </h2>
              </div>

              {/* Testimonials Grid stacking */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {testimonials.map((testi, idx) => (
                  <div
                    key={idx}
                    className="testimonial-card flex flex-col justify-between p-8 md:p-10 bg-[#0a0a0d] border border-[#1a1a24] transition-all duration-300 hover:border-zinc-700"
                  >
                    <p className="text-base md:text-lg font-sans leading-relaxed text-zinc-300 italic mb-10 select-text">
                      "{testi.quote}"
                    </p>

                    <div className="testi-profile flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full border border-[#1a1a24] overflow-hidden shrink-0">
                        <img src={testi.image} alt={testi.author} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">{testi.author}</span>
                        <span className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-0.5">{testi.role}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* 10. FAQ Section */}
        <section id="faq" className="section section-padding bg-black border-t border-[#1a1a24] py-24 md:py-36">
          <div className="container mx-auto px-6 md:px-12">
            <div className="section-contain flex flex-col md:flex-row md:items-start justify-between gap-12">

              <div className="w-full md:w-1/3 flex flex-col gap-4">
                <div className="section-tag flex items-center gap-2 text-xs uppercase tracking-widest text-[#ff5722] font-mono">
                  <div className="w-2 h-2 rounded-full bg-[#ff5722]" />
                  <span>FAQ</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-black font-sans uppercase tracking-tight text-white">
                  Key Questions
                </h2>
              </div>

              {/* Accordion dropdown stack */}
              <div className="w-full md:w-7/12 flex flex-col border-b border-[#1a1a24]">
                {faqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div key={idx} className="faq-item border-t border-[#1a1a24] overflow-hidden">
                      <button
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full py-6 flex justify-between items-center text-left text-white focus:outline-none group"
                      >
                        <span className="font-bold text-sm md:text-base uppercase tracking-wide group-hover:text-[#ff5722] transition-colors">
                          {faq.q}
                        </span>
                        <div className="wrapper-icon-accordion text-zinc-500 shrink-0">
                          {isOpen ? (
                            <Minus className="w-4 h-4 text-[#ff5722]" />
                          ) : (
                            <Plus className="w-4 h-4 group-hover:text-white transition-colors" />
                          )}
                        </div>
                      </button>

                      <div
                        className="transition-all duration-300 ease-in-out overflow-hidden"
                        style={{
                          maxHeight: isOpen ? '160px' : '0px',
                          opacity: isOpen ? 1 : 0
                        }}
                      >
                        <p className="pb-6 text-xs md:text-sm text-gray-500 leading-relaxed font-mono uppercase select-text">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>
          </div>
        </section>

        {/* 11. Contact Form Section */}
        <section id="contact" className="section section-cta bg-black border-t border-[#1a1a24] py-24 md:py-36">
          <div className="container mx-auto px-6 md:px-12 max-w-4xl">
            <ContactForm />
          </div>
        </section>

        {/* 12. Footer */}
        <footer className="footer bg-black border-t border-[#1a1a24] py-12">
          <div className="container mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6">

            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2.5">
                <img src="/logo.svg" alt="Prime Edits Logo" className="h-6 w-auto" />
                <span className="font-sans font-black tracking-widest text-sm text-white uppercase">
                  PRIME EDITS
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-600 uppercase">
                &copy; {new Date().getFullYear()} PRIME EDITS. ALL RIGHTS RESERVED.
              </p>
            </div>

            {/* Time Clock & Links */}
            <div className="flex flex-col items-center md:items-end gap-2">
              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500 uppercase">
                <Clock className="w-3.5 h-3.5 text-[#ff5722]" />
                <span>MUMBAI TIME:</span>
                <span className="text-white font-bold">{timeString}</span>
              </div>
              <div className="flex gap-4 text-xs font-mono text-zinc-500 uppercase tracking-widest mt-1">
                <a href="#hero" className="hover:text-white">TOP</a>
                <span>/</span>
                <a href="#contact" className="hover:text-white">BRIEF FORM</a>
              </div>
            </div>

          </div>
        </footer>

      </div>
    </>
  );
}
