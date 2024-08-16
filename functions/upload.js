const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const slugify = require('slugify');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { getLatestUserAgent, randomPause, color, rootPath } = require('./utils');

const argv = yargs(hideBin(process.argv))
  .option('name', {
    alias: 'n',
    type: 'string',
    description: 'Nome da conta a ser usada'
  })
  .argv;

async function uploadVideo(page, videoConfig, filePath) {
  await page.goto('https://studio.youtube.com/');
  await randomPause();

  await page.click('#create-icon > ytcp-button-shape > button');
  await randomPause();

  await page.click('#text-item-0 > ytcp-ve > tp-yt-paper-item-body > div > div > div > yt-formatted-string');
  await randomPause();

  const uploadInput = page.locator('#content > input[type=file]');
  await uploadInput.setInputFiles(filePath);
  await randomPause();

  if (videoConfig.title) {
    await page.click('#basics.ytcp-video-metadata-editor #title-wrapper #textbox');
    await page.keyboard.press('Control+A');
    await page.keyboard.type(videoConfig.title);
    await randomPause();
  }

  if (videoConfig.description) {
    await page.click('#basics.ytcp-video-metadata-editor #description-textarea #child-input');
    await page.keyboard.type(videoConfig.description);
    await randomPause();
  }

  for (let i = 0; i < 3; i++) {
    await page.click('#next-button > ytcp-button-shape > button');
    await randomPause();
  }

  const privacyOption = videoConfig.privacy || "PRIVATE";
  await page.click(`tp-yt-paper-radio-button[name="${privacyOption}"]`);
  await randomPause();

  if (videoConfig.scheduleDate) {
    await page.click('#second-container-expand-button');
    await randomPause();

    const [dia, mes, ano] = videoConfig.scheduleDate.split('/');
    const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const youtubeDate = `${meses[parseInt(mes) - 1]} ${dia}, ${ano}`;

    await page.click('tp-yt-iron-icon#right-icon');
    await page.fill('#control-area .ytcp-date-picker input', youtubeDate);
    await page.press('#control-area .ytcp-date-picker input', 'Enter');
    await randomPause();
  }

  if (videoConfig.scheduleTime) {
    await page.fill('#time-of-day-container input', videoConfig.scheduleTime);
    await randomPause();
  }

  await page.click('#done-button[role="button"]');
  await randomPause();

  await page.click('#close-button button[aria-label="Close"]');
  await randomPause();
}

(async () => {
  const videosDir = 'videos';
  const configData = JSON.parse(fs.readFileSync('videos.json'));

  let selectedAccount;
  if (argv.name) {
    selectedAccount = config.accounts.find(account => account.name === argv.name);
    if (!selectedAccount) {
      console.log(color(`Conta "${argv.name}" não encontrada. Usando a primeira conta.`, 33));
      selectedAccount = config.accounts[0];
    }
  } else {
    selectedAccount = config.accounts[0];
  }

  console.log(color(`Usando a conta: ${color(selectedAccount.name, 35)}`, 36));

  const dirName = slugify(selectedAccount.name, { lower: true });
  const userDataDir = path.join(rootPath, `user-data-${dirName}`);

  if (!fs.existsSync(userDataDir)) {
    console.log(color(`Sessão para ${selectedAccount.name} não encontrada. Por favor, faça login primeiro.`, 31));
    process.exit(1);
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: { width: 1280, height: 800 },
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

  for (const videoConfig of configData) {
    const videoFiles = fs.readdirSync(videosDir).filter(file =>
      path.parse(file).name === videoConfig.filename
    );

    if (videoFiles.length === 0) {
      console.log(color(`Arquivo de vídeo não encontrado para: ${videoConfig.filename}`, 31));
      continue;
    }

    const filePath = path.join(videosDir, videoFiles[0]);

    try {
      await uploadVideo(page, videoConfig, filePath);
      console.log(color(`Vídeo ${videoConfig.filename} enviado com sucesso para a conta `, 32) + color(selectedAccount.name, 35));
    } catch (error) {
      console.error(color(`Erro ao enviar o vídeo ${videoConfig.filename} para a conta ${selectedAccount.name}:`, 31), error);
    }
  }

  await context.close();
})();