'use client';

import {useCallback, useEffect, useRef, useState, type ReactNode} from 'react';
import {CloseIcon} from '@/components/site/icons';

export type DialogGridItem = {
  key: string;
  /** DOM ids the card answers to; the first is written to the URL hash. */
  ids: string[];
  title: string;
  card: ReactNode;
  content: ReactNode;
};

const currentHash = () => decodeURIComponent(window.location.hash.slice(1));

// Cards that open their details in a modal dialog, as the legacy door and
// catalogue slide-overs did. Opening writes the card's id to the URL hash, so
// /servicii/policandre#Policandru-7 opens that card and Back closes it.
export function DialogGrid({items, closeLabel, detailsLabel, className}: {
  items: DialogGridItem[];
  closeLabel: string;
  detailsLabel: string;
  className: string;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);
  const pushed = useRef(false);
  const closing = useRef(false);
  const opener = useRef<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  const keyForHash = useCallback(
    (hash: string) => (hash ? items.find((item) => item.ids.includes(hash))?.key ?? null : null),
    [items],
  );

  // Follow the hash on load, Back/Forward and in-page links.
  useEffect(() => {
    const sync = () => {
      const key = keyForHash(currentHash());
      if (!key) pushed.current = false;
      closing.current = false;
      setOpenKey(key);
    };
    sync();
    window.addEventListener('popstate', sync);
    window.addEventListener('hashchange', sync);
    return () => {
      window.removeEventListener('popstate', sync);
      window.removeEventListener('hashchange', sync);
    };
  }, [keyForHash]);

  useEffect(() => {
    const element = dialog.current;
    if (openKey && element && !element.open) element.showModal();
    if (!openKey && opener.current) {
      document.querySelector<HTMLElement>(`[data-dialog-card="${opener.current}"]`)?.focus();
      opener.current = null;
    }
  }, [openKey]);

  const open = (item: DialogGridItem) => {
    opener.current = item.key;
    window.history.pushState(null, '', `#${encodeURIComponent(item.ids[0])}`);
    pushed.current = true;
    setOpenKey(item.key);
  };

  const close = () => {
    if (!openKey || closing.current) return;
    closing.current = true;
    opener.current ??= openKey;
    if (pushed.current) {
      pushed.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
      closing.current = false;
      setOpenKey(null);
    }
  };

  const current = items.find((item) => item.key === openKey);

  return (
    <>
      <ul className={className}>
        {items.map((item) => (
          <li key={item.key} id={item.ids[0]} className="scroll-mt-28">
            {item.ids.slice(1).map((id) => <span key={id} id={id} aria-hidden="true" />)}
            <button
              type="button"
              data-dialog-card={item.key}
              onClick={() => open(item)}
              aria-label={`${detailsLabel}: ${item.title}`}
              className="group block w-full text-left"
            >
              {item.card}
            </button>
          </li>
        ))}
      </ul>
      {current && (
        <dialog
          key={current.key}
          ref={dialog}
          aria-label={current.title}
          // React propagates cancel/close from the nested lightbox <dialog>.
          onCancel={(event) => {
            if (event.target !== event.currentTarget) return;
            event.preventDefault();
            close();
          }}
          onClose={(event) => event.target === event.currentTarget && close()}
          onClick={(event) => event.target === dialog.current && close()}
          className="m-0 ml-auto h-dvh max-h-none w-full max-w-4xl bg-paper p-0 text-ink shadow-2xl transition-transform duration-300 ease-out backdrop:bg-ink/50 starting:open:translate-x-full"
        >
          <div className="sticky top-0 z-10 flex justify-end border-b border-line bg-paper/95 px-3 py-2 backdrop-blur">
            <button type="button" onClick={close} className="grid size-11 place-items-center rounded-md hover:bg-stone" autoFocus>
              <CloseIcon className="size-6" />
              <span className="sr-only">{closeLabel}</span>
            </button>
          </div>
          <div className="px-5 pb-16 pt-6 sm:px-10">{current.content}</div>
        </dialog>
      )}
    </>
  );
}
