'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Logo from './Logo';

interface ParticleSpec {
  left: string;
  top: string;
  opacity: number;
  duration: number;
  delay: number;
}

const MagneticButton = ({ children, className, ...props }: any) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.4;
    const y = (clientY - (top + height / 2)) * 0.4;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="relative inline-block"
      {...props}
    >
      {children}
    </motion.div>
  );
};

const SplitText = ({ text, className, delay = 0 }: { text: string, className?: string, delay?: number }) => {
  const letters = text.split("");
  return (
    <span className={className}>
      {letters.map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.5,
            delay: delay + (i * 0.03),
            ease: [0.215, 0.61, 0.355, 1]
          }}
          className="inline-block"
        >
          {char === " " ? " " : char}
        </motion.span>
      ))}
    </span>
  );
};

const Hero: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  const [glowPosition, setGlowPosition] = useState({ x: 0, y: 0 });

  const particles: ParticleSpec[] = Array.from({ length: 50 }, (_, i) => {
    const base = Math.abs(Math.sin(i * 12.9898));
    const offset = Math.abs(Math.sin((i + 1) * 8.347));
    return {
      left: `${(base * 100).toFixed(2)}%`,
      top: `${(offset * 100).toFixed(2)}%`,
      opacity: 0.3 + (base * 0.5),
      duration: 4 + offset * 8,
      delay: base * 2,
    };
  });

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = (clientX - left - width / 2) / width;
    const y = (clientY - top - height / 2) / height;
    setMousePosition({ x, y });

    // Set raw coordinates for the glow effect
    setGlowPosition({
      x: clientX - left,
      y: clientY - top,
    });
  };

  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center overflow-hidden masonic-bg"
      onMouseMove={handleMouseMove}
    >
      {/* Background overlays */}
      <div className="hero-bg-overlay" />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(circle 600px at ${glowPosition.x}px ${glowPosition.y}px, rgba(255, 215, 0, 0.07), transparent 80%)`,
          zIndex: 1
        }}
      />
      <div className="hero-glow" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-[rgba(14,16,36,0.9)] via-[rgba(10,11,27,0.8)] to-[rgba(4,6,10,0.92)]"
        style={{
          y: scrollY * 0.28,
        }}
      />

      {/* Animated particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-gold/40 rounded-full"
            initial={{
              left: particle.left,
              top: particle.top,
              opacity: particle.opacity,
            }}
            animate={{
              top: ['0%', '100%'],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{
              duration: particle.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: particle.delay,
            }}
          />
        ))}
      </div>

      {/* Main content with staggered animation */}
      <motion.div
        className="relative z-10 mx-auto text-center px-5 sm:px-8 lg:px-10 max-w-4xl glass animated backdrop-blur-xl border border-[var(--secondary-color)]/40 bg-[rgba(10,10,10,0.2)] shadow-[0_22px_76px_rgba(115,14,27,0.65)] ring ring-[rgba(115,14,27,0.3)]"
        initial={{ opacity: 0, y: 42 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{
          x: mousePosition.x * 18,
          y: mousePosition.y * 18,
        }}
      >
        {/* Logo with scale animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: 'spring', stiffness: 100 }}
          className="mb-8"
        >
          <Logo className="w-28 h-28 mx-auto mb-6 filter drop-shadow-lg" />
        </motion.div>

        {/* Historical overline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-xs uppercase tracking-widest font-semibold text-[var(--secondary-color)] mb-2"
        >
          Established 1921
        </motion.p>

        {/* Main heading with gradient text */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-tight"
          style={{ letterSpacing: '0.015em' }}
        >
          <SplitText text="T. De Leon " className="text-white" />
          <SplitText text="Chapter No. 47" className="text-[var(--secondary-color)]" delay={0.5} />
        </motion.h1>

        {/* Subheading with enhanced typography */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-xl sm:text-2xl lg:text-3xl text-silver font-light mb-8 tracking-wide"
        >
          Brotherhood • Leadership • Legacy
        </motion.p>

        {/* Description text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-base sm:text-lg text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          Building character, developing leadership, and fostering brotherhood among young men in our community.
        </motion.p>

        {/* CTA Buttons with enhanced styling and hover effects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <MagneticButton>
            <motion.a
              href="#join"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 rounded-lg font-bold text-lg text-white shadow-[0_12px_28px_rgba(79,70,229,0.4)] bg-gradient-to-r from-[#4f46e5] to-[#7c3aed] hover:shadow-[0_14px_32px_rgba(79,70,229,0.6)] transition-all block text-center"
            >
              Join Us
            </motion.a>
          </MagneticButton>
          <MagneticButton>
            <motion.a
              href="#events"
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="px-8 py-4 border border-[var(--secondary-color)] text-[var(--secondary-color)] rounded-lg font-bold text-lg bg-transparent hover:bg-[rgba(255,215,0,0.08)] hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all block text-center"
            >
              View Events
            </motion.a>
          </MagneticButton>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-gold/20 backdrop-blur"
        >
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-foreground/70">Active Chapter • Est. 1921</span>
        </motion.div>
      </motion.div>

      {/* Enhanced scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex flex-col items-center gap-2"
        >
          <span className="text-xs text-gold uppercase tracking-widest font-semibold">Scroll to explore</span>
          <div className="w-6 h-10 border-2 border-gold rounded-full flex justify-center p-2">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1 h-2 bg-gold rounded-full"
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default Hero;