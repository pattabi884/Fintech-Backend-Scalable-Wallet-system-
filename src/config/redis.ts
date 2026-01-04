import 'dotenv/config';
import { ConnectionOptions } from 'bullmq';

// Standard Redis Connection settings
// If you are using Docker, host might be 'redis' instead of 'localhost'
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || 'localhost', 
  port: parseInt(process.env.REDIS_PORT || '6379'),
};