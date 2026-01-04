import { getShardDb } from '../config/db.js';

/**
 * Factory function to get a repository instance for a specific shard.
 * usage: const repo = walletRepository(shardUrl);
 * await repo.deposit(...);
 */
export const walletRepository = (shardUrl: string) => {
  // 1. Get the CACHED client (This is cheap, just a Map lookup)
  const shardClient = getShardDb(shardUrl);

  return {
    /**
     * Creates a new wallet.
     * No need to pass shardUrl again.
     */
    create: async (merchantId: number, vamId: string) => {
      return await shardClient.wallet.create({
        data: {
          merchantId,
          vamId,
          availableBalance: 0.00,
          mainBalance: 0.00,
        },
      });
    },

    /**
     * Adds money to a wallet.
     * Uses Batch Transaction for atomicity.
     */
    deposit: async (merchantId: number, amount: number, irn: string) => {
      // Prepare queries (Not executed yet)
      const updateBalance = shardClient.wallet.updateMany({
        where: { merchantId },
        data: {
          mainBalance: { increment: amount },
          availableBalance: { increment: amount },
        },
      });

      const createTransaction = shardClient.transaction.create({
        data: {
          amount,
          type: 'DEPOSIT',
          irn,
        },
      });

      const createLedger = shardClient.ledger.create({
        data: {
          amount,
          type: 'CREDIT',
          irn,
        },
      });

      // Execute Batch
      const [walletBatch, txn, ledger] = await shardClient.$transaction([
        updateBalance,
        createTransaction,
        createLedger
      ]);

      if (walletBatch.count === 0) {
        throw new Error(`Critical: Wallet for Merchant ${merchantId} not found on this shard.`);
      }

      return { txn, ledger };
    },

    /**
     * Finds wallet balance.
     */
    findByMerchantId: async (merchantId: number) => {
      return await shardClient.wallet.findFirst({
        where: { merchantId }
      });
    }
  };
};