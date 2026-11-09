const fs = require('fs');

async function compare() {
  const res1 = await fetch('https://backloggd.com/games/lib/popular/release_year:2002/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html1 = await res1.text();
  const games1 = [...html1.matchAll(/class="game-text-centered">([^<]+)<\/div>/g)].map(m => m[1]);
  
  const res2 = await fetch('https://backloggd.com/games/lib/popular/release_year:2002;category:main_game/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
  });
  const html2 = await res2.text();
  const games2 = [...html2.matchAll(/class="game-text-centered">([^<]+)<\/div>/g)].map(m => m[1]);
  
  console.log('Default games count:', games1.length);
  console.log('main_game count:', games2.length);
  console.log('Default top 15:', games1.slice(0, 15));
  console.log('main_game top 15:', games2.slice(0, 15));
  
  // Notice in Default top 15 earlier:
  // 'The Legend of Zelda: A Link to the Past' (port from 1991), 'Sonic Mega Collection' (compilation), 'Kingdom Hearts Final Mix' (remaster)
  const diff = games1.filter(g => !games2.includes(g));
  console.log('Games removed by main_game filter:', diff);
}

compare().catch(console.error);
