# PharmaTrack ERP & Supply Chain Distribution Platform

[![System Architecture](https://img.shields.io/badge/Architecture-FastAPI%20%7C%20React%20%7C%20PostgreSQL-0ea5e9.svg)](#architecture-overview)
[![Compliance](https://img.shields.io/badge/Compliance-21%20CFR%20Part%2011%20%7C%20cGMP-10b981.svg)](#compliance--regulatory-validation)
[![License](https://img.shields.io/badge/License-Enterprise%20Proprietary-64748b.svg)](#)

An enterprise-grade **Pharmacy ERP & Supply Chain Distribution Platform** engineered for pharmaceutical logistics providers, hospital systems, and multi-depot dispensary networks. The platform guarantees strict batch tracking, automated First-Expired, First-Out (FEFO) dispensing, governed multi-warehouse transfers, and fine-grained Role-Based Access Control (RBAC).

---

## Architecture Overview

```
                      +---------------------------------------+
                      |      ReactJS + Tailwind CSS UI       |
                      |     (Vite, TypeScript, Lucide)        |
                      +-------------------+-------------------+
                                          |
                                HTTP / REST API (Port 3000 / Proxy)
                                          |
                      +-------------------v-------------------+
                      |         FastAPI REST Backend          |
                      |    (Python 3.11, Pydantic, PyJWT)     |
                      +-------------------+-------------------+
                                          |
                      +-------------------v-------------------+
                      |       SQLAlchemy ORM + Indexes        |
                      |      (PostgreSQL 16 / SQLite)         |
                      +-------------------+-------------------+
                                          |
     +-----------------+------------------+-----------------+-----------------+
     |                 |                  |                 |                 |
+----v----+       +----v----+        +----v----+       +----v----+       +----v----+
| Medicine|       |  Batch  |        |StockLvl |       |Warehouse|       | Transfer|
| Catalog |       | Tracking|        |  (Bins) |       | Network |       |  Order  |
+---------+       +---------+        +---------+       +---------+       +---------+
```

### Key Technical Capabilities
- **FEFO (First-Expired, First-Out) Optimization**: Algorithmic dispensing engine prioritizing earliest expiring drug lots to slash write-offs and prevent expired delivery.
- **Color-Coded Expiry Risk Radar**: Real-time surveillance categorizing inventory into **Critical Red (< 30 days)**, **Warning Amber (< 90 days)**, and **Valid Green (> 90 days)**.
- **Inter-Warehouse Transfer State Machine**: Formally enforced state lifecycle: `Draft` $\rightarrow$ `Pending Approval` $\rightarrow$ `Dispatched` $\rightarrow$ `Received & Reconciled`.
- **Role-Based Access Control (RBAC)**: Cryptographically validated route guards protecting operations across `SuperAdmin`, `Pharmacist`, `Warehouse_Staff`, and `Sales_Rep`.
- **B-Tree Index Tuning**: Composite indexes tuned for constant-time lot selection across millions of stock records.

---

## Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    User ||--o{ TransferOrder : "creates"
    User ||--o{ TransferOrder : "approves"
    User }o--|| Warehouse : "assigned_to"

    Warehouse ||--o{ StockLevel : "stores"
    Warehouse ||--o{ TransferOrder : "originates_outbound"
    Warehouse ||--o{ TransferOrder : "receives_inbound"

    Medicine ||--o{ Batch : "manufactures"
    Batch ||--o{ StockLevel : "inventoried_in"
    Batch ||--o{ TransferOrderItem : "allocated_in"

    TransferOrder ||--o{ TransferOrderItem : "contains"

    Medicine {
        int id PK
        string code UK "SKU or NDC code"
        string name "Formulation name"
        string generic_name "Active Pharmaceutical Ingredient"
        string category "Antibiotics, Vaccines, Oncology, etc."
        string dosage_form "Capsule, Vial, Inhaler"
        string strength "500mg, 100IU/mL"
        string manufacturer "Pfizer, GSK, Roche"
        float unit_price "Retail Price"
        float cost_price "Acquisition Cost"
        boolean requires_cold_chain "2-8C Temperature Lock"
        int reorder_threshold
    }

    Batch {
        int id PK
        string batch_no UK "Unique Lot Identifier"
        int medicine_id FK
        date mfg_date "Manufacture Date"
        date exp_date "Expiration Date [INDEXED]"
        int total_initial_quantity
        string barcode_sku
        string status "Active, Quarantined, Expired, Recalled"
    }

    Warehouse {
        int id PK
        string name "Facility Name"
        string code UK "WH-BOS-01, WH-CHI-02"
        string location "Address"
        string type "Central Hub, Regional Depot"
        boolean is_cold_storage "Equipped with cold vault"
        int capacity
    }

    StockLevel {
        int id PK
        int warehouse_id FK "[INDEXED]"
        int batch_id FK "[INDEXED]"
        int quantity "On-hand physical units"
        int allocated_quantity "Reserved for in-flight orders"
        string location_bin "VAULT-COLD-01/B02"
        datetime updated_at
    }

    TransferOrder {
        int id PK
        string order_no UK "TR-2026-0001"
        int source_warehouse_id FK
        int destination_warehouse_id FK
        string status "Draft -> Pending -> Dispatched -> Reconciled"
        int created_by_user_id FK
        int approved_by_user_id FK
        datetime dispatched_at
        datetime received_at
        text notes
    }

    TransferOrderItem {
        int id PK
        int transfer_order_id FK
        int batch_id FK
        int quantity_requested
        int quantity_shipped
        int quantity_received
        boolean reconciled
    }

    User {
        int id PK
        string email UK
        string hashed_password
        string full_name
        string role "SuperAdmin, Pharmacist, Warehouse_Staff, Sales_Rep"
        int warehouse_id FK
        boolean is_active
    }
```

---

## Milestone Implementation Breakdown

### Milestone 1: Relational Schema & 40+ Formulation Seed
- Models: `Medicine`, `Batch`, `Warehouse`, `StockLevel`, `TransferOrder`, `TransferOrderItem`, `User`.
- **42 Realistic Medicines** with diverse therapeutic categories (Antibiotics, Pain Relief, Vaccines & Biologics, Cardiovascular, Diabetes & Insulins, Respiratory, and Oncology).
- Dynamic batch distribution with expiration profiles calibrated for cold-chain compliance and inventory churn.

### Milestone 2: FEFO Recommendation Engine & Expiry Radar
- **FEFO Engine (`/api/inventory/fefo-recommendation`)**:
  1. Filters active batches where `quantity > allocated_quantity` and `exp_date >= current_date`.
  2. Executes ordering strictly by `Batch.exp_date ASC`.
  3. Greedily allocates available quantities across lots.
  4. Generates an itemized pick ticket with location bins and unit costs.
- **Color-Coded Expiry Surveillance**:
  - **Critical Red (< 30 days)**: Imminent spoilage alert requiring priority dispatch.
  - **Warning Amber (30 – 90 days)**: Mid-term shelf life window targeted for rebalancing.
  - **Valid Green (> 90 days)**: Stable inventory.

### Milestone 3: Inter-Warehouse Transfer State Machine
```
   [ Draft ]
       |  (Submit for Review)
       v
   [ Pending Approval ]  ---- (Rejection / Revision) ----> [ Draft ]
       |  (Authorized by Pharmacist: Allocates Source Stock)
       v
   [ Dispatched ]  ---- (Emergency Recall) ----> [ Cancelled ]
       |  (Physical Delivery Verified by Receiving Staff)
       v
   [ Received & Reconciled ]  (Atomic Stock Rebalance & Bin Placement)
```

### Milestone 4: Role-Based Access Control (RBAC)
| Capability | SuperAdmin | Pharmacist | Warehouse_Staff | Sales_Rep |
| :--- | :---: | :---: | :---: | :---: |
| **Expiry Radar & Stock Batches** | Yes | Yes | Yes | Yes |
| **FEFO Dispense & Pick Tickets** | Yes | Yes | Yes | Read-Only |
| **Draft Transfer Creation** | Yes | Yes | Yes | No |
| **Approve & Dispatch Transfers** | Yes | Yes | No | No |
| **Receive & Reconcile Stock** | Yes | No | Yes | No |
| **Executive Financial Analytics** | Yes | Yes | No | No |
| **User & RBAC Security Settings** | Yes | No | No | No |

### Milestone 5: BI Analytics & Database Index Optimization
- **Financial Margins**: Aggregated gross margin and holding value by therapeutic classification.
- **Spoilage Loss Modeling**: 30-day temporal loss projection demonstrating ~72% salvage recovery through automated FEFO allocation.
- **Index Architecture**:
  - `idx_batch_exp_medicine`: `ON batches (exp_date ASC, medicine_id)` eliminates table scans on high-throughput FEFO pick generation.
  - `idx_stock_warehouse_batch`: `ON stock_levels (warehouse_id, batch_id) [UNIQUE]` enables single-pass atomic inventory balance locking.
  - `idx_medicine_category_name`: `ON medicines (category, name)` speeds up formulary classification queries.

---

## Quickstart & Docker Deployment

### Run with Docker Compose
```bash
# Clone the repository
git clone https://github.com/thanhtrung0017/Pharmacy-ERP.git
cd Pharmacy-ERP

# Build and start PostgreSQL + FastAPI + React
docker compose up --build
```
Access the application at `http://localhost:3000`.

### Local Development Setup
```bash
# 1. Install Node dependencies
npm install

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Seed Database
python3 -m backend.seed_data

# 4. Start Full-Stack Dev Environment
npm run dev
```

---

## Pre-Configured Test Credentials

| Role | Email | Password | Primary Permissions |
| :--- | :--- | :--- | :--- |
| **SuperAdmin** | `admin@pharmatrack.io` | `Password123!` | Unrestricted enterprise administrative access |
| **Pharmacist** | `pharmacist@pharmatrack.io` | `Password123!` | Formulary control, transfer approvals, FEFO dispensing |
| **Warehouse_Staff** | `warehouse@pharmatrack.io` | `Password123!` | Physical dispatching, receiving, reconciliation |
| **Sales_Rep** | `sales@pharmatrack.io` | `Password123!` | Read-only formulary and inventory availability checks |

*Note: You can instantly toggle between personas in the UI via the "Simulate RBAC Role" selector in the top navbar.*

---
*Built with ReactJS, Vite, Tailwind CSS, FastAPI, and SQLAlchemy.*
