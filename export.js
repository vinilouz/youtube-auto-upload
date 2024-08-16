const fs = require('fs');

// Função para ler o conteúdo de um arquivo
function lerArquivo(nomeDoArquivo) {
  return new Promise((resolve, reject) => {
    fs.readFile(nomeDoArquivo, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

// Lista de arquivos a serem lidos
const arquivos = [
  './functions/login.js',
  './functions/manual_login.js',
  './functions/upload.js',
  './functions/utils.js',
  './functions/videos.js',
  'config.example.js',
  'package.json',
  'videos.example.json',
];

// Lê cada arquivo e imprime o conteúdo no console
async function lerTodosArquivos() {
  let conteudoTotal = '';
  for (const arquivo of arquivos) {
    try {
      const conteudo = await lerArquivo(arquivo);
      conteudoTotal += `// ${arquivo}\n${conteudo}\n// fim do arquivo\n\n`;
    } catch (err) {
      console.error(`Erro ao ler o arquivo ${arquivo}:`, err);
    }
  }
  return conteudoTotal;
}

// Chama a função para ler todos os arquivos e escreve em um arquivo
async function exportarParaArquivo() {
  try {
    const conteudoTotal = await lerTodosArquivos();
    fs.writeFileSync('arquivos_combinados.txt', conteudoTotal);
    console.info('Arquivos combinados exportados para arquivos_combinados.txt');
  } catch (err) {
    console.error('Erro ao exportar para arquivo:', err);
  }
}

// Chama a função para exportar para arquivo
exportarParaArquivo();
