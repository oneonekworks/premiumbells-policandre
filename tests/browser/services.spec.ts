import {expect, test, type Page} from '@playwright/test';
import {findPriceText} from '../../scripts/lib/price-text';

// Services and catalogue (Phase 6). The first tests need no content. The rest
// need the hand-made test documents (`npm run services:test-docs -- --write`)
// and skip when they are not published.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const hub = '/servicii/test-serviciu';
const variant = `${hub}/test-varianta`;

/** Currency in the full HTML (head, JSON-LD, RSC payload) or "preț" in visible text. */
async function expectNoPrices(page: Page, path: string) {
  const response = await page.goto(path);
  expect(response?.status(), path).toBe(200);
  const html = await page.content();
  expect(findPriceText(html).filter(({level}) => level === 'error').map(({match}) => match), path).toEqual([]);
  const text = await page.locator('body').innerText();
  expect(findPriceText(text).filter(({rule}) => rule === 'price-word').map(({match}) => match), path).toEqual([]);
}

test('the services overview renders in both languages without errors', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/servicii');
  await expect(page.locator('main h1')).toHaveText('Servicii');
  expect(await noOverflow(page)).toBe(true);
  await page.goto('/en/services');
  await expect(page.locator('main h1')).toHaveText('Services');
  expect(errors).toEqual([]);
});

test('unknown services and variants are 404s', async ({page}) => {
  for (const path of ['/servicii/serviciu-inexistent', '/servicii/serviciu-inexistent/varianta', '/en/services/no-such-service']) {
    expect((await page.goto(path))?.status(), path).toBe(404);
  }
  await expect(page.locator('header')).toBeVisible();
});

test('legacy duplicate and typo URLs redirect permanently', async ({page}) => {
  for (const [source, target] of [
    ['/servicii/iconostase/lemn', '/servicii/iconostase'],
    ['/servicii/iconostase/lemn-bronz', '/servicii/iconostase'],
    ['/servicii/servicii/usi', '/servicii/usi'],
    ['/_lucrarile-noastre', '/lucrarile-noastre'],
  ]) {
    const response = await page.request.get(source, {maxRedirects: 0});
    expect(response.status(), source).toBe(308);
    expect(new URL(response.headers().location, 'http://x').pathname, source).toBe(target);
  }
});

test.describe('with the test documents', () => {
  test.beforeEach(async ({page}) => {
    const response = await page.request.get(hub, {maxRedirects: 0});
    test.skip(response.status() !== 200, 'Test documents are not published (npm run services:test-docs -- --write)');
  });

  test('the overview lists the service with its active variant only', async ({page}) => {
    await page.goto('/servicii');
    await expect(page.getByRole('link', {name: 'Serviciu de test'})).toHaveAttribute('href', hub);
    const variants = page.getByRole('list', {name: 'Variante: Serviciu de test'});
    await expect(variants.getByRole('link')).toHaveText(['Variantă de test']);
    await expect(page.getByText('Variantă ascunsă de test')).toHaveCount(0);
  });

  test('hub and variant pages render their sections, breadcrumbs and related works', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(hub);
    await expect(page.locator('main h1')).toHaveText('Serviciu de test');
    await expect(page.getByRole('heading', {name: 'Variante'})).toBeVisible();
    await expect(page.getByRole('table')).toContainText('1.100 kg');
    await expect(page.getByText('Include: limba, icoane')).toBeVisible();
    await expect(page.getByText('Cu clopotar electronic')).toBeVisible();
    await expect(page.getByRole('heading', {name: 'Lucrări realizate'})).toBeVisible();
    await expect(page.getByRole('link', {name: /Cereți o ofertă/})).toHaveAttribute('href', /^tel:/);
    expect(await noOverflow(page)).toBe(true);
    await expect(page).toHaveTitle(/Serviciu de test/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/servicii\/test-serviciu$/);
    await expect(page.locator('link[hreflang="en"]')).toHaveCount(0);

    await page.getByRole('link', {name: 'Variantă de test'}).first().click();
    await expect(page).toHaveURL(new RegExp(`${variant}$`));
    const breadcrumb = page.getByRole('navigation', {name: 'Breadcrumb'});
    await expect(breadcrumb.getByRole('link')).toHaveText(['Servicii', 'Serviciu de test']);
    expect(errors).toEqual([]);
  });

  test('hidden, misplaced and English-only URLs are 404s; a wrong-language slug redirects', async ({page}) => {
    for (const path of ['/servicii/test-varianta', '/servicii/inexistent/test-varianta', `${hub}/test-ascuns`, '/en/services/test-service']) {
      expect((await page.goto(path))?.status(), path).toBe(404);
    }
    const response = await page.request.get('/servicii/test-service', {maxRedirects: 0});
    expect(response.status()).toBe(308);
    expect(new URL(response.headers().location, 'http://x').pathname).toBe(hub);
  });

  test('a legacy #Policandru-N link opens that catalogue item; Escape closes it', async ({page}) => {
    await page.goto(`${hub}#Policandru-7`);
    const dialog = page.getByRole('dialog', {name: 'Policandru de test nr. 7'});
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('3,1 m');
    await expect(dialog).toContainText('cod 110311');
    await expect(dialog).toContainText('Aurit');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    expect(new URL(page.url()).hash).toBe('');
  });

  test('a catalogue card opens from the keyboard, Back closes it and focus returns', async ({page}) => {
    await page.goto(hub);
    const card = page.getByRole('button', {name: 'Vezi detaliile: Policandru de test nr. 1'});
    await expect(card).toContainText('1 nivel ·');
    await card.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', {name: 'Policandru de test nr. 1'});
    await expect(dialog).toBeVisible();
    expect(new URL(page.url()).hash).toMatch(/^#.+/);
    await expect(dialog.getByRole('button', {name: 'Închide'})).toBeFocused();
    await page.goBack();
    await expect(dialog).toBeHidden();
    await expect(page).toHaveURL(new RegExp(`${hub}$`));
    await expect(card).toBeFocused();
    await page.goForward();
    await expect(dialog).toBeVisible();
  });

  test('a model opens its gallery; Escape closes only the lightbox', async ({page}) => {
    await page.goto(hub);
    await page.getByRole('button', {name: 'Vezi detaliile: Model A'}).click();
    const dialog = page.getByRole('dialog', {name: 'Model A'});
    await expect(dialog).toContainText('Înălțime');
    await expect(page).toHaveURL(/#Model-A$/);
    await dialog.getByRole('button', {name: /^Mărește fotografia/}).first().click();
    const lightbox = page.getByRole('dialog', {name: 'Galerie foto'});
    await expect(lightbox).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(lightbox).toBeHidden();
    await expect(dialog).toBeVisible();
    await dialog.getByRole('button', {name: 'Închide'}).click();
    await expect(dialog).toBeHidden();
    expect(await noOverflow(page)).toBe(true);
  });

  test('YouTube loads only after a click', async ({page}) => {
    await page.goto(hub);
    const play = page.getByRole('button', {name: /^Redă videoclipul/});
    test.skip(await play.count() === 0, 'No YouTube video in the test documents');
    await expect(page.locator('iframe')).toHaveCount(0);
    await play.click();
    await expect(page.locator('iframe[src*="youtube-nocookie.com"]')).toHaveCount(1);
  });

  test('no prices in the HTML or visible text of any service page or dialog', async ({page}) => {
    await page.goto('/servicii');
    const links = await page.locator('main a[href^="/servicii/"]').evaluateAll((anchors) =>
      [...new Set(anchors.map((anchor) => anchor.getAttribute('href')!))]);
    expect(links.length).toBeGreaterThan(0);
    for (const path of ['/servicii', ...links]) await expectNoPrices(page, path);
    await page.goto(`${hub}#Policandru-7`);
    await expect(page.getByRole('dialog')).toBeVisible();
    expect(findPriceText(await page.content()).filter(({level}) => level === 'error')).toEqual([]);
  });
});
