import {CategoryNav} from '@/components/portfolio/category-nav';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {plural} from '@/lib/i18n/format';
import {localizedHref} from '@/lib/i18n/routing';
import {getCategories} from '@/sanity/portfolio';
import {categoryPath, routeLang} from '@/sanity/portfolio-routes';

// Category sidebar around both the grid and the full project page. The
// `modal` slot renders the intercepted project slide-over above the grid.
export default async function CategoryLayout({children, modal, params}: LayoutProps<'/[lang]/lucrarile-noastre/[category]'>) {
  const lang = routeLang((await params).lang);
  const {portfolio} = getDictionary(lang);
  const categories = await getCategories(lang);
  const items = categories.map((category) => ({
    id: category._id,
    title: category.title ?? '',
    href: localizedHref(lang, categoryPath(category.slug ?? '')),
    count: plural(lang, category.projectCount, portfolio.projects),
    image: category.coverImage,
  }));

  return (
    <>
      <div className="container-site py-8 sm:py-12 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
        <aside className="mb-8 lg:mb-0">
          <div className="lg:sticky lg:top-[calc(var(--spacing-header)+2rem)]">
            <p className="eyebrow mb-3 hidden lg:block">{portfolio.categories}</p>
            <CategoryNav items={items} label={portfolio.categories} />
          </div>
        </aside>
        <div className="min-w-0">{children}</div>
      </div>
      {modal}
    </>
  );
}
