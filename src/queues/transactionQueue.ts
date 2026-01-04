import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

// Define strictly what data we accept in the job
interface TransactionJobData {
  type: 'DEPOSIT' | 'WITHDRAWAL';
  email: string; // We use email to lookup the user later
  amount: number;
  irn: string;   // We generate the Unique Ref Number BEFORE adding to queue
}

// 1. Initialize the Queue (The Mailbox)
export const transactionQueue = new Queue('transaction-queue', {
  connection: redisConnection
});

// 2. Helper to Add Jobs safely
export const addTransactionJob = async (data: TransactionJobData) => {
  const jobName = `${data.type}-${data.email}-${Date.now()}`;

  await transactionQueue.add(jobName, data, {
    // Retry Strategy (Crucial for robust systems)
    attempts: 3, 
    backoff: {
      type: 'exponential',
      delay: 1000, // Wait 1s, 2s, 4s...
    },
    // Cleanup
    removeOnComplete: true, // Don't fill Redis with old success logs
    removeOnFail: false     // Keep failed jobs for inspection
  });

  console.log(`📥 Queue: Added ${data.type} for ${data.email}`);
};