'use client';

import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useEffect, useRef, type ReactNode} from 'react';
import {CloseIcon, MenuIcon} from './icons';
import {isActive, MenuRow, WorksFeature, type NavItem, type WorksCard} from './nav-links';

// Native modal <dialog>: focus containment, Escape, and inert background come
// from the browser. A full-screen white-glass sheet that fades in (M12); the
// menu closes after any navigation.
export function MobileMenu({home, logo, items, works, labels, footer}: {
  home: NavItem;
  logo: ReactNode;
  items: NavItem[];
  works: WorksCard;
  labels: {open: string; close: string; title: string; nav: string};
  footer: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();
  const close = () => dialog.current?.close();

  useEffect(() => {
    dialog.current?.close();
  }, [pathname]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        aria-haspopup="dialog"
        className="grid size-11 place-items-center rounded-pill bg-surface text-ink shadow-e1 transition-shadow hover:shadow-e2"
      >
        <MenuIcon className="size-5" />
        <span className="sr-only">{labels.open}</span>
      </button>
      <dialog
        ref={dialog}
        aria-label={labels.title}
        className="glass-light m-0 h-dvh max-h-none w-full max-w-none border-0 bg-white/88 p-0 text-ink opacity-100 transition-[opacity,display,overlay] transition-discrete duration-(--duration-fade) ease-light backdrop:bg-transparent starting:open:opacity-0"
      >
        <div className="mx-auto flex h-full max-w-xl flex-col">
          <div className="flex h-16 shrink-0 items-center justify-between px-5">
            {logo}
            <button
              type="button"
              onClick={close}
              className="grid size-11 place-items-center rounded-pill bg-surface shadow-e1"
              autoFocus
            >
              <CloseIcon className="size-5" />
              <span className="sr-only">{labels.close}</span>
            </button>
          </div>
          <nav aria-label={labels.nav} className="flex-1 overflow-y-auto px-5 pb-6 pt-2">
            <ul className="space-y-6">
              {[home, ...items].map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? 'page' : undefined}
                      onClick={close}
                      className={`flex min-h-12 items-center font-display text-[2.25rem] leading-none ${
                        active ? 'text-teal-700' : 'text-ink'
                      }`}
                    >
                      {item.label}
                    </Link>
                    {item.children?.length ? (
                      <ul className="mt-2 grid gap-1 sm:grid-cols-2">
                        {item.children.map((child) => (
                          <li key={child.href}>
                            <MenuRow item={child} active={pathname === child.href} onNavigate={close} compact />
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                );
              })}
            </ul>
            <div className="mt-8 h-44">
              <WorksFeature card={works} onNavigate={close} />
            </div>
          </nav>
          <div className="shrink-0 border-t border-hairline px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4">{footer}</div>
        </div>
      </dialog>
    </>
  );
}
