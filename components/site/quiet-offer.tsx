/**
 * Quiet offer v6.2 (components.md, "Quiet offer"): at the end of the content of
 * a layer or a section, a short question + a light button (and optionally a
 * "Sunați" text link); never a filled button, never sticky. Dark filled buttons
 * stay for the final step on pages (footer, phone bottom bar). `onDark` for the
 * overlay and teal-950 panels.
 */
export function QuietOffer({question, offer, call, onDark = false, className = ''}: {
  question: string;
  offer: {href: string; label: string};
  call?: {href: string; label: string} | null;
  onDark?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-stretch gap-x-4 gap-y-3 border-t pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between ${
      onDark ? 'border-white/12' : 'border-hairline'
    } ${className}`}>
      <p className={`text-ui leading-[1.4] ${onDark ? 'text-overlay-soft' : 'text-ink-soft'}`}>{question}</p>
      <span className="flex items-center gap-4">
        {call ? (
          <a href={call.href} className={`inline-flex min-h-11 items-center text-ui font-semibold underline underline-offset-[5px] ${onDark ? 'text-overlay-text' : 'text-teal-700'}`}>
            {call.label}
          </a>
        ) : null}
        <a href={offer.href} className={`btn flex-1 sm:flex-none max-sm:min-h-12 ${onDark ? 'btn-outline-light min-h-11.5 px-5 text-ui' : 'btn-quiet'}`}>
          {offer.label}
        </a>
      </span>
    </div>
  );
}
