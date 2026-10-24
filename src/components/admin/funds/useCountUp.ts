'use client';

import { useEffect, useState } from 'react';

export function useCountUp(target: number, durationMs = 1100): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - (1 - t) ** 3;
      setValue(target * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else setValue(target);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, durationMs]);

  return value;
}
