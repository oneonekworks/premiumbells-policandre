// Photo descriptions are optional for editors (galleries reach 200 photos).
// Missing ones are generated from data the page already has, so every image
// still gets a meaningful, language-specific alternative text.

type Describable = {alt?: string | null; caption?: string | null};

const words = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * "Schitul Duca, Brașov" — subject and place, skipping empty parts and places
 * the text already names ("Parohia Ziua Crucii, Iași" + "Iași" stays as is).
 */
export function subject(title: string | null | undefined, ...place: (string | null | undefined)[]): string {
  const parts: string[] = [];
  const named = new Set<string>();
  for (const part of [title, ...place].map((value) => value?.trim())) {
    if (!part) continue;
    const partWords = words(part);
    if (parts.length && partWords.length && partWords.every((word) => named.has(word))) continue;
    parts.push(part);
    partWords.forEach((word) => named.add(word));
  }
  return parts.join(', ');
}

/**
 * Editor's description, else the caption, else `fallback` (typically
 * `subject(...)`), with "fotografia 3 din 12" appended when a position is given.
 */
export function photoAlt(
  image: Describable,
  fallback: string,
  position?: {index: number; total: number; template: string},
): string {
  const written = image.alt?.trim() || image.caption?.trim();
  if (written) return written;
  if (!position) return fallback;
  const where = position.template
    .replace('{index}', String(position.index + 1))
    .replace('{total}', String(position.total));
  return fallback ? `${fallback} – ${where}` : where;
}
