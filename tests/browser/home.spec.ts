import {expect, test, type Page} from '@playwright/test';
import {findPriceText} from '../../scripts/lib/price-text';

// Home page (Phase 7). Runs against the published `homePage` and skips while
// only the placeholder renders. Checks shape rather than wording, so editors
// can change the copy in Studio. Set HOME_HIDDEN=<section> after switching a
// section off to check that it disappears.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const hidden = process.env.HOME_HIDDEN;

async function openHome(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const response = await page.goto('/');
  expect(response?.status()).toBe(200);
  test.skip(await page.locator('#despre-noi').count() === 0 && hidden !== 'about', 'The home page is not published');
  return errors;
}

test('every home section renders in order, without prices or horizontal scroll', async ({page}) => {
  const errors = await openHome(page);
  const main = page.locator('main');

  await expect(main.getByRole('link', {name: 'Vezi lucrările'})).toHaveAttribute('href', '/lucrarile-noastre');
  await expect(main.getByRole('link', {name: 'Cereți o ofertă'})).toHaveAttribute('href', /^tel:\+\d+$/);

  const expected = [
    ['services', 'Serviciile noastre'],
    ['testimonial', 'Mărturie'],
    ['audio', 'Dăngăt pascal'],
    ['blog', 'De pe blog'],
    ['about', 'Despre noi'],
  ].filter(([name]) => name !== hidden).map(([, heading]) => heading);
  expect(await main.locator('section h2').allInnerTexts()).toEqual(expected);

  if (hidden !== 'services') {
    const services = main.getByRole('region', {name: 'Serviciile noastre'});
    expect(await services.getByRole('listitem').count()).toBeGreaterThan(0);
    await expect(services.getByRole('link', {name: 'Toate serviciile'})).toHaveAttribute('href', '/servicii');
  }
  if (hidden !== 'blog') {
    const blog = main.getByRole('region', {name: 'De pe blog'});
    await expect(blog.getByRole('listitem')).toHaveCount(3);
    // Newest first, with date and computed reading time.
    const dates = await blog.locator('time').evaluateAll((times) => times.map((time) => time.getAttribute('datetime')!));
    expect(dates).toEqual([...dates].sort().reverse());
    await expect(blog.getByRole('listitem').first()).toContainText('min de citit');
    await expect(blog.getByRole('listitem').first().getByRole('link').first()).toHaveAttribute('href', /^\/blog\/[\w-]+$/);
  }
  if (hidden !== 'testimonial') {
    await expect(main.locator('figure blockquote')).not.toBeEmpty();
  }
  if (hidden !== 'about') {
    await expect(page.locator('#despre-noi')).toBeVisible();
  }

  // The catalogue section is off until price-free PDFs exist (decision 3).
  await expect(main.getByText('Descarcă cataloagele noastre')).toHaveCount(0);

  const html = await page.content();
  expect(findPriceText(html).filter(({level}) => level === 'error').map(({match}) => match)).toEqual([]);
  expect(findPriceText(await page.locator('body').innerText()).filter(({rule}) => rule === 'price-word')).toEqual([]);
  expect(await noOverflow(page)).toBe(true);
  expect(errors).toEqual([]);
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

test('the audio player loads nothing up front and plays from the keyboard', async ({page}) => {
  test.skip(hidden === 'audio', 'Audio is switched off');
  await openHome(page);
  const audio = page.locator('main audio');
  await expect(audio).toHaveAttribute('preload', 'none');
  await expect(audio).toHaveAttribute('controls', '');
  expect(await audio.evaluate((element: HTMLAudioElement) => element.paused && element.readyState === 0)).toBe(true);

  await audio.focus();
  await page.keyboard.press('Space');
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => !element.paused), {timeout: 15000}).toBe(true);
  await page.keyboard.press('Space');
  await expect.poll(() => audio.evaluate((element: HTMLAudioElement) => element.paused)).toBe(true);
});

test('the about video stays a poster until played from the keyboard', async ({page}) => {
  test.skip(hidden === 'about', 'About is switched off');
  await openHome(page);
  const about = page.locator('#despre-noi');
  await expect(about.locator('iframe, video')).toHaveCount(0);
  expect(await page.locator('iframe[src*="youtube"]').count()).toBe(0);

  // Until the video is on YouTube the poster has no play button (decision 2).
  const play = about.getByRole('button', {name: /Redă videoclipul/});
  if (await play.count() === 0) {
    await expect(about.locator('img')).toHaveCount(1);
    return;
  }
  // The play button follows the section's button in the tab order.
  await about.getByRole('link', {name: 'Vizitați lucrările noastre'}).focus();
  await page.keyboard.press('Tab');
  await expect(play).toBeFocused();
  await page.keyboard.press('Enter');

  const frame = about.locator('iframe');
  await expect(frame).toHaveAttribute('src', /^https:\/\/www\.youtube-nocookie\.com\/embed\/[\w-]{11}\?/);
  await expect(frame).toBeFocused();
  await expect(play).toHaveCount(0);
});

test('the about anchor from the footer lands on the section', async ({page}) => {
  test.skip(hidden === 'about', 'About is switched off');
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
