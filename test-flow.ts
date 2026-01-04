import 'dotenv/config'; // Must be top
import { userService } from './src/services/userService.js';
import { transactionService } from './src/services/transactionService.js';

async function testShardingFlow() {
  try {
    // --- PART 1: REGISTRATION ---
    // (You can comment these out if Alice/Bob already exist to avoid "Unique constraint" errors)
    // OR just use a unique email every time you run it, like alice_TIMESTAMP@test.com
    
    const timestamp = Date.now();
    const email1 = `alice_${timestamp}@test.com`;
    const email2 = `bob_${timestamp}@test.com`;

    await userService.register(email1, "pass123");
    await userService.register(email2, "pass456");

    // --- PART 2: TRANSACTIONS ---
    
    // Deposit 100 into Alice's account (Shard ?)
    await transactionService.deposit(email1, 100.00);

    // Deposit 500 into Bob's account (Shard ?)
    await transactionService.deposit(email2, 500.00);

  } catch (error) {
    console.error("❌ Process Failed:", error);
  }
}

testShardingFlow();