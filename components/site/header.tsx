import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import type {Shell} from '@/lib/shell';
import {MailIcon, PhoneIcon} from './icons';
import {LanguageSwitcher} from './language-switcher';
import {Logo} from './logo';
import {MobileMenu} from './mobile-menu';
import {NavLinks} from './nav-links';

export function SiteHeader({lang, dictionary, shell}: {lang: Lang; dictionary: Dictionary; shell: Shell}) {
  const {phone, email} = shell.company;
  const switcher = (
    <LanguageSwitcher current={lang} label={dictionary.language.label} names={dictionary.language} missing={shell.missingPaths} />
  );

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md">
      <div className="container-site flex h-header items-center justify-between gap-4">
        <Logo href={localizedHref(lang, '/')} />

        <nav aria-label={dictionary.nav.label} className="hidden md:block">
          <NavLinks items={shell.header} toggleLabel={dictionary.nav.submenu} />
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href={phone.href}
            className="inline-flex min-h-11 items-center gap-2 rounded-md px-2 text-sm font-semibold text-teal-900 hover:text-teal-700"
          >
            <PhoneIcon className="size-5 text-teal-700" />
            <span className="hidden lg:inline">{phone.display}</span>
            <span className="sr-only lg:hidden">{dictionary.contact.call}</span>
          </a>
          <span aria-hidden="true" className="h-6 w-px bg-line" />
          {switcher}
        </div>

        <div className="flex items-center gap-1 md:hidden">
          <a href={phone.href} className="grid size-11 place-items-center rounded-md text-teal-700 hover:bg-stone">
            <PhoneIcon className="size-6" />
            <span className="sr-only">{dictionary.contact.call}</span>
          </a>
          <MobileMenu
            items={[{label: dictionary.nav.home, href: localizedHref(lang, '/')}, ...shell.header]}
            labels={{...dictionary.menu, nav: dictionary.nav.label}}
            footer={
              <div className="space-y-4">
                <a href={phone.href} className="flex min-h-11 items-center gap-3 font-semibold text-teal-900">
                  <PhoneIcon className="size-5 text-teal-700" />
                  {phone.display}
                </a>
                <a href={`mailto:${email}`} className="flex min-h-11 items-center gap-3 text-ink-soft">
                  <MailIcon className="size-5 text-teal-700" />
                  {email}
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
