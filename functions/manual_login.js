const path = require('path');
const config = require('../config');
const slugify = require('slugify');
const { chromium } = require('playwright');
const { getLatestUserAgent, color, rootPath } = require('./utils');

async function manualLogin(account) {
  const dirName = slugify(account.name, { lower: true });
  const userDataDir = path.join(rootPath, `user-data-${dirName}`);

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

  await page.goto('https://www.youtube.com/account');

  console.log(`Por favor, faça login manualmente para a conta ${account.name}`);
  console.log("Pressione Enter quando o login estiver concluído...");

  await new Promise(resolve => process.stdin.once('data', resolve));

  await context.storageState({ path: path.join(userDataDir, 'sessionState.json') });

  console.log(color('🎉 Sessão salva para a conta ', 32) + color(account.name, 35));

  await context.close();
  process.exit();
  return;
}

(async () => {
  for (const account of config.accounts) {
    await manualLogin(account);
  }
})();