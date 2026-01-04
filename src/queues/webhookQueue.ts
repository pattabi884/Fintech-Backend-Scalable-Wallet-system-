import { Queue } from 'bullmq';
// 👇 FIX: Import 'redisConnection' instead of 'connection'
import { redisConnection } from '../config/redis.js'; 

export const webhookQueue = new Queue('webhook-queue', { 
  connection: redisConnection // 👈 Pass it here
});

export const addWebhookJob = async (data: any) => {
  await webhookQueue.add('send_webhook', data, {
    attempts: 3,
    backoff: { type: 'exponential', delay: 1000 },
  });
};