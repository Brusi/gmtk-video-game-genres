const fs = require('fs');

function decodeHtml(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
}

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9'
        }
      });
      if (res.status === 200) {
        return await res.text();
      }
      console.warn(`Attempt ${attempt} returned status ${res.status} for ${url}`);
    } catch (err) {
      console.warn(`Attempt ${attempt} failed for ${url}: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, 1000 * attempt));
  }
  return null;
}

function parseGamesFromHtml(html, year) {
  const games = [];
  // Each card:
  // <a href="/games/slug/" class="cover-link" ...>
  // <img ... alt="Title" ... src="img_url">
  // <div class="game-text-centered">Title</div>
  
  // Card regex
  const cardRegex = /<div class="card mx-auto game-cover quick-access"\s+game_id="(\d+)"\s*>[\s\S]*?<a href="(\/games\/[^\/"]+\/)"[^>]*>[\s\S]*?<img class="card-img height"\s+src="([^"]+)"\s+alt="([^"]+)"[\s\S]*?<div class="game-text-centered">([^<]+)<\/div>/g;
  
  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    const gameId = parseInt(match[1]);
    const slug = match[2];
    const coverUrl = match[3];
    const altTitle = decodeHtml(match[4].trim());
    const displayTitle = decodeHtml(match[5].trim());
    
    games.push({
      year,
      id: gameId,
      title: displayTitle || altTitle,
      slug,
      coverUrl
    });
  }
  
  // Fallback regex if card structure varies slightly
  if (games.length === 0) {
    const fallbackRegex = /<a href="(\/games\/[^\/"]+\/)"[^>]*>[\s\S]*?<div class="game-text-centered">([^<]+)<\/div>/g;
    while ((match = fallbackRegex.exec(html)) !== null) {
      if (!match[1].includes('/games/lib/')) {
        games.push({
          year,
          title: decodeHtml(match[2].trim()),
          slug: match[1]
        });
      }
    }
  }

  return games;
}

async function scrapeAllYears() {
  const START_YEAR = 1975;
  const END_YEAR = 2025;
  const MAX_GAMES_PER_YEAR = 200;
  
  let allGamesByYear = {};
  if (fs.existsSync('backloggd_games_raw.json')) {
    try {
      allGamesByYear = JSON.parse(fs.readFileSync('backloggd_games_raw.json', 'utf8'));
      console.log('Loaded existing backloggd_games_raw.json with years:', Object.keys(allGamesByYear).length);
    } catch (e) {
      console.error('Error reading existing file:', e.message);
    }
  }
  
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    if (allGamesByYear[year] && allGamesByYear[year].length >= (year < 1980 ? 20 : 180)) {
      console.log(`Year ${year} already scraped (${allGamesByYear[year].length} games). Skipping.`);
      continue;
    }
    
    console.log(`\n--- Scraping Year ${year} ---`);
    const yearGames = [];
    let page = 1;
    
    while (yearGames.length < MAX_GAMES_PER_YEAR) {
      const url = page === 1 
        ? `https://backloggd.com/games/lib/popular/release_year:${year};category:main_game/`
        : `https://backloggd.com/games/lib/popular/release_year:${year};category:main_game/?page=${page}`;
      
      const html = await fetchWithRetry(url);
      if (!html) {
        console.error(`Failed to fetch page ${page} for year ${year}`);
        break;
      }
      
      const pageGames = parseGamesFromHtml(html, year);
      if (pageGames.length === 0) {
        console.log(`No more games found on page ${page} for year ${year}.`);
        break;
      }
      
      for (const g of pageGames) {
        if (!yearGames.some(existing => existing.slug === g.slug) && yearGames.length < MAX_GAMES_PER_YEAR) {
          g.rank = yearGames.length + 1;
          yearGames.push(g);
        }
      }
      
      console.log(`Year ${year} page ${page}: got ${pageGames.length} games (total so far: ${yearGames.length})`);
      
      // If fewer than 60 games were on the page, this was the last page
      if (pageGames.length < 60) break;
      
      page++;
      // Polite delay between requests
      await new Promise(r => setTimeout(r, 250));
    }
    
    allGamesByYear[year] = yearGames;
    console.log(`Finished year ${year}: ${yearGames.length} games.`);
    
    // Periodically save
    fs.writeFileSync('backloggd_games_raw.json', JSON.stringify(allGamesByYear, null, 2));
  }
  
  // Calculate total games
  let total = 0;
  for (const y in allGamesByYear) {
    total += allGamesByYear[y].length;
  }
  console.log(`\nScraping complete! Total games across all years: ${total}`);
  
  // Flatten array
  const flatGames = [];
  for (let year = START_YEAR; year <= END_YEAR; year++) {
    if (allGamesByYear[year]) {
      flatGames.push(...allGamesByYear[year]);
    }
  }
  fs.writeFileSync('all_games.json', JSON.stringify(flatGames, null, 2));
  console.log(`Saved ${flatGames.length} games to all_games.json`);
}

scrapeAllYears().catch(console.error);
