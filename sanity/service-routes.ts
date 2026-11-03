import 'server-only';
import {notFound, permanentRedirect} from 'next/navigation';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {localizedHref} from '@/lib/i18n/routing';
import {servicePath} from '@/lib/services';
import {routeLang} from './portfolio-routes';
import {getService} from './services';

/**
 * Service (or variant, when `parentSlug` is given) for the URL segments in the
 * current language. A slug from another language permanently redirects to
 * this language's path; hidden, unpublished, wrong-parent or unknown
 * services are 404s.
 */
export async function resolveService(langParam: string, parentSlug: string | null, slug: string) {
  const lang = routeLang(langParam);
  const service = await getService(lang, parentSlug, slug);
  if (!service?.slug) notFound();
  const parentCurrent = service.parent?.slug ?? null;
  if (parentSlug && !parentCurrent) notFound();
  if (service.slug !== slug || parentCurrent !== parentSlug) {
    permanentRedirect(localizedHref(lang, servicePath(parentCurrent, service.slug)));
  }
  return {lang, service, dictionary: getDictionary(lang)};
}
