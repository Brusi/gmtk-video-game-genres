const fs = require('fs');

const master = JSON.parse(fs.readFileSync('games_master.json', 'utf8'));
const counts = JSON.parse(fs.readFileSync('genre_yearly_counts.json', 'utf8'));
const summary = JSON.parse(fs.readFileSync('genre_summary.json', 'utf8'));
const chapters = JSON.parse(fs.readFileSync('chapter_breakdown.json', 'utf8'));

// Prepare web data directory
if (!fs.existsSync('docs')) fs.mkdirSync('docs');
if (!fs.existsSync('docs/data')) fs.mkdirSync('docs/data');

// Add chapter transcript context to each genre in summary
summary.forEach(g => {
  // Find matching chapter in video
  const matchedChapter = chapters.find(c => 
    c.title.toLowerCase().includes(g.genre.toLowerCase()) ||
    g.genre.toLowerCase().includes(c.title.toLowerCase())
  );
  if (matchedChapter) {
    g.videoTimestamp = matchedChapter.time;
    // Extract a 1-2 sentence excerpt from the transcript
    const text = matchedChapter.fullText;
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [];
    const keySentence = sentences.find(s => 
      s.includes('genre') || s.includes('dataset') || s.includes('popular') || s.length > 50
    );
    g.commentary = keySentence ? keySentence.trim() : sentences.slice(0, 2).join(' ').trim();
  } else {
    g.videoTimestamp = null;
    g.commentary = `Tracked across 50 years of gaming history from 1975 to 2025.`;
  }
});

fs.writeFileSync('docs/data/genre_summary.json', JSON.stringify(summary));
fs.writeFileSync('docs/data/genre_yearly_counts.json', JSON.stringify(counts));

// Minified games array for fast client loading:
// [year, rank, title, genres, slug, coverUrl]
const compactGames = master.map(g => ({
  y: g.year,
  r: g.rank,
  t: g.title,
  g: g.genres,
  s: g.slug,
  c: g.coverUrl ? g.coverUrl.replace('https://images.igdb.com/igdb/image/upload/t_cover_big/', '') : ''
}));

fs.writeFileSync('docs/data/games_compact.json', JSON.stringify(compactGames));

// Also group games by genre and by year for instant zero-latency lookups
const gamesByGenreYear = {};
for (const g of master) {
  for (const genre of g.genres) {
    if (!gamesByGenreYear[genre]) gamesByGenreYear[genre] = {};
    if (!gamesByGenreYear[genre][g.year]) gamesByGenreYear[genre][g.year] = [];
    gamesByGenreYear[genre][g.year].push({
      t: g.title,
      r: g.rank,
      s: g.slug,
      c: g.coverUrl ? g.coverUrl.replace('https://images.igdb.com/igdb/image/upload/t_cover_big/', '') : ''
    });
  }
}

fs.writeFileSync('docs/data/games_by_genre_year.json', JSON.stringify(gamesByGenreYear));

console.log('Saved web data files to docs/data:');
console.log('genre_summary.json:', (fs.statSync('docs/data/genre_summary.json').size / 1024).toFixed(1), 'KB');
console.log('genre_yearly_counts.json:', (fs.statSync('docs/data/genre_yearly_counts.json').size / 1024).toFixed(1), 'KB');
console.log('games_compact.json:', (fs.statSync('docs/data/games_compact.json').size / 1024).toFixed(1), 'KB');
console.log('games_by_genre_year.json:', (fs.statSync('docs/data/games_by_genre_year.json').size / 1024).toFixed(1), 'KB');
