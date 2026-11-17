import Image from 'next/image';
import Link from 'next/link';

// The legacy monogram is only available as a 72×49 PNG; replace with a vector
// source when the business supplies one. Sizes follow the v6 boards: header
// 30 / 24 (phone 26 / 21), footer 28 / 24 (phone 24 / 21).
export function Logo({href, name, inverted = false, label}: {href: string; name: string; inverted?: boolean; label?: string}) {
  return (
    <Link href={href} aria-label={label} className="flex min-h-11 shrink-0 items-center gap-2 rounded-pill lg:gap-2.5">
      <Image
        src={inverted ? '/brand/logo-mark-white.png' : '/brand/logo-mark.png'}
        alt=""
        width={inverted ? 68 : 72}
        height={49}
        className={inverted ? 'h-6 w-auto md:h-7' : 'h-6.5 w-auto lg:h-7.5'}
        priority={!inverted}
      />
      <span className={`font-display text-[1.3125rem] font-semibold leading-none tracking-[-0.01em] ${inverted ? 'text-on-dark md:text-[1.5rem]' : 'text-ink lg:text-[1.5rem]'}`}>
        {name}
      </span>
    </Link>
  );
}
