const fs = require('fs');

const transcript = fs.readFileSync('transcript_with_timestamps.txt', 'utf8').split('\n');

const stats = [];
for (let i = 0; i < transcript.length; i++) {
  const line = transcript[i];
  if (
    line.toLowerCase().includes('most popular') ||
    line.toLowerCase().includes('top 5') ||
    line.toLowerCase().includes('peaking in') ||
    line.toLowerCase().includes('in my dataset') ||
    line.toLowerCase().includes('graph') ||
    line.toLowerCase().includes('timeline') ||
    line.toLowerCase().includes('released in') ||
    line.toLowerCase().includes('percent') ||
    line.toLowerCase().includes('%')
  ) {
    stats.push(`Line ${i+1}: ${line}`);
  }
}

fs.writeFileSync('all_stats_lines.txt', stats.join('\n'));
console.log('Saved all stats lines:', stats.length);
