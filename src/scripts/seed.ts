// src/scripts/seed.ts
import { centralDb } from '../config/db.js';

const main = async () => {
  console.log('🌱 Seeding Database...');

  try {
    // 1. Check if user already exists
    const existing = await centralDb.merchant.findUnique({
      where: { email: 'user@example.com' }
    });

    if (existing) {
      console.log('⚠️ Merchant already exists. Skipping.');
      return;
    }

    // 2. Create the Merchant
    const merchant = await centralDb.merchant.create({
      data: {
        name: 'Test User',
        email: 'user@example.com',
        phoneNo: '1234567890', // This is standard String (text), so it's safe
        vams: {
          create: {
            vamId: 'VAM_001',
            pwd: 'password' // ✅ FIXED: 8 chars (Under the 12 char limit)
          }
        }
      }
    });

    console.log(`✅ Created Merchant: ${merchant.name} (ID: ${merchant.id})`);
    
  } catch (e) {
    console.error('❌ Seeding failed:', e);
  } finally {
    process.exit(0);
  }
};

main();