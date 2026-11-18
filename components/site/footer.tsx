import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import type {Dictionary} from '@/lib/i18n/dictionaries';
import {localizedHref, type Lang} from '@/lib/i18n/routing';
import type {Shell, ShellLink} from '@/lib/shell';
import {BottomBar} from './bottom-bar';
import {ArrowV6Icon, FacebookIcon, InstagramIcon, PhoneV6Icon, PinIcon, YouTubeIcon} from './icons';
import {LanguageToggle} from './language-switcher';
import {Logo} from './logo';

const socialIcons = {facebook: FacebookIcon, instagram: InstagramIcon, youtube: YouTubeIcon};
const socialNames = {facebook: 'Facebook', instagram: 'Instagram', youtube: 'YouTube'};

/** The footer's anchor; the header phone menu and the bottom bar "Cereți o ofertă" land here. */
export const offerAnchor = 'oferta';

const heading = 'mb-1.5 text-[0.8125rem] font-semibold tracking-[0.02em] text-on-dark-soft';
const link = 'flex min-h-11 w-fit items-center text-[0.9375rem] text-on-dark underline-offset-[5px] hover:underline md:min-h-9';

function FooterLink({item, className = link}: {item: ShellLink; className?: string}) {
  return item.href.startsWith('/')
    ? <Link href={item.href} className={className}>{item.label}</Link>
    : <a href={item.href} className={className} rel={item.href.startsWith('http') ? 'noopener' : undefined}>{item.label}</a>;
}

/**
 * Footer v6.2, the one canonical block on every page (reference/footer.html +
 * footer.css): brand + showroom card · two link columns · "Cereți o ofertă"
 * (phone pill, email, response note, Colaborează) · legal bar with the credit,
 * RO / EN and socials. Phones reorder it (offer before the showroom) with
 * `display: contents` wrappers and `order`, so the markup stays one block.
 */
export function SiteFooter({lang, dictionary, shell}: {lang: Lang; dictionary: Dictionary; shell: Shell}) {
  const {footer, offer} = dictionary;
  const {company, showroom} = shell;
  const home = localizedHref(lang, '/');
  const groups = (shell.footerGroups
    ?? [{heading: footer.navigation, links: shell.header}]).slice(0, 2);
  const address = `${showroom.street}, ${showroom.postcode} ${showroom.town}`;
  const mapsHref = showroom.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const wazeHref = showroom.wazeUrl ?? `https://waze.com/ul?q=${encodeURIComponent(`${showroom.street}, ${showroom.town}`)}&navigate=yes`;
  const offerNote = shell.responseTime ? footer.offerNote.replace('[X] zile lucrătoare', shell.responseTime).replace('[X] working days', shell.responseTime) : footer.offerNote;
  const legal = [
    `© ${new Date().getFullYear()} ${company.legalName}`,
    `CUI ${company.cui}`,
    company.registration,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <footer
        id={offerAnchor}
        className="on-dark m-2 scroll-mt-header rounded-card bg-teal-950 text-on-dark [background:radial-gradient(ellipse_420px_320px_at_100%_-12%,rgb(15_107_99/var(--dT,.42)),transparent_70%),var(--color-teal-950)] md:m-4 md:[background:radial-gradient(ellipse_900px_520px_at_100%_-24%,rgb(15_107_99/var(--dT,.42)),transparent_70%),var(--color-teal-950)]"
      >
        <div className="flex flex-col px-5 pb-24 pt-7 md:mx-auto md:max-w-(--container-page) md:px-6 md:pb-0 md:pt-14 lg:pb-0">
          <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:pb-9 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            {/* Brand: logo, tagline, showroom (phones: the showroom moves below the offer). */}
            <div className="contents md:col-span-2 md:block lg:col-span-1">
              <div className="order-1">
                <Logo href={home} name={company.name} inverted label={`${company.name}, ${footer.home}`} />
              </div>
              <p className="order-2 mt-2 max-w-[400px] text-caption leading-[1.55] text-on-dark-soft">{company.tagline}</p>
              <div id="showroom" className="order-4 mt-4 flex max-w-[400px] items-start gap-3.5 rounded-[16px] border border-on-dark/10 bg-on-dark/6 p-2.5">
                <span className="relative grid h-27 w-21 flex-none place-items-center overflow-hidden rounded-[10px] bg-on-dark/8 text-center text-[0.75rem] text-on-dark-soft">
                  {showroom.photo
                    ? <SanityImage image={showroom.photo} cover sizes="84px" />
                    : footer.photo}
                </span>
                <div className="min-w-0">
                  <p className={`${heading} mb-0`}>{footer.showroom} · {showroom.town}</p>
                  <a href={mapsHref} target="_blank" rel="noopener"
                    aria-label={`${address}, ${footer.openInMaps}`}
                    className="mt-1.5 flex min-h-11 items-start gap-1.5 text-caption font-semibold leading-[1.4] text-on-dark underline decoration-on-dark/35 underline-offset-4 md:min-h-9">
                    <PinIcon className="mt-0.5 size-3.5 flex-none" />
                    <span>{showroom.street}<br />{showroom.postcode} {showroom.town}</span>
                  </a>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    <a href={mapsHref} target="_blank" rel="noopener"
                      className="inline-flex h-11 items-center rounded-pill bg-on-dark/8 px-3 text-[0.75rem] font-semibold hover:bg-on-dark/16 md:h-8.5">Google Maps</a>
                    <a href={wazeHref} target="_blank" rel="noopener"
                      className="inline-flex h-11 items-center rounded-pill bg-on-dark/8 px-3 text-[0.75rem] font-semibold hover:bg-on-dark/16 md:h-8.5">Waze</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Link columns: two across on phones, under a hairline. */}
            <div className="order-5 mt-6 grid grid-cols-2 gap-x-4 border-t border-on-dark/12 pt-5 md:contents">
              {groups.map((group) => (
                <nav key={group.heading} aria-label={group.heading} className="flex flex-col">
                  <p className={heading}>{group.heading}</p>
                  {group.links.map((item) => <FooterLink key={`${item.href}-${item.label}`} item={item} />)}
                </nav>
              ))}
            </div>

            {/* Cereți o ofertă (phones: right after the tagline). */}
            <div className="contents md:flex md:flex-col">
              <p className={`${heading} order-3 mt-6 md:mt-0`}>{offer.title}</p>
              <a href={company.phone.href}
                className="order-3 mt-1.5 flex h-13 items-center justify-center gap-2 rounded-pill bg-white text-base font-semibold text-teal-950 hover:bg-teal-tint md:mb-1 md:mt-0.5 md:h-11 md:w-fit md:px-4.5 md:text-[0.9375rem]">
                <PhoneV6Icon className="size-4" />{company.phone.display}
              </a>
              <a href={`mailto:${company.email}`}
                className="order-3 mt-1 flex min-h-11 w-fit items-center break-all text-[0.9375rem] font-medium text-teal-tint underline underline-offset-[5px] md:mt-0 md:min-h-9 md:font-normal md:text-on-dark md:no-underline md:hover:underline">
                <span className="md:hidden">{offer.write}:&nbsp;</span>{company.email}
              </a>
              <p className="order-3 mt-1.5 max-w-[240px] text-[0.8125rem] leading-normal text-on-dark-soft max-md:max-w-none">{offerNote}</p>
              <a href={shell.partners} className={`${link} order-6 mt-1 gap-1 md:mt-2.5`}>
                {footer.collaborate} <ArrowV6Icon className="size-3.5" />
              </a>
            </div>
          </div>

          <div className="order-7 mt-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-on-dark/12 pt-3 md:mt-0 md:pb-4.5 md:pt-3.5">
            <p className="hidden text-[0.8125rem] leading-normal text-on-dark-soft md:block">{legal}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 max-md:w-full max-md:justify-between">
              <p className="inline-flex items-center gap-1.5 text-[0.8125rem] text-on-dark-soft">
                {footer.credit}
                <svg width="12" height="12" viewBox="0 0 24 24" role="img" aria-label={footer.creditHeart} className="flex-none text-focus-on-dark">
                  <path fill="currentColor" d="M12 21s-8-5.2-8-11.2A4.6 4.6 0 0 1 12 7a4.6 4.6 0 0 1 8 2.8C20 15.8 12 21 12 21z" />
                </svg>
                {footer.creditBy}
                <a href="https://11k.io" target="_blank" rel="noopener" className="inline-flex min-h-10 items-center font-semibold text-on-dark hover:underline hover:underline-offset-4">11k.io</a>
              </p>
              <span className="flex items-center gap-2">
                <LanguageToggle current={lang} names={dictionary.language} missing={shell.missingPaths} variant="footer" />
                {company.social.map((item) => {
                  const Icon = socialIcons[item.network];
                  return (
                    <a key={item.href} href={item.href} rel="noopener" aria-label={socialNames[item.network]}
                      className="grid size-11 place-items-center rounded-pill bg-on-dark/8 text-on-dark hover:bg-on-dark/16 md:size-10">
                      <Icon className="size-4" />
                    </a>
                  );
                })}
              </span>
            </div>
          </div>
          <p className="order-8 mt-2 text-[0.75rem] leading-normal text-on-dark-soft md:hidden">{legal}</p>
        </div>
      </footer>
      <BottomBar offerHref={`#${offerAnchor}`} offerLabel={offer.title} phoneHref={company.phone.href} callLabel={offer.call} label={dictionary.menu.quickContact} />
    </>
  );
}
