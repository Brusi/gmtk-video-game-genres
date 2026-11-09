const fs = require('fs');

async function fetchSources() {
  const url = 'https://gamemakerstoolkit.com/sources-the-history-of-every-video-game-genre/';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('Status:', res.status);
  const text = await res.text();
  fs.writeFileSync('gmtk_sources.html', text);
  console.log(`Saved sources HTML (${text.length} chars)`);
}

fetchSources().catch(console.error);
