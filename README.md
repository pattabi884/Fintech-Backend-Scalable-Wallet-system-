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
<br />

⚡ Quick Start (Run Everywhere)
This project uses a Split-Network Configuration to run seamlessly on any machine without installing local databases.