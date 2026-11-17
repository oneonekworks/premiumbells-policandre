'use client';

import {createContext, useCallback, useContext, useEffect, useRef, useState, type MouseEvent, type ReactNode} from 'react';
import {Lightbox, type LightboxSet} from '@/components/portfolio/lightbox';
import type {Dictionary} from '@/lib/i18n/dictionaries';

/**
 * Lightbox · Iconostase (boards V6IconostasViewer + Mobile; routes.md): the
 * Lightbox with material tabs, addressed by the material's URL
 * (/servicii/iconostase/marmura …). Material links are real <a href> to those
 * URLs; a click opens the layer in place and pushes the address, tabs replace
 * it, Back or × return to /servicii/iconostase. A direct visit to a material
 * URL renders the page with the layer already open (`initial`).
 */
type Context = {open: (set: number, event?: MouseEvent) => void};
const LayerContext = createContext<Context | null>(null);

export function MaterialLayer({sets, paths, basePath, initial, labels, title, offer, children}: {
  sets: LightboxSet[];
  /** The address of each set (material). */
  paths: string[];
  /** /servicii/iconostase */
  basePath: string;
  /** The set open on load (a material URL), else null. */
  initial: number | null;
  labels: Dictionary['portfolio']['lightbox'];
  title: string;
  offer: {href: string; label: string};
  children: ReactNode;
}) {
  const [open, setOpen] = useState<{set: number; index: number} | null>(initial === null ? null : {set: initial, index: 0});
  const pushed = useRef(false);

  useEffect(() => {
    const onPop = () => {
      const index = paths.indexOf(location.pathname);
      pushed.current = false;
      setOpen(index >= 0 ? {set: index, index: 0} : null);
    };
    addEventListener('popstate', onPop);
    return () => removeEventListener('popstate', onPop);
  }, [paths]);

  const show = useCallback((set: number, event?: MouseEvent) => {
    if (!sets[set]?.images.length) return;
    if (event) {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;
      event.preventDefault();
    }
    history.pushState(history.state, '', paths[set]);
    pushed.current = true;
    setOpen({set, index: 0});
  }, [paths, sets]);

  const close = () => {
    setOpen(null);
    if (pushed.current) {
      pushed.current = false;
      history.back();
    } else {
      history.replaceState(history.state, '', basePath);
    }
  };

  return (
    <LayerContext.Provider value={{open: show}}>
      {children}
      {open ? (
        <Lightbox sets={sets} initialSet={open.set} index={open.index} title={title} labels={labels} offer={offer}
          onIndexChange={(index, set) => {
            if (set !== open.set) history.replaceState(history.state, '', paths[set]);
            setOpen({set, index});
          }}
          onClose={close} />
      ) : null}
    </LayerContext.Provider>
  );
}

/** A link to a material's address that opens the layer in place. */
export function MaterialLink({set, href, className, label, children}: {
  set: number;
  href: string;
  className?: string;
  label?: string;
  children: ReactNode;
}) {
  const layer = useContext(LayerContext);
  return (
    <a href={href} aria-haspopup="dialog" aria-label={label} className={className} onClick={(event) => layer?.open(set, event)}>
      {children}
    </a>
  );
}
