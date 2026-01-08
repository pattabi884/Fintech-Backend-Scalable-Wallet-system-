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
   
    if (amount <= 0) throw new Error("Deposit amount must be positive");

    
    const merchant = await merchantRepository.findByEmail(email);
    if (!merchant) throw new Error("Merchant not found");

   
    const shardIndex = getShardIndex(merchant.id);
    const shardUrl = getShardUrl(shardIndex);

    // This ensures that if the request retries, we can detect duplicates later.
    const irn = `DEP_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;

    console.log(`💸 Processing Deposit for Merchant ${merchant.id} on Shard ${shardIndex}`);

    
    const walletRepo = walletRepository(shardUrl);
    
    const result = await walletRepo.deposit(merchant.id, amount, irn);

    return {
      status: "Success",
      newBalance: result.txn.amount, 
      transactionId: result.txn.irn,
      timestamp: result.txn.createdAt
    };
  }
};