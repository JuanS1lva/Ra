import { validateEnv } from './env.schema';

const configuration = () => {
  const env = validateEnv(process.env);

  return {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    databaseUrl: env.DATABASE_URL,
    redisUrl: env.REDIS_URL,
    corsOrigins: env.CORS_ORIGINS,
  };
};

export type AppConfig = ReturnType<typeof configuration>;

export default configuration;
