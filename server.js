import 'dotenv/config';
import express from 'express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 8555;

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Inline the API handler (mirrors api/chat.js)
app.post('/api/chat', async (req, res) => {
  const handler = (await import('./api/chat.js')).default;
  await handler(req, res);
});

app.post('/api/tts', async (req, res) => {
  const handler = (await import('./api/tts.js')).default;
  await handler(req, res);
});

app.listen(PORT, () => {
  console.log(`CosmoBot running at http://localhost:${PORT}`);
});
