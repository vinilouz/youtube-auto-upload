const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function randomPause() {
  const min = 500;
  const max = 2000;
  const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, randomTime));
}

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await chromium.launchPersistentContext('./my-session', {
    headless: false,
    viewport: { width: 1280, height: 800 },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    locale: 'pt-BR',
  });

  const page = await context.newPage();

  // Lê os arquivos de vídeo da pasta "videos"
  const videosDir = 'videos';
  const videoFiles = fs.readdirSync(videosDir).filter(file => path.extname(file) === '.mp4');

  // Lê o arquivo de configuração
  const configData = JSON.parse(fs.readFileSync('videos.json'));

  for (const videoConfig of configData) {
    // Encontra o arquivo de vídeo correspondente 
    const videoFiles = fs.readdirSync(videosDir).filter(file =>
      path.parse(file).name === videoConfig.filename
    );

    if (videoFiles.length === 0) {
      console.error(`Arquivo de vídeo não encontrado para: ${videoConfig.filename}`);
      continue;
    }

    const filePath = path.join(videosDir, videoFiles[0]);

    await page.goto('https://studio.youtube.com/');
    await randomPause();

    // Clica no botão "Criar"
    await page.click('#create-icon > ytcp-button-shape > button');
    await randomPause();

    // Clica em "Enviar vídeo"
    await page.click('#text-item-0 > ytcp-ve > tp-yt-paper-item-body > div > div > div > yt-formatted-string');
    await randomPause();

    // Upload direto no elemento de input
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

    // Clica em "Avançar" 3 vezes
    for (let i = 0; i < 3; i++) {
      await page.click('#next-button > ytcp-button-shape > button');
      await randomPause();
    }

    // Seleciona a privacidade (mantém a primeira opção como padrão)
    const privacyOption = videoConfig.privacy || "PRIVATE";
    await page.click(`tp-yt-paper-radio-button[name="${privacyOption}"]`);
    await randomPause();

    if (videoConfig.scheduleDate) {
      await page.click('#second-container-expand-button');
      await randomPause();

      // Converte a data para o formato esperado pelo YouTube
      const [dia, mes, ano] = videoConfig.scheduleDate.split('/');
      const meses = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const youtubeDate = `${meses[parseInt(mes) - 1]} ${dia}, ${ano}`;

      await page.click('tp-yt-iron-icon#right-icon');
      await page.fill('#control-area .ytcp-date-picker input', youtubeDate);
      await page.press('#control-area .ytcp-date-picker input', 'Enter');
      await randomPause();
    }

    if (videoConfig.scheduleTime) {
      // Seleciona o horário
      await page.fill('#time-of-day-container input', videoConfig.scheduleTime);
      await randomPause();
    }

    // Clica em "Agendar"
    await page.click('#done-button[role="button"]');
    await randomPause();

    // Fecha o modal de sucesso
    await page.click('#close-button button[aria-label="Close"]');
    await randomPause();
  }

  await browser.close();
})();
