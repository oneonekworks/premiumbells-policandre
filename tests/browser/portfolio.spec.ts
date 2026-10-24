import {expect, test, type Page} from '@playwright/test';

// Reads the live published dataset (no writes). Requires the Clopote category
// with at least one published project that has a gallery.

const noOverflow = (page: Page) => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);

test('grid opens a project slide-over that closes with Escape and reopens with Forward', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/lucrarile-noastre');
  await page.getByRole('link', {name: 'Clopote'}).first().click();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote$/);
  await expect(page.locator('main h1')).toHaveText('Clopote');
  expect(await noOverflow(page)).toBe(true);

  const card = page.locator('main article h2 a').first();
  const title = (await card.textContent())!.trim();
  await card.click();
  const modal = page.getByRole('dialog', {name: title});
  await expect(modal).toBeVisible();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote\/[a-z0-9-]+$/);
  await expect(page.locator('main h1')).toHaveText('Clopote');
  const projectUrl = page.url();

  await page.keyboard.press('Escape');
  await expect(modal).toBeHidden();
  await expect(page).toHaveURL(/\/lucrarile-noastre\/clopote$/);

  await page.goForward();
  await expect(modal).toBeVisible();
  await expect(page).toHaveURL(projectUrl);
  expect(errors).toEqual([]);
});

test('the lightbox navigates with arrows and Escape closes only the lightbox', async ({page}) => {
  await page.goto('/lucrarile-noastre/clopote');
  const card = page.locator('main article h2 a').first();
  const title = (await card.textContent())!.trim();
  await card.click();
  const modal = page.getByRole('dialog', {name: title});
  await modal.getByRole('button', {name: /^Mărește fotografia/}).first().click();

  const lightbox = page.getByRole('dialog', {name: 'Galerie foto'});
  await expect(lightbox).toBeVisible();
  const counter = lightbox.locator('p[aria-live]');
  await expect(counter).toContainText(/^1 din \d+$/);
  const total = Number((await counter.textContent())!.split(' din ')[1]);
  await page.keyboard.press('ArrowLeft');
  await expect(counter).toHaveText(`${total} din ${total}`);

  await page.keyboard.press('Escape');
  await expect(lightbox).toBeHidden();
  await expect(modal).toBeVisible();
});

test('a direct project URL renders the full page with canonical metadata', async ({page}) => {
  await page.goto('/lucrarile-noastre/clopote');
  const href = await page.locator('main article h2 a').first().getAttribute('href');
  const title = (await page.locator('main article h2 a').first().textContent())!.trim();

  await page.goto(href!);
  await expect(page.locator('main h1')).toHaveText(title);
  await expect(page.locator('dialog[open]')).toHaveCount(0);
  await expect(page.getByRole('navigation', {name: 'Breadcrumb'})).toContainText('Clopote');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', new RegExp(`${href}$`));
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /cdn\.sanity\.io/);
  expect(await noOverflow(page)).toBe(true);
});

test('unknown projects and categories, and unpublished English, are 404s', async ({page}) => {
  for (const path of [
    '/lucrarile-noastre/clopote/lucrare-inexistenta-8de49',
    '/lucrarile-noastre/categorie-inexistenta',
  ]) {
    expect((await page.goto(path))?.status()).toBe(404);
    await expect(page.getByRole('heading', {name: 'Pagina nu a fost găsită.'})).toBeVisible();
  }
  // Clopote is published in Romanian only so far.
  expect((await page.goto('/en/our-work/clopote'))?.status()).toBe(404);
});
