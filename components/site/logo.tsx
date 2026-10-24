import Image from 'next/image';
import Link from 'next/link';
import {site} from '@/lib/site';

// The legacy monogram is only available as a 72×49 PNG; replace with a vector
// source when the business supplies one.
export function Logo({href, inverted = false}: {href: string; inverted?: boolean}) {
  return (
    <Link href={href} className="flex shrink-0 items-center gap-2.5">
      <Image
        src={inverted ? '/brand/logo-mark-white.png' : '/brand/logo-mark.png'}
        alt=""
        width={inverted ? 68 : 72}
        height={49}
        className="h-9 w-auto"
        priority={!inverted}
      />
      <span
        className={`font-display text-2xl font-semibold leading-none tracking-tight ${inverted ? 'text-paper' : 'text-teal-900'}`}
      >
        {site.name}
      </span>
    </Link>
  );
}
