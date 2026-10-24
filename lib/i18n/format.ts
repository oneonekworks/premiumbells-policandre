import type {Lang} from './routing';

/**
 * Count with a plural noun. Forms are [one, few, many]: Romanian uses "de"
 * from 20 upward ("20 de lucrări"); English uses only one/other.
 */
export function plural(lang: Lang, count: number, forms: readonly string[]): string {
  if (count === 1) return `${count} ${forms[0]}`;
  if (lang === 'ro') {
    const rest = count % 100;
    return `${count} ${count === 0 || (rest >= 1 && rest <= 19) ? forms[1] : forms[2] ?? forms[1]}`;
  }
  return `${count} ${forms[1]}`;
}
