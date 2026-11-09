const fs = require('fs');

const lines = fs.readFileSync('transcript_with_timestamps.txt', 'utf8').split('\n');

const keywords = [
  'genre', 'sub-genre', 'subgenre', 'graph', 'timeline', 'my dataset',
  'most popular', 'top 5', 'released each year', 'act '
];

console.log('Total lines:', lines.length);

// Find headers / topic transitions
const matches = [];
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (keywords.some(k => line.toLowerCase().includes(k))) {
    matches.push({ lineNum: i + 1, text: line });
  }
}

console.log(`Found ${matches.length} matching lines.`);
fs.writeFileSync('genre_mentions.txt', matches.map(m => `Line ${m.lineNum}: ${m.text}`).join('\n'));
