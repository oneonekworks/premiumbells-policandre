import 'server-only';
import {notFound, permanentRedirect} from 'next/navigation';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {localizedHref} from '@/lib/i18n/routing';
import {defaultVariants, servicePath, servicesPath} from '@/lib/services';
import {routeLang} from './portfolio-routes';
import {getService} from './services';

/**
 * Service (or variant, when `parentSlug` is given) for the URL segments in the
 * current language. A slug from another language, or a path that is not the
 * service's canonical one (/servicii/clopote/cu-jug → /servicii/clopote),
 * permanently redirects; hidden, unpublished, wrong-parent or unknown services
 * are 404s. A parent with a default variant (Clopote) renders that variant.
 */
export async function resolveService(langParam: string, parentSlug: string | null, slug: string) {
  const lang = routeLang(langParam);
  let service = await getService(lang, parentSlug, slug);
  if (!service?.slug) notFound();
  const parentCurrent = service.parent?.slug ?? null;
  if (parentSlug && !parentCurrent) notFound();
  const requested = parentSlug ? `${servicesPath}/${parentSlug}/${slug}` : `${servicesPath}/${slug}`;
  const canonical = servicePath(parentCurrent, service.slug);
  if (requested !== canonical) permanentRedirect(localizedHref(lang, canonical));
  const fallback = !parentSlug ? defaultVariants[service.slug] : undefined;
  if (fallback) {
    const variant = await getService(lang, service.slug, fallback);
    if (variant?.slug) service = variant;
  }
  return {lang, service, dictionary: getDictionary(lang)};
}
