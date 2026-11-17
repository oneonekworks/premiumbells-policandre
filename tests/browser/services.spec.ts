import {expect, test, type Page} from '@playwright/test';
import {findPriceText} from '../../scripts/lib/price-text';

// Service pages v6 (V4): one story hero per page, the Policandre catalogue,
// the bell pages, the Iconostase material layer, redirects and the price
// guard. Shape, not copy: the published services are the fixtures.

const pages = [
  '/servicii/policandre', '/servicii/policandre-la-comanda', '/servicii/reconditionare-policandre',
  '/servicii/clopote', '/servicii/clopote/fara-balans', '/servicii/clopotar-electronic',
  '/servicii/automatizari-clopote-cu-balans', '/servicii/iconostase', '/servicii/usi',
];

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

async function location(page: Page, path: string) {
  const response = await page.request.get(path, {maxRedirects: 0});
  const target = new URL(response.headers().location ?? '', 'http://x');
  return {status: response.status(), path: target.pathname, hash: target.hash};
}

test('every service page has the story hero, a breadcrumb to /#servicii and no overflow', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const path of pages) {
    const response = await page.goto(path);
    expect(response?.status(), path).toBe(200);
    await expect(page.locator('main h1'), path).toHaveCount(1);
    const crumbs = page.getByRole('navigation', {name: 'Breadcrumb'});
    await expect(crumbs.locator('a[href="/#servicii"]'), path).toHaveCount(1);
    await expect(crumbs.locator('[aria-current="page"]'), path).toHaveCount(1);
    expect(await noOverflow(page), path).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('/servicii and the Clopote chooser are gone; old addresses redirect permanently', async ({page}) => {
  expect(await location(page, '/servicii')).toMatchObject({status: 308, path: '/', hash: '#servicii'});
  for (const [source, target] of [
    ['/servicii/clopote/cu-jug', '/servicii/clopote'],
    ['/servicii/iconostase/iconostas-bronz', '/servicii/iconostase'],
    ['/servicii/iconostase/lemn', '/servicii/iconostase'],
    ['/servicii/servicii/usi', '/servicii/usi'],
  ]) {
    expect(await location(page, source), source).toMatchObject({status: 308, path: target});
  }
  for (const path of ['/servicii/serviciu-inexistent', '/servicii/clopote/inexistent', '/en/services/no-such-service']) {
    expect((await page.goto(path))?.status(), path).toBe(404);
  }
});

test('Policandre: the level filter changes the grid, legacy anchors land on a card, the photo opens the Lightbox', async ({page}) => {
  await page.goto('/servicii/policandre#Policandru-7');
  const cards = page.locator('[data-catalogue] > li');
  await expect(page.locator('#Policandru-7')).toBeInViewport();
  const all = await cards.count();
  expect(all).toBeGreaterThan(12);
  await expect(cards.first()).toContainText('La comandă');
  const filter = page.getByRole('group', {name: 'Filtrați după nivele'}).filter({visible: true});
  await filter.getByRole('button', {name: 'Horos'}).click();
  await expect(filter.getByRole('button', {name: 'Horos'})).toHaveAttribute('aria-pressed', 'true');
  expect(await cards.count()).toBeLessThan(all);
  await cards.first().getByRole('button').click();
  const lightbox = page.getByRole('dialog');
  await expect(lightbox).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
});

test('Clopote: the type picker marks the current page; a row and a set drive the size guide', async ({page}) => {
  await page.goto('/servicii/clopote');
  const picker = page.getByRole('navigation', {name: 'Ce fel de clopot căutați?'});
  await expect(picker.locator('[aria-current="page"]')).toHaveAttribute('href', '/servicii/clopote');
  await expect(picker.getByRole('link').nth(1)).toHaveAttribute('href', '/servicii/clopote/fara-balans');
  const rows = page.getByRole('table').getByRole('button');
  await rows.first().click();
  await expect(rows.first()).toHaveAttribute('aria-pressed', 'true');
  const firstSet = page.getByRole('button', {name: /^Set 1/});
  await firstSet.click();
  await expect(firstSet).toHaveAttribute('aria-pressed', 'true');
  await expect(rows.first()).toHaveAttribute('aria-pressed', 'false');
  await page.goto('/servicii/clopote/fara-balans');
  await expect(page.getByRole('navigation', {name: 'Ce fel de clopot căutați?'}).locator('[aria-current="page"]'))
    .toHaveAttribute('href', '/servicii/clopote/fara-balans');
});

test('Iconostase: a material opens the Lightbox at its own address; Back closes it; the address opens it directly', async ({page}) => {
  await page.goto('/servicii/iconostase');
  await page.locator('main a[href="/servicii/iconostase/lemn-aur"]').first().click();
  const layer = page.getByRole('dialog');
  await expect(layer).toBeVisible();
  await expect(page).toHaveURL(/\/servicii\/iconostase\/lemn-aur$/);
  await expect(layer.getByRole('tab', {selected: true})).toHaveCount(1);
  await page.goBack();
  await expect(layer).toBeHidden();
  await expect(page).toHaveURL(/\/servicii\/iconostase$/);

  const html = await (await page.request.get('/servicii/iconostase/marmura')).text();
  expect(html).toContain('<dialog');
  await page.goto('/servicii/iconostase/marmura');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page).toHaveURL(/\/servicii\/iconostase$/);
});

// Prices: none on any service page while the Policandre catalogue shows "La comandă" (user, 2026-11-17).
test('no prices in the HTML or visible text of any service page', async ({page}) => {
  for (const path of pages) {
    await page.goto(path);
    const html = await page.content();
    expect(findPriceText(html).filter(({level}) => level === 'error').map(({match}) => match), path).toEqual([]);
    const text = await page.locator('body').innerText();
    expect(findPriceText(text).filter(({rule}) => rule === 'price-word').map(({match}) => match), path).toEqual([]);
  }
});
