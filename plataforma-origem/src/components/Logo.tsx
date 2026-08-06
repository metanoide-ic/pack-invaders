import { cn } from '@/lib/utils';

/**
 * Recriação vetorial da marca Origem: anel aberto com uma seta/foguete
 * partindo para o canto superior direito.
 */
export function LogoMark({
  className,
  gradient = true,
}: {
  className?: string;
  gradient?: boolean;
}) {
  const gid = gradient ? 'origem-grad' : undefined;
  const stroke = gradient ? 'url(#origem-grad)' : 'currentColor';
  return (
    <svg viewBox="0 0 100 100" className={cn('block', className)} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id="origem-grad" x1="10" y1="90" x2="90" y2="10" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#6d28d9" />
            <stop offset="1" stopColor="#a879ff" />
          </linearGradient>
        </defs>
      )}
      <mask id="origem-cut">
        <rect width="100" height="100" fill="white" />
        {/* corta o anel por onde a seta atravessa */}
        <line x1="46" y1="56" x2="92" y2="10" stroke="black" strokeWidth="17" strokeLinecap="round" />
      </mask>
      {/* anel */}
      <circle cx="43" cy="57" r="27" fill="none" stroke={stroke} strokeWidth="11" mask="url(#origem-cut)" />
      {/* haste da seta */}
      <line x1="41" y1="59" x2="84" y2="16" stroke={stroke} strokeWidth="11" strokeLinecap="round" />
      {/* cabeça da seta */}
      <path
        d="M67 12 L88 8 L84 29 Z"
        fill={gid ? `url(#origem-grad)` : 'currentColor'}
        stroke={stroke}
        strokeWidth="3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  showTagline = true,
  size = 'md',
}: {
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  const mark = { sm: 'h-7 w-7', md: 'h-9 w-9', lg: 'h-12 w-12' }[size];
  const word = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' }[size];
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark className={mark} />
      <div className="leading-none">
        <div className={cn('font-display font-semibold tracking-[0.28em] text-white', word)}>
          ORIGEM
        </div>
        {showTagline && (
          <div className="mt-1 text-[9px] font-medium tracking-[0.34em] text-white/50">
            COMUNICAÇÃO &amp; MARKETING
          </div>
        )}
      </div>
    </div>
  );
}
