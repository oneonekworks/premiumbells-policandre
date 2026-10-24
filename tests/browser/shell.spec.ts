import {expect, test} from '@playwright/test';

test('Romanian and English shells render with language-specific URLs', async ({page, isMobile}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ro');
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('footer')).toContainText('CUI');

  const scope = isMobile ? page.getByRole('dialog', {name: 'Meniu'}) : page.locator('header');
  if (isMobile) await page.getByRole('button', {name: 'Deschide meniul'}).click();
  await scope.getByRole('group', {name: 'Limba'}).getByRole('link', {name: /EN/}).click();
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');

  if (!isMobile) {
    await page.getByRole('navigation', {name: 'Main navigation'}).getByRole('link', {name: 'Our work'}).click();
    await expect(page).toHaveURL(/\/en\/our-work$/);
    await expect(page.getByRole('navigation', {name: 'Main navigation'}).getByRole('link', {name: 'Our work'}))
      .toHaveAttribute('aria-current', 'page');
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('language prefixes and section names are canonicalised', async ({page}) => {
  await page.goto('/ro/servicii');
  await expect(page).toHaveURL(/\/servicii$/);
  await page.goto('/en/lucrarile-noastre');
  await expect(page).toHaveURL(/\/en\/our-work$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('unknown paths return 404 inside the shell', async ({page}) => {
  const response = await page.goto('/pagina-inexistenta-check');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', {name: 'Pagina nu a fost găsită.'})).toBeVisible();
  await expect(page.locator('header')).toBeVisible();
  expect((await page.goto('/en/prototip/portofoliu'))?.status()).toBe(404);
});

test('mobile menu opens, closes with Escape, and closes after navigation', async ({page, isMobile}) => {
  test.skip(!isMobile, 'Mobile navigation only');
  await page.goto('/');
  const dialog = page.getByRole('dialog', {name: 'Meniu'});
  await page.getByRole('button', {name: 'Deschide meniul'}).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();

  await page.getByRole('button', {name: 'Deschide meniul'}).click();
  await dialog.getByRole('link', {name: 'Lucrările noastre'}).click();
  await expect(page).toHaveURL(/\/lucrarile-noastre$/);
  await expect(dialog).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
