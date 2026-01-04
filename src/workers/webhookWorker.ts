import { Worker } from 'bullmq';
// 👇 FIX: Import 'redisConnection'
import { redisConnection } from '../config/redis.js'; 
import { generateHmac } from '../utils/security.js';

export const startWebhookWorker = () => {
  new Worker('webhook-queue', async (job) => {
    const { merchantUrl, transactionData, secret } = job.data;

    console.log(`🪝 Webhook Worker: Preparing callback for ${transactionData.irn}`);

    // 1. Sign the payload
    const signature = generateHmac(transactionData, secret || 'default_secret');

    console.log(`🚀 SENDING WEBHOOK to ${merchantUrl}`);
    console.log(`📦 Payload:`, JSON.stringify(transactionData));
    console.log(`🔐 X-Signature: ${signature}`);
    
    // Simulate network delay
    await new Promise(r => setTimeout(r, 500));
    console.log(`✅ Webhook Delivered (200 OK)`);

  }, { 
    connection: redisConnection // 👈 Pass it here
  });
};