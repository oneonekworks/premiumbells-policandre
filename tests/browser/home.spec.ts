import {expect, test, type Page} from '@playwright/test';
import {findPriceText} from '../../scripts/lib/price-text';

// Home page (design v6 Clarity). Runs against the home page the server reads:
// the published one, or the draft when the server runs with
// SANITY_PREVIEW_DRAFTS=1 (local review before publishing). Skips while the
// redesigned page has no triptych (old data or the placeholder). Checks
// shape rather than wording, so editors can change the copy in Studio.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const order = ['inceput', 'servicii', 'lucrari', 'despre-noi', 'ascultati', 'jurnal'];

async function openHome(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  test.skip(await page.locator('#inceput a[href^="/servicii/"]').count() < 3, 'The redesigned home page is not published');
  return errors;
}

test('every home section renders in order, without prices or horizontal scroll', async ({page}) => {
  const errors = await openHome(page);
  const main = page.locator('main');

  // The headline's three words link to the three services; no other link or
  // button in the hero than the slices and the pause control (rules.md).
  await expect(main.locator('h1').getByRole('link')).toHaveCount(3);
  const hero = page.locator('#inceput');
  const heroLinks = await hero.locator('a').evaluateAll((links) => links.map((link) => link.getAttribute('href')));
  expect(heroLinks).toHaveLength(6);
  expect(heroLinks.every((href) => href?.startsWith('/servicii/'))).toBe(true);
  await expect(hero.locator('dl > div')).toHaveCount(3);

  const ids = await main.locator('section[id]').evaluateAll((sections) => sections.map((section) => section.id));
  expect(ids.filter((id) => order.includes(id))).toEqual(order.filter((id) => ids.includes(id)));
  expect(ids).toEqual(expect.arrayContaining(['inceput', 'servicii', 'lucrari', 'despre-noi', 'jurnal']));

  expect(await page.locator('#servicii a[href^="/servicii/"]').count()).toBeGreaterThan(3);
  // The map story: works per country (→ Works) and photo pins (→ the work).
  expect(await page.locator('#lucrari a[href^="/lucrarile-noastre?tara="]').count()).toBeGreaterThanOrEqual(5);
  expect(await page.locator('#lucrari a[href^="/lucrarile-noastre/"]').count()).toBeGreaterThan(3);

  const journal = page.locator('#jurnal');
  await expect(journal.getByRole('listitem')).toHaveCount(3);
  // Newest first, with type, date and computed reading time.
  const dates = await journal.locator('time').evaluateAll((times) => times.map((time) => time.getAttribute('datetime')!));
  expect(dates).toEqual([...dates].sort().reverse());
  await expect(journal.getByRole('listitem').first()).toContainText(/\d+ min/);
  await expect(journal.getByRole('listitem').first().getByRole('link')).toHaveAttribute('href', /^\/blog\/[\w-]+$/);

  // The footer carries the offer; the catalogue card stays off until price-free PDFs exist.
  await expect(page.locator('footer#oferta')).toContainText('Cereți o ofertă');
  await expect(page.locator('#servicii a[download]')).toHaveCount(0);

  const html = await page.content();
  expect(findPriceText(html).filter(({level}) => level === 'error').map(({match}) => match)).toEqual([]);
  expect(findPriceText(await page.locator('body').innerText()).filter(({rule}) => rule === 'price-word')).toEqual([]);
  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
});

test('the triptych rotates until a visitor chooses a slice, and can be restarted', async ({page, isMobile}) => {
  await openHome(page);
  const toggle = page.locator('#inceput').getByRole('button', {name: 'Opriți derularea automată'});
  await expect(toggle).toBeVisible();

  // Focus on a headline word opens its slice and stops the rotation for good.
  await page.locator('h1').getByRole('link').nth(2).focus();
  const play = page.locator('#inceput').getByRole('button', {name: 'Porniți derularea automată'});
  await expect(play).toBeVisible();
  if (!isMobile) {
    // The open slice takes half the panel once its 480ms transition ends.
    await expect.poll(() => page.locator('#inceput a[href^="/servicii/"]').evaluateAll((links) =>
      links.filter((link) => !link.closest('h1')).map((link) => getComputedStyle(link).flexGrow))).toEqual(['1', '1', '2']);
  }
  await play.click();
  await expect(toggle).toBeVisible();
});

test('reduced motion keeps the triptych still, without the pause control', async ({page, isMobile}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await openHome(page);
  await expect(page.locator('#inceput').getByRole('button')).toHaveCount(0);
  // Equal slices: columns on desktop, bands on phones.
  const sizes = () => page.locator('#inceput a[href^="/servicii/"]').evaluateAll((links, mobile) =>
    links.filter((link) => !link.closest('h1')).map((link) => Math.round(link.getBoundingClientRect()[mobile ? 'height' : 'width'])), isMobile);
  await expect.poll(async () => new Set(await sizes()).size).toBe(1);
});

test('metadata and Organization JSON-LD come from Sanity', async ({page}) => {
  await openHome(page);
  await expect(page).toHaveTitle(/\S/);
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{20}/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /cdn\.sanity\.io/);
  const data = JSON.parse(await page.locator('script[type="application/ld+json"]').innerText());
  expect(data).toMatchObject({'@type': 'Organization', name: 'Premium Bells', taxID: expect.any(String)});
  expect(data.telephone).toMatch(/^\+\d+$/);
});

test('the bell player loads nothing up front and plays from the keyboard', async ({page}) => {
  await openHome(page);
  const strip = page.locator('#ascultati');
  test.skip(await strip.count() === 0, 'Audio is switched off');
  const audio = strip.locator('audio');
  await expect(audio).toHaveAttribute('preload', 'none');
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused && element.readyState === 0)).toBe(true);

  const button = strip.getByRole('button', {name: /^Ascultați /});
  await button.focus();
  await page.keyboard.press('Space');
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => !element.paused), {timeout: 15000}).toBe(true);
  await page.keyboard.press('Space');
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
});

test('the about video stays a poster until played from the keyboard', async ({page}) => {
  await openHome(page);
  const about = page.locator('#despre-noi');
  await expect(about.locator('iframe, video')).toHaveCount(0);
  expect(await page.locator('iframe[src*="youtube"]').count()).toBe(0);

  // Until the video is on YouTube the poster has no play button (decision 2).
  const play = about.getByRole('button', {name: /Redă videoclipul/});
  if (await play.count() === 0) return;
  await play.focus();
  await page.keyboard.press('Enter');
  const frame = about.locator('iframe');
  await expect(frame).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?/);
  await expect(frame).toBeFocused();
});

test('the about anchor from the footer lands on the section', async ({page}) => {
  await openHome(page);
  await page.goto('/#despre-noi');
  await expect(page.locator('#despre-noi')).toBeInViewport();
});

test('English keeps the placeholder until the home page is published in English', async ({page}) => {
  const response = await page.goto('/en');
  expect(response?.status()).toBe(200);
  await expect(page.locator('main h1')).toHaveText('Chandeliers, bells and iconostases for Orthodox churches');
  await expect(page.locator('#despre-noi')).toHaveCount(0);
  expect(await noOverflow(page)).toBe(true);
});
