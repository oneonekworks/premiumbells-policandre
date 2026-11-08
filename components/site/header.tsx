import type {Dictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import type {Shell} from '@/lib/shell';
import {HeaderFrame} from './header-frame';
import {MailIcon, PhoneIcon} from './icons';
import {LanguageSwitcher} from './language-switcher';
import {Logo} from './logo';
import {MobileMenu} from './mobile-menu';
import {NavLinks, type WorksCard} from './nav-links';

export function SiteHeader({lang, dictionary, shell}: {lang: Lang; dictionary: Dictionary; shell: Shell}) {
  const {phone, email} = shell.company;
  const switcher = (
    <LanguageSwitcher current={lang} label={dictionary.language.label} names={dictionary.language} missing={shell.missingPaths} />
  );
  const works: WorksCard = {
    href: shell.works.href,
    label: dictionary.nav.allWorks,
    meta: plural(lang, shell.works.count, dictionary.portfolio.projects),
    image: shell.works.image,
  };
  const home = localizedHref(lang, '/');

  return (
    <header className="sticky top-0 z-40 h-16 lg:h-header">
      <HeaderFrame>
        <Logo href={home} name={shell.company.name} />

        <nav aria-label={dictionary.nav.label} className="hidden lg:block">
          <NavLinks items={shell.header} toggleLabel={dictionary.nav.submenu} works={works} />
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          {switcher}
          <a href={phone.href} className="btn btn-primary btn-sm">
            <PhoneIcon className="size-4 xl:hidden" />
            <span className="hidden xl:inline">{phone.display}</span>
            <span className="sr-only xl:hidden">{dictionary.contact.call}</span>
          </a>
        </div>

        <div className="lg:hidden">
          <MobileMenu
            home={{label: dictionary.nav.home, href: home}}
            logo={<Logo href={home} name={shell.company.name} />}
            items={shell.header}
            works={works}
            labels={{...dictionary.menu, nav: dictionary.nav.label}}
            footer={
              <div className="space-y-3">
                <a href={phone.href} className="btn btn-primary w-full">
                  <PhoneIcon className="size-5" />
                  {phone.display}
                </a>
                <div className="flex items-center justify-between gap-4">
                  <a href={`mailto:${email}`} className="inline-flex min-h-11 min-w-0 items-center gap-2 text-body text-ink-soft hover:text-teal-700">
                    <MailIcon className="size-5 shrink-0 text-teal-700" />
                    <span className="truncate">{email}</span>
                  </a>
                  {switcher}
                </div>
              </div>
            }
          />
        </div>
      </HeaderFrame>
    </header>
  );
}
