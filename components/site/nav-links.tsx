'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';

export type NavItem = {label: string; href: string};

export function isActive(pathname: string, href: string): boolean {
  if (href === '/' || href === '/en') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function NavLinks({items}: {items: NavItem[]}) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={`relative inline-flex min-h-11 items-center px-3 text-[0.95rem] font-medium transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:transition-colors ${
                active ? 'text-teal-700 after:bg-teal-700' : 'text-ink hover:text-teal-700 after:bg-transparent'
              }`}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
