import Image from 'next/image';
import Link from 'next/link';

// The legacy monogram is only available as a 72×49 PNG; replace with a vector
// source when the business supplies one.
export function Logo({href, name, inverted = false}: {href: string; name: string; inverted?: boolean}) {
  return (
    <Link href={href} className="flex min-h-11 shrink-0 items-center gap-2.5 rounded-pill">
      <Image
        src={inverted ? '/brand/logo-mark-white.png' : '/brand/logo-mark.png'}
        alt=""
        width={inverted ? 68 : 72}
        height={49}
        className="h-8 w-auto lg:h-9"
        priority={!inverted}
      />
      <span className={`font-display text-[1.5rem] leading-none lg:text-[1.625rem] ${inverted ? 'text-on-dark' : 'text-ink'}`}>
        {name}
      </span>
    </Link>
  );
}
