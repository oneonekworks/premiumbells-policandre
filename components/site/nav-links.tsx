'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useId, useRef, useState} from 'react';
import {ChevronDownIcon} from './icons';

export type NavItem = {label: string; href: string; children?: NavItem[]};

export function isActive(pathname: string, href: string): boolean {
  if (href === '/' || href === '/en') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const linkClass = (active: boolean) =>
  `relative inline-flex min-h-11 items-center px-3 text-[0.95rem] font-medium transition-colors after:absolute after:inset-x-3 after:bottom-1.5 after:h-0.5 after:rounded-full after:transition-colors ${
    active ? 'text-teal-700 after:bg-teal-700' : 'text-ink hover:text-teal-700 after:bg-transparent'
  }`;

/**
 * A section link with a separate toggle for its submenu (disclosure pattern):
 * the link keeps working, the button opens the list. Escape, a click outside
 * or a navigation closes it.
 */
function Dropdown({item, active, toggleLabel}: {item: NavItem; active: boolean; toggleLabel: string}) {
  // Remember the page it was opened on, so a navigation closes it.
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const setOpen = (value: boolean) => setOpenOn(value ? pathname : null);
  const panelId = useId();
  const root = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpenOn(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpenOn(null);
      button.current?.focus();
    };
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <li ref={root} className="relative flex items-center">
      <Link href={item.href} aria-current={active ? 'page' : undefined} className={`${linkClass(active)} pr-1`}>
        {item.label}
      </Link>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="grid size-8 place-items-center rounded-md text-ink-soft hover:bg-stone hover:text-teal-700"
      >
        <ChevronDownIcon className={`size-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        <span className="sr-only">{toggleLabel.replace('{section}', item.label)}</span>
      </button>
      <ul
        id={panelId}
        hidden={!open}
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget as Node)) setOpen(false);
        }}
        className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-line bg-white p-2 shadow-xl shadow-teal-950/10"
      >
        {item.children!.map((child) => (
          <li key={child.href}>
            <Link
              href={child.href}
              onClick={() => setOpen(false)}
              className="flex min-h-11 items-center rounded-md px-3 text-[0.95rem] text-ink hover:bg-stone hover:text-teal-700"
            >
              {child.label}
            </Link>
          </li>
        ))}
      </ul>
    </li>
  );
}

export function NavLinks({items, toggleLabel}: {items: NavItem[]; toggleLabel: string}) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        if (item.children?.length) return <Dropdown key={item.href} item={item} active={active} toggleLabel={toggleLabel} />;
        return (
          <li key={item.href}>
            <Link href={item.href} aria-current={active ? 'page' : undefined} className={linkClass(active)}>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
