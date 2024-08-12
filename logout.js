const fs = require('fs');
const path = require('path');

(async () => {
  const sessionPath = path.resolve('./my-session');
  
  // Verifica se a pasta existe e a remove
  if (fs.existsSync(sessionPath)) {
    fs.rmSync(sessionPath, { recursive: true, force: true });
    console.log('Sessão removida com sucesso.');
  } else {
    console.log('Nenhuma sessão encontrada.');
  }
})();