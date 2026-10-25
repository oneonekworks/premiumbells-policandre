import type {Metadata} from 'next';
import Link from 'next/link';
import {SanityImage} from '@/components/sanity-image';
import {photoAlt} from '@/lib/alt';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import {localizedHref} from '@/lib/i18n/routing';
import {languageAlternates} from '@/lib/seo';
import {getCategories, getPortfolioPage} from '@/sanity/portfolio';
import {categoryPath, routeLang, worksPath} from '@/sanity/portfolio-routes';

export async function generateMetadata({params}: PageProps<'/[lang]/lucrarile-noastre'>): Promise<Metadata> {
  const lang = routeLang((await params).lang);
  const page = await getPortfolioPage(lang);
  return {
    title: page?.title ?? getDictionary(lang).nav.works,
    description: page?.intro ?? undefined,
    alternates: languageAlternates(lang, {ro: worksPath, en: worksPath}),
  };
}

export default async function WorksPage({params}: PageProps<'/[lang]/lucrarile-noastre'>) {
  const lang = routeLang((await params).lang);
  const dictionary = getDictionary(lang);
  const [page, categories] = await Promise.all([getPortfolioPage(lang), getCategories(lang)]);

  return (
    <div className="container-site py-14 sm:py-20">
      <p className="eyebrow">{dictionary.nav.works}</p>
      <h1 className="mt-4 max-w-3xl font-display text-5xl font-semibold leading-tight text-teal-900 sm:text-6xl">
        {page?.title ?? dictionary.nav.works}
      </h1>
      {page?.intro && <p className="mt-6 max-w-2xl whitespace-pre-line text-lg leading-relaxed text-ink-soft">{page.intro}</p>}

      {categories.length === 0 ? (
        <p className="mt-12 rounded-lg border border-line p-6">{dictionary.portfolio.emptyPortfolio}</p>
      ) : (
        <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <li key={category._id} className="group relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg bg-stone">
                <SanityImage
                  image={category.coverImage && {...category.coverImage, alt: photoAlt(category.coverImage, category.title ?? '')}}
                  ratio={4 / 3}
                  priority={index < 3}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold text-teal-900">
                <Link href={localizedHref(lang, categoryPath(category.slug ?? ''))} className="after:absolute after:inset-0 group-hover:text-teal-700">
                  {category.title}
                </Link>
              </h2>
              <p className="mt-1 text-sm text-ink-soft">{plural(lang, category.projectCount, dictionary.portfolio.projects)}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
