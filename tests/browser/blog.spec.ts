import {expect, test, type Page} from '@playwright/test';
import {findPriceText} from '../../scripts/lib/price-text';

// Blog and Article, design v6 (V6). Shape, not copy: the listing, filter,
// featured story and byline cards run on the published posts; the body-block
// test needs the hand-made test posts (`npm run home:test-docs -- --write`,
// post 1 holds every block) and skips without them. The English blog has no
// posts, so it must be a 404.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const rich = '/blog/test-articol-1';
const darkPanels = '.dark-panel, .m-dark, .m-dark2, .m-director';

async function open(page: Page, path: string) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto(path);
  test.skip(response?.status() === 404 && path.startsWith('/blog/test-'), 'Test posts are not published (npm run home:test-docs -- --write)');
  expect(response?.status(), path).toBe(200);
  return errors;
}

/** The first post on the listing (the featured one), as an address. */
async function newestPost(page: Page) {
  await page.goto('/blog');
  return (await page.locator('main article h2 a').first().getAttribute('href'))!;
}

async function expectNoPrices(page: Page, path: string) {
  expect((await page.goto(path))?.status(), path).toBe(200);
  expect(findPriceText(await page.content()).filter(({level}) => level === 'error').map(({match}) => match), path).toEqual([]);
  const text = await page.locator('body').innerText();
  expect(findPriceText(text).filter(({rule}) => rule === 'price-word').map(({match}) => match), path).toEqual([]);
}

test('the listing: featured story of the newest post, then byline cards newest first', async ({page}) => {
  const errors = await open(page, '/blog');
  const main = page.locator('main');
  await expect(main.locator('h1')).toHaveCount(1);
  await expect(main.getByRole('navigation', {name: 'Breadcrumb'}).getByRole('link')).toHaveAttribute('href', '/');
  expect(await page.locator('header a[href="/blog"][aria-current="page"]').count()).toBeGreaterThan(0);

  // One link on the featured block: its title, stretched over it.
  const featured = main.locator('article').first();
  await expect(featured.getByRole('link')).toHaveCount(1);
  await expect(featured.locator('h2 a')).toHaveAttribute('href', /^\/blog\/[\w-]+$/);
  await expect(featured.locator('img').first()).toBeVisible();

  const cards = main.locator('a.post-card');
  expect(await cards.count()).toBeGreaterThan(0);
  for (const href of await cards.evaluateAll((links) => links.map((link) => link.getAttribute('href')))) expect(href).toMatch(/^\/blog\/[\w-]+$/);
  const dates = await main.locator('time').evaluateAll((times) => times.map((time) => time.getAttribute('datetime')!));
  expect(dates).toEqual([...dates].sort().reverse());

  await expect(main.locator(darkPanels)).toHaveCount(0);
  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('the kind filter shows the posts of one kind, the newest of them featured', async ({page}) => {
  await open(page, '/blog');
  const group = page.locator('main').getByRole('group', {name: 'Tip'});
  test.skip(!(await group.count()), 'Only one kind of post');
  const buttons = group.locator('button:visible');
  await expect(buttons.first()).toHaveAttribute('aria-pressed', 'true');
  const total = await page.locator('main time').count();

  await buttons.filter({hasText: 'Rapoarte'}).click();
  await expect(buttons.filter({hasText: 'Rapoarte'})).toHaveAttribute('aria-pressed', 'true');
  const kinds = await page.locator('main time').evaluateAll((times) => times.map((time) => time.parentElement!.querySelector('b')?.textContent));
  expect(kinds.length).toBeGreaterThan(0);
  expect(kinds.length).toBeLessThan(total);
  expect(new Set(kinds)).toEqual(new Set(['Raport']));

  await buttons.first().click();
  await expect(page.locator('main time')).toHaveCount(total);
});

test('an article: v6 hero, 680 column, "Citiți și" with byline cards, works open the Project panel', async ({page}) => {
  const path = await newestPost(page);
  const errors = await open(page, path);
  const main = page.locator('main');

  await expect(main.getByRole('navigation', {name: 'Breadcrumb'}).getByRole('link')).toHaveAttribute('href', '/blog');
  await expect(main.locator('h1')).toHaveCount(1);
  await expect(main.locator('article header time')).toHaveCount(1);
  // The text column is at most 680 wide.
  const width = await main.locator('.article-grid > p').first().evaluate((p) => p.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(680);

  const also = main.getByRole('region', {name: 'Citiți și'});
  await expect(also.locator('a.post-card')).toHaveCount(2);
  for (const href of await also.locator('a.post-card').evaluateAll((links) => links.map((link) => link.getAttribute('href')))) {
    expect(href).toMatch(/^\/blog\/[\w-]+$/);
    expect(href).not.toBe(path);
  }
  await expect(main.locator(darkPanels)).toHaveCount(0);
  expect(await noOverflow(page)).toBe(true);

  // A related work opens the Project panel over the article; Esc returns to it.
  const work = main.getByRole('region', {name: 'Din acest articol'}).locator('a[href^="/lucrarile-noastre/"]').first();
  if (await work.count()) {
    await work.click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveURL(/\/lucrarile-noastre\/[^/]+\/[^/]+$/);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page).toHaveURL(new RegExp(`${path}$`));
  }
  expect(errors).toEqual([]);
});

test('article photos open the Lightbox; Escape closes it', async ({page}) => {
  await open(page, await newestPost(page));
  const photo = page.locator('main .article-grid figure button[aria-haspopup="dialog"]').first();
  test.skip(!(await photo.count()), 'The newest post has no photos in its body');
  await photo.click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('an article renders every body block', async ({page}) => {
  const errors = await open(page, rich);
  const article = page.locator('main article').first();

  await expect(article.getByRole('heading', {level: 2, name: 'Un subtitlu de test'})).toBeVisible();
  await expect(article.getByRole('heading', {level: 3, name: 'Un subtitlu de nivel trei'})).toBeVisible();
  await expect(article.locator('blockquote')).toContainText('Tot ce suflă');
  await expect(article.locator('ul > li').filter({hasText: 'punct al listei'})).toHaveCount(2);
  await expect(article.locator('ol > li').filter({hasText: /^(Primul|Al doilea) pas$/})).toHaveCount(2);
  await expect(article.locator('strong')).toHaveText('text îngroșat');
  await expect(article.locator('em')).toHaveText('text cursiv');
  await expect(article.getByRole('link', {name: 'Text de test: Mănăstire de test'})).toHaveAttribute('href', 'https://www.putna.ro');

  // External and internal links (project, service, another post).
  await expect(article.getByRole('link', {name: 'legătură externă'})).toHaveAttribute('target', '_blank');
  await expect(article.getByRole('link', {name: 'lucrare din portofoliu'})).toHaveAttribute('href', /^\/lucrarile-noastre\/[^/]+\/[^/]+$/);
  await expect(article.getByRole('link', {name: 'serviciu', exact: true})).toHaveAttribute('href', /^\/servicii\/[^/]+$/);
  await expect(article.getByRole('link', {name: 'alt articol'})).toHaveAttribute('href', '/blog/test-articol-2');

  const figure = article.locator('figure').filter({hasText: 'Legendă de test pentru fotografie.'});
  await expect(figure.locator('img')).toHaveAttribute('alt', 'Clopote montate în turn, fotografie de test');

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

  await expect(article.locator('audio[controls][preload="none"]')).toHaveCount(1);
  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('article metadata and BlogPosting JSON-LD', async ({page}) => {
  const path = await newestPost(page);
  await open(page, path);
  const title = (await page.locator('main h1').innerText()).trim();
  await expect(page).toHaveTitle(new RegExp(title.slice(0, 20).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'article');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /cdn\.sanity\.io/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${path}$`));
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerText());
  expect(data).toMatchObject({'@type': 'BlogPosting', headline: title, inLanguage: 'ro'});
});

test('the English blog is a 404 while it has no posts, and menus do not link to it', async ({page}) => {
  for (const path of ['/en/blog', '/en/blog/test-articol-1', '/blog/no-such-post']) {
    expect((await page.goto(path))?.status(), path).toBe(404);
  }
  await page.goto('/en');
  await expect(page.locator('header a[href="/en/blog"]')).toHaveCount(0);
  await expect(page.locator('footer a[href="/en/blog"]')).toHaveCount(0);
  await page.goto('/blog');
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
