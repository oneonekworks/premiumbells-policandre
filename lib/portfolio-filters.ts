// Text matching shared by the Works search (lib/works.ts) and the place lists.

/**
 * Lower-case text without diacritics or punctuation, so "Iași", "IASI" and
 * "iasi" compare equal (both ș and the legacy cedilla ş).
 */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

/** URL value for a county: "Caraș-Severin" → "caras-severin". */
export const countySlug = (county: string) => fold(county).replaceAll(' ', '-');
