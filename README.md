# 🏦 Scalable Fintech Backend (Sharded & Event-Driven)

A high-performance, distributed banking backend built with **Node.js, TypeScript, and PostgreSQL**. This system implements **Database Sharding** to handle massive scale, uses **Redis** for asynchronous event processing, and ensures financial consistency with **Idempotency** and **Dual-Write** patterns.

## 🚀 Key Engineering Features

* **Database Sharding:** Horizontally scales user data across multiple PostgreSQL instances based on `MerchantID`.
* **Event-Driven Architecture:** Decouples API ingestion from processing using **Redis queues (BullMQ)** for high throughput.
* **Distributed Transactions:** Manages atomic operations across a Central Identity DB and isolated Shard DBs.
* **Idempotency & Deduplication:** Prevents double-spending by tracking unique Transaction Request Numbers (IRN).
* **Dual-Write Reporting:** Synchronizes high-speed shard transactions with a central ledger for analytics.
* **Secure Webhooks:** Notifies merchants of transaction status using HMAC-SHA256 signed payloads.

## 🛠️ Tech Stack

* **Runtime:** Node.js, TypeScript
* **Framework:** Express.js
* **Databases:** PostgreSQL (Central + 2 Shards), Redis (Queues)
* **ORM:** Prisma (Multi-schema management)
* **Infrastructure:** Docker, Docker Compose
* **Queues:** BullMQ

## 🏗️ Architecture Flow


graph TD
    User[Merchant / API] -->|POST /deposit| API[Express API]
    API -->|Push Job| Redis[(Redis Queue)]
    API -->|202 Accepted| User
    
    subgraph "Async Worker Cluster"
        Worker[Transaction Worker] -->|Pop Job| Redis
        Worker -->|1. Lookup| CentralDB[(Central DB)]
        Worker -->|2. Route Logic| Router{Shard Router}
        Router -->|Shard 0| DB0[(Shard 0 DB)]
        Router -->|Shard 1| DB1[(Shard 1 DB)]
        Worker -->|3. Sync Ledger| CentralDB
        Worker -->|4. Trigger Hook| WebhookQ[(Webhook Queue)]
    end
    
    WebhookQ -->|Notify| MerchantServer[Merchant Webhook]
⚡ Quick Start
Prerequisites
Docker & Docker Compose

Node.js (v18+)

1. Installation
Clone the repo and install dependencies:

Bash

git clone [https://github.com/yourusername/wallet-sharding-project.git](https://github.com/yourusername/wallet-sharding-project.git)
cd wallet-sharding-project
npm install
2. Start Infrastructure
Launch the database cluster (Central DB, Shards, Redis) and the API:

Bash

docker-compose up -d --build
3. Generate Database Clients
We use a custom script to generate Prisma clients for all 3 databases automatically:

Bash

npm run prisma:generate:all
4. Run the Demo 🎬
I have included a demo script that simulates a real merchant onboarding and processing transactions:

Bash

npx tsx demo_client.ts
You will see the system create a user, assign them to a shard, and process a deposit in real-time.

🔌 API Endpoints
1. Onboard Merchant
POST /api/merchant/onboard Creates identity in Central DB and a Wallet in the assigned Shard.

JSON

{
  "name": "Tech Corp",
  "email": "admin@techcorp.com",
  "password": "pass"
}
2. Deposit Funds
POST /api/transaction/deposit Asynchronous deposit. Returns 202 Accepted instantly.

JSON

{
  "email": "admin@techcorp.com",
  "amount": 1000
}
📂 Project Structure
Plaintext

src/
├── config/         # Database & Redis connections
├── controllers/    # API Request Handlers
├── middlewares/    # Global Error Handling & Validation
├── queues/         # BullMQ Producers
├── routes/         # Express Route Definitions
├── utils/          # Sharding Logic & Hashing Utils
├── workers/        # Async Consumers (The heavy lifters)
└── app.ts          # Entry Point
🛡️ Security & Reliability
Async Error Handling: Centralized middleware catches failures without crashing the server.

Graceful Shutdown: Workers finish processing current jobs before stopping.

Environment Isolation: Strict separation between Shard connections to prevent data leaks.