import Link from 'next/link';
import type {CSSProperties} from 'react';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import type {Shell, ShellLink} from '@/lib/shell';
import {BottomBar} from './bottom-bar';
import {FacebookIcon, InstagramIcon, YouTubeIcon} from './icons';
import {LanguageSwitcher} from './language-switcher';
import {Logo} from './logo';

const socialIcons = {facebook: FacebookIcon, instagram: InstagramIcon, youtube: YouTubeIcon};
const socialNames = {facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube'};

/** The anchor of the offer block; the bottom bar and "Cereți o ofertă" buttons point here. */
export const offerAnchor = 'oferta';

const headingClass = 'mb-3 text-chip font-semibold text-on-dark';
const linkClass = 'inline-flex min-h-10 items-center text-body text-on-dark-soft transition-colors duration-(--duration-line) hover:text-on-dark';

/** Internal links use next/link; external, tel: and mailto: stay plain anchors. */
function FooterLink({link}: {link: ShellLink}) {
  return link.href.startsWith('/')
    ? <Link href={link.href} className={linkClass}>{link.label}</Link>
    : <a href={link.href} className={linkClass} rel={link.href.startsWith('http') ? 'noopener' : undefined}>{link.label}</a>;
}

function LinkColumn({heading, links}: {heading: string; links: ShellLink[]}) {
  return (
    <nav aria-label={heading}>
      <h2 className={headingClass}>{heading}</h2>
      <ul>
        {links.map((link) => <li key={`${link.href}-${link.label}`}><FooterLink link={link} /></li>)}
      </ul>
    </nav>
  );
}

/** The one gold ornament on the site (tokens: --color-ornament). */
function BellOrnament() {
  return (
    <svg viewBox="0 0 40 44" aria-hidden="true" className="h-11 w-10 text-ornament">
      <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 2v4" />
        <path d="M17 6h6" />
        <path d="M20 6c-6.6 0-10.5 5.2-10.5 12.4 0 6.4-1.6 10.4-5 13.6h31c-3.4-3.2-5-7.2-5-13.6C30.5 11.2 26.6 6 20 6Z" />
        <path d="M4.5 32h31" />
        <path d="M16.5 36a3.5 3.5 0 0 0 7 0" />
        <path d="M14 18.5c.6-3.4 2.6-5.6 6-6" opacity="0.6" />
      </g>
    </svg>
  );
}

export function SiteFooter({lang, dictionary, shell}: {lang: Lang; dictionary: Dictionary; shell: Shell}) {
  const {footer, offer} = dictionary;
  const {company} = shell;
  const groups = shell.footerGroups
    ?? [{heading: footer.navigation, links: [{label: dictionary.nav.home, href: localizedHref(lang, '/')}, ...shell.header]}];
  const legal = [
    company.legalName,
    `CUI ${company.cui}`,
    company.registration ? `${footer.registration} ${company.registration}` : null,
    company.address?.split('\n').map((line) => line.trim()).filter(Boolean).join(', '),
    `© ${new Date().getFullYear()}`,
  ].filter(Boolean);

  return (
    <>
      <footer className="on-dark grain mx-3 mb-28 mt-20 rounded-panel bg-teal-950 text-on-dark lg:mx-4 lg:mb-4 lg:mt-40">
        <div className="mx-auto max-w-page px-5 pb-8 pt-12 md:px-8 lg:px-14 lg:pb-10 lg:pt-18">
          <section id={offerAnchor} aria-labelledby="oferta-titlu" className="scroll-mt-header grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 id="oferta-titlu" className="font-display text-offer">{offer.title}</h2>
              <p className="mt-5 max-w-xl text-lead text-on-dark-soft">{offer.text}</p>
            </div>
            <div className="flex flex-col items-start gap-3 lg:items-end">
              <a href={company.phone.href} className="btn btn-light min-h-15 px-8 text-[1.0625rem]">
                {offer.call}: {company.phone.display}
              </a>
              <a href={`mailto:${company.email}`} className="inline-flex min-h-11 items-center text-body text-on-dark-soft underline decoration-on-dark/30 underline-offset-4 hover:text-on-dark hover:decoration-on-dark">
                {offer.write}: {company.email}
              </a>
            </div>
          </section>

          <div className="my-12 h-px bg-on-dark/14" />

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[2fr_repeat(var(--cols),1fr)]"
            style={{'--cols': groups.length + 1} as CSSProperties}>
            <div>
              <Logo href={localizedHref(lang, '/')} name={company.name} inverted />
              <div className="mt-6 flex items-start gap-4">
                <BellOrnament />
                <p className="max-w-xs text-body text-on-dark-soft">{company.tagline}</p>
              </div>
              {company.social.length ? (
                <ul aria-label={footer.social} className="mt-6 flex gap-2">
                  {company.social.map((item) => {
                    const Icon = socialIcons[item.network];
                    return (
                      <li key={item.href}>
                        <a href={item.href} rel="noopener"
                          className="grid size-11 place-items-center rounded-pill bg-on-dark/8 text-on-dark-soft transition-colors hover:bg-on-dark/14 hover:text-on-dark">
                          <Icon className="size-5" />
                          <span className="sr-only">{socialNames[item.network]}</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>

            {groups.map((group) => <LinkColumn key={group.heading} heading={group.heading} links={group.links} />)}

            <div>
              <h2 className={headingClass}>{dictionary.contact.heading}</h2>
              <ul>
                <li><a href={company.phone.href} className={linkClass}>{company.phone.display}</a></li>
                <li><a href={`mailto:${company.email}`} className={`${linkClass} break-all`}>{company.email}</a></li>
              </ul>
              <div className="mt-3">
                <LanguageSwitcher current={lang} label={dictionary.language.label} names={dictionary.language}
                  missing={shell.missingPaths} onDark />
              </div>
            </div>
          </div>

          <p className="mt-12 border-t border-on-dark/14 pt-6 text-caption text-on-dark-soft">
            {company.registryUrl
              ? <a href={company.registryUrl} rel="noopener" className="underline-offset-4 hover:text-on-dark hover:underline">{legal[0]}</a>
              : legal[0]}
            {legal.slice(1).map((part) => <span key={part}> · {part}</span>)}
          </p>
        </div>
      </footer>
      <BottomBar offerHref={`#${offerAnchor}`} offerLabel={offer.title} phoneHref={company.phone.href} callLabel={offer.call} />
    </>
  );
}
