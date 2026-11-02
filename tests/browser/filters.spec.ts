import {expect, test, type Page} from '@playwright/test';

// Search and filters on the Clopote grid. Reads the live published dataset
// (no writes): needs works in Iași, Botoșani and 2022, more than 24 Romanian
// works, and at least one Moldovan one.

const grid = '/lucrarile-noastre/clopote';
const fold = (text: string) => text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
const cards = (page: Page) => page.locator('main article');
const search = (page: Page) => page.getByRole('searchbox', {name: 'Caută'});
const year = (page: Page) => page.getByRole('combobox', {name: 'An'});
const county = (page: Page) => page.getByRole('combobox', {name: 'Județ'});
const result = (page: Page) => page.locator('main p[aria-live]');

async function cardTexts(page: Page) {
  await expect(cards(page).first()).toBeVisible();
  return (await cards(page).allTextContents()).map(fold);
}

test('search ignores diacritics and adds one history entry while typing', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(grid);
  const all = await cards(page).count();
  const entries = await page.evaluate(() => history.length);

  await search(page).pressSequentially('iasi', {delay: 40});
  await expect(page).toHaveURL(`${grid}?cauta=iasi`);
  await expect(result(page)).toHaveText(/^\d+ din \d+ (de )?lucrări$/);
  const texts = await cardTexts(page);
  expect(texts.length).toBeLessThan(all);
  expect(texts.every((text) => text.includes('iasi'))).toBe(true);
  expect(texts.some((text) => text.includes('ziua crucii'))).toBe(true);
  expect(await page.evaluate(() => history.length)).toBe(entries + 1);

  await search(page).fill('rosu');
  await expect(page).toHaveURL(`${grid}?cauta=rosu`);
  await expect(cards(page).filter({hasText: 'Roșu Chiajna'})).toHaveCount(1);
  // 16 px text, so phones do not zoom into the field.
  expect(await search(page).evaluate((input) => parseFloat(getComputedStyle(input).fontSize))).toBeGreaterThanOrEqual(16);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('filters combine with each other and with the search; nothing found can be cleared', async ({page}) => {
  await page.goto(grid);
  await county(page).selectOption('botosani');
  await expect(page).toHaveURL(`${grid}?judet=botosani`);
  expect((await cardTexts(page)).every((text) => text.includes('botosani'))).toBe(true);

  await year(page).selectOption('2018');
  await expect(page).toHaveURL(`${grid}?an=2018&judet=botosani`);
  expect((await cardTexts(page)).every((text) => text.includes('botosani') && text.includes('2018'))).toBe(true);

  await search(page).fill('zzzz');
  await expect(page).toHaveURL(`${grid}?cauta=zzzz&an=2018&judet=botosani`);
  await expect(page.getByText('Nicio lucrare nu corespunde căutării.')).toBeVisible();
  await expect(cards(page)).toHaveCount(0);

  await page.getByRole('button', {name: 'Șterge filtrele'}).click();
  await expect(page).toHaveURL(grid);
  await expect(search(page)).toHaveValue('');
  await expect(year(page)).toHaveValue('');
  await expect(county(page)).toHaveValue('');
  await expect(result(page)).toBeEmpty();

  // Moldova is one option, whether or not a raion is set.
  await county(page).selectOption('moldova');
  await expect(page).toHaveURL(`${grid}?judet=moldova`);
  expect((await cardTexts(page)).every((text) => text.includes('moldova'))).toBe(true);
});

test('pagination keeps the filters and a new filter returns to page 1', async ({page}) => {
  // Every Romanian work matches the country name: more than one page.
  await page.goto(`${grid}?cauta=romania`);
  const pagination = page.getByRole('navigation', {name: 'Paginare'});
  await expect(pagination).toContainText('Pagina 1 din 2');
  await pagination.getByRole('link', {name: 'Înainte'}).click();
  await expect(page).toHaveURL(`${grid}?cauta=romania&pagina=2`);
  await expect(pagination).toContainText('Pagina 2 din 2');
  await expect(search(page)).toHaveValue('romania');
  expect((await cardTexts(page)).some((text) => text.includes('moldova'))).toBe(false);

  await year(page).selectOption('2022');
  await expect(page).toHaveURL(`${grid}?cauta=romania&an=2022`);
  await expect(pagination).toHaveCount(0);

  // A year or county the category does not have is ignored.
  await page.goto(`${grid}?an=1800&judet=nicaieri`);
  await expect(result(page)).toBeEmpty();
  await expect(cards(page)).toHaveCount(24);
});

test('the slide-over opens from filtered results and Back/Forward restore the filters', async ({page}) => {
  await page.goto(grid);
  await search(page).fill('parohia');
  await expect(page).toHaveURL(`${grid}?cauta=parohia`);
  await year(page).selectOption('2022');
  const filtered = `${grid}?cauta=parohia&an=2022`;
  await expect(page).toHaveURL(filtered);
  const count = await cards(page).count();

  const card = page.locator('main article h2 a').first();
  const title = (await card.textContent())!.trim();
  await card.click();
  const modal = page.getByRole('dialog', {name: title});
  await expect(modal).toBeVisible();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote\/[a-z0-9-]+$/);

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(page).toHaveURL(filtered);
  await expect(cards(page)).toHaveCount(count);
  await expect(year(page)).toHaveValue('2022');

  await page.goBack();
  await expect(page).toHaveURL(`${grid}?cauta=parohia`);
  await expect(year(page)).toHaveValue('');
  await expect(search(page)).toHaveValue('parohia');
  await page.goBack();
  await expect(page).toHaveURL(grid);
  await expect(search(page)).toHaveValue('');
  await expect(cards(page)).toHaveCount(24);

  await page.goForward();
  await expect(page).toHaveURL(`${grid}?cauta=parohia`);
  await expect(search(page)).toHaveValue('parohia');
  await page.goForward();
  await expect(page).toHaveURL(filtered);
  await expect(cards(page)).toHaveCount(count);
  await page.goForward();
  await expect(modal).toBeVisible();
});
