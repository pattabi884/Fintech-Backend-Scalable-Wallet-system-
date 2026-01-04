import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { addTransactionJob } from '../queues/transactionQueue.js';
import { v4 as uuidv4 } from 'uuid';

export const transactionController = {
  deposit: asyncHandler(async (req: Request, res: Response) => {
    const { email, amount } = req.body;

    // 1. Basic Validation
    if (!email || !amount || amount <= 0) {
      throw new Error('Missing fields'); // Or custom validation error
    }

    // 2. Generate ID (Idempotency)
    const irn = uuidv4();

    // 3. Add to Redis Queue
    await addTransactionJob({
      type: 'DEPOSIT',
      email,
      amount,
      irn
    });

    // 4. Return Accepted (202)
    res.status(202).json({
      message: 'Transaction accepted for processing',
      status: 'PENDING',
      irn
    });
  })
};