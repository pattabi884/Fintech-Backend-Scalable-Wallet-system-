import { Request, Response } from 'express';
import { centralDb, getShardDb } from '../config/db.js';
import { getShardIndex, getShardUrl } from '../utils/shardUtils.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const merchantController = {
  onboard: asyncHandler(async (req: Request, res: Response) => {
    const { name, email, phoneNo, password, vamId } = req.body;

    // 1. Validate Input
    if (!email || !name) {
      throw new Error('Missing fields'); // Passed to globalErrorHandler
    }

    // 2. Create Identity in CENTRAL DB
    console.log('👤 Creating Merchant Identity...');
    const newMerchant = await centralDb.merchant.create({
      data: {
        name,
        email,
        phoneNo: phoneNo || '0000000000',
        vams: {
          create: {
            vamId: vamId || `VAM_${Date.now()}`,
            pwd: password || 'default_pass'
          }
        }
      },
      include: { vams: true }
    });

    const generatedVamId = newMerchant.vams[0].vamId;

    // 3. Sharding Logic
    const shardIndex = getShardIndex(newMerchant.id);
    console.log(`🧮 Sharding: Merchant ${newMerchant.id} assigned to Shard ${shardIndex}`);

    // 4. Connect to Shard
    const shardUrl = getShardUrl(shardIndex);
    const shardClient = getShardDb(shardUrl);

    // 5. Create Wallet
    console.log(`🏦 Opening Wallet on Shard ${shardIndex}...`);
    await shardClient.wallet.create({
      data: {
        merchantId: newMerchant.id,
        vamId: generatedVamId,
        availableBalance: 0,
        mainBalance: 0
      }
    });

    // 6. Success
    res.status(201).json({
      message: 'Onboarding Successful',
      merchantId: newMerchant.id,
      assignedShard: shardIndex,
      email: newMerchant.email
    });
  })
};