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

* **Runtime:** Node.js v18 (Debian/Standard)
* **Language:** TypeScript
* **Database:** PostgreSQL (1 Central + 2 Shards)
* **Caching/Queues:** Redis
* **ORM:** Prisma (Multi-Schema Support)
* **Infrastructure:** Docker & Docker Compose

## 🏗️ Architecture Flow

```mermaid
graph TD
    User["Merchant / API"] -->|POST /deposit| API["Express API"]
    API -->|Push Job| Redis[("Redis Queue")]
    API -->|202 Accepted| User
    
    subgraph "Async Worker Cluster"
        Worker["Transaction Worker"] -->|Pop Job| Redis
        Worker -->|1. Lookup| CentralDB[("Central DB")]
        Worker -->|2. Route Logic| Router{"Shard Router"}
        Router -->|Shard 0| DB0[("Shard 0 DB")]
        Router -->|Shard 1| DB1[("Shard 1 DB")]
        Worker -->|3. Sync Ledger| CentralDB
        Worker -->|4. Trigger Hook| WebhookQ[("Webhook Queue")]
    end

    WebhookQ -->|Notify| MerchantServer["Merchant Webhook"]