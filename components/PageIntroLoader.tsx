'use client';

import { useEffect, useState } from 'react';

export default function PageIntroLoader() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 850);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(10,10,10,0.95)]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-14 w-14 animate-spin rounded-full border-2 border-gold/35 border-t-gold" />
        <p className="text-xs uppercase tracking-[0.25em] text-gold">Loading Chapter Experience</p>
      </div>
    </div>
  );
}
