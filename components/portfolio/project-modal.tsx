'use client';

import {useRouter} from 'next/navigation';
import {useEffect, useRef, type ReactNode} from 'react';
import {CloseIcon} from '@/components/site/icons';

// Slide-over for an intercepted project route. Closing (button, Escape,
// backdrop) goes back in history, so the URL returns to the category grid and
// Forward reopens the project.
export function ProjectModal({title, closeLabel, children}: {
  title: string;
  closeLabel: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const dialog = useRef<HTMLDialogElement>(null);
  const closing = useRef(false);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) element.showModal();
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    router.back();
  };

  return (
    <dialog
      ref={dialog}
      aria-label={title}
      // React propagates close/cancel from the nested lightbox <dialog>, so
      // react only to events from this dialog itself.
      onCancel={(event) => {
        if (event.target !== event.currentTarget) return;
        event.preventDefault();
        close();
      }}
      // Browsers may force-close on repeated Escape despite preventDefault.
      onClose={(event) => event.target === event.currentTarget && close()}
      onClick={(event) => event.target === dialog.current && close()}
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-5xl bg-paper p-0 text-ink shadow-2xl transition-transform duration-300 ease-out backdrop:bg-ink/50 starting:open:translate-x-full"
    >
      <div className="sticky top-0 z-10 flex justify-end border-b border-line bg-paper/95 px-3 py-2 backdrop-blur">
        <button type="button" onClick={close} className="grid size-11 place-items-center rounded-md hover:bg-stone" autoFocus>
          <CloseIcon className="size-6" />
          <span className="sr-only">{closeLabel}</span>
        </button>
      </div>
      <div className="px-5 pb-16 pt-6 sm:px-10">{children}</div>
    </dialog>
  );
}
