'use client';

import {useSyncExternalStore, type ReactNode} from 'react';

/**
 * The list the Project panel browses (Anterior / Următor, "Lucrarea n din N ·
 * filtru"). Whatever opened the panel registers its list on click: the Works
 * wall its filtered list, a service page its own works. The panel lives in the
 * root layout's modal slot, outside the page's tree, so this is a small module
 * store rather than a React context. Without a registered list (a shared link,
 * the homepage) the panel uses the list the server gives it.
 */
export type ListItem = {href: string; title: string; category: string; thumb: string | null};
/** `plain`: opened from a service page, so the category shows as text, not a link. */
export type ProjectList = {label: string; items: ListItem[]; plain?: boolean};

let current: ProjectList | null = null;
const listeners = new Set<() => void>();

export function setProjectList(list: ProjectList) {
  current = list;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The registered list if it holds `href`, else the fallback. */
export function useProjectList(href: string, fallback: ProjectList): ProjectList {
  const list = useSyncExternalStore(subscribe, () => current, () => null);
  return list?.items.some((item) => item.href === href) ? list : fallback;
}

/**
 * Wraps server-rendered work cards: a click on a link to one of `items`
 * registers the list (capture phase, before Next's Link navigates).
 */
export function ProjectListScope({label, items, plain, children, className}: ProjectList & {children: ReactNode; className?: string}) {
  return (
    <div className={className} onClickCapture={(event) => {
      const link = (event.target as Element).closest('a[href]');
      const href = link?.getAttribute('href');
      if (href && items.some((item) => item.href === href)) setProjectList({label, items, plain});
    }}>
      {children}
    </div>
  );
}
