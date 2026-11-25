/** Server settings read from environment variables, with safe defaults for local play. */
export const config = {
  port: Number(process.env.PORT ?? 3001),
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
} as const;
