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

  // Aguarda manualmente o login ser realizado
  console.log("Por favor, realize o login manualmente no navegador.");
  
  await page.waitForURL(login_url); 

  console.log('Login realizado com sucesso (manualmente)');
})();