import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {SanityImage} from '@/components/sanity-image';
import {StoryHero} from '@/components/services/story-hero';
import {QuietOffer} from '@/components/site/quiet-offer';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {isLang} from '@/lib/i18n/routing';
import {getCategories, getCategoryProjects} from '@/sanity/portfolio';
import {LightboxDemo} from './lightbox-demo';

// Design preview of the v6 shared pieces, checked in isolation before they are
// wired into pages (docs/design-plan.md, V1). Only built with DESIGN_PREVIEW=1;
// everywhere else, the hosted preview included, the path is a 404.
export const metadata: Metadata = {title: 'v6 preview', robots: {index: false, follow: false}};

const metals = [
  {word: 'Policandre', mw: 'mw-gold', bar: 'bar-gold', line: '1–7 nivele, clasa premium'},
  {word: 'Clopote', mw: 'mw-bronze', bar: 'bar-bronze', line: 'Cu balans, până la 16 tone'},
  {word: 'Iconostase', mw: 'mw-gilt', bar: 'bar-gilt', line: 'Marmură, lemn cu aur'},
];

function Block({title, ground = 'm-white', children}: {title: string; ground?: string; children: React.ReactNode}) {
  return (
    <section className={`${ground} py-16 md:py-24`}>
      <div className="mx-auto max-w-(--container-page) px-5 md:px-6">
        <p className="kicker">V1 · preview</p>
        <h2 className="mt-3 section-title">{title}</h2>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

export default async function V6Preview({params}: PageProps<'/[lang]/v6'>) {
  const {lang} = await params;
  if (process.env.DESIGN_PREVIEW !== '1' || !isLang(lang)) notFound();
  const categories = (await getCategories(lang)).filter((category) => category.coverImage);
  const photo = categories[0]?.coverImage;
  const dictionary = getDictionary(lang);
  const cover = (index: number) => categories[index % Math.max(categories.length, 1)]?.coverImage ?? null;
  // Two photo sets for the tabbed Lightbox: the first category's project covers, then the category covers.
  const projects = categories[0] ? await getCategoryProjects(lang, categories[0]._id) : [];
  const sets = [
    {tab: 'Marmură', title: 'Marmură grecească', line: 'Cu porți din alamă, cupru sau aurite.',
      images: projects.flatMap((project) => (project.coverImage?.asset ? [{...project.coverImage, _key: project._id}] : []))},
    {tab: 'Lemn cu aur', title: 'Lemn sculptat cu aur', line: 'Sculptat unic, cu foiță de aur.',
      images: categories.flatMap((category) => (category.coverImage?.asset ? [{...category.coverImage, _key: category._id}] : []))},
  ].filter((set) => set.images.length);

  return (
    <div className="mood-subtle">
      <section className="m-hero pt-32 pb-16 md:pt-36">
        <div className="mx-auto max-w-(--container-page) px-5 text-center md:px-6">
          <p className="kicker">Confecționate de către ortodocși pentru ortodocși</p>
          <h1 className="display mt-5 text-hero">
            <a href="#" className="mw mw-gold">Policandre</a>, <a href="#" className="mw mw-bronze">clopote</a> și{' '}
            <a href="#" className="mw mw-gold">recondiționări</a>
            <span className="mt-3.5 block text-[.64em] italic leading-[1.1] text-teal-700">produse în lumea ortodoxă, clasa Premium</span>
          </h1>
        </div>
      </section>

      <StoryHero
        crumbLabel="Breadcrumb"
        crumbs={[{label: 'Acasă', href: '/'}, {label: 'Servicii', href: '/#servicii'}, {label: 'Clopote', href: '/servicii/clopote'}, {label: 'Clopotar electronic'}]}
        title="Clopotar electronic" metal="bronze" subline="pentru clopote fixe"
        lead="Clopotele fixe sună automat din limbă, cu melodii de la Athos, la ora dorită sau din telecomandă."
        factsLabel="Pe scurt"
        facts={[
          {figure: '1000', line: 'melodii de înregistrat, și cele de la Athos'},
          {figure: '10 ani', line: 'memoria se păstrează la o pană de curent'},
          {figure: '50 m', line: 'raza telecomenzii de buzunar, opțională'},
        ]}
        photo={cover(1)}
        insets={[{image: cover(2), title: 'Motor pe limbă', line: 'clopotul sună natural'}, {image: cover(3), title: 'Montaj în clopotniță', line: 'motoare și panou electric'}]}
        control={sets.length ? <LightboxDemo sets={sets} labels={dictionary.portfolio.lightbox} label="Priviți de aproape" /> : null}
      />

      <Block title="Oferta discretă">
        <div className="max-w-xl">
          <QuietOffer question="Vă place acest model?" call={{href: 'tel:+40722790776', label: 'Sunați'}} offer={{href: '#oferta', label: 'Cereți o ofertă'}} />
        </div>
        <div className="mt-8 max-w-xl rounded-card bg-teal-950 p-6">
          <QuietOffer onDark question="Doriți un policandru asemănător?" offer={{href: '#oferta', label: 'Cereți o ofertă'}} />
        </div>
      </Block>

      <Block title="Butoane și legături" ground="m-band">
        <div className="flex flex-wrap items-center gap-4">
          <a href="#" className="btn btn-primary">Cereți o ofertă</a>
          <a href="#" className="btn btn-secondary">Vedeți lucrările</a>
          <a href="#" className="btn btn-primary btn-sm">+40 722 790 776</a>
          <a href="#" className="btn btn-primary btn-lg">Cereți o ofertă</a>
          <a href="#" className="btn btn-quiet">Cereți o ofertă</a>
          <button type="button" className="btn btn-primary" disabled>Indisponibil</button>
          <a href="#" className="text-link">Toate lucrările cu clopote cu jug</a>
        </div>
        <div className="mt-8 flex flex-wrap gap-2">
          <button type="button" className="chip" aria-pressed="true">Toate</button>
          <button type="button" className="chip">Policandre</button>
          <button type="button" className="chip">Clopote</button>
          <button type="button" className="chip">Iconostase și uși</button>
        </div>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          {metals.map((metal) => (
            <span key={metal.word} className="flex items-center gap-2 text-ui font-semibold text-ink-soft">
              <i className={`family-bar ${metal.bar}`} aria-hidden="true" />{metal.word}
            </span>
          ))}
        </div>
      </Block>

      <Block title="Cardul ieșit din tavă">
        <div className="on-white grid grid-cols-2 gap-x-2 gap-y-7 md:gap-x-10 lg:grid-cols-3">
          {metals.map((metal, index) => (
            <a key={metal.word} href="#" className={`bo ${index === 0 ? 'col-span-2 lg:col-span-1' : ''}`}>
              <span className="ph">
                <SanityImage image={categories[index]?.coverImage} ratio={4 / 3} sizes="(max-width: 768px) 50vw, 400px" />
              </span>
              <span className="tx">
                <i className={`bar ${metal.bar}`} aria-hidden="true" />
                <b>{metal.word}</b>
                <small>{metal.line}</small>
              </span>
            </a>
          ))}
        </div>
      </Block>

      <Block title="Sticlă și panouri" ground="m-band">
        <div className="relative h-80 overflow-hidden rounded-panel">
          <SanityImage image={photo} cover sizes="(max-width: 768px) 100vw, 1200px" priority />
          <div className="glass-light absolute left-4 top-4 rounded-pill px-5 py-3 text-ui font-medium shadow-e2">glass-light</div>
          <div className="glass-docked absolute right-4 top-4 rounded-pill px-5 py-3 text-ui font-medium">glass-docked</div>
          <div className="overlay-backdrop absolute inset-x-4 bottom-4 flex h-32 items-center justify-center gap-3 rounded-card">
            <span className="glass-on-dark rounded-pill px-4 py-2.5 text-caption font-medium">glass-on-dark</span>
          </div>
        </div>
      </Block>

      <section className="dark-panel m-dark on-dark py-16 md:py-24">
        <div className="mx-auto max-w-(--container-page) px-5 md:px-6">
          <p className="kicker text-on-dark-soft">Panou închis</p>
          <h2 className="mt-3 section-title">Despre noi</h2>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a href="#" className="btn btn-light">Sunați</a>
            <a href="#" className="btn btn-outline-light">Cereți o ofertă</a>
            <a href="#" className="text-link">Citiți povestea</a>
          </div>
        </div>
      </section>
      <div className="h-16" />
    </div>
  );
}
