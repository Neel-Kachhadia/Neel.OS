import { test, expect } from '@playwright/test';

async function bootToTerminal(page: import('@playwright/test').Page) {
  // Clear session before page loads so we always get first-boot → sound-gate
  await page.addInitScript(() => {
    localStorage.removeItem('neel_os_session');
  });

  await page.goto('/');

  // Handle return-gate if it appears (e.g. if session was cached in browser storage)
  const returnGate = page.locator('button', { hasText: /\[yes/ });
  const soundGateText = page.getByText('enable system audio?');

  // Wait for either gate to appear
  await Promise.race([
    returnGate.waitFor({ timeout: 25000 }),
    soundGateText.waitFor({ timeout: 25000 }),
  ]);

  // If return-gate is visible, click "start fresh" to reach sound-gate
  if (await returnGate.isVisible()) {
    const startFreshBtn = page.locator('button', { hasText: /start fresh/ });
    await startFreshBtn.click();
    await soundGateText.waitFor({ timeout: 20000 });
  }

  // Now on sound-gate — click [n] to skip audio
  const noBtn = page.locator('button', { hasText: /^\[n/ });
  await noBtn.click();

  // Wait for Hero terminal input (boot complete)
  const termInput = page.locator('input[aria-label="Terminal input"]');
  await termInput.waitFor({ timeout: 10000 });

  return termInput;
}

test('chat command renders ChatWorld without crash', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', err => consoleErrors.push(`PAGE ERROR: ${err.message}`));

  const termInput = await bootToTerminal(page);

  // Type 'chat' and press Enter
  await termInput.fill('chat');
  await termInput.press('Enter');

  // Wait: ChatWorld mounts after Hero sequence + GSAP transition (~1s total)
  const chatSection = page.locator('section#chat');
  const errorBoundary = page.locator('text=runtime fault. reload required.');

  const result = await Promise.race([
    chatSection.waitFor({ timeout: 6000 }).then(() => 'chat' as const),
    errorBoundary.waitFor({ timeout: 6000 }).then(() => 'error' as const),
  ]).catch(() => 'timeout' as const);

  if (result !== 'chat') {
    // Take screenshot to debug
    await page.screenshot({ path: 'test-results/chat-debug.png', fullPage: true });
  }

  expect(
    result,
    `Expected ChatWorld but got "${result}"\nConsole errors:\n${consoleErrors.join('\n')}`
  ).toBe('chat');

  // Verify ChatWorld header
  await expect(page.locator('text=NEEL.OS  ·  CHAT INTERFACE')).toBeVisible({ timeout: 3000 });
  await expect(page.locator('text=runtime fault')).not.toBeVisible();

  console.log('Console errors:', consoleErrors.length ? consoleErrors.join('\n') : 'none');
});

test('chat escape returns to terminal root', async ({ page }) => {
  const termInput = await bootToTerminal(page);

  await termInput.fill('chat');
  await termInput.press('Enter');

  await page.locator('section#chat').waitFor({ timeout: 6000 });

  // Escape should exit ChatWorld
  await page.keyboard.press('Escape');
  await page.locator('section#hero').waitFor({ timeout: 5000 });
  await expect(page.locator('section#chat')).not.toBeVisible();
});

test('chat boot sequence plays inside ChatWorld', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(`PAGE_ERROR: ${err.message}\n${err.stack}`));

  const termInput = await bootToTerminal(page);

  await termInput.fill('chat');
  await termInput.press('Enter');

  // Wait for ChatWorld or error boundary
  const chatSection = page.locator('section#chat');
  const errorBoundary = page.locator('text=runtime fault. reload required.');

  const result = await Promise.race([
    chatSection.waitFor({ timeout: 6000 }).then(() => 'chat' as const),
    errorBoundary.waitFor({ timeout: 6000 }).then(() => 'error' as const),
  ]).catch(() => 'timeout' as const);

  if (result === 'error') {
    // Grab the exposed error message
    const errMsg = await page.locator('[data-error-message]').textContent().catch(() => '(no message)');
    console.log('ERROR BOUNDARY triggered:', errMsg);
    console.log('Console errors:', errors.join('\n'));
    await page.screenshot({ path: 'test-results/chat-boot-debug.png', fullPage: true });
  }

  expect(result, `Expected chat, got ${result}. Errors:\n${errors.join('\n')}`).toBe('chat');

  // "NEEL.OS is ready" is a single-span boot line — use locator text engine
  await expect(
    page.locator('section#chat').locator('text=NEEL.OS is ready')
  ).toBeVisible({ timeout: 5000 });

  // Chat input should be enabled after boot finishes (~880ms)
  const chatInput = page.locator('section#chat input[aria-label="Chat input"]');
  await expect(chatInput).toBeEnabled({ timeout: 4000 });
});
