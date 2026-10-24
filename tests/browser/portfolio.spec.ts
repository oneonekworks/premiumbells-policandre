import {expect, test} from '@playwright/test';

test('published portfolio works on navigation and reload without horizontal overflow', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/lucrarile-noastre');
  await page.getByRole('link', {name: 'Deschide portofoliul'}).click();
  await expect(page).toHaveURL(/\/prototip\/portofoliu$/);
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.reload();
  await expect(page.locator('main h1')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(errors).toEqual([]);
});

test('an unknown project has no public detail page', async ({page}) => {
  await page.goto('/prototip/portofoliu/nonexistent-prototype-check-8de49');
  await expect(page.getByRole('heading', {name: 'Lucrarea sau pagina nu este disponibilă.'})).toBeVisible();
  await page.getByRole('link', {name: 'Înapoi la portofoliu'}).click();
  await expect(page).toHaveURL(/\/prototip\/portofoliu$/);
  await expect(page.locator('main h1')).toBeVisible();
  await expect(page.locator('main [role="alert"]')).toHaveCount(0);
});
