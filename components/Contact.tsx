'use client';

import React, { useState } from 'react';
import { LODGE_ADDRESS, googleMapsLodgeUrl } from '@/lib/lodgeLocation';
import { motion } from 'framer-motion';

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Simulate API call - replace with actual endpoint if available
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } catch {
      setSubmitStatus('error');
      setTimeout(() => {
        setSubmitStatus('idle');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: '✉️',
      title: 'Email',
      content: 'tdeleonchapter47@gmail.com',
      link: 'mailto:tdeleonchapter47@gmail.com',
    },
    {
      icon: '📍',
      title: 'Location',
      content: LODGE_ADDRESS,
      link: googleMapsLodgeUrl,
    },
    {
      icon: '📞',
      title: 'Phone',
      content: '(555) 123-4567',
      link: 'tel:+15551234567',
    },
  ];

  const socialLinks = [
    { icon: 'f', label: 'Facebook', url: '#' },
    { icon: 'x', label: 'Twitter', url: '#' },
    { icon: 'in', label: 'LinkedIn', url: '#' },
  ];

  return (
    <section id="contact" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-maroon/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-[var(--secondary-color)] uppercase font-bold tracking-widest text-sm"
          >
            Get in Touch
          </motion.span>
          <h2 className="text-5xl sm:text-6xl font-black text-foreground mt-4 mb-6">
            Contact Us
          </h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"
          />
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact info cards */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {/* Contact cards */}
            {contactInfo.map((info, index) => (
              <motion.a
                key={info.title}
                href={info.link}
                {...(info.link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ x: 10 }}
                className="glass animated p-8 rounded-xl border border-[var(--secondary-color)]/20 group block"
              >
                <div className="flex gap-4">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="text-4xl flex-shrink-0"
                  >
                    {info.icon}
                  </motion.div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--secondary-color)] mb-1">{info.title}</h3>
                    <p className="text-foreground/70 group-hover:text-foreground transition-colors">
                      {info.content}
                    </p>
                  </div>
                </div>
              </motion.a>
            ))}

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              viewport={{ once: true }}
              className="glass animated p-8 rounded-xl border border-[var(--secondary-color)]/20 mt-8"
            >
              <h3 className="text-lg font-bold text-[var(--secondary-color)] mb-6">Follow Us</h3>
              <div className="flex gap-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.label}
                    href={social.url}
                    whileHover={{ scale: 1.2, rotate: 10 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-full bg-[var(--gradient-main)] bg-opacity-20 border border-[var(--secondary-color)]/20 flex items-center justify-center text-[var(--secondary-color)] font-bold hover:border-[var(--secondary-color)] transition-colors"
                    title={social.label}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Contact form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="glass animated p-10 lg:p-12 rounded-2xl border border-[var(--secondary-color)]/20"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name field */}
              <div>
                <label className="block text-sm font-bold text-[var(--secondary-color)] mb-2">
                  Your Name <span className="text-red-400">*</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none transition-all ${
                    errors.name ? 'border-red-400' : 'border-[var(--secondary-color)]/20 focus:border-[var(--secondary-color)]'
                  }`}
                />
                {errors.name && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.name}
                  </motion.p>
                )}
              </div>

              {/* Email field */}
              <div>
                <label className="block text-sm font-bold text-[var(--secondary-color)] mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none transition-all ${
                    errors.email ? 'border-red-400' : 'border-[var(--secondary-color)]/20 focus:border-[var(--secondary-color)]'
                  }`}
                />
                {errors.email && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.email}
                  </motion.p>
                )}
              </div>

              {/* Phone field */}
              <div>
                <label className="block text-sm font-bold text-[var(--secondary-color)] mb-2">
                  Phone (Optional)
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(555) 123-4567"
                  className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none transition-all ${
                    errors.phone ? 'border-red-400' : 'border-[var(--secondary-color)]/20 focus:border-[var(--secondary-color)]'
                  }`}
                />
                {errors.phone && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.phone}
                  </motion.p>
                )}
              </div>

              {/* Message field */}
              <div>
                <label className="block text-sm font-bold text-[var(--secondary-color)] mb-2">
                  Message <span className="text-red-400">*</span>
                </label>
                <motion.textarea
                  whileFocus={{ scale: 1.01 }}
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your inquiry..."
                  rows={5}
                  className={`w-full px-4 py-3 bg-background/50 border rounded-lg text-foreground placeholder-foreground/40 focus:outline-none resize-none transition-all ${
                    errors.message ? 'border-red-400' : 'border-[var(--secondary-color)]/20 focus:border-[var(--secondary-color)]'
                  }`}
                />
                {errors.message && (
                  <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm mt-1"
                  >
                    {errors.message}
                  </motion.p>
                )}
              </div>

              {/* Status messages */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg text-green-400 text-sm"
                >
                  ✓ Message sent successfully! We&apos;ll be in touch soon.
                </motion.div>
              )}
              {submitStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
                >
                  ✗ Failed to send message. Please try again.
                </motion.div>
              )}

              {/* Submit button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isSubmitting}
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-gold to-yellow-500 text-black font-bold text-lg rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity }}
                    >
                      ⟳
                    </motion.span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </>
                )}
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
