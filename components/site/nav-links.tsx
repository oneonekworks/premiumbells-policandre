'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useId, useRef, useState} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {SanityImageValue} from '@/sanity/image';
import {ArrowRightIcon, ChevronDownIcon} from './icons';

export type NavItem = {
  label: string;
  href: string;
  children?: NavItem[];
  hint?: string | null;
  image?: SanityImageValue | null;
};

/** The featured card at the end of every mega menu. */
export type WorksCard = {href: string; label: string; meta: string; image: SanityImageValue | null};

export function isActive(pathname: string, href: string): boolean {
  if (href === '/' || href === '/en') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

// M08: a teal tint fades in behind the word; the active page keeps it.
const linkClass = (active: boolean) =>
  `inline-flex min-h-11 items-center rounded-pill px-4 text-ui font-medium transition-colors duration-(--duration-line) ease-light ${
    active ? 'bg-teal-tint text-teal-900' : 'text-ink hover:bg-teal-tint'
  }`;

/** A thumbnail row: photo, name and one short line (menus on every screen size). */
export function MenuRow({item, active, onNavigate, compact = false}: {
  item: NavItem;
  active: boolean;
  onNavigate: () => void;
  compact?: boolean;
}) {
  return (
    <Link
      href={item.href}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={`flex min-h-11 items-center gap-3 rounded-caption p-1.5 transition-colors duration-(--duration-line) ease-light hover:bg-teal-tint ${
        active ? 'bg-teal-tint' : ''
      }`}
    >
      <span className={`relative shrink-0 overflow-hidden rounded-caption bg-sunk ${compact ? 'h-10 w-[3.25rem]' : 'h-12 w-16'}`}>
        <SanityImage image={item.image && {...item.image, alt: ''}} ratio={4 / 3} sizes="64px" />
      </span>
      <span className="min-w-0">
        <span className={`block text-[0.9375rem] font-semibold leading-tight ${active ? 'text-teal-900' : 'text-ink'}`}>{item.label}</span>
        {item.hint ? <span aria-hidden="true" className="mt-0.5 block truncate text-caption text-ink-soft">{item.hint}</span> : null}
      </span>
    </Link>
  );
}

export function WorksFeature({card, onNavigate}: {card: WorksCard; onNavigate: () => void}) {
  return (
    <Link href={card.href} onClick={onNavigate}
      className="card-lift group relative block h-full min-h-44 overflow-hidden rounded-card bg-sunk shadow-e1">
      <span className="card-photo absolute inset-0">
        <SanityImage image={card.image && {...card.image, alt: ''}} cover sizes="240px" />
      </span>
      <span className="glass-light absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 rounded-caption px-3.5 py-2.5">
        <span>
          <span className="block text-[0.9375rem] font-semibold text-ink">{card.label}</span>
          <span className="block text-caption text-ink-soft">{card.meta}</span>
        </span>
        <ArrowRightIcon className="size-4 shrink-0 text-teal-700 transition-transform duration-(--duration-line) group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}

/**
 * A section link with a separate toggle for its mega menu (disclosure pattern):
 * the link keeps working, the button opens the panel. Escape, a click outside
 * or a navigation closes it (M09–M10).
 */
function Dropdown({item, active, toggleLabel, works}: {item: NavItem; active: boolean; toggleLabel: string; works: WorksCard}) {
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
  const children = item.children!;
  const close = () => setOpen(false);

  return (
    <li ref={root} className="flex items-center">
      <span className={`flex items-center rounded-pill transition-colors duration-(--duration-line) ${active || open ? 'bg-teal-tint' : ''}`}>
        <Link href={item.href} aria-current={active ? 'page' : undefined}
          className={`${linkClass(active)} pr-1.5 ${active || open ? 'hover:bg-transparent' : ''}`}>
          {item.label}
        </Link>
        <button
          ref={button}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="-ml-1 grid size-11 place-items-center rounded-pill text-ink-soft hover:text-teal-900"
        >
          <ChevronDownIcon className={`size-4 transition-transform duration-(--duration-line) ${open ? 'rotate-180' : ''}`} />
          <span className="sr-only">{toggleLabel.replace('{section}', item.label)}</span>
        </button>
      </span>
      <div
        id={panelId}
        hidden={!open}
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget as Node)) close();
        }}
        className="glass-light absolute inset-x-0 top-full z-50 mx-auto mt-2 max-w-(--container-header) rounded-menu bg-white/90 p-6 shadow-e3 transition-[opacity,translate,display] transition-discrete duration-(--duration-fade) ease-light starting:-translate-y-2 starting:opacity-0"
      >
        <div className="grid grid-cols-[1fr_15rem] gap-6">
          <ul className={`grid content-start gap-x-6 gap-y-1 ${children.length > 6 ? 'grid-cols-3' : 'grid-cols-2'}`}>
            {children.map((child) => (
              <li key={child.href}>
                <MenuRow item={child} active={isActive(pathname, child.href)} onNavigate={close} />
              </li>
            ))}
          </ul>
          <WorksFeature card={works} onNavigate={close} />
        </div>
      </div>
    </li>
  );
}

export function NavLinks({items, toggleLabel, works}: {items: NavItem[]; toggleLabel: string; works: WorksCard}) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        if (item.children?.length) {
          return <Dropdown key={item.href} item={item} active={active} toggleLabel={toggleLabel} works={works} />;
        }
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
