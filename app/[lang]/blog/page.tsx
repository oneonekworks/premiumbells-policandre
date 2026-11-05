import type {Metadata} from 'next';
import {notFound} from 'next/navigation';
import {PostCard} from '@/components/blog/post-card';
import {getDictionary} from '@/lib/i18n/dictionaries';
import {languages} from '@/lib/i18n/routing';
import {languageAlternates} from '@/lib/seo';
import {getBlogPosts} from '@/sanity/blog';
import {routeLang} from '@/sanity/portfolio-routes';

// Every post in the page language, newest first. A language with no posts
// has no blog (404), so no empty listing is ever published.

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
  const [latest, ...rest] = posts;

  return (
    <div className="container-site py-12 sm:py-20">
      <header className="max-w-3xl">
        <p className="eyebrow">{dictionary.nav.blog}</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-teal-900 sm:text-6xl">{dictionary.blog.heading}</h1>
        <p className="mt-5 text-lg leading-relaxed text-ink-soft">{dictionary.blog.intro}</p>
      </header>

      <section aria-label={dictionary.blog.latest} className="mt-12 border-t border-line pt-12 sm:mt-16 sm:pt-16">
        <PostCard post={latest} lang={lang} dictionary={dictionary} size="feature" heading="h2" priority />
      </section>

      {rest.length > 0 && (
        // Three columns only when they fill a row; two posts share it evenly.
        <ul className={`mt-16 grid gap-x-6 gap-y-14 border-t border-line pt-16 sm:grid-cols-2 ${rest.length > 2 ? 'lg:grid-cols-3' : 'lg:gap-x-10'}`}>
          {rest.map((post) => (
            <li key={post._id}><PostCard post={post} lang={lang} dictionary={dictionary} heading="h2" /></li>
          ))}
        </ul>
      )}
    </div>
  );
}
