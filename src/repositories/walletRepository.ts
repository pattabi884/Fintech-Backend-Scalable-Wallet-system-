import { getShardDb } from '../config/db.js';
import { AppError } from '../utils/AppError.js';

import { Wallet, Transaction } from '@prisma/shard-client';


interface DepositResult {
  txn: Transaction;
  wallet: Wallet;
}

export const walletRepository = (shardUrl: string) => {
  const prisma = getShardDb(shardUrl);

  return {
   
    find: async (merchantId: number): Promise<Wallet | null> => {
      return prisma.wallet.findUnique({
        where: { merchantId }
      });
    },

    deposit: async (merchantId: number, amount: number, irn: string): Promise<DepositResult> => {
      try {
        
        return await prisma.$transaction(async (tx): Promise<DepositResult> => {
          
          const transactionRecord = await tx.transaction.create({
            data: {
              irn,
              amount: BigInt(amount),
              type: 'DEPOSIT',
              wallet: {
                connect: { merchantId }
              }
            }
          });

          const updatedWallet = await tx.wallet.update({
            where: { merchantId },
            data: {
              balance: {
                increment: BigInt(amount)
              }
            }
          });

          return { txn: transactionRecord, wallet: updatedWallet };
        });

      } catch (error: any) {
        if (error.code === 'P2002') {
          console.warn(`Idempotency Hit: Transaction ${irn} already exists.`);
          throw new AppError('Transaction already processed (Idempotent)', 409);
        }
        throw error;
      }
    }
  };
};