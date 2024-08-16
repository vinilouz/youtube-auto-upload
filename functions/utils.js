const UserAgent = require('user-agents');

async function getLatestUserAgent() {
  const userAgent = new UserAgent({ deviceCategory: 'desktop', platform: 'Win32' });
  return userAgent.toString();
}

function color(text, colorCode) {
  return '\x1b[' + colorCode + 'm' + text + '\x1b[0m';
}

function randomPause() {
  const min = 500; // 0.5 segundos
  const max = 1200; // 1.2 segundos
  const randomTime = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, randomTime));
}

const rootPath = process.cwd();

module.exports = {
  getLatestUserAgent,
  randomPause,
  color,
  rootPath
};