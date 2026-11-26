'use client';

import { motion, useReducedMotion } from 'framer-motion';

/** Title block for console pages: mono kicker, display title, lead line, meta chips and an actions slot. */
export function PageHeader({
  kicker,
  title,
  lead,
  meta,
  actions,
}: {
  kicker: string;
  title: string;
  lead?: string;
  meta?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.header
      className="cs-page-head"
      initial={reduce ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="cs-page-titles">
        <span className="cs-kicker">{kicker}</span>
        <h1>{title}</h1>
        {lead ? <p>{lead}</p> : null}
        {meta ? <div className="cs-page-meta">{meta}</div> : null}
      </div>
      {actions ? <div className="cs-page-actions">{actions}</div> : null}
    </motion.header>
  );
}
