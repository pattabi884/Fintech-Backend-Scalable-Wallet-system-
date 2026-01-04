import crypto from 'crypto';
import { merchantRepository } from '../repositories/merchantRepository.js';
import { walletRepository } from '../repositories/walletRepository.js';
import { getShardIndex, getShardUrl } from '../utils/shardUtils.js';

export const transactionService = {
  /**
   * Deposits money into a merchant's wallet.
   * - Looks up the merchant to find their ID.
   * - Calculates which shard they are on.
   * - Executes the deposit on that specific shard.
   */
  deposit: async (email: string, amount: number) => {
    // 1. Validate Input
    if (amount <= 0) throw new Error("Deposit amount must be positive");

    // 2. Find Merchant (Central DB)
    // We need the ID to calculate the shard.
    const merchant = await merchantRepository.findByEmail(email);
    if (!merchant) throw new Error("Merchant not found");

    // 3. Calculate Shard
    const shardIndex = getShardIndex(merchant.id);
    const shardUrl = getShardUrl(shardIndex);

    // 4. Generate Idempotency Key (IRN)
    // This ensures that if the request retries, we can detect duplicates later.
    const irn = `DEP_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    console.log(`💸 Processing Deposit for Merchant ${merchant.id} on Shard ${shardIndex}`);

    // 5. Execute Deposit (Shard DB)
    // Connect to the correct shard
    const walletRepo = walletRepository(shardUrl);
    
    const result = await walletRepo.deposit(merchant.id, amount, irn);

    return {
      status: "Success",
      newBalance: result.txn.amount, // Or query wallet for total
      transactionId: result.txn.irn,
      timestamp: result.txn.createdAt
    };
  }
};