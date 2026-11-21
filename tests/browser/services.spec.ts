import {expect, test, type Page} from '@playwright/test';

// Service pages v6 (V4): one story hero per page, the Policandre catalogue,
// the bell pages, the Iconostase material layer, the Uși doors at scale and
// redirects. Shape, not copy: the published services are the fixtures.

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
  const firstSet = page.getByRole('button', {name: /^Set 1 /});
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

test('Uși: the doors at scale pick the model; ?model= opens one; its photos open its own Lightbox set', async ({page}) => {
  await page.goto('/servicii/usi');
  const doors = page.getByRole('group', {name: /aceeași scară/}).getByRole('button');
  const count = await doors.count();
  expect(count).toBeGreaterThan(1);
  // One px-per-metre: taller doors are drawn taller, in height order.
  const heights = await doors.evaluateAll((buttons) => buttons.map((button) => button.firstElementChild!.getBoundingClientRect().height));
  expect(heights).toEqual([...heights].sort((a, b) => a - b));
  await expect(doors.and(page.locator('[aria-pressed="true"]'))).toHaveCount(1);

  const block = page.locator('[aria-live="polite"]');
  const name = async () => block.getByRole('heading', {level: 3}).textContent();
  await doors.first().focus();
  await page.keyboard.press('Enter');
  await expect(doors.first()).toHaveAttribute('aria-pressed', 'true');
  await expect(page).toHaveURL(/\?model=\d+$/);
  const first = await name();
  await doors.last().click();
  expect(await name()).not.toEqual(first);
  const model = new URL(page.url()).searchParams.get('model');

  // The photo count in the block is the size of the Lightbox set.
  const total = Number((await block.getByText(/^Fotografii · \d+$/).textContent())!.match(/\d+/)![0]);
  await block.getByRole('button', {name: /^Vedeți toate/}).first().click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText(new RegExp(`1\\s*/\\s*${total}`));
  await page.keyboard.press('Escape');

  await page.goto(`/servicii/usi?model=${model}`);
  await expect(doors.last()).toHaveAttribute('aria-pressed', 'true');
  expect(await noOverflow(page)).toBe(true);
});
