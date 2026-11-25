import { config } from './config';
import { createGameServer } from './createGameServer';

const server = createGameServer({ corsOrigin: config.corsOrigin });

server.httpServer.listen(config.port, () => {
  console.info(`DrawTopia server listening on http://localhost:${config.port}`);
});

const shutdown = (signal: string) => {
  console.info(`${signal} received, closing server`);
  server.close().then(
    () => process.exit(0),
    () => process.exit(1),
  );
};
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
