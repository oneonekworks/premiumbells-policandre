'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, type ReactNode} from 'react';
import {CloseIcon, MenuIcon} from './icons';
import {isActive, type NavItem} from './nav-links';

// Native modal <dialog>: focus containment, Escape, and inert background come
// from the browser. The menu closes after any navigation.
export function MobileMenu({items, labels, footer}: {
  items: NavItem[];
  labels: {open: string; close: string; title: string; nav: string};
  footer: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="grid size-11 place-items-center rounded-md text-ink hover:bg-stone"
      >
        <MenuIcon className="size-6" />
        <span className="sr-only">{labels.open}</span>
      </button>
      <dialog
        ref={dialog}
        aria-label={labels.title}
        onClick={(event) => event.target === dialog.current && dialog.current.close()}
        className="m-0 ml-auto h-dvh max-h-none w-full max-w-sm bg-paper p-0 text-ink shadow-2xl transition-transform duration-300 ease-out backdrop:bg-ink/40 starting:open:translate-x-full"
      >
        <div className="flex h-full flex-col">
          <div className="flex h-header items-center justify-end border-b border-line px-3">
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="grid size-11 place-items-center rounded-md hover:bg-stone"
              autoFocus
            >
              <CloseIcon className="size-6" />
              <span className="sr-only">{labels.close}</span>
            </button>
          </div>
          <nav aria-label={labels.nav} className="flex-1 overflow-y-auto px-6 py-6">
            <ul className="space-y-1">
              {items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => dialog.current?.close()}
                      className={`flex min-h-12 items-center border-l-2 pl-4 font-display text-2xl font-semibold ${
                        active ? 'border-teal-700 text-teal-700' : 'border-transparent hover:border-line'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <div className="border-t border-line px-6 py-6">{footer}</div>
        </div>
      </dialog>
    </>
  );
}
