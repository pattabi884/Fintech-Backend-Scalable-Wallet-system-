import { Router } from 'express';
import { transactionController } from '../controllers/transactionController.js';

const router = Router();

// POST /api/transaction/deposit
router.post('/deposit', transactionController.deposit);

export default router;