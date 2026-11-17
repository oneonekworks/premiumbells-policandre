import type {Dictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import type {Shell} from '@/lib/shell';
import {offerAnchor} from './footer';
import {HeaderFrame} from './header-frame';
import {PhoneV6Icon} from './icons';
import {LanguageToggle} from './language-switcher';
import {Logo} from './logo';
import {MobileMenu} from './mobile-menu';
import {NavLinks, type WorksCard} from './nav-links';

/**
 * Header v6 (boards V6HomeDesktop / V6HomeMobileA, V6MegaMenu, V6MobileMenu):
 * fixed over the page; `main` keeps the pill's height free (layout.tsx).
 * Desktop: logo · Servicii (mega menu) · Lucrările noastre · Blog · RO / EN ·
 * phone button. Below 1024: logo · round phone button · menu button.
 */
export function SiteHeader({lang, dictionary, shell}: {lang: Lang; dictionary: Dictionary; shell: Shell}) {
  const {phone} = shell.company;
  const works: WorksCard = {
    href: shell.works.href,
    label: dictionary.nav.allWorks,
    meta: plural(lang, shell.works.count, dictionary.portfolio.projects),
    image: shell.works.image,
  };
  const home = localizedHref(lang, '/');
  const languageToggle = (
    <LanguageToggle current={lang} names={dictionary.language} missing={shell.missingPaths} />
  );

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-3 lg:px-4 lg:pt-4">
      <HeaderFrame>
        <Logo href={home} name={shell.company.name} label={`${shell.company.name}, ${dictionary.nav.home.toLowerCase()}`} />

        <nav aria-label={dictionary.nav.label} className="hidden lg:block">
          <NavLinks items={shell.header} groups={shell.serviceGroups} works={works} />
        </nav>

        <div className="hidden items-center gap-1.5 lg:flex">
          {languageToggle}
          <a href={phone.href} className="btn btn-primary btn-sm">{phone.display}</a>
        </div>

        <div className="flex gap-1 lg:hidden">
          <a href={phone.href} className="btn-icon bg-teal-900 text-white hover:bg-teal-950">
            <PhoneV6Icon className="size-4.5" />
            <span className="sr-only">{dictionary.offer.call}: {phone.display}</span>
          </a>
          <MobileMenu
            logo={<Logo href={home} name={shell.company.name} />}
            items={shell.header}
            groups={shell.serviceGroups}
            labels={{...dictionary.menu, nav: dictionary.nav.label, call: dictionary.offer.call, offer: dictionary.offer.title}}
            phoneHref={phone.href}
            offerHref={`#${offerAnchor}`}
            languageToggle={<LanguageToggle current={lang} names={dictionary.language} missing={shell.missingPaths} variant="menu" />}
          />
        </div>
      </HeaderFrame>
    </header>
  );
}
