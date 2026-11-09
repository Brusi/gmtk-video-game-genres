const { YoutubeTranscript } = require('youtube-transcript');
const fs = require('fs');

async function run() {
  try {
    const transcript = await YoutubeTranscript.fetchTranscript('Dbgdi7BzMR0');
    console.log('Fetched items:', transcript.length);
    fs.writeFileSync('transcript.json', JSON.stringify(transcript, null, 2));
    
    const lines = transcript.map(t => {
      const mins = Math.floor(t.offset / 60000);
      const secs = Math.floor((t.offset % 60000) / 1000);
      const ts = `[${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}]`;
      return `${ts} ${t.text}`;
    });
    fs.writeFileSync('transcript_with_timestamps.txt', lines.join('\n'));
    fs.writeFileSync('transcript_clean.txt', transcript.map(t => t.text).join(' '));
    console.log('Successfully saved transcripts!');
  } catch (err) {
    console.error('Error fetching transcript:', err);
  }
}

run();
