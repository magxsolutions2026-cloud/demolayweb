'use client';

import { motion } from 'framer-motion';

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        opacity: { duration: 0.4 },
        y: { duration: 0.6 },
        scale: { duration: 0.6 }
      }}
      className="page-enter"
    >
      {children}
    </motion.div>
  );
}
