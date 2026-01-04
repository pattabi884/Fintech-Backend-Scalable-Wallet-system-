import crypto from 'crypto'; // Native Node.js module (no install needed)
import { merchantRepository } from '../repositories/merchantRepository.js';
import { walletRepository } from '../repositories/walletRepository.js';
import { getShardIndex, getShardUrl } from '../utils/shardUtils.js';

export const merchantService = {
  /**
   * Onboards a new merchant.
   * - Generates a secure VAM ID.
   * - Hashes the password.
   * - Creates the user in Central DB.
   * - Creates the wallet in the correct Shard DB.
   */
  onboard: async (name: string, email: string, phone: string) => {
    console.log(`\n--- Starting Onboarding for ${name} ---`);

    // 1. Generate Business Logic Data
    // We generate the VAM ID programmatically (e.g., VAM_8f3a...)
    const vamId = `VAM_${crypto.randomBytes(4).toString('hex')}`;
    
    // Simple hashing for now (In production, use bcrypt/argon2)
    const hashedPassword = crypto.createHash('sha256').update("default_password").digest('hex');

    // 2. Create Identity (Central DB)
    // If this fails (e.g. email exists), it throws immediately.
    const merchant = await merchantRepository.create({
      name,
      email,
      phone,
      vamId,
      hashedPassword
    });

    console.log(`✅ Central: Identity created (ID: ${merchant.id})`);

    // 3. Determine Shard Location
    // This is purely mathematical (ID % N), no DB call needed.
    const shardIndex = getShardIndex(merchant.id);
    const shardUrl = getShardUrl(shardIndex);

    console.log(`📍 Routing: Assigned to Shard ${shardIndex}`);

    // 4. Create Wallet (Shard DB)
    // We initialize the repo with the specific URL we just calculated.
    const walletRepo = walletRepository(shardUrl);
    
    // Use the VAM from the merchant object to ensure consistency
    // Note: merchant.vams is an array, we take the first one
    const wallet = await walletRepo.create(merchant.id, merchant.vams[0].vamId);

    console.log(`✅ Shard ${shardIndex}: Wallet created`);

    // 5. Return clean object (hide internal IDs if needed)
    return {
      merchantId: merchant.id,
      name: merchant.name,
      vamId: merchant.vams[0].vamId,
      shardAssigned: shardIndex,
      walletStatus: "Active"
    };
  }
};