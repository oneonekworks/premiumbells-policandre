import type {Lang} from '@/lib/i18n/routing';

/** The number and date locale of a page language. */
export const numberLocale = (lang: Lang) => (lang === 'ro' ? 'ro-RO' : 'en-GB');
