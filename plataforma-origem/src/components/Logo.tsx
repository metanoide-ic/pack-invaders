import { cn } from '@/lib/utils';

/**
 * Marca Orikay: um "O" aberto em traço grosso, com a seta saindo pelo canto
 * superior direito e a ponta do anel fechando por baixo dela. Redesenhada em
 * vetor para ficar nítida em qualquer tamanho e acompanhar o tema.
 */
export function LogoMark({
  className,
  gradient = true,
}: {
  className?: string;
  gradient?: boolean;
}) {
  const fill = gradient ? 'url(#orikay-grad)' : 'currentColor';
  return (
    <svg viewBox="0 0 100 100" className={cn('block', className)} aria-hidden="true">
      {gradient && (
        <defs>
          <linearGradient id="orikay-grad" x1="14" y1="86" x2="86" y2="14" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5b2fe0" />
            <stop offset="0.55" stopColor="#7c4dff" />
            <stop offset="1" stopColor="#c4a0ff" />
          </linearGradient>
        </defs>
      )}

      {/* Anel: aberto no canto superior direito, por onde a seta escapa. */}
      <mask id="orikay-abertura">
        <rect width="100" height="100" fill="white" />
        <path d="M52 62 L96 18 L104 26 L60 70 Z" fill="black" />
      </mask>
      <circle
        cx="46" cy="56" r="30"
        fill="none" stroke={fill} strokeWidth="14"
        mask="url(#orikay-abertura)"
      />

      {/* Ponta inferior do anel, que na marca desce solta ao lado da seta. */}
      <path
        d="M72 64 C74 74 70 84 62 90 C64 79 66 71 66 64 Z"
        fill={fill}
      />

      {/* Haste da seta, saindo de dentro do anel. */}
      <path
        d="M44 58 L82 20 L90 28 L52 66 Z"
        fill={fill}
      />

      {/* Cabeça da seta. */}
      <path
        d="M70 14 L92 10 L88 32 Z"
        fill={fill}
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
  const mark = { sm: 'h-8 w-8', md: 'h-10 w-10', lg: 'h-14 w-14' }[size];
  const word = { sm: 'text-xl', md: 'text-2xl', lg: 'text-4xl' }[size];
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className={mark} />
      <div className="leading-none">
        <div className={cn('font-display font-semibold tracking-tight text-ink-50', word)}>
          Orikay
        </div>
        {showTagline && (
          <div className="mt-1 text-[9px] font-medium tracking-[0.28em] text-ink-400">
            COMUNICAÇÃO &amp; MARKETING
          </div>
        )}
      </div>
    </div>
  );
}
