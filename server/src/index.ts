import { createServer } from 'node:http';
import { MAX_PLAYERS, MIN_PLAYERS } from '@drawtopia/shared';

const PORT = Number(process.env.PORT ?? 3001);

const httpServer = createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, players: { min: MIN_PLAYERS, max: MAX_PLAYERS } }));
    return;
  }
  res.writeHead(404).end();
});

httpServer.listen(PORT, () => {
  console.log(`DrawTopia server listening on http://localhost:${PORT}`);
});
