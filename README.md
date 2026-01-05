# 🏦 Sharded Wallet System (Fintech Backend)

A high-performance, distributed banking backend built with **Node.js, TypeScript, and Docker**. This system demonstrates **Database Sharding**, **Event-Driven Architecture**, and **Idempotency** handling to process financial transactions at scale.

![License](https://img.shields.io/badge/license-MIT-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED)

## 🚀 Key Engineering Patterns

* **Horizontal Scaling (Sharding):** User data is mechanically split across multiple PostgreSQL instances based on Merchant ID (Modulo Routing).
* **Dual-Client Architecture:** Custom-generated Prisma clients strictly separate "Identity Data" (Central DB) from "Transactional Data" (Shard DBs).
* **Event-Driven Processing:** API ingestion is decoupled from execution using **BullMQ (Redis)** to handle traffic spikes without blocking.
* **Idempotency & Deduplication:** Prevents double-spending using unique Transaction Reference Numbers (IRN).
* **Containerized Environment:** Fully isolated infrastructure using Docker Compose with internal DNS resolution.

## 🛠️ Tech Stack

* **Runtime:** Node.js v18 (Alpine Linux)
* **Language:** TypeScript
* **Database:** PostgreSQL (1 Central + 2 Shards)
* **Caching/Queues:** Redis
* **ORM:** Prisma (Multi-Schema Support)
* **Infrastructure:** Docker & Docker Compose

## 🏗️ Architecture Flow

```mermaid
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
⚡ Quick Start (Run Everywhere)This project uses a Split-Network Configuration to run seamlessly on any machine without installing local databases.PrerequisitesDocker Desktop & Docker ComposeNode.js (v18+)1. Clone & InstallBashgit clone [https://github.com/your-username/sharded-wallet-backend.git](https://github.com/your-username/sharded-wallet-backend.git)
cd sharded-wallet-backend
npm install
2. Configure EnvironmentCreate two environment files in the root directory:File 1: .env (For Local Scripts)Used by your terminal to connect to exposed ports.Code snippetDATABASE_URL="postgresql://postgres:password123@localhost:6432/central_db?schema=public"
SHARD_0_URL="postgresql://postgres:password123@localhost:6433/shard0_db?schema=public"
SHARD_1_URL="postgresql://postgres:password123@localhost:6434/shard1_db?schema=public"
REDIS_HOST="localhost"
REDIS_PORT=6380
File 2: .env.docker (For Containers)Used by the API inside Docker to talk to internal services.Code snippetDATABASE_URL="postgresql://postgres:password123@central-db:5432/central_db?schema=public"
SHARD_0_URL="postgresql://postgres:password123@shard0-db:5432/shard0_db?schema=public"
SHARD_1_URL="postgresql://postgres:password123@shard1-db:5432/shard1_db?schema=public"
REDIS_HOST="redis"
REDIS_PORT=6379
3. Launch Infrastructure 🚀Start the API, 3 Databases, and Redis with one command:Bashdocker-compose up -d --build
4. Initialize DatabasePush the schema to the running databases:Bash# Create tables in Central DB and Shards
npm run prisma:push:central
npm run prisma:push:shards

# Generate Type Definitions
npm run prisma:generate:all
5. Run the DemoSimulate a real-world transaction flow (Onboard -> Deposit -> Check Balance):Bashnpx tsx demo_client.ts
🔌 API ReferenceMethodEndpointDescriptionPOST/api/merchant/onboardCreate a new merchant (Auto-assigned to a shard)POST/api/transaction/depositAsync deposit request (Returns 202 Accepted)GET/api/merchant/:idFetch merchant details & balance📂 Project StructurePlaintextsrc/
├── config/         # Database & Redis Connections (Singleton Patterns)
├── controllers/    # Request Handlers
├── queues/         # BullMQ Producers
├── workers/        # BullMQ Consumers (Business Logic)
├── repositories/   # Data Access Layer (Clean Architecture)
├── utils/          # Sharding Logic (Modulo Hashing)
└── app.ts          # Entry Point

🛡️ Security & Reliability
Async Error Handling: Centralized middleware catches failures without crashing the server.

Graceful Shutdown: Workers finish processing current jobs before stopping.

Environment Isolation: Strict separation between Shard connections to prevent data leaks.