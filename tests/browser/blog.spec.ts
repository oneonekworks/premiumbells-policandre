import {expect, test, type Page} from '@playwright/test';
import {findPriceText} from '../../scripts/lib/price-text';

// Blog listing and articles (Phase 7 step 6). The listing and price crawl run
// on the published posts; the article-block tests need the hand-made test
// posts (`npm run home:test-docs -- --write`, post 1 holds every block) and
// skip without them.
// The English blog has no posts, so it must be a 404.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const rich = '/blog/test-articol-1';

async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(path);
  test.skip(response?.status() === 404 && path.startsWith('/blog'), 'Test posts are not published (npm run home:test-docs -- --write)');
  expect(response?.status(), path).toBe(200);
  return errors;
}

async function expectNoPrices(page: Page, path: string) {
  expect((await page.goto(path))?.status(), path).toBe(200);
  expect(findPriceText(await page.content()).filter(({level}) => level === 'error').map(({match}) => match), path).toEqual([]);
  const text = await page.locator('body').innerText();
  expect(findPriceText(text).filter(({rule}) => rule === 'price-word').map(({match}) => match), path).toEqual([]);
}

test('the listing shows the posts newest first, the first one featured', async ({page}) => {
  const errors = await open(page, '/blog');
  const main = page.locator('main');
  await expect(main.locator('h1')).toHaveText('Articole, rapoarte și video');
  expect(await main.locator('article h2').count()).toBeGreaterThan(0);
  const dates = await main.locator('article time').evaluateAll((times) => times.map((time) => time.getAttribute('datetime')!));
  expect(dates).toEqual([...dates].sort().reverse());
  await expect(main.locator('article').first()).toContainText('Citește articolul');
  await expect(main.locator('article').first().getByRole('link').first()).toHaveAttribute('href', /^\/blog\/[\w-]+$/);
  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('an article renders every body block', async ({page}) => {
  const errors = await open(page, rich);
  const main = page.locator('main');
  const article = main.locator('article').first();

  await expect(main.getByRole('navigation', {name: 'Breadcrumb'}).getByRole('link', {name: 'Blog'})).toHaveAttribute('href', '/blog');
  await expect(main.locator('h1')).toHaveText(/Articol de test numărul 1/);
  await expect(article.locator('header')).toContainText('Articol');
  await expect(article.locator('header')).toContainText('17 februarie 2023');
  await expect(article.locator('header')).toContainText('min de citit');
  await expect(article.locator('header')).toContainText('Autor de test');
  await expect(article.getByRole('link', {name: 'Text de test: Mănăstire de test'})).toHaveAttribute('href', 'https://www.putna.ro');

  await expect(article.getByRole('heading', {level: 2, name: 'Un subtitlu de test'})).toBeVisible();
  await expect(article.getByRole('heading', {level: 3, name: 'Un subtitlu de nivel trei'})).toBeVisible();
  await expect(article.locator('blockquote')).toContainText('Tot ce suflă');
  await expect(article.locator('ul > li').filter({hasText: 'punct al listei'})).toHaveCount(2);
  await expect(article.locator('ol > li').filter({hasText: /^(Primul|Al doilea) pas$/})).toHaveCount(2);
  await expect(article.locator('strong')).toHaveText('text îngroșat');
  await expect(article.locator('em')).toHaveText('text cursiv');

  // External and internal links (project, service, another post).
  await expect(article.getByRole('link', {name: 'legătură externă'})).toHaveAttribute('target', '_blank');
  await expect(article.getByRole('link', {name: 'lucrare din portofoliu'})).toHaveAttribute('href', /^\/lucrarile-noastre\/[^/]+\/[^/]+$/);
  await expect(article.getByRole('link', {name: 'serviciu', exact: true})).toHaveAttribute('href', /^\/servicii\/[^/]+$/);
  await expect(article.getByRole('link', {name: 'alt articol'})).toHaveAttribute('href', '/blog/test-articol-2');

  // Figure with caption and description.
  const figure = article.locator('figure').filter({hasText: 'Legendă de test pentru fotografie.'});
  await expect(figure.locator('img')).toHaveAttribute('alt', 'Clopote montate în turn, fotografie de test');

  // Gallery opens the lightbox; Escape closes it.
  const gallery = article.getByRole('region', {name: 'Galerie foto'});
  await expect(gallery.getByRole('button')).toHaveCount(6);
  await gallery.getByRole('button').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  // Video facade: nothing from YouTube until play.
  await expect(page.locator('iframe')).toHaveCount(0);
  await article.getByRole('button', {name: /Redă videoclipul/}).click();
  await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(1);

  // Audio.
  await expect(article.locator('audio[controls][preload="none"]')).toHaveCount(1);

  // Related items and other posts.
  const works = main.getByRole('region', {name: 'Lucrări legate'});
  await expect(works.getByRole('listitem')).toHaveCount(2);
  await expect(main.getByRole('region', {name: 'Servicii legate'}).getByRole('listitem')).toHaveCount(1);
  const others = main.getByRole('region', {name: 'Alte articole'});
  await expect(others.locator('article h3')).toHaveText([/numărul 3/, /numărul 2/]);

  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('article metadata and BlogPosting JSON-LD', async ({page}) => {
  await open(page, rich);
  await expect(page).toHaveTitle(/Articol de test numărul 1/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /Rezumat de test/);
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /cdn\.sanity\.io/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/blog\/test-articol-1$/);
  await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerText());
  expect(data).toMatchObject({'@type': 'BlogPosting', headline: expect.stringContaining('numărul 1'), datePublished: '2023-02-17',
    author: {'@type': 'Person', name: 'Autor de test'}, inLanguage: 'ro'});
});

test('"Din blog" lists the posts that link to a project', async ({page}) => {
  await open(page, rich);
  const href = await page.locator('main').getByRole('region', {name: 'Lucrări legate'}).getByRole('link').first().getAttribute('href');
  await page.goto(href!);
  const fromBlog = page.locator('main').getByRole('region', {name: 'Din blog'});
  await expect(fromBlog.locator('article h3')).toHaveText([/numărul 2/, /numărul 1/]);
  expect(await noOverflow(page)).toBe(true);
});

test('the English blog is a 404 while it has no posts, and menus do not link to it', async ({page}) => {
  for (const path of ['/en/blog', '/en/blog/test-articol-1', '/blog/no-such-post']) {
    expect((await page.goto(path))?.status(), path).toBe(404);
  }
  await page.goto('/en');
  await expect(page.locator('header a[href="/en/blog"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="/en/blog"]')).toHaveCount(0);
  await page.goto('/blog');
  test.skip((await page.title()).includes('404'), 'No Romanian posts');
  await expect(page.locator('header [hreflang="en"]').first()).toHaveAttribute('href', '/en');
});

test('legacy blog addresses redirect permanently', async ({request}) => {
  for (const [from, to] of [['/blog2', '/blog'], ['/blog/raport-18-ianuarie-23', '/blog/raport-18-ianuarie-2023']]) {
    const response = await request.get(from, {maxRedirects: 0});
    expect(response.status(), from).toBe(308);
    expect(new URL(response.headers().location, 'http://x').pathname, from).toBe(to);
  }
});

test('no prices in the HTML or visible text of the blog pages', async ({page}) => {
  await open(page, '/blog');
  const links = await page.locator('main a[href^="/blog/"]').evaluateAll((anchors) =>
    [...new Set(anchors.map((anchor) => anchor.getAttribute('href')!))]);
  for (const path of ['/blog', ...links]) await expectNoPrices(page, path);
});
