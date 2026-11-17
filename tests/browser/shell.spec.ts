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
  await scope.getByRole('link', {name: /^Limba: română/}).click();
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
  await page.goto('/ro/blog');
  await expect(page).toHaveURL(/\/blog$/);
  await page.goto('/en/lucrarile-noastre');
  await expect(page).toHaveURL(/\/en\/our-work$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('unknown paths return 404 inside the shell', async ({page}) => {
  const response = await page.goto('/pagina-inexistenta-check');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', {name: 'Pagina nu a fost găsită.'})).toBeVisible();
  await expect(page.locator('header')).toBeVisible();
  expect((await page.goto('/en/lucrarile-noastre-inexistent'))?.status()).toBe(404);
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

// Needs the published `navigation` singleton and homePage service groups.
test('the Servicii mega menu opens by button, closes with Escape, outside clicks and navigation', async ({page, isMobile}) => {
  test.skip(isMobile, 'Desktop header only');
  await page.goto('/');
  const toggle = page.locator('header').getByRole('button', {name: 'Servicii'});
  test.skip(!(await toggle.count()), 'navigation singleton not published');

  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  const menu = page.getByRole('region', {name: 'Servicii', exact: true});
  await expect(menu.getByRole('link', {name: /^Policandre/}).first()).toBeVisible();
  await expect(menu.getByRole('link', {name: /^Toate lucrările/})).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toBeFocused();

  await toggle.click();
  await page.locator('main').click({position: {x: 5, y: 5}});
  await expect(menu).toBeHidden();

  await toggle.click();
  await menu.getByRole('link', {name: /^Clopote cu jug/}).click();
  await expect(page).toHaveURL(/\/servicii\/clopote$/);
  await expect(menu).toBeHidden();
});

test('the footer is the v6.2 block: offer column, showroom, columns from the menu document', async ({page, isMobile}) => {
  await page.goto('/');
  const footer = page.locator('footer#oferta');
  await expect(footer.getByRole('link', {name: /^\+40/})).toHaveAttribute('href', /^tel:/);
  await expect(footer.getByRole('link', {name: /Buftea/}).first()).toHaveAttribute('href', /google\.com\/maps/);
  await expect(footer.getByRole('link', {name: '11k.io'})).toBeVisible();
  const solutions = page.getByRole('navigation', {name: 'Soluții'});
  test.skip(!(await solutions.count()), 'navigation singleton not published');
  await expect(solutions.getByRole('link', {name: 'Clopote'})).toHaveAttribute('href', '/servicii/clopote');
  await expect(page.getByRole('navigation', {name: 'Companie'}).getByRole('link', {name: 'Despre noi'})).toHaveAttribute('href', '/#despre-noi');
  if (isMobile) {
    await page.getByRole('button', {name: 'Deschide meniul'}).click();
    const dialog = page.getByRole('dialog', {name: 'Meniu'});
    await dialog.getByRole('button', {name: 'Iconostase și uși'}).click();
    await dialog.getByRole('link', {name: /^Iconostase/}).click();
    await expect(page).toHaveURL(/\/servicii\/iconostase$/);
  }
});
