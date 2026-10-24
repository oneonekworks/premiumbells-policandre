import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import {site} from '@/lib/site';
import {MailIcon, PhoneIcon} from './icons';
import {LanguageSwitcher} from './language-switcher';
import {Logo} from './logo';
import {MobileMenu} from './mobile-menu';
import {NavLinks, type NavItem} from './nav-links';

export function primaryNav(lang: Lang, dictionary: Dictionary): NavItem[] {
  return [
    {label: dictionary.nav.services, href: localizedHref(lang, '/servicii')},
    {label: dictionary.nav.works, href: localizedHref(lang, '/lucrarile-noastre')},
    {label: dictionary.nav.blog, href: localizedHref(lang, '/blog')},
  ];
}

export function SiteHeader({lang, dictionary}: {lang: Lang; dictionary: Dictionary}) {
  const items = primaryNav(lang, dictionary);
  const switcher = (
    <LanguageSwitcher current={lang} label={dictionary.language.label} names={dictionary.language} />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="container-site flex h-header items-center justify-between gap-4">
        <Logo href={localizedHref(lang, '/')} />

        <nav aria-label={dictionary.nav.label} className="hidden md:block">
          <NavLinks items={items} />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={site.phone.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-teal-900 hover:text-teal-700"
          >
            <PhoneIcon className="size-5 text-teal-700" />
            <span className="hidden lg:inline">{site.phone.display}</span>
            <span className="sr-only lg:hidden">{dictionary.contact.call}</span>
          </a>
          <span aria-hidden="true" className="h-6 w-px bg-line" />
          {switcher}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <a
            href={site.phone.href}
            className="grid size-11 place-items-center rounded-md text-teal-700 hover:bg-stone"
          >
            <PhoneIcon className="size-6" />
            <span className="sr-only">{dictionary.contact.call}</span>
          </a>
          <MobileMenu
            items={[{label: dictionary.nav.home, href: localizedHref(lang, '/')}, ...items]}
            labels={{...dictionary.menu, nav: dictionary.nav.label}}
            footer={
              <div className="space-y-4">
                <a href={site.phone.href} className="flex min-h-11 items-center gap-3 font-semibold text-teal-900">
                  <PhoneIcon className="size-5 text-teal-700" />
                  {site.phone.display}
                </a>
                <a href={`mailto:${site.email}`} className="flex min-h-11 items-center gap-3 text-ink-soft">
                  <MailIcon className="size-5 text-teal-700" />
                  {site.email}
                </a>
                {switcher}
              </div>
            }
          />
        </div>
      </div>
    </header>
  );
}
