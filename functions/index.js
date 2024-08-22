document.getElementById('videoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const files = document.getElementById('videoFiles').files;
  const title = document.getElementById('title').value;
  const description = document.getElementById('description').value;
  const tags = document.getElementById('tags').value.split(',').map(tag => tag.trim());

  function createVideoObject(filename, index) {
      const today = new Date();
      today.setDate(today.getDate() + 1 + index);
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return {
          filename: `videos/${filename}`,
          scheduleDate: `${day}/${month}/${year}`,
          title,
          description,
          tags
      };
  }

  const videoFiles = Array.from(files).map((file, index) => createVideoObject(file.name, index));
  const jsonContent = JSON.stringify(videoFiles, null, 2);

  const blob = new Blob([jsonContent], { type: 'application/json' });

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'videos.json';

  a.click();

  // Limpar o objeto URL
  URL.revokeObjectURL(a.href);

  alert('Arquivo videos.json gerado e baixado com sucesso!');
});