import express from 'express';
import 'dotenv/config';

// Import Routes
import merchantRoutes from './routes/merchantRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Import Middleware
import { globalErrorHandler } from './middlewares/globalErrorHandler.js';

// Import Workers
import { startTransactionWorker } from './workers/transactionWorker.js';
// import { startWebhookWorker } from './workers/webhookWorker.js'; // (Uncomment if you implemented the webhook worker)

const app = express();
app.use(express.json());

// --- ROUTES ---
app.use('/api/merchant', merchantRoutes);
app.use('/api/transaction', transactionRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: '✅ System Online' });
});

// --- GLOBAL ERROR HANDLER (Must be last) ---
app.use(globalErrorHandler);

// --- START WORKERS ---
startTransactionWorker();
// startWebhookWorker();

// --- START SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Endpoints ready at http://localhost:${PORT}/api`);
});