const fs = require('fs');
const { classifyGenre } = require('./genre_taxonomy');

function parseRawWikiGenre(rawWikitext) {
  if (!rawWikitext) return [];
  let text = rawWikitext.replace(/<!--[\s\S]*?-->/g, '');
  text = text.replace(/<ref\b[^<]*(?:(?!<\/ref>)<[^<]*)*<\/ref>/gi, '');
  text = text.replace(/<ref[^>]*\/>/gi, '');

  const extracted = [];
  const linkRegex = /\[\[(?:([^\|\]]+)\|)?([^\]]+)\]\]/g;
  let match;
  while ((match = linkRegex.exec(text)) !== null) {
    const target = match[1] ? match[1].trim() : match[2].trim();
    const anchor = match[2].trim();
    extracted.push({ target, anchor, text: `${target} ${anchor}` });
  }
  
  if (extracted.length > 0) {
    return extracted;
  }
  
  text = text.replace(/\{\{(?:hlist|ubl|plainlist|flatlist|unbulleted list)\s*\|?/gi, '\n');
  text = text.replace(/\}\}/g, '\n');
  const items = text.split(/(?:<br\s*\/?>|\n|\||\/|,)/i);
  for (let it of items) {
    it = it.replace(/^[*\s•-]+/, '').replace(/<[^>]+>/g, '').trim();
    if (it && !it.startsWith('{{') && !it.startsWith('}}') && it.length > 1) {
      extracted.push({ target: it, anchor: it, text: it });
    }
  }
  return extracted;
}

async function fetchWikiBatch(titles) {
  const titlesParam = titles.map(t => t.trim()).join('|');
  const url = `https://en.wikipedia.org/w/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&rvsection=0&format=json&redirects=1&titles=${encodeURIComponent(titlesParam)}`;
  
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'GMTKHistoryDatasetBot/1.0 (contact: gmtk_history@example.com)'
      }
    });
    if (res.status === 200) {
      return await res.json();
    }
  } catch (err) {
    console.warn(`Error fetching wiki batch: ${err.message}`);
  }
  return null;
}

async function searchWikiSingle(title, year) {
  const query = `${title} ${year} video game`;
  const url = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&srlimit=1&format=json`;
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'GMTKHistoryDatasetBot/1.0 (contact: gmtk_history@example.com)' }
    });
    if (res.status === 200) {
      const data = await res.json();
      const firstHit = data.query?.search?.[0];
      if (firstHit) {
        return firstHit.title;
      }
    }
  } catch (e) {}
  return null;
}

async function main() {
  if (!fs.existsSync('all_games.json')) {
    console.error('all_games.json not found yet.');
    return;
  }
  
  const allGames = JSON.parse(fs.readFileSync('all_games.json', 'utf8'));
  console.log(`Loaded ${allGames.length} games from all_games.json`);

  let cache = {};
  if (fs.existsSync('wiki_cache.json')) {
    try {
      cache = JSON.parse(fs.readFileSync('wiki_cache.json', 'utf8'));
      console.log(`Loaded ${Object.keys(cache).length} cached Wikipedia entries.`);
    } catch (e) {}
  }

  // Find unique titles
  const uniqueTitles = [...new Set(allGames.map(g => g.title))];
  console.log(`Total unique game titles to lookup: ${uniqueTitles.length}`);
  
  const missingTitles = uniqueTitles.filter(t => !cache[t]);
  console.log(`Titles still needing lookup: ${missingTitles.length}`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < missingTitles.length; i += BATCH_SIZE) {
    const batch = missingTitles.slice(i, i + BATCH_SIZE);
    const data = await fetchWikiBatch(batch);
    
    // Map normalized and redirected titles
    const normalizedMap = {};
    if (data?.query?.normalized) {
      for (const n of data.query.normalized) {
        normalizedMap[n.to] = n.from;
      }
    }
    const redirectsMap = {};
    if (data?.query?.redirects) {
      for (const r of data.query.redirects) {
        redirectsMap[r.to] = r.from;
      }
    }

    const pages = data?.query?.pages || {};

    for (const pageId in pages) {
      const page = pages[pageId];
      let origTitle = page.title;
      if (redirectsMap[origTitle]) origTitle = redirectsMap[origTitle];
      if (normalizedMap[origTitle]) origTitle = normalizedMap[origTitle];
      
      const matchedBatchTitle = batch.find(b => b.toLowerCase() === origTitle.toLowerCase()) || origTitle;

      if (page.missing) {
        cache[matchedBatchTitle] = { found: false, rawGenre: '', genres: [] };
        continue;
      }

      const content = page.revisions?.[0]?.slots?.main?.['*'] || '';
      const genreMatch = content.match(/\|\s*genre\s*=\s*([^\n|]+(?:\n[^\n|]+)*)/i);
      const rawGenre = genreMatch ? genreMatch[1].trim() : '';
      
      const parsedElements = parseRawWikiGenre(rawGenre);
      const genreTokens = parsedElements.map(e => e.text).join(' ');
      const classified = classifyGenre(genreTokens || rawGenre);
      
      cache[matchedBatchTitle] = {
        found: true,
        wikiTitle: page.title,
        rawGenre,
        genres: classified
      };
    }

    for (const b of batch) {
      if (!cache[b]) {
        cache[b] = { found: false, rawGenre: '', genres: [] };
      }
    }

    if ((i / BATCH_SIZE) % 5 === 0 || i + BATCH_SIZE >= missingTitles.length) {
      console.log(`Processed ${Math.min(i + BATCH_SIZE, missingTitles.length)} / ${missingTitles.length} titles...`);
      fs.writeFileSync('wiki_cache.json', JSON.stringify(cache, null, 2));
    }
    
    await new Promise(r => setTimeout(r, 100));
  }

  fs.writeFileSync('wiki_cache.json', JSON.stringify(cache, null, 2));
  console.log('Saved wiki_cache.json');

  // Secondary pass: for games with missing or empty genre, try appending " (video game)"
  const emptyTitles = uniqueTitles.filter(t => !cache[t]?.found || cache[t]?.genres?.length === 0);
  console.log(`Titles needing disambiguation (empty or missing): ${emptyTitles.length}`);
  
  const disambigBatch = emptyTitles.map(t => `${t} (video game)`);
  for (let i = 0; i < disambigBatch.length; i += BATCH_SIZE) {
    const batch = disambigBatch.slice(i, i + BATCH_SIZE);
    const origSubBatch = emptyTitles.slice(i, i + BATCH_SIZE);
    const data = await fetchWikiBatch(batch);
    const pages = data?.query?.pages || {};

    for (const pageId in pages) {
      const page = pages[pageId];
      if (page.missing) continue;
      
      const content = page.revisions?.[0]?.slots?.main?.['*'] || '';
      const genreMatch = content.match(/\|\s*genre\s*=\s*([^\n|]+(?:\n[^\n|]+)*)/i);
      if (genreMatch) {
        const rawGenre = genreMatch[1].trim();
        const parsedElements = parseRawWikiGenre(rawGenre);
        const genreTokens = parsedElements.map(e => e.text).join(' ');
        const classified = classifyGenre(genreTokens || rawGenre);
        
        // Find which original title this corresponds to
        const cleanTitle = page.title.replace(/\s*\(video game\)/i, '');
        const matchedOrig = origSubBatch.find(o => o.toLowerCase() === cleanTitle.toLowerCase()) || cleanTitle;
        if (classified.length > 0) {
          cache[matchedOrig] = {
            found: true,
            wikiTitle: page.title,
            rawGenre,
            genres: classified
          };
        }
      }
    }
    
    if ((i / BATCH_SIZE) % 10 === 0) {
      console.log(`Disambiguated ${Math.min(i + BATCH_SIZE, disambigBatch.length)} / ${disambigBatch.length}...`);
    }
    await new Promise(r => setTimeout(r, 100));
  }
  
  fs.writeFileSync('wiki_cache.json', JSON.stringify(cache, null, 2));
  console.log('Saved updated wiki_cache.json');

  // Assemble master dataset!
  console.log('\nAssembling master dataset...');
  const gamesWithGenres = allGames.map(g => {
    const wiki = cache[g.title] || { genres: [] };
    return {
      id: g.id,
      year: g.year,
      rank: g.rank,
      title: g.title,
      slug: g.slug,
      coverUrl: g.coverUrl,
      wikiTitle: wiki.wikiTitle || null,
      rawGenre: wiki.rawGenre || '',
      genres: wiki.genres || []
    };
  });

  fs.writeFileSync('games_master.json', JSON.stringify(gamesWithGenres, null, 2));
  console.log(`Saved games_master.json (${gamesWithGenres.length} games)`);

  // Compute yearly genre counts
  const yearlyCounts = {};
  for (let y = 1975; y <= 2025; y++) {
    yearlyCounts[y] = {};
  }

  let totalCategorized = 0;
  gamesWithGenres.forEach(game => {
    const y = game.year;
    if (game.genres.length > 0) totalCategorized++;
    for (const genre of game.genres) {
      yearlyCounts[y][genre] = (yearlyCounts[y][genre] || 0) + 1;
    }
  });

  console.log(`Categorized games: ${totalCategorized} / ${gamesWithGenres.length} (${((totalCategorized/gamesWithGenres.length)*100).toFixed(1)}%)`);

  fs.writeFileSync('genre_yearly_counts.json', JSON.stringify(yearlyCounts, null, 2));
  console.log('Saved genre_yearly_counts.json');

  // Genre Summary
  const allCanonicalGenres = [...new Set(gamesWithGenres.flatMap(g => g.genres))].sort();
  const genreSummary = allCanonicalGenres.map(genre => {
    let total = 0;
    let peakYear = 1975;
    let peakCount = 0;
    const history = {};

    for (let y = 1975; y <= 2025; y++) {
      const count = yearlyCounts[y][genre] || 0;
      history[y] = count;
      total += count;
      if (count > peakCount) {
        peakCount = count;
        peakYear = y;
      }
    }

    return {
      genre,
      totalGames: total,
      peakYear,
      peakCount,
      history
    };
  }).sort((a, b) => b.totalGames - a.totalGames);

  fs.writeFileSync('genre_summary.json', JSON.stringify(genreSummary, null, 2));
  console.log(`Saved genre_summary.json with ${genreSummary.length} genres.`);
  
  console.log('\nTop 20 genres by total game count:');
  genreSummary.slice(0, 20).forEach((g, idx) => {
    console.log(`${idx + 1}. ${g.genre}: ${g.totalGames} games (Peak: ${g.peakYear} with ${g.peakCount})`);
  });
}

main().catch(console.error);
