import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AppError } from '../utils/AppError.js'; // 👈 Import your new custom error class
import { addTransactionJob } from '../queues/transactionQueue.js';

export const transactionController = {
  /**
   * POST /api/transaction/deposit
   */
  deposit: asyncHandler(async (req: Request, res: Response) => {
    const { email, amount } = req.body;
    //INPUT VALIDATION
    if (!email || !amount) {
      throw new AppError('Missing required fields: email and amount', 400);
    }

    if (amount <= 0) {
      throw new AppError('Deposit amount must be a positive number', 400);
    }

   
    const irn = `DEP-${uuidv4()}`;

   
    await addTransactionJob({
      type: 'DEPOSIT',
      email,
      amount: Number(amount), 
      irn
    });

    console.log(` Controller: Received Deposit request ${irn} for ${email}`);

    res.status(202).json({
      status: 'PENDING',
      message: 'Transaction accepted for processing',
      data: {
        transactionId: irn,
        amount,
        recipient: email
      }
    });
  })
};