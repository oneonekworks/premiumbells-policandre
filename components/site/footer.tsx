import Link from 'next/link';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {site} from '@/lib/site';
import {FacebookIcon, InstagramIcon, MailIcon, PhoneIcon} from './icons';
import {primaryNav} from './header';
import {Logo} from './logo';

const socialIcons = {Facebook: FacebookIcon, Instagram: InstagramIcon};

export function SiteFooter({lang, dictionary}: {lang: Lang; dictionary: Dictionary}) {
  const {footer} = dictionary;
  const headingClass = 'mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200';
  const linkClass = 'inline-flex min-h-10 items-center text-paper/80 hover:text-paper';

  return (
    <footer className="border-t-2 border-gold-500 bg-teal-950 text-paper">
      <div className="container-site grid gap-10 py-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-5">
          <Logo href={localizedHref(lang, '/')} inverted />
          <p className="mt-5 max-w-sm leading-relaxed text-paper/75">{footer.tagline}</p>
          <ul aria-label={footer.social} className="mt-6 flex gap-2">
            {site.social.map((item) => {
              const Icon = socialIcons[item.name];
              return (
                <li key={item.name}>
                  <a
                    href={item.href}
                    rel="noopener"
                    className="grid size-11 place-items-center rounded-full border border-paper/20 text-paper/80 hover:border-paper/60 hover:text-paper"
                  >
                    <Icon className="size-5" />
                    <span className="sr-only">{item.name}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <nav aria-label={footer.navigation} className="md:col-span-3">
          <h2 className={headingClass}>{footer.navigation}</h2>
          <ul>
            {[{label: dictionary.nav.home, href: localizedHref(lang, '/')}, ...primaryNav(lang, dictionary)].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-4">
          <h2 className={headingClass}>{dictionary.contact.heading}</h2>
          <ul>
            <li>
              <a href={site.phone.href} className={`${linkClass} gap-3`}>
                <PhoneIcon className="size-5 text-teal-500" />
                {site.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${site.email}`} className={`${linkClass} gap-3 break-all`}>
                <MailIcon className="size-5 shrink-0 text-teal-500" />
                {site.email}
              </a>
            </li>
          </ul>
          <h2 className={`${headingClass} mt-8`}>{footer.company}</h2>
          <dl className="space-y-1 text-sm text-paper/75">
            <dt className="sr-only">{footer.company}</dt>
            <dd>{site.legalName}</dd>
            <div className="flex gap-1.5">
              <dt>CUI</dt>
              <dd>{site.cui}</dd>
            </div>
            <div className="flex gap-1.5">
              <dt>{footer.registration}</dt>
              <dd>{site.registration}</dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <p className="container-site py-5 text-sm text-paper/60">
          © {new Date().getFullYear()} {site.name}. {footer.rights}
        </p>
      </div>
    </footer>
  );
}
