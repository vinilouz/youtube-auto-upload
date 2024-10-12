const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");
const config = require("../config");
const slugify = require("slugify");
const yargs = require("yargs/yargs");
const { format, parse } = require("date-fns");
const { ptBR } = require("date-fns/locale");
const { hideBin } = require("yargs/helpers");
const { getLatestUserAgent, randomPause, color, rootPath } = require("./utils");

const argv = yargs(hideBin(process.argv))
  .option("name", {
    alias: "n",
    type: "string",
    description: "Nome da conta a ser usada",
  })
  .option("headless", {
    alias: "h",
    type: "boolean",
    default: false,
    description: "Executar o navegador em modo headless (sem interface gráfica)",
  }).argv;

function similarity(s1, s2) {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  const longerLength = longer.length;
  if (longerLength === 0) {
    return 1.0;
  }
  return (
    (longerLength - editDistance(longer.toLowerCase(), shorter.toLowerCase())) /
    parseFloat(longerLength)
  );
}

function editDistance(s1, s2) {
  const costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) {
        costs[j] = j;
      } else if (j > 0) {
        let newValue = costs[j - 1];
        if (s1.charAt(i - 1) !== s2.charAt(j - 1)) {
          newValue = Math.min(newValue, lastValue, costs[j]) + 1;
        }
        costs[j - 1] = lastValue;
        lastValue = newValue;
      }
    }
    if (i > 0) {
      costs[s2.length] = lastValue;
    }
  }
  return costs[s2.length];
}

async function uploadVideo(page, videoConfig, filePath) {
  const clipboardy = await import("clipboardy");

  await page.goto("https://studio.youtube.com/");
  await randomPause();

  await page.click("#create-icon > ytcp-button-shape > button");
  await randomPause();

  await page.click(
    "#text-item-0 > ytcp-ve > tp-yt-paper-item-body > div > div > div > yt-formatted-string"
  );
  await randomPause();

  const uploadInput = page.locator("#content > input[type=file]");
  await uploadInput.setInputFiles(filePath);
  await randomPause();

  // Obter videoUrl
  const videoUrlSelector =
    ".ytcp-video-metadata-editor-sidepanel .ytcp-video-info > .ytcp-video-info > .ytcp-video-info > .ytcp-video-info.video-url-fadeable > a.ytcp-video-info";
  await page.waitForSelector(videoUrlSelector, { visible: true });
  const videoUrl = await page.$eval(videoUrlSelector, (el) => el.href);

  if (videoConfig.title) {
    await page.click("#basics.ytcp-video-metadata-editor #title-wrapper #textbox");
    await page.keyboard.press("Control+A");
    await page.keyboard.type(videoConfig.title);
    await randomPause();
  }

  if (videoConfig.description) {
    clipboardy.default.writeSync(videoConfig.description);
    await page.click("#basics.ytcp-video-metadata-editor #description-textarea #textbox");
    await page.keyboard.press("Control+A");
    await randomPause();
    await page.keyboard.press("Control+V");

    await randomPause();
  }

  if (videoConfig.playlist) {
    await page.click(
      "#scrollable-content .ytcp-video-metadata-editor-basics .dropdown-trigger-text"
    );
    await page.waitForSelector("#items .ytcp-checkbox-group .ytcp-checkbox-group .checkbox-label");

    const labels = await page.$$(
      "#items .ytcp-checkbox-group .ytcp-checkbox-group .checkbox-label"
    );
    let bestMatch = null;
    let bestScore = 0;

    for (const label of labels) {
      const text = await label.textContent();
      const score = similarity(text, videoConfig.playlist);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = label;
      }
    }

    if (bestMatch) {
      await bestMatch.click();
    }

    await page.click(
      "#dialog > div.action-buttons.style-scope.ytcp-playlist-dialog > ytcp-button.done-button.action-button.style-scope.ytcp-playlist-dialog > ytcp-button-shape > button"
    );
  }
  await randomPause();

  // IS FOR KIDS?
  await page.waitForSelector(
    "#audience > ytkc-made-for-kids-select > div.made-for-kids-rating-container.ytkc-made-for-kids-select .made-for-kids-group",
    { visible: true }
  );
  if (videoConfig.kids === true) {
    await page.click('[name="VIDEO_MADE_FOR_KIDS_MFK"]');
  } else {
    await page.click('[name="VIDEO_MADE_FOR_KIDS_NOT_MFK"]');
  }
  await randomPause();

  // Abrir botão de mais opções
  await page.click("#toggle-button > ytcp-button-shape > button[aria-label]");
  await randomPause();

  // TAGS
  if (videoConfig.tags && Array.isArray(videoConfig.tags)) {
    await page.waitForSelector("#chip-bar #text-input", { visible: true });
    const tagsString = videoConfig.tags.join(", ");
    await page.fill("#chip-bar #text-input", tagsString);
    await randomPause();
  }

  // ALERT SUBS
  await page.waitForSelector("#notify-subscribers", { visible: true });
  const notifySubscribersCheckbox = await page.$("#notify-subscribers");
  const isChecked = await notifySubscribersCheckbox.evaluate(
    (el) => el.getAttribute("aria-checked") === "true"
  );
  if (videoConfig.alertSubs === true && !isChecked) {
    await notifySubscribersCheckbox.click();
  } else if (videoConfig.alertSubs !== true && isChecked) {
    await notifySubscribersCheckbox.click();
  }
  await randomPause();

  if (videoConfig.gaming) {
    const gamingInput = await page.$(
      "#category-container > ytcp-form-gaming > ytcp-form-autocomplete > ytcp-dropdown-trigger > div > div.left-container.style-scope.ytcp-dropdown-trigger > input"
    );
    await randomPause();

    if (gamingInput) {
      await gamingInput.fill(videoConfig.gaming);
      await randomPause();
      const searchResultItem = await page.$("#search-results #paper-list #text-item-2");
      if (searchResultItem) {
        await searchResultItem.click();
      }
    } else {
      console.warn("O campo gamingInput não foi encontrado.");
    }
  }
  await randomPause();

  const uploading =
    "#dialog > div > ytcp-animatable.button-area.metadata-fade-in-section.style-scope.ytcp-uploads-dialog > div > div.left-button-area.style-scope.ytcp-uploads-dialog > ytcp-video-upload-progress";
  await page.waitForFunction((selector) => {
    const element = document.querySelector(selector);
    return !element.hasAttribute("uploading");
  }, uploading);

  for (let i = 0; i < 3; i++) {
    await page.click("#next-button > ytcp-button-shape > button");
    await randomPause();
  }

  const privacyOption = videoConfig.privacy || "UNLISTED";
  await page.click(`tp-yt-paper-radio-button[name="${privacyOption}"]`);
  await randomPause();

  // Fluxo de Comentários
  if (videoConfig.comments) {
    // Definir privacidade como UNLISTED
    await page.click(`tp-yt-paper-radio-button[name="UNLISTED"]`);
    await randomPause();
  } else {
    // Agendamento caso não haja comentários
    if (videoConfig.scheduleDate || videoConfig.scheduleTime) {
      await page.click("#select-button > tp-yt-iron-icon");
      await randomPause();

      if (videoConfig.scheduleDate) {
        await page.click("#second-container-expand-button > tp-yt-iron-icon");
        await randomPause();

        await page.click("#datepicker-trigger #right-icon");
        await randomPause();

        const youtubeDate = format(
          parse(videoConfig.scheduleDate, "dd/MM/yyyy", new Date()),
          /[a-zA-Z]/.test(inputDateValue)
            ? inputDateValue.includes("de")
              ? "d 'de' MMM. 'de' yyyy"
              : "MMM d, yyyy"
            : "dd/MM/yyyy",
          { locale: ptBR }
        );

        await page.fill(".ytcp-date-picker #textbox input", youtubeDate);
        await page.press(".ytcp-date-picker #textbox input", "Enter");
        await randomPause();
      }

      if (videoConfig.scheduleTime) {
        await page.fill("#time-of-day-container input", videoConfig.scheduleTime);
        await randomPause();
      }

      await page.click("#save-button button");
      await randomPause();
    }
  }

  await page.click('#done-button[role="button"]');
  await randomPause();

  // Obter shortUrl com espera adequada
  const shortUrlSelector = "a#share-url";
  await page.waitForSelector(shortUrlSelector, { visible: true, timeout: 3600000 });
  const shortUrl = await page.$eval(shortUrlSelector, (el) => el.href);

  if (videoConfig.comments) {
    // Executar fluxo de comentários
    await adicionarComentario(page, shortUrl, videoConfig.comments);
  }

  await page.click("#close-button button[aria-label]");
  await randomPause();

  return videoUrl;
}

async function adicionarComentario(page, videoUrl, comentario) {
  // Ir para a URL do vídeo
  await page.goto(videoUrl);
  await randomPause();

  // Clicar para abrir os comentários
  await page.click(
    "#comments-button > ytd-button-renderer > yt-button-shape > label > button > yt-touch-feedback-shape > div > div.yt-spec-touch-feedback-shape__fill"
  );
  await randomPause();

  // Clicar na caixa de entrada do comentário
  await page.click("#contenteditable-root");
  await randomPause();

  // Preencher o conteúdo do comentário
  await page.keyboard.type(comentario);
  await randomPause();

  // Postar o comentário
  await page.click("#submit-button > yt-button-shape > button");
  await randomPause();

  // Opcional: Fixar o comentário (se necessário)
  /*
  await page.click('#watch-while-engagement-panel #action-menu #top-level-buttons-computed + #flexible-item-buttons + .dropdown-trigger.style-scope.ytd-menu-renderer > button');
  await randomPause();
  await page.click('#items > ytd-menu-navigation-item-renderer.style-scope.ytd-menu-popup-renderer.iron-selected');
  await randomPause();
  */

  // Fechar a aba do vídeo
  const pageIndex = page.context().pages().indexOf(page);
  await page.close();
  await randomPause();
}

(async () => {
  const videosDir = "videos";
  const configData = JSON.parse(fs.readFileSync("videos.json"));

  let selectedAccount;
  if (argv.name) {
    selectedAccount = config.accounts.find((account) => account.name === argv.name);
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
    console.log(
      color(
        `Sessão para ${selectedAccount.name} não encontrada. Por favor, faça login primeiro.`,
        31
      )
    );
    process.exit(1);
  }

  const context = await chromium.launchPersistentContext(userDataDir, {
    headless: argv.headless,
    viewport: { width: 1152, height: 648 },
    userAgent: await getLatestUserAgent(),
    locale: "pt-BR",
    isMobile: false,
    hasTouch: false,
    javaScriptEnabled: true,
    ignoreHTTPSErrors: true,
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--window-position=0,0",
      "--ignore-certifcate-errors",
      "--ignore-certifcate-errors-spki-list",
    ],
  });

  const page = await context.newPage();

  for (const videoConfig of configData) {
    const videoFileName = path.parse(videoConfig.filename).name;
    const videoFiles = fs
      .readdirSync(videosDir)
      .filter((file) => path.parse(file).name === videoFileName);

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
      console.error(
        color(
          `Erro ao enviar o vídeo ${videoConfig.filename} para a conta ${selectedAccount.name}:`,
          31
        ),
        error
      );
    }
  }

  await context.close();
})();
