'use client';

export function FieldLabel({ htmlFor, children, required }: { htmlFor: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="text-foreground/80 mb-1.5 block text-xs font-medium uppercase tracking-wider">
      {children}
      {required ? <span className="text-gold/90"> *</span> : null}
    </label>
  );
}

export function AdminField({
  label,
  htmlFor,
  required,
  error,
  children,
  className = '',
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <FieldLabel htmlFor={htmlFor} required={required}>
        {label}
      </FieldLabel>
      {children}
      {error ? <p className="text-rose-300 mt-1.5 text-xs">{error}</p> : null}
    </div>
  );
}

export function adminInputClass(invalid?: boolean) {
  return [
    'input w-full rounded-xl px-3.5 py-2.5 text-sm transition duration-200',
    invalid ? 'border-rose-400/60 ring-2 ring-rose-500/25' : '',
  ]
    .filter(Boolean)
    .join(' ');
}
