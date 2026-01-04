import { Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { merchantRepository } from '../repositories/merchantRepository.js';
import { walletRepository } from '../repositories/walletRepository.js';
import { getShardIndex, getShardUrl } from '../utils/shardUtils.js';
import { addWebhookJob } from '../queues/webhookQueue.js';
import { centralDb } from '../config/db.js'; // Import Central DB connection

// This is the function that actually DOES the work
const processTransaction = async (job: Job) => {
  const { email, amount, irn, type } = job.data;
  console.log(`⚙️ Worker: Processing ${type} for ${email} (Job ${job.id})`);

  // --- STEP 1: IDENTITY CHECK (Central DB) ---
  const merchant = await merchantRepository.findByEmail(email);
  if (!merchant) {
    throw new Error(`Merchant not found: ${email}`);
  }

  // --- STEP 2: ROUTING (Logic) ---
  const shardIndex = getShardIndex(merchant.id);
  const shardUrl = getShardUrl(shardIndex);
  
  // --- STEP 3: FINANCIAL EXECUTION (Shard DB) ---
  const walletRepo = walletRepository(shardUrl);

  if (type === 'DEPOSIT') {
    // This atomic transaction updates Wallet AND creates Shard Transaction
    await walletRepo.deposit(merchant.id, amount, irn);
  }
  // Add 'WITHDRAW' logic here later if needed

  // --- STEP 4: REPORTING & ANALYTICS (Central DB) ---
  // We sync the data back to Central so the admin dashboard works.
  // We use a transaction to ensure both tables update or neither does.
  await centralDb.$transaction([
    centralDb.allTransactions.create({
      data: {
        irn,
        amount,
        type,
        shardId: shardIndex
      }
    }),
    centralDb.allLedger.create({
      data: {
        irn,
        amount,
        type
      }
    })
  ]);
  console.log(`📊 Central Ledger Updated for ${irn}`);

  // --- STEP 5: NOTIFICATIONS (Webhook) ---
  await addWebhookJob({
    merchantUrl: 'https://webhook.site/your-demo-url', // In real app, fetch from merchant profile
    secret: 'my_super_secret_key',
    transactionData: {
      status: 'SUCCESS',
      type,
      amount,
      irn,
      timestamp: new Date().toISOString()
    }
  });
  console.log(`🪝 Webhook Job added for ${irn}`);

  console.log(`✅ Worker: Success! ${irn} processed on Shard ${shardIndex}`);
  return { status: 'COMPLETED', shard: shardIndex };
};

// Initialize the Worker Listener
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