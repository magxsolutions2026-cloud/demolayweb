'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Logo from './Logo';
import { LODGE_ADDRESS } from '@/lib/lodgeLocation';
import { NewsletterSubscribeForm } from './site/NewsletterSubscribeForm';
import { useJoinUsModal } from './site/JoinUsModalContext';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const { open: openJoin } = useJoinUsModal();

  const socialLinks = [
    { icon: 'f', label: 'Facebook', url: '#' },
    { icon: 'x', label: 'Twitter', url: '#' },
    { icon: 'in', label: 'LinkedIn', url: '#' },
    { icon: '📸', label: 'Instagram', url: '#' },
  ];

  const quickLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
    { label: 'Officers', href: '/officers' },
    { label: 'Events', href: '/events' },
    { label: 'News', href: '/news' },
    { label: 'Contact', href: '/contact' },
  ];

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-gradient-to-b from-background via-maroon/5 to-background border-t border-gold/20 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-maroon/5 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="relative z-10">
        {/* Main footer content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="glass animated p-6 rounded-3xl border border-[var(--secondary-color)]/20">
            {/* Brand section */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="lg:col-span-1"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center bg-white/5 backdrop-blur p-4 rounded-xl border border-gold/10 w-fit mb-6"
              >
                <Logo className="w-10 h-10" />
                <span className="font-bold text-gold text-sm ml-3">DeMolay</span>
              </motion.div>

              <h3 className="text-xl font-bold text-foreground mb-3">
                T. De Leon <span className="text-gold">Chapter No. 47</span>
              </h3>
              <p className="text-foreground/70 text-sm leading-relaxed mb-4">
                Building character and developing leaders in our community since 1975. Brotherhood,
                leadership, and legacy.
              </p>

              {/* Social links */}
              <div className="flex gap-3">
                {socialLinks.map((social, i) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    whileHover={{ scale: 1.15, rotate: 10 }}
                    whileTap={{ scale: 0.9 }}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.3 }}
                    viewport={{ once: true }}
                    className="w-10 h-10 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors group"
                    title={social.label}
                  >
                    <span className="text-xs font-bold group-hover:text-gold/80">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

            {/* Quick links */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold text-gold mb-6 flex items-center gap-2">
                <span>Quick Links</span>
                <motion.span animate={{ x: [0, 3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  →
                </motion.span>
              </h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <motion.li
                    key={link.label}
                    whileHover={{ x: 5 }}
                  >
                    <Link
                      href={link.href}
                      className="text-foreground/70 hover:text-gold transition-colors text-sm font-medium"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
                <motion.li whileHover={{ x: 5 }}>
                  <button
                    type="button"
                    onClick={openJoin}
                    className="text-foreground/70 hover:text-gold text-left text-sm font-medium transition-colors"
                  >
                    Join Us
                  </button>
                </motion.li>
              </ul>
            </motion.div>

            {/* Contact info */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold text-[var(--secondary-color)] mb-6">Contact Info</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-2 text-foreground/70">
                  <span>📧</span>
                  <a href="mailto:tdeleonchapter47@gmail.com" className="hover:text-gold transition-colors">
                    tdeleonchapter47@gmail.com
                  </a>
                </li>
                <li className="flex gap-2 text-foreground/70">
                  <span>📍</span>
                  <div>
                    {LODGE_ADDRESS.split(', ').map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* Newsletter */}
            <motion.div
              variants={itemVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h4 className="text-lg font-bold text-[var(--secondary-color)] mb-6">Stay Updated</h4>
              <p className="text-foreground/70 text-sm mb-4">
                Subscribe to get updates about events and chapter news.
              </p>
              <NewsletterSubscribeForm
                variant="compact"
                placeholder="Your email"
                className="max-w-md"
              />
            </motion.div>
          </div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            viewport={{ once: true }}
            className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent mb-8 origin-left"
          />

          {/* Bottom section */}
          <div className="flex flex-col sm:flex-row items-center justify-between">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              viewport={{ once: true }}
              className="text-foreground/60 text-sm text-center sm:text-left"
            >
              © {currentYear} T. De Leon Chapter No. 47 - Order of DeMolay. All rights reserved.
            </motion.p>

            <motion.button
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToTop}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              viewport={{ once: true }}
              className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 flex items-center justify-center text-gold hover:bg-gold/20 transition-colors mt-4 sm:mt-0 flex-shrink-0"
              title="Scroll to top"
            >
              <span className="text-xl">↑</span>
            </motion.button>
          </div>
        </div>

        {/* Floating accent bars */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold to-transparent"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      </div>
    </footer>
  );
};

export default Footer;
