import axios from 'axios';

// Configuration
const API_URL = 'http://localhost:3000/api';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

const runDemo = async () => {
  console.log('\n🔵 --- STARTING FINTECH SYSTEM DEMO --- 🔵\n');

  try {
    // 1. GENERATE A RANDOM USER
    const randomId = Math.floor(Math.random() * 10000);
    const userEmail = `demo_user_${randomId}@techcorp.com`;
    
    console.log(`1️⃣  Attempting Onboarding for: ${userEmail}`);

    const onboardRes = await axios.post(`${API_URL}/merchant/onboard`, {
      name: "Demo Corp",
      email: userEmail,
      phoneNo: "1234567890",
      password: "pass"
    });

    console.log(`   ✅ SUCCESS: Merchant Created (ID: ${onboardRes.data.merchantId})`);
    console.log(`   🧮 Sharding Logic: System assigned them to Shard ${onboardRes.data.assignedShard}`);
    
    await sleep(1000);

    // 2. MAKE A DEPOSIT
    console.log(`\n2️⃣  Initiating Deposit of $500.00...`);
    const depositRes = await axios.post(`${API_URL}/transaction/deposit`, {
      email: userEmail,
      amount: 500
    });

    console.log(`   ✅ API ACCEPTED: Status ${depositRes.status} (Pending Processing)`);
    console.log(`   🆔 Transaction IRN: ${depositRes.data.irn}`);
    console.log(`   ⏳ Worker is processing in background...`);

    // 3. CHECK LOGS REMINDER
    console.log(`\n3️⃣  VERIFICATION:`);
    console.log(`   👉 Check your Docker logs terminal.`);
    console.log(`   👉 You should see: "✅ Worker: Success! ... processed on Shard ${onboardRes.data.assignedShard}"`);
    console.log(`   👉 (If you enabled webhooks, you will see the HMAC signature logs there too!)`);

    console.log('\n🟢 --- DEMO COMPLETE --- 🟢');

  } catch (error: any) {
    console.error('❌ DEMO FAILED:', error.response?.data || error.message);
  }
};

runDemo();