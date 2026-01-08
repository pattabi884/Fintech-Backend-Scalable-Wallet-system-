import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';

import { merchantRepository } from '../repositories/merchantRepository.js';
import { walletRepository } from '../repositories/walletRepository.js';
import { centralLedgerRepository } from '../repositories/centralLedgerRepository.js'; 
import { getShardIndex, getShardUrl } from '../utils/shardUtils.js';
import { addWebhookJob } from '../queues/webhookQueue.js';

const processTransaction = async (job: Job) => {
  const { email, amount, irn, type } = job.data;
  console.log(`⚙️ Worker: Processing ${type} for ${email} (Job ${job.id})`);

  // verify 
  const merchant = await merchantRepository.findByEmail(email);
  if (!merchant) throw new Error(`Merchant not found: ${email}`);

  // 2. Routing Logic
  const shardIndex = getShardIndex(merchant.id);
  const shardUrl = getShardUrl(shardIndex);
  
  //
  const walletRepo = walletRepository(shardUrl);
  if (type === 'DEPOSIT') {
    await walletRepo.deposit(merchant.id, amount, irn);
  }

  // 4. Reporting & Analytics (Central DB)
  
  await centralLedgerRepository.recordTransaction({
    irn,
    amount,
    type,
    shardId: shardIndex
  });
  console.log(`📊 Central Ledger Updated for ${irn}`);

  //  (Webhook)
  await addWebhookJob({
    merchantUrl: 'https://webhook.site/your-demo-url', 
    secret: 'my_super_secret_key',
    transactionData: {
      status: 'SUCCESS',
      type,
      amount,
      irn,
      timestamp: new Date().toISOString()
    }
  });

  console.log(`✅ Worker: Success! ${irn} processed on Shard ${shardIndex}`);
  return { status: 'COMPLETED', shard: shardIndex };
};

export const startTransactionWorker = () => {
  const worker = new Worker('transaction-queue', processTransaction, {
    connection: redisConnection,
    concurrency: 5 
  });

  worker.on('completed', (job: Job) => {
    console.log(`🎉 Job ${job.id} completed`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`❌ Job ${job?.id} failed: ${err.message}`);
  });

  console.log('🚀 Transaction Worker Started...');
};