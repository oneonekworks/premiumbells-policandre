import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {BlogIndex, type BlogEntry} from '@/components/blog/blog-index';
import {BylineCard} from '@/components/blog/byline-card';
import {FeaturedPost} from '@/components/blog/featured-post';
import {Breadcrumb} from '@/components/services/story-hero';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {languages, localizedHref} from '@/lib/i18n/routing';
import {languageAlternates} from '@/lib/seo';
import {getBlogPosts} from '@/sanity/blog';
import {routeLang} from '@/sanity/portfolio-routes';

// Blog v6.2 (boards V6Blog, V6BlogMobile; pages.md "Blog index"): white hero
// (breadcrumb, H1 + kind filter, featured story preview of the newest post),
// then every other post as a byline card on the band, then the footer, the
// only dark panel. Every post in the page language, newest first; a language
// with no posts has no blog (404), so no empty listing is ever published.

async function load(params: PageProps<'/[lang]/blog'>['params']) {
  const lang = routeLang((await params).lang);
  const posts = (await getBlogPosts(lang)).filter((post) => post.slug);
  if (!posts.length) notFound();
  return {lang, posts, dictionary: getDictionary(lang)};
}

export async function generateMetadata({params}: PageProps<'/[lang]/blog'>): Promise<Metadata> {
  const {lang, dictionary} = await load(params);
  const withPosts = await Promise.all(languages.map(async (code) => [code, (await getBlogPosts(code)).length > 0] as const));
  return {
    title: dictionary.nav.blog,
    description: dictionary.blog.intro,
    alternates: languageAlternates(lang, Object.fromEntries(withPosts.map(([code, has]) => [code, has ? '/blog' : null]))),
  };
}

export default async function BlogPage({params}: PageProps<'/[lang]/blog'>) {
  const {lang, posts, dictionary} = await load(params);
  const t = dictionary.blog;
  const kinds = [...new Set(posts.flatMap((post) => (post.kind ? [post.kind] : [])))]
    .map((id) => ({id: id as string, label: t.kinds[id] ?? id}));
  // The featured story is rendered for the posts that can lead a list: the newest overall and per kind.
  const leads = new Set([posts[0]._id, ...kinds.map(({id}) => posts.find((post) => post.kind === id)!._id)]);
  const entries: BlogEntry[] = posts.map((post) => ({
    id: post._id,
    kind: post.kind,
    card: <BylineCard post={post} lang={lang} dictionary={dictionary} heading="h2" ground="band" className="w-full"
      sizes="(min-width: 1440px) 420px, (min-width: 1024px) 31vw, (min-width: 768px) 50vw, 100vw" />,
    featured: leads.has(post._id) ? <FeaturedPost post={post} lang={lang} dictionary={dictionary} /> : undefined,
  }));

  return (
    <div className="v6-page mood-subtle">
      <BlogIndex
        crumb={<Breadcrumb label={dictionary.services.breadcrumb}
          items={[{label: dictionary.services.home, href: localizedHref(lang, '/')}, {label: t.title}]} />}
        title={t.title} entries={entries} kinds={kinds}
        labels={{filter: t.filter, all: t.all, more: t.more}} />
    </div>
  );
}
