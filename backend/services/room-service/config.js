import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT) || 9001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
};
