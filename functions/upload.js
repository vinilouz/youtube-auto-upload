const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const config = require('../config');
const slugify = require('slugify');
const yargs = require('yargs/yargs');
const { format, parse } = require('date-fns');
const { ptBR } = require('date-fns/locale'); 
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

  // Get videoUrl
  const videoUrlSelector = '.ytcp-video-metadata-editor-sidepanel .ytcp-video-info > .ytcp-video-info > .ytcp-video-info > .ytcp-video-info.video-url-fadeable > a.ytcp-video-info';
  await page.waitForSelector(videoUrlSelector, { visible: true });
  const videoUrl = await page.$eval(videoUrlSelector, el => el.href);

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

  // IS FOR KIDS?
  await page.waitForSelector('#audience > ytkc-made-for-kids-select > div.made-for-kids-rating-container.ytkc-made-for-kids-select .made-for-kids-group', { visible: true });
  if (videoConfig.kids === true) {
    await page.click('[name="VIDEO_MADE_FOR_KIDS_MFK"]');
  } else {
    await page.click('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]');
  }
  await randomPause();


  // Abrir botão de mais opções
  await page.click('#toggle-button > ytcp-button-shape > button[aria-label]');
  await randomPause();

  // TAGS
  if (videoConfig.tags && Array.isArray(videoConfig.tags)) {
    await page.waitForSelector('#chip-bar #text-input', { visible: true });
    for (const tag of videoConfig.tags) {
      await page.click('#chip-bar #text-input');
      await page.keyboard.type(tag);
      await page.keyboard.press('Enter');
      await randomPause();
    }
  }

  // ALERT SUBS
  await page.waitForSelector('#notify-subscribers', { visible: true });
  const notifySubscribersCheckbox = await page.$('#notify-subscribers');
  const isChecked = await notifySubscribersCheckbox.evaluate(el => el.getAttribute('aria-checked') === 'true');
  if (videoConfig.alertSubs === true && !isChecked) {
    await notifySubscribersCheckbox.click();
  } else if (videoConfig.alertSubs !== true && isChecked) {
    await notifySubscribersCheckbox.click();
  }
  await randomPause();

  for (let i = 0; i < 3; i++) {
    // Checar a visibilidade do botão "#next-button > ytcp-button-shape > button" antes de fazer varios cliques
    await page.click('#next-button > ytcp-button-shape > button');
    await randomPause();
  }

  const privacyOption = videoConfig.privacy || "UNLISTED";
  await page.click(`tp-yt-paper-radio-button[name="${privacyOption}"]`);
  await randomPause();

  if (videoConfig.scheduleDate) {
    await page.waitForSelector('#second-container-expand-button', { visible: true });
    await page.click('#second-container-expand-button');
    await randomPause();

    await page.click('tp-yt-iron-icon#right-icon');
    await randomPause();

    const inputDateValue = await page.$eval('.ytcp-date-picker input', el => el.value);
    const youtubeDate = format(
      parse(videoConfig.scheduleDate, 'dd/MM/yyyy', new Date()),
      /[a-zA-Z]/.test(inputDateValue) ?
        (inputDateValue.includes('de') ? "d 'de' MMM 'de' yyyy" : 'MMM d, yyyy') :
        'dd/MM/yyyy',
      { locale: ptBR }
    );

    await page.fill('#control-area .ytcp-date-picker input', youtubeDate);
    await page.press('#control-area .ytcp-date-picker input', 'Enter');
    await randomPause();
  }

  if (videoConfig.scheduleTime) {
    await page.waitForSelector('#second-container-expand-button', { visible: true });
    await page.click('#second-container-expand-button');
    await randomPause();

    await page.fill('#time-of-day-container input', videoConfig.scheduleTime);
    await randomPause();
  }

  await page.click('#done-button[role="button"]');
  await randomPause();

  await page.click('#close-button button[aria-label="Close"]');
  await randomPause();

  /* SE tiver attr comments NAO executar o schedule e NÃO usar o privacy selecionado, sempre como UNLISTED
     Executar fluxo do comment
     Após executar schedule */

  // Comments
  // Go to video Url
  // Click on first (open comments):
  // #comments-button > ytd-button-renderer > yt-button-shape > label > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill
  // Click input comment:
  // #contenteditable-root
  // Fill content
  // Post comment
  // #submit-button > yt-button-shape > button
  // Click on:
  // #watch-while-engagement-panel #action-menu #top-level-buttons-computed + #flexible-item-buttons + .dropdown-trigger.style-scope.ytd-menu-renderer > button
  // Click on:
  // #items > ytd-menu-navigation-item-renderer.style-scope.ytd-menu-popup-renderer.iron-selected
  // Close tab video url

  // Re agendar pos comment
  // Go to:
  // `https://studio.youtube.com/video/${videoID}/edit`

  // IF DATE OU DATEIME
  // click on (Open Select):
  // #select-button > tp-yt-iron-icon
  // Click on (open Schedule select):
  // #second-container-expand-button > tp-yt-iron-icon
  // Aplicar função generica

  // IF DATE = Click on (open date select):
  // #datepicker-trigger #right-icon
  // find and fill:
  // .ytcp-date-picker #textbox input
  // keypres enter

  // IF TIME = Click on: 
  // #time-of-day-container input

  // Click on:
  // #save-button button
  // Close tab

  return videoUrl;
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

  for (const videoConfig of configData) {
    const videoFileName = path.parse(videoConfig.filename).name;
    const videoFiles = fs.readdirSync(videosDir).filter(file =>
      path.parse(file).name === videoFileName
    );

    if (videoFiles.length === 0) {
      console.log(color(`Arquivo de vídeo não encontrado para: ${videoConfig.filename}`, 31));
      continue;
    }

    const filePath = path.join(videosDir, videoFiles[0]);

    try {
      const videoUrl = await uploadVideo(page, videoConfig, filePath);
      console.log(
        color(`Vídeo ${videoConfig.filename} enviado com sucesso para a conta `, 32) +
        color(selectedAccount.name, 35) +
        color(` ${videoUrl}`, 36)
      );
    } catch (error) {
      console.error(color(`Erro ao enviar o vídeo ${videoConfig.filename} para a conta ${selectedAccount.name}:`, 31), error);
    }
  }

  await context.close();
})();