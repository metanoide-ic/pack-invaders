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

      {/* Anel aberto no canto superior direito, desenhado como arco puro:
          a versão com máscara facetava o traço em alguns renderizadores. */}
      <path
        d="M51.21 26.46 A30 30 0 1 0 75.34 49.76"
        fill="none" stroke={fill} strokeWidth="14" strokeLinecap="round"
      />
      {/* Haste da seta, atravessando o anel. */}
      <path d="M44 58 L82 20 L90 28 L52 66 Z" fill={fill} />
      {/* Cabeça da seta. */}
      <path d="M68 12 L94 8 L90 34 Z" fill={fill} strokeLinejoin="round" />
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
