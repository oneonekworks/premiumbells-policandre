import {SanityImage} from '@/components/sanity-image';
import {localizedHref} from '@/lib/i18n/routing';
import {automatizariCopy as copy} from '@/lib/service-copy';
import {servicePath} from '@/lib/services';
import {getService, type ServiceSection} from '@/sanity/services';
import {Nudges, Section, SectionHead, wrap} from '../blocks';
import {kg} from '@/lib/bells';
import {StoryHero, type HeroInset} from '../story-hero';
import {crumbs, heroFacts, heroInsets, serviceBySlug, type PageProps} from './common';

type Of<T extends ServiceSection['_type']> = Extract<ServiceSection, {_type: T}>;

const BELL = 'M36 14C36 9 42 8 50 8C58 8 64 9 64 14C66 20 69 26 71 36C74 52 76 66 84 78C88 84 94 88 98 90L98 96L2 96L2 90C6 88 12 84 16 78C24 66 26 52 29 36C31 26 34 20 36 14Z';
// Board scale: every bell of every set at one scale (desktop 1,256 px/cm, phones 0,86), yoke 18 / 12 tall.
const SCALE = {desktop: 1.256, phone: 0.86};

/** One bell on its yoke, at the set rows' shared scale. */
function SetBell({diameter, height, weight}: {diameter: number; height: number; weight: number}) {
  const size = (k: number) => ({w: Math.round(diameter * k), h: Math.round(height * k), y: Math.round(diameter * 1.2 * k)});
  const d = size(SCALE.desktop);
  const p = size(SCALE.phone);
  return (
    <div className="flex flex-col items-center" style={{['--yw' as string]: `${p.y}px`, ['--yW' as string]: `${d.y}px`, ['--bw' as string]: `${p.w}px`, ['--bW' as string]: `${d.w}px`, ['--bh' as string]: `${p.h}px`, ['--bH' as string]: `${d.h}px`}}>
      <i aria-hidden="true" className="block h-3 w-(--yw) rounded-[2px] bg-[#8a6a45] lg:h-[18px] lg:w-(--yW)" />
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" overflow="visible" aria-hidden="true" className="block h-(--bh) w-(--bw) lg:h-(--bH) lg:w-(--bW)">
        <path d="M42 9L42 4Q42 0 46 0L54 0Q58 0 58 4L58 9Z" fill="url(#bronzeA)" />
        <path d={BELL} fill="url(#bronzeA)" />
        <circle cx="50" cy="97" r="3" fill="url(#bronzeA)" />
        <path d="M33 27H67M29 40H71M15 80H85M6 89H94" fill="none" stroke="rgb(255 232 188 / .5)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
      </svg>
      <small className="mt-1.5 block whitespace-nowrap text-caption text-ink-soft">{kg(weight)}</small>
    </div>
  );
}

/** /servicii/automatizari-clopote-cu-balans (boards V6AutomatizariBalans + Mobile): kits without prices. */
export async function AutomatizariPage({lang, service, dictionary}: PageProps) {
  const sections = service.sections ?? [];
  const setsSection = sections.find((section): section is Of<'sectionBellSets'> => section._type === 'sectionBellSets');
  const kitSection = sections.find((section): section is Of<'sectionKit'> => section._type === 'sectionKit');
  const [bells, nudgeTarget] = await Promise.all([getService(lang, 'clopote', 'cu-jug'), serviceBySlug(lang, copy.nudge.slug)]);
  // Bell sizes come from the Clopote cu jug table (nearest weight).
  const rows = (bells?.sections?.find((section): section is Of<'sectionBellSizes'> => section._type === 'sectionBellSizes')?.rows ?? [])
    .flatMap((row) => (row.weightKg && row.diameterCm && row.heightCm ? [{weight: row.weightKg, diameter: row.diameterCm, height: row.heightCm}] : []));
  const nearest = (weight: number) => rows.reduce((best, row) => (Math.abs(row.weight - weight) < Math.abs(best.weight - weight) ? row : best), rows[0]);

  const kit = kitSection?.items?.length
    ? kitSection.items.map((item) => ({key: item._key, name: item.name ?? '', image: item.image ?? null}))
    : copy.kit.items.map((name) => ({key: name, name, image: null}));
  const insets: [HeroInset, HeroInset] | [] = heroInsets(service).length ? heroInsets(service)
    : [{image: null, ...copy.insets[0]}, {image: null, ...copy.insets[1]}];
  const sets = (setsSection?.sets ?? []).filter((set) => set.weightsKg?.length);

  return (
    <div className="v6-page mood-subtle">
      <svg width="0" height="0" className="absolute" aria-hidden="true">
        <defs>
          <linearGradient id="bronzeA" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#3f2a16" /><stop offset=".18" stopColor="#7d5a2e" /><stop offset=".36" stopColor="#d8ae68" />
            <stop offset=".5" stopColor="#ad8344" /><stop offset=".76" stopColor="#6e4c26" /><stop offset="1" stopColor="#352312" />
          </linearGradient>
        </defs>
      </svg>
      <StoryHero
        crumbs={crumbs(lang, dictionary, copy.hero.title, [
          {label: 'Clopote', href: localizedHref(lang, servicePath(null, 'clopote'))},
          {label: 'Cu jug', href: localizedHref(lang, servicePath('clopote', 'cu-jug'))},
        ])}
        crumbLabel={dictionary.services.breadcrumb}
        title={copy.hero.title} titleSize="long2" sublineEm={0.4} metal="bronze" subline={copy.hero.subline} lead={copy.hero.lead}
        factsLabel={dictionary.services.facts} facts={heroFacts(service)} photo={service.coverImage} insets={insets}
      />

      <Section ground="band">
        <div className={wrap}>
          <SectionHead kicker={copy.kit.kicker} title={kitSection?.heading ?? copy.kit.title} />
          <ul className="mt-7 grid grid-cols-2 gap-2.5 lg:mt-14 lg:grid-cols-5 lg:gap-5">
            {kit.map((item) => (
              <li key={item.key} className="rounded-image border border-white/90 bg-white/70 px-2 pb-3 pt-2 text-center shadow-e1 last:max-lg:col-span-full lg:rounded-card lg:px-2.5 lg:pb-4.5 lg:pt-2.5">
                <span className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-white p-2 lg:aspect-square lg:rounded-[14px] lg:p-3.5">
                  <span className="relative block size-full">
                    {item.image?.asset ? <SanityImage image={{...item.image, alt: item.name}} sizes="(max-width: 1024px) 50vw, 230px" />
                      : <span className="grid size-full place-items-center rounded-[8px] bg-teal-tint text-[0.75rem] text-ink-soft">[fotografie]</span>}
                  </span>
                </span>
                <b className="mt-2 block font-display text-[1.375rem] font-semibold leading-[1.1] lg:mt-3.5 lg:text-2xl">{item.name}</b>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      {sets.length && rows.length ? (
        <section id="seturi" className="dark-panel m-dark on-dark mt-2 px-3 pb-4 pt-14 lg:mt-4 lg:px-0 lg:py-22">
          <div className={`${wrap} max-md:px-2`}>
            <p className="kicker mb-3 !text-on-dark-soft md:mb-4">{copy.sets.kicker}</p>
            <h2 className="display text-[2.25rem] lg:section-title">{setsSection?.heading && setsSection.heading !== 'Seturi' ? setsSection.heading : copy.sets.title}</h2>
          </div>
          <div className={`${wrap} max-md:px-0`}>
            <ol className="mt-7 grid gap-2 lg:mt-12 lg:gap-3">
              {sets.map((set, index) => {
                const weights = set.weightsKg!;
                const name = `Set ${index + 1}`;
                return (
                  <li key={set._key} className="flex flex-col gap-2.5 rounded-image bg-white p-3.5 text-ink lg:flex-row lg:items-end lg:justify-between lg:gap-8 lg:rounded-card lg:px-7 lg:py-5">
                    <div className="lg:w-60 lg:flex-none lg:self-center">
                      <b className="block font-display text-[1.625rem] font-semibold leading-[1.1] lg:text-[2rem]">{name}</b>
                      <span className="mt-0.5 block text-caption leading-[1.4] text-ink-soft lg:mt-1 lg:text-meta">
                        {weights.length} {copy.sets.bells} · {weights.map((weight) => String(weight).replace('.', ',')).join(', ')} kg
                      </span>
                    </div>
                    <div className="flex flex-1 items-end justify-center gap-3.5 lg:gap-5">
                      {weights.map((weight, bell) => {
                        const row = nearest(weight);
                        return <SetBell key={bell} weight={weight} diameter={row.diameter} height={row.height} />;
                      })}
                    </div>
                    <a href="#oferta" aria-label={`${copy.sets.offerFor} ${name}`} className="text-link self-start whitespace-nowrap !text-teal-700 lg:self-center">{copy.sets.offer}</a>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      ) : null}

      {nudgeTarget ? (
        <section className="m-white px-3 py-14 lg:px-0 lg:py-22 lg:text-center">
          <div className={`${wrap} max-md:px-0`}>
            <Nudges items={[{href: nudgeTarget.href, image: nudgeTarget.coverImage, question: copy.nudge.question, name: copy.nudge.name, why: copy.nudge.why}]}
              className="[&>a:hover]:!bg-band [&>a]:lg:inline-flex" />
          </div>
        </section>
      ) : null}
    </div>
  );
}
