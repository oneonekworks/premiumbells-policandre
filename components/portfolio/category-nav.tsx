'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {SanityImage} from '@/components/sanity-image';
import type {SanityImageValue} from '@/sanity/image';
import {isActive} from '@/components/site/nav-links';

export type CategoryNavItem = {
  id: string; title: string; href: string; count: string; image: SanityImageValue | null;
};

// Vertical list with thumbnails from `lg`; a horizontally scrolling row of
// chips below it, so categories stay one tap away on phones.
export function CategoryNav({items, label}: {items: CategoryNavItem[]; label: string}) {
  const pathname = usePathname();
  return (
    <nav aria-label={label}>
      <ul className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:p-0">
        {items.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.id} className="shrink-0">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-11 items-center gap-3 rounded-full border px-4 py-1.5 text-sm transition-colors lg:rounded-lg lg:border-transparent lg:px-2 lg:py-2 ${
                  active
                    ? 'border-teal-700 bg-teal-50 text-teal-900 lg:border-transparent'
                    : 'border-line bg-white hover:border-teal-700 lg:bg-transparent lg:hover:border-transparent lg:hover:bg-stone'
                }`}
              >
                <span className="relative hidden size-12 shrink-0 overflow-hidden rounded-md bg-stone lg:block">
                  <SanityImage image={item.image} sizes="48px" ratio={1} />
                </span>
                <span className="flex flex-col">
                  <span className={`font-medium ${active ? 'text-teal-900' : 'text-ink'}`}>{item.title}</span>
                  <span className="hidden text-xs text-ink-soft lg:block">{item.count}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
