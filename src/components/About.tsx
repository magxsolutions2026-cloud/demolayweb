'use client';

import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
  const features = [
    {
      icon: '🤝',
      title: 'Brotherhood',
      description: 'Building lifelong bonds and mutual respect among members.',
    },
    {
      icon: '🎯',
      title: 'Leadership',
      description: 'Developing essential skills to lead with confidence and integrity.',
    },
    {
      icon: '🌍',
      title: 'Service',
      description: 'Making a positive impact in our community through service.',
    },
    {
      icon: '⭐',
      title: 'Character',
      description: 'Building strong moral values and personal integrity.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <section id="about" className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-maroon/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Section Header */}
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
            className="text-gold uppercase font-bold tracking-widest text-sm"
          >
            About DeMolay
          </motion.span>
          <h2 className="text-5xl sm:text-6xl font-black text-foreground mt-4 mb-6">
            Who We Are
          </h2>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto"
          />
        </motion.div>

        {/* Main content grid */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
          {/* Left column - Text */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl sm:text-4xl font-bold text-foreground mb-6">
              What is <span className="text-gold">DeMolay?</span>
            </h3>
            <p className="text-lg text-foreground/70 mb-6 leading-relaxed">
              DeMolay International is a youth leadership organization for young men ages 12-21.
              Founded in 1919, it has helped shape the lives of over 2.5 million young men worldwide,
              teaching them the values of brotherhood, leadership, and character development.
            </p>
            <p className="text-lg text-foreground/70 mb-8 leading-relaxed">
              Through meaningful rituals, hands-on leadership training, and impactful community
              service, DeMolay prepares young men to become responsible citizens and influential
              leaders in their communities.
            </p>
            <motion.div
              whileHover={{ x: 5 }}
              className="flex items-center gap-3 text-gold font-semibold cursor-pointer group"
            >
              <span>Learn more about our history</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                →
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Right column - Mission box */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="group"
          >
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass animated p-10 rounded-2xl border border-[var(--secondary-color)]/20 relative overflow-hidden"
            >
              {/* Animated background gradient */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-[var(--secondary-color)]/10 to-[var(--primary-color)]/10 opacity-0 group-hover:opacity-100"
                transition={{ duration: 0.3 }}
                style={{ pointerEvents: 'none' }}
              />

              <div className="relative z-10">
                <h3 className="text-3xl font-bold text-[var(--secondary-color)] mb-8">Our Core Values</h3>
                <ul className="space-y-4">
                  {['Brotherhood', 'Leadership', 'Character', 'Service'].map((value, i) => (
                    <motion.li
                      key={value}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i, duration: 0.5 }}
                      viewport={{ once: true }}
                      className="flex items-center gap-3 text-foreground/80 text-lg"
                    >
                      <motion.span
                        whileHover={{ rotate: 360, scale: 1.2 }}
                        className="text-gold text-2xl"
                      >
                        ✓
                      </motion.span>
                      <span>{value}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Features Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '0px 0px -100px 0px' }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              whileHover={{ y: -10 }}
              className="group"
            >
              <div className="glass animated p-8 rounded-xl border border-[var(--secondary-color)]/20 h-full relative overflow-hidden">
                {/* Hover background effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-[var(--secondary-color)]/10 to-transparent opacity-0 group-hover:opacity-100"
                  transition={{ duration: 0.3 }}
                  style={{ pointerEvents: 'none' }}
                />
                
                <div className="relative z-10">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-5xl mb-4"
                  >
                    {feature.icon}
                  </motion.div>
                  <h4 className="text-xl font-bold text-foreground mb-3">{feature.title}</h4>
                  <p className="text-sm text-foreground/70 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Chapter History */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div className="glass animated p-12 lg:p-16 rounded-2xl border border-[var(--secondary-color)]/20">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: '100%' }}
              transition={{ delay: 0.2, duration: 0.8 }}
              viewport={{ once: true }}
              className="absolute top-0 left-0 h-1 bg-[var(--gradient-main)]"
            />

            <div className="text-center">
              <h3 className="text-3xl sm:text-4xl font-bold text-[var(--secondary-color)] mb-6">
                T. De Leon Chapter No. 47
              </h3>
              <p className="text-lg text-foreground/70 max-w-3xl mx-auto leading-relaxed mb-8">
                The T. De Leon Chapter No. 47 has been serving our community with pride and
                dedication for over 50 years. Named after a prominent Masonic leader, our chapter
                continues the tradition of excellence in leadership development and character
                building, shaping young men into influential community leaders.
              </p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
                className="flex justify-center gap-8"
              >
                <div className="text-center">
                  <div className="text-4xl font-black text-gold">50+</div>
                  <div className="text-sm text-foreground/70 mt-1">Years of Service</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-black text-gold">500+</div>
                  <div className="text-sm text-foreground/70 mt-1">Members Served</div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;