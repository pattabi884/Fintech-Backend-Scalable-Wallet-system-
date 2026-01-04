import 'dotenv/config';
const TOTAL_SHARDS = 2;

export const getShardIndex = (merchantId: number): number =>{
    if(!merchantId) throw new Error("merchant ID is required for sharding routing");
    return merchantId % TOTAL_SHARDS;
};

//dynamically constructs  the data bsee url from a specific shard this prevents us from hardcodeing connection strings in the code 

export const getShardUrl = (shardIndex: number): string => {
  // FIX: Use a different name for the key string
  const key = `SHARD${shardIndex}_URL`; 
  
  // FIX: Look up using the key string
  const url = process.env[key];

  if (!url) {
    throw new Error(`Configuration Error: ${key} is missing in .env`);
  }
  return url;
};