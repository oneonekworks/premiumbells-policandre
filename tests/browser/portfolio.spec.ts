import {expect, test, type Page} from '@playwright/test';

// Lucrările noastre and the Project panel (v6.2, V5). Reads the live published
// dataset (no writes): needs more than 23 public works, Clopote works with
// galleries, and the Clopote cu jug service page with its works section.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const panel = (page: Page) => page.locator('dialog.project-panel[open]');
const tiles = (page: Page) => page.locator('main a.ww-tile[aria-haspopup="dialog"]');

test('a tile opens the Project panel over the wall; Anterior / Următor browse the list; Escape and Forward', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/lucrarile-noastre');
  await expect(page.locator('main h1')).toHaveText('Lucrările noastre');
  expect(await tiles(page).count()).toBeGreaterThan(3);
  await expect(page.getByRole('button', {name: /^Deschideți harta/}).filter({visible: true})).toHaveCount(1);
  expect(await noOverflow(page)).toBe(true);

  const tile = tiles(page).first();
  const title = (await tile.locator('b').textContent())!.trim();
  await tile.click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page).getByRole('heading', {level: 2})).toHaveText(title);
  await expect(page).toHaveURL(/\/lucrarile-noastre\/[a-z0-9-]+\/[a-z0-9-]+$/);
  await expect(panel(page)).toContainText(/Lucrarea 1 din \d+ · Policandre/);
  await expect(page.locator('main h1')).toHaveText('Lucrările noastre');
  const first = page.url();

  await panel(page).getByRole('link', {name: /^Lucrarea următoare/}).click();
  await expect(panel(page)).toContainText(/Lucrarea 2 din \d+ · Policandre/);
  await expect(page).not.toHaveURL(first);

  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/lucrarile-noastre\/policandre$/);
  await page.goForward();
  await expect(panel(page)).toBeVisible();
  expect(errors).toEqual([]);
});

test('the panel opens the Lightbox with ?foto; Escape closes only the Lightbox', async ({page}) => {
  await page.goto('/lucrarile-noastre/clopote');
  await tiles(page).first().click();
  await expect(panel(page)).toBeVisible();
  const title = (await panel(page).getByRole('heading', {level: 2}).textContent())!.trim();
  await panel(page).getByRole('button', {name: /^Mărește fotografia/}).filter({visible: true}).first().click();
  const lightbox = page.getByRole('dialog', {name: `Fotografii, ${title}`});
  await expect(lightbox).toBeVisible();
  await expect(page).toHaveURL(/[?&]foto=1/);
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
  await expect(page).not.toHaveURL(/foto=/);
  await expect(panel(page)).toBeVisible();
});

test('a direct project URL renders the Works page with the panel open on the server; × shows the wall', async ({page, request}) => {
  await page.goto('/lucrarile-noastre/clopote');
  const href = (await tiles(page).first().getAttribute('href'))!;
  const title = (await tiles(page).first().locator('b').textContent())!.trim();

  const html = await (await request.get(href)).text();
  expect(html).toMatch(/<dialog[^>]*open/);
  expect(html).toContain(title.replaceAll('&', '&amp;'));
  expect(html).toContain('Lucrările noastre');

  await page.goto(href);
  await expect(panel(page)).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${href}$`));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /cdn\.sanity\.io/);
  await panel(page).getByRole('button', {name: 'Închide'}).click();
  await expect(panel(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote$/);
  await expect(page.getByRole('button', {name: 'Clopote', exact: true}).filter({visible: true}).first()).toHaveAttribute('aria-pressed', 'true');
  expect(await noOverflow(page)).toBe(true);
});

test('service-page cards open the panel over the page and browse that service only', async ({page}) => {
  await page.goto('/servicii/clopote');
  const card = page.locator('main a.bo[aria-haspopup="dialog"]').first();
  await card.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => scrollY);
  await card.click();
  await expect(panel(page)).toBeVisible();
  await expect(panel(page)).toContainText(/Lucrarea 1 din \d+/);
  if ((page.viewportSize()?.width ?? 0) >= 1024) await expect(panel(page)).toContainText('· Clopote cu jug');
  // The category under the page is plain text, not a link back to the wall.
  await expect(panel(page).getByRole('link', {name: 'Clopote', exact: true})).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(panel(page)).toHaveCount(0);
  await expect(page).toHaveURL(/\/servicii\/clopote$/);
  expect(Math.abs(await page.evaluate(() => scrollY) - scroll)).toBeLessThan(80);
});

test('unknown projects and categories, and unpublished English, are 404s', async ({page}) => {
  for (const path of ['/lucrarile-noastre/clopote/lucrare-inexistenta-8de49', '/lucrarile-noastre/categorie-inexistenta']) {
    expect((await page.goto(path))?.status()).toBe(404);
  }
  expect((await page.goto('/en/our-work/clopote'))?.status()).toBe(404);
});
