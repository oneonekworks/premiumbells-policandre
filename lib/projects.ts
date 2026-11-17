// Short texts about a work (project), shared by cards, captions and the
// Project panel.

type Spec = {value?: string | null; unit?: string | null; label?: string | null} | null | undefined;

/**
 * A specification as a short phrase: "100 kg", "3 nivele", "6 clopote".
 * Without a unit, a bare number takes the label as its noun ("Număr de
 * clopote" → "clopote"); text values stay as written.
 */
export function specText(spec: Spec): string | null {
  const value = spec?.value?.trim();
  if (!value) return null;
  if (spec?.unit) return `${value} ${spec.unit}`;
  const bare = /^[\d.,–-]+$/.test(value) || /^[IVXLC]+$/.test(value);
  const noun = spec?.label?.replace(/^număr(ul)? de\s+/i, '').trim().toLowerCase();
  return bare && noun ? `${value} ${noun}` : value;
}
