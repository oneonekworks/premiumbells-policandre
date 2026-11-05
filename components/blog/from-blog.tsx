import type {Dictionary} from '@/lib/i18n/dictionaries';
import type {Lang} from '@/lib/i18n/routing';
import {getPostsReferencing} from '@/sanity/blog';
import {PostGrid} from './post-card';

// "Din blog" on project and service pages: the posts that link to this
// document, so the links are kept in one place (the post).
export async function FromBlog({id, lang, dictionary, columns = 3}: {
  id: string;
  lang: Lang;
  dictionary: Dictionary;
  columns?: 2 | 3;
}) {
  const posts = (await getPostsReferencing(lang, id)).filter((post) => post.slug);
  if (!posts.length) return null;
  return (
    <section aria-labelledby={`din-blog-${id}`} className="border-t border-line pt-12">
      <h2 id={`din-blog-${id}`} className="mb-8 font-display text-3xl font-semibold text-teal-900">{dictionary.blog.fromBlog}</h2>
      <PostGrid posts={posts} lang={lang} dictionary={dictionary} columns={columns} />
    </section>
  );
}
