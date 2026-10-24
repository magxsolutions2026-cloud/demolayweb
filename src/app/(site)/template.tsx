'use client';

import { motion } from 'framer-motion';

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className="page-enter"
    >
      {children}
    </motion.div>
  );
}
