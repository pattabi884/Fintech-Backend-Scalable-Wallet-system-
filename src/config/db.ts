import 'dotenv/config'; // Load env first!
import { PrismaClient as CentralClient } from '@prisma/central-client';
import { PrismaClient as ShardClient } from '@prisma/shard-client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// --- 1. CENTRAL DB (Standard Singleton) ---
const centralPool = new Pool({ connectionString: process.env.DATABASE_URL });
const centralAdapter = new PrismaPg(centralPool);
export const centralDb = new CentralClient({ adapter: centralAdapter });

// --- 2. SHARD DB MANAGER (Cached Singleton) ---

// This Map acts as our cache. 
// Key: Connection String (URL) | Value: Active Prisma Client
const shardClients = new Map<string, ShardClient>();

export const getShardDb = (shardUrl: string): ShardClient => {
  // A. Check Cache
  if (shardClients.has(shardUrl)) {
    // console.log(`🔄 Reusing connection for ${shardUrl}`); // Uncomment to verify reuse
    return shardClients.get(shardUrl)!;
  }

  // B. Create New if missing
  // console.log(`🔌 Establishing NEW connection to ${shardUrl}`);
  const pool = new Pool({ connectionString: shardUrl });
  const adapter = new PrismaPg(pool);
  const client = new ShardClient({ adapter });

  // C. Save to Cache
  shardClients.set(shardUrl, client);

  return client;
};