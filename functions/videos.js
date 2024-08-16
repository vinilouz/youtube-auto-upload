const fs = require('fs');
const { color } = require('./utils');

const videosDirectory = './videos';
const outputFilename = 'videos.json';

function createVideoObject(filename) {
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return {
    filename,
    scheduleDate: `${day}/${month}/${year}`,
    privacy: 'UNLISTED'
  };
}

try {
  const files = fs.readdirSync(videosDirectory);
  const videoFiles = files.map(file => createVideoObject(file));
  fs.writeFileSync(outputFilename, JSON.stringify(videoFiles, null, 2));
  console.log(color('Arquivo de videos gerado com sucesso: ', 32) + color(outputFilename, 35));
} catch (error) {
  console.error('Erro ao gerar o arquivo JSON:', error);
}