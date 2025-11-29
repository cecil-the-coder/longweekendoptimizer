import { test } from '@playwright/test';

test('inspect rendered HTML and classes', async ({ page }) => {
  await page.goto('https://cecil-the-coder.github.io/longweekendoptimizer/');
  await page.waitForLoadState('networkidle');

  // Get the rendered HTML with all classes
  const rootHTML = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root?.innerHTML.substring(0, 2000); // First 2000 chars
  });

  console.log('Rendered HTML:', rootHTML);

  // Check specific elements for their classes
  const mainDivClasses = await page.evaluate(() => {
    const root = document.getElementById('root');
    const firstDiv = root?.querySelector('div');
    return firstDiv?.className;
  });

  console.log('First div classes:', mainDivClasses);

  // Check header classes
  const headerClasses = await page.evaluate(() => {
    const header = document.querySelector('header');
    return header?.className;
  });

  console.log('Header classes:', headerClasses);

  // Check h1 classes
  const h1Classes = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    return h1?.className;
  });

  console.log('H1 classes:', h1Classes);
});
