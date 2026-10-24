"use client";

import Image from "next/image";

/** Static site logo — `public/logo.png` only; not editable from admin. */
export const CHAPTER_LOGO_SRC = "/logo.png" as const;

interface LogoProps {
  className?: string;
  /** Set on above-the-fold instances for LCP (e.g. hero). */
  priority?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "w-16 h-16", priority = false }) => {
  return (
    <div className={`${className} logo-tilt relative`}>
      <Image
        src={CHAPTER_LOGO_SRC}
        alt="T. De Leon Chapter No. 47 — Order of DeMolay"
        fill
        sizes="160px"
        priority={priority}
        className="logo-tilt-media object-contain"
      />
    </div>
  );
};

export default Logo;
