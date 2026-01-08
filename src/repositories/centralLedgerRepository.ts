import { centralDb } from '../config/db.js';
import { Ledger } from '@prisma/central-client'; 


export interface RecordLedgerInput {
  irn: string;
  amount: number;
  type: 'DEPOSIT' | 'WITHDRAWAL';
  shardId: number; 
  merchantId: number;
}

export const centralLedgerRepository = {
  
  recordTransaction: async (data: RecordLedgerInput): Promise<Ledger> => {
    return await centralDb.ledger.create({
      data: {
        irn: data.irn,
        amount: BigInt(data.amount), // Convert JS Number to Postgres BigInt
        type: data.type,
        shardId: data.shardId,
        merchantId: data.merchantId,
        timestamp: new Date()
      }
    });
  },

  
  getHistory: async (merchantId: number): Promise<Ledger[]> => {
    return await centralDb.ledger.findMany({
      where: { merchantId },
      orderBy: { timestamp: 'desc' },
      take: 50 // Pagination limit
    });
  }
};