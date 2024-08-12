require('dotenv').config(); // Carrega as variáveis de ambiente do arquivo .env
const { chromium } = require('playwright');
const login_url = 'https://www.youtube.com/account';

(async () => {
  const context = await chromium.launchPersistentContext('./my-session', {
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    locale: 'pt-BR',
  });

  const page = await context.newPage();

  await page.goto(login_url);
  await randomPause();

  const emailField = page.locator('input#identifierId');
  await emailField.hover();
  await emailField.click();
  await randomPause();
  await emailField.fill(process.env.EMAIL);
  await randomPause();

  const submitButtonEmail = page.locator('#identifierNext button[jsaction]');
  await submitButtonEmail.hover();
  await submitButtonEmail.click();
  await randomPause();

  const passField = page.locator('#password input[name="Passwd"]');
  await passField.hover();
  await passField.click();
  await randomPause();
  await passField.fill(process.env.PASSWORD);
  await randomPause();

  const submitButtonPass = page.locator('#passwordNext button[jsaction]');
  await submitButtonPass.hover();
  await submitButtonPass.click();
  await randomPause();

  if (page.url().includes('dashboard')) {
    console.log('Login realizado com sucesso');
  } else {
    console.log('Falha no login');
  }

  await context.close();

  function randomPause() {
    const min = 500; // 0.5 segundos
    const max = 2000; // 2 segundos
    const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, randomTime));
  }
})();