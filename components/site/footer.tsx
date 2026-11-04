import Link from 'next/link';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import type {Shell, ShellLink} from '@/lib/shell';
import {FacebookIcon, InstagramIcon, MailIcon, PhoneIcon, YouTubeIcon} from './icons';
import {Logo} from './logo';

const socialIcons = {facebook: FacebookIcon, instagram: InstagramIcon, youtube: YouTubeIcon};
const socialNames = {facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube'};

const headingClass = 'mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-gold-200';
const linkClass = 'inline-flex min-h-10 items-center text-paper/80 hover:text-paper';

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

export function SiteFooter({lang, dictionary, shell}: {lang: Lang; dictionary: Dictionary; shell: Shell}) {
  const {footer} = dictionary;
  const {company} = shell;
  const groups = shell.footerGroups
    ?? [{heading: footer.navigation, links: [{label: dictionary.nav.home, href: localizedHref(lang, '/')}, ...shell.header]}];

  return (
    <footer className="border-t-2 border-gold-500 bg-teal-950 text-paper">
      <div className="container-site grid gap-10 py-14 md:grid-cols-12 md:gap-8">
        <div className="md:col-span-4">
          <Logo href={localizedHref(lang, '/')} inverted />
          <p className="mt-5 max-w-sm leading-relaxed text-paper/75">{company.tagline}</p>
          {company.social.length ? (
            <ul aria-label={footer.social} className="mt-6 flex gap-2">
              {company.social.map((item) => {
                const Icon = socialIcons[item.network];
                return (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      rel="noopener"
                      className="grid size-11 place-items-center rounded-full border border-paper/20 text-paper/80 hover:border-paper/60 hover:text-paper"
                    >
                      <Icon className="size-5" />
                      <span className="sr-only">{socialNames[item.network]}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          ) : null}
        </div>

        <div className={`grid gap-10 sm:grid-cols-2 md:col-span-4 ${groups.length > 2 ? 'lg:grid-cols-3' : ''}`}>
          {groups.map((group) => <LinkColumn key={group.heading} heading={group.heading} links={group.links} />)}
        </div>

        <div className="md:col-span-4">
          <h2 className={headingClass}>{dictionary.contact.heading}</h2>
          <ul>
            <li>
              <a href={company.phone.href} className={`${linkClass} gap-3`}>
                <PhoneIcon className="size-5 text-teal-500" />
                {company.phone.display}
              </a>
            </li>
            <li>
              <a href={`mailto:${company.email}`} className={`${linkClass} gap-3 break-all`}>
                <MailIcon className="size-5 shrink-0 text-teal-500" />
                {company.email}
              </a>
            </li>
          </ul>
          {company.address ? <p className="mt-3 whitespace-pre-line text-sm text-paper/75">{company.address}</p> : null}
          <h2 className={`${headingClass} mt-8`}>{footer.company}</h2>
          <dl className="space-y-1 text-sm text-paper/75">
            <dt className="sr-only">{footer.company}</dt>
            <dd>
              {company.registryUrl
                ? <a href={company.registryUrl} rel="noopener" className="underline-offset-4 hover:text-paper hover:underline">{company.legalName}</a>
                : company.legalName}
            </dd>
            <div className="flex gap-1.5">
              <dt>CUI</dt>
              <dd>{company.cui}</dd>
            </div>
            {company.registration ? (
              <div className="flex gap-1.5">
                <dt>{footer.registration}</dt>
                <dd>{company.registration}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      </div>
      <div className="border-t border-paper/10">
        <p className="container-site py-5 text-sm text-paper/60">
          © {new Date().getFullYear()} {company.name}. {footer.rights}
        </p>
      </div>
    </footer>
  );
}
