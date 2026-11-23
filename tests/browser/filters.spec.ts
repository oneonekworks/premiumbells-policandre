import {expect, test, type Page} from '@playwright/test';

// The one filter bar on Lucrările noastre (v6.2, V5): crafts, bell type after
// Clopote, search, Galerie | Hartă, place from the map, "Arată încă 24".
// Reads the live published dataset (no writes): needs Clopote works in Iași,
// more than 47 works in all, and the Automatizări category.

const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const tiles = (page: Page) => page.locator('main a.ww-tile[aria-haspopup="dialog"]');
// The wall has no visible text (v6.3); each tile's name is "parish, craft · place · year".
const labels = async (page: Page) => (await tiles(page).evaluateAll((links) => links.map((link) => link.getAttribute('aria-label') ?? '')));
const chip = (page: Page, name: string | RegExp) =>
  page.getByRole('button', {name, exact: typeof name === 'string'}).filter({visible: true}).first();
const counter = (page: Page) => page.locator('main p', {hasText: / din \d+/}).last();

test('crafts and bell type are one bar; the address follows; a type clears with its category', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/lucrarile-noastre');
  await expect(chip(page, 'Toate')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', {name: 'Doar clopote cu jug'})).toHaveCount(0);

  await chip(page, 'Clopote').click();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote$/);
  await expect(chip(page, 'Clopote')).toHaveAttribute('aria-pressed', 'true');
  const all = fold((await counter(page).textContent())!);

  await chip(page, 'Doar clopote cu jug').click();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote\?tip=cu-jug$/);
  // Works not marked with a type yet still show under each type.
  await expect(counter(page)).toContainText('Clopote cu jug');
  await chip(page, /^Cu jug, apăsați/).click();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote$/);
  await expect(counter(page)).not.toContainText('Clopote cu jug');
  expect(fold((await counter(page).textContent())!)).toBe(all);

  await chip(page, 'Doar clopote fără balans').click();
  await chip(page, 'Policandre').click();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/policandre$/);
  await expect(page.getByRole('button', {name: /clopote fără balans/})).toHaveCount(0);
  await expect(tiles(page).first()).toHaveAttribute('aria-label', /, Policandre · /);

  await page.goBack();
  await expect(page).toHaveURL(/tip=fara-balans/);
  await expect(chip(page, /^Fără balans, apăsați/)).toHaveAttribute('aria-pressed', 'true');
  expect(errors).toEqual([]);
});

test('search ignores diacritics; an old category address filters to itself; unknown params are ignored', async ({page}) => {
  await page.goto('/lucrarile-noastre?an=2022');
  await expect(tiles(page)).toHaveCount(23);
  const field = page.getByRole('searchbox', {name: 'Caută o lucrare'}).filter({visible: true});
  if (!(await field.count())) await page.getByRole('button', {name: 'Caută o lucrare'}).filter({visible: true}).first().click();
  await page.getByRole('searchbox', {name: 'Caută o lucrare'}).filter({visible: true}).pressSequentially('iasi', {delay: 30});
  await expect(page).toHaveURL(/cauta=iasi/);
  const texts = (await labels(page)).map(fold);
  expect(texts.length).toBeGreaterThan(0);
  expect(texts.every((text) => text.includes('iasi'))).toBe(true);

  await page.goto('/lucrarile-noastre/automatizari');
  await expect(chip(page, 'Clopote')).toHaveAttribute('aria-pressed', 'true');
  const names = await labels(page);
  expect(names.length).toBeGreaterThan(0);
  expect(names.every((name) => name.includes(', Automatizări · '))).toBe(true);
});

test('Hartă: a county from the list filters the gallery; its chip clears it', async ({page}) => {
  await page.goto('/lucrarile-noastre?vedere=harta');
  const iasi = page.getByRole('button', {name: /^Iași\s*\d+$/}).filter({visible: true}).first();
  await expect(iasi).toBeVisible();
  await iasi.click();
  await expect(page).toHaveURL(/judet=iasi/);
  await expect(page).not.toHaveURL(/vedere=harta/);
  const texts = (await labels(page)).map(fold);
  expect(texts.length).toBeGreaterThan(0);
  expect(texts.every((text) => text.includes('iasi'))).toBe(true);
  await page.getByRole('button', {name: 'Iași, arată toate locurile'}).click();
  await expect(page).toHaveURL(/\/lucrarile-noastre$/);

  await page.goto('/lucrarile-noastre?tara=ro');
  expect(await tiles(page).count()).toBe(23);
});

test('"Arată încă 24" adds tiles and keeps the page in the address; the bar docks under the header', async ({page}) => {
  await page.goto('/lucrarile-noastre');
  await page.getByRole('link', {name: 'Arată încă 24'}).click();
  await expect(tiles(page)).toHaveCount(47);
  await expect(page).toHaveURL(/pagina=2/);

  await page.evaluate(() => scrollTo(0, 1600));
  const docked = page.locator('[role=region][aria-label="Filtre lucrări"]').filter({visible: true});
  await expect(docked).toHaveCount(1);
  await expect(docked).toHaveClass(/glass-docked/);
  // Under the header (96 / 84), or at the top while a fast scroll hides the header.
  expect((await docked.boundingBox())!.y).toBeLessThan(110);
});
