import { Router } from 'express';
import { merchantController } from '../controllers/merchantController.js';

const router = Router();

// POST /api/merchant/onboard
router.post('/onboard', merchantController.onboard);

export default router;