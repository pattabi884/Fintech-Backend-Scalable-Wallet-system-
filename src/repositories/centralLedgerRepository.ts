import { centralDb } from '../config/db.js';

export const centralLedgerRepository = {
  recordTransaction: async (data: { irn: string; amount: number; type: string; shardId: number }) => {
    const { irn, amount, type, shardId } = data;

    // Execute both writes atomically
    await centralDb.$transaction([
      centralDb.allTransactions.create({
        data: {
          irn,
          amount,
          type,
          shardId
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
    
    return true;
  }
};