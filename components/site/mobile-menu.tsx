'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useId, useRef, useState, type ReactNode} from 'react';
import type {ServiceGroup} from '@/lib/shell';
import {CaretIcon, CloseV6Icon, MenuV6Icon} from './icons';
import {isActive, MenuRow, type NavItem} from './nav-links';

/**
 * Mobile menu v6 (board V6MobileMenu): a full-screen white sheet in a native
 * modal <dialog> (focus containment, Escape and an inert page come from the
 * browser). The craft groups are an accordion, one open at a time (the one
 * holding the current page, else the first); then the other sections, RO / EN,
 * and "Sunați" + "Cereți o ofertă" pinned at the bottom. Any navigation closes it.
 */
export function MobileMenu({logo, items, groups, labels, phoneHref, offerHref, languageToggle}: {
  logo: ReactNode;
  items: NavItem[];
  groups: ServiceGroup[];
  labels: {open: string; close: string; title: string; nav: string; call: string; offer: string};
  phoneHref: string;
  offerHref: string;
  languageToggle: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const currentGroup = Math.max(0, groups.findIndex((group) => group.items.some((item) => isActive(pathname, item.href))));
  const [openGroup, setOpenGroup] = useState(currentGroup);
  const baseId = useId();
  const close = () => dialog.current?.close();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  const links = items.filter((item) => !(item.menu === 'services' && groups.length));

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpenGroup(currentGroup);
          dialog.current?.showModal();
          setExpanded(true);
        }}
        aria-haspopup="dialog"
        aria-expanded={expanded}
        className="btn-icon bg-surface text-ink shadow-e1 hover:shadow-e2"
      >
        <MenuV6Icon className="size-4.5" />
        <span className="sr-only">{labels.open}</span>
      </button>
      <dialog
        ref={dialog}
        aria-label={labels.title}
        onClose={() => setExpanded(false)}
        className="m-0 h-dvh max-h-none w-full max-w-none border-0 bg-ground p-0 text-ink opacity-100 transition-[opacity,display,overlay] transition-discrete duration-(--duration-fade) ease-light backdrop:bg-transparent starting:open:opacity-0"
      >
        <div className="mx-auto flex h-full max-w-xl flex-col">
          <div className="flex h-21 shrink-0 items-center justify-between pl-7.5 pr-5 pt-3">
            {logo}
            <button type="button" onClick={close} className="btn-icon bg-surface text-ink shadow-e1" autoFocus>
              <CloseV6Icon className="size-4.5" />
              <span className="sr-only">{labels.close}</span>
            </button>
          </div>
          <nav aria-label={labels.nav} className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5">
            {groups.map((group, index) => {
              const open = openGroup === index;
              const panelId = `${baseId}-${index}`;
              return (
                <div key={group.title} className="border-b border-hairline">
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setOpenGroup(open ? -1 : index)}
                    className="flex min-h-15 w-full items-center justify-between font-display text-[1.625rem] font-semibold leading-[1.1] text-ink"
                  >
                    {group.title}
                    <CaretIcon className={`size-3 transition-transform duration-(--duration-fade) ease-light ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <ul id={panelId} hidden={!open} className="pb-2">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <MenuRow item={item} active={isActive(pathname, item.href)} onNavigate={close} compact />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
            {links.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  onClick={close}
                  className={`flex min-h-15 items-center border-b border-hairline font-display text-[1.625rem] font-semibold leading-[1.1] ${active ? 'text-teal-900' : 'text-ink'}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <div className="mt-2">{languageToggle}</div>
          </nav>
          <div className="grid shrink-0 grid-cols-2 gap-2 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
            <a href={phoneHref} className="btn btn-secondary px-6">{labels.call}</a>
            <a href={offerHref} onClick={close} className="btn btn-primary px-6">{labels.offer}</a>
          </div>
        </div>
      </dialog>
    </>
  );
}
