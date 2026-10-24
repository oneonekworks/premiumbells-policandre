import 'server-only';
import {lang as rootLang} from 'next/root-params';
import {notFound} from 'next/navigation';
import {getDictionary} from './dictionaries';
import {isLang, type Lang} from './routing';

/** Current language from the root `[lang]` segment, validated. */
export async function currentLang(): Promise<Lang> {
  const value = await rootLang();
  if (!value || !isLang(value)) notFound();
  return value;
}

export async function currentDictionary() {
  return getDictionary(await currentLang());
}
