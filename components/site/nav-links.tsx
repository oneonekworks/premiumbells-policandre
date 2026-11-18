'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useId, useRef, useState} from 'react';
import {SanityImage} from '@/components/sanity-image';
import type {ServiceGroup} from '@/lib/shell';
import type {SanityImageValue} from '@/sanity/image';
import {ArrowV6Icon, CaretIcon} from './icons';

export type NavItem = {
  label: string;
  href: string;
  menu?: 'services';
  hint?: string | null;
  image?: SanityImageValue | null;
};

/** The featured card of the mega menu: all works, their number and a photo. */
export type WorksCard = {href: string; label: string; meta: string; image: SanityImageValue | null};

export function isActive(internal: string, href: string): boolean {
  // Prerendered pages report the internal /ro path (the proxy rewrites / to /ro).
  const pathname = internal.replace(/^\/ro(?=\/|$)/, '') || '/';
  if (href === '/' || href === '/en') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export const metalBar = {gold: 'bar-gold', bronze: 'bar-bronze', gilt: 'bar-gilt'} as const;

// Nav item: 44 tall pill, 15 / 500; hover and the current section take the tint (M08).
const navClass = (on: boolean) =>
  `inline-flex h-11 items-center gap-1.5 rounded-pill px-4 text-ui font-medium transition-colors duration-(--duration-line) ease-light hover:bg-teal-tint ${
    on ? 'bg-teal-tint text-teal-900' : 'text-ink'
  }`;

/**
 * A thumbnail row: photo, name (Cormorant 600) and one short line. Mega menu
 * 88 × 66 (v6.2); mobile menu 72 × 54, no padding.
 */
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
      className={`grid items-center gap-3.5 rounded-caption transition-colors duration-(--duration-line) ease-light ${
        compact ? 'min-h-17 grid-cols-[72px_minmax(0,1fr)] py-1.5' : 'min-h-[78px] grid-cols-[88px_minmax(0,1fr)] p-1.5 hover:bg-teal-tint focus-visible:bg-teal-tint'
      } ${active ? 'bg-teal-tint' : ''}`}
    >
      <span className={`relative overflow-hidden rounded-[10px] bg-band ${compact ? 'h-[54px] w-[72px]' : 'h-[66px] w-[88px] shadow-e1'}`}>
        <SanityImage image={item.image && {...item.image, alt: ''}} ratio={4 / 3} sizes={compact ? '72px' : '88px'} />
      </span>
      <span className="min-w-0">
        <span className={`block font-display text-[1.3125rem] font-semibold leading-[1.1] ${active ? 'text-teal-900' : 'text-ink'}`}>{item.label}</span>
        {item.hint ? <span className="mt-0.5 block truncate text-caption text-ink-soft">{item.hint}</span> : null}
      </span>
    </Link>
  );
}

/** "Toate lucrările · 60 de lucrări": a project photo with a glass caption (v6.2). */
export function WorksFeature({card, onNavigate}: {card: WorksCard; onNavigate: () => void}) {
  return (
    <Link href={card.href} onClick={onNavigate}
      className="group relative block min-h-44 overflow-hidden rounded-[18px] bg-band shadow-e2 transition-[translate,scale,box-shadow] duration-(--duration-fade) ease-light hover:-translate-y-1 hover:shadow-e3 focus-visible:-translate-y-1 focus-visible:shadow-e3 motion-reduce:still">
      <span className="absolute inset-0 transition-transform duration-(--duration-image) ease-light group-hover:scale-[1.03] motion-reduce:still">
        <SanityImage image={card.image && {...card.image, alt: ''}} cover sizes="248px" />
      </span>
      <span className="glass-light absolute inset-x-2.5 bottom-2.5 flex items-center justify-between gap-2 rounded-caption px-3.5 py-3">
        <span>
          <span className="block font-display text-[1.5rem] font-semibold leading-[1.1] text-ink">{card.label}</span>
          <span className="mt-0.5 block text-caption text-ink-soft">{card.meta}</span>
        </span>
        <ArrowV6Icon className="size-4.5 shrink-0 text-teal-700" />
      </span>
    </Link>
  );
}

/** One craft column heading: the family bar and its name (a link when the craft has a page). */
export function GroupHeading({group, onNavigate}: {group: ServiceGroup; onNavigate: () => void}) {
  return (
    <div className="flex flex-col gap-2 px-1.5 pb-2">
      <i aria-hidden="true" className={`family-bar ${metalBar[group.metal]}`} />
      <p className="text-ui font-semibold leading-none text-ink-soft">
        {group.href
          ? <Link href={group.href} onClick={onNavigate} className="inline-flex min-h-8 items-center hover:underline hover:underline-offset-4">{group.title} →</Link>
          : <span className="inline-flex min-h-8 items-center">{group.title}</span>}
      </p>
    </div>
  );
}

/**
 * "Servicii" opens the mega menu v6.2 (disclosure pattern): three craft
 * columns of thumbnail rows + "Toate lucrările". Escape, a click outside,
 * focus leaving it or a navigation closes it (M09–M10).
 */
function ServicesMenu({item, groups, works}: {item: NavItem; groups: ServiceGroup[]; works: WorksCard}) {
  // Remember the page it was opened on, so a navigation closes it.
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;
  const close = () => setOpenOn(null);
  const panelId = useId();
  const root = useRef<HTMLLIElement>(null);
  const button = useRef<HTMLButtonElement>(null);
  const current = groups.some((group) => group.items.some((child) => isActive(pathname, child.href)));

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
    <li ref={root}>
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpenOn(open ? null : pathname)}
        className={navClass(open || current)}
      >
        {item.label}
        <CaretIcon className={`size-3 transition-transform duration-(--duration-line) ${open ? 'rotate-180' : ''}`} />
      </button>
      <div
        id={panelId}
        role="region"
        aria-label={item.label}
        hidden={!open}
        onBlur={(event) => {
          if (!root.current?.contains(event.relatedTarget as Node)) close();
        }}
        className="glass-light absolute inset-x-0 top-full z-50 mt-2 grid grid-cols-[repeat(3,minmax(0,1fr))_248px] gap-5 rounded-[24px] p-6 shadow-e3 transition-[opacity,translate,display] transition-discrete duration-(--duration-fade) ease-light starting:-translate-y-2 starting:opacity-0"
      >
        {groups.map((group) => (
          <div key={group.title}>
            <GroupHeading group={group} onNavigate={close} />
            <ul>
              {group.items.map((child) => (
                <li key={child.href}>
                  <MenuRow item={child} active={isActive(pathname, child.href)} onNavigate={close} />
                </li>
              ))}
            </ul>
          </div>
        ))}
        <WorksFeature card={works} onNavigate={close} />
      </div>
    </li>
  );
}

export function NavLinks({items, groups, works}: {items: NavItem[]; groups: ServiceGroup[]; works: WorksCard}) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-0.5">
      {items.map((item) => {
        if (item.menu === 'services' && groups.length) {
          return <ServicesMenu key={item.href} item={item} groups={groups} works={works} />;
        }
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link href={item.href} aria-current={active ? 'page' : undefined} className={navClass(active)}>
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
