const fs = require('fs');
const path = require('path');
const config = require('../config');
const slugify = require('slugify');
const { chromium } = require('playwright');
const { getLatestUserAgent, randomPause, color, rootPath } = require('./utils');
const targetUrl = 'https://www.youtube.com/account';

async function loginAccount(account, userDataDir) {
  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1152, height: 648 },
    userAgent: await getLatestUserAgent(),
    locale: 'pt-BR',
    isMobile: false,
    hasTouch: false,
    javaScriptEnabled: true,
    ignoreHTTPSErrors: true,
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
    ],
  });

  const page = await context.newPage();

  await page.goto(targetUrl);

  await randomPause();

  const emailField = page.locator('input#identifierId');
  await emailField.hover();
  await emailField.click();
  await randomPause();
  await emailField.fill(account.email);
  await randomPause();

  const submitButtonEmail = page.locator('#identifierNext button[jsaction]');
  await submitButtonEmail.hover();
  await submitButtonEmail.click();
  await randomPause();

  const passField = page.locator('#password input[name="Passwd"]');
  await passField.hover();
  await passField.click();
  await randomPause();
  await passField.fill(account.password);
  await randomPause();

  const submitButtonPass = page.locator('#passwordNext button[jsaction]');
  await submitButtonPass.hover();
  await submitButtonPass.click();
  await randomPause();


  await page.waitForURL(targetUrl);

  if (page.url() === targetUrl) {
    console.log(color('🎉 Login realizado com sucesso para a conta ', 32) + color(account.name, 35));
    await context.storageState({ path: path.join(userDataDir, 'sessionState.json') });
  } else {
    console.error('Não foi possível encontrar a página de sucesso.');
  }

  await context.close();
}

(async () => {
  for (const account of config.accounts) {
    const dirName = slugify(account.name, { lower: true });
    const userDataDir = path.join(rootPath, `user-data-${dirName}`);

    if (fs.existsSync(userDataDir)) {
      console.log(
        color('Sessão para ', 33) +
        color(account.name, 35) +
        color(' já existente', 33)
      );
    } else {
      await loginAccount(account, userDataDir);
    }
  }
})();