# Data Flow

This document details the comprehensive data flow patterns across the Shopify Marketplace ecosystem, showing how data moves between applications, APIs, databases, and external services.

## 🌊 Data Flow Overview

```mermaid
graph TB
    subgraph "Data Flow Architecture"
        subgraph "Data Sources"
            SH[Shopify Platform]
            US[User Inputs]
            EX[External APIs]
            WH[Webhooks]
        end
        
        subgraph "Processing Layer"
            MA[Market App] 
            AA[Admin App]
            BA[Buyer App]
            TE[Theme Extensions]
        end
        
        subgraph "Data Storage"
            PDB[(Prisma Database)]
            SDB[(Sequelize Database)]
            SMO[Shopify Metaobjects]
            SF[Shopify Files]
            CF[Cloudflare CDN]
        end
        
        subgraph "Data Consumers"
            AD[Admin Users]
            VN[Vendors]
            CU[Customers]
            AN[Analytics]
        end
    end
    
    %% Data Source Flows
    SH --> MA
    SH --> AA
    SH --> BA
    US --> MA
    US --> AA
    US --> BA
    EX --> MA
    WH --> MA
    WH --> AA
    
    %% Processing Flows
    MA --> PDB
    MA --> SMO
    MA --> SF
    AA --> SDB
    AA --> SMO
    BA --> CF
    TE --> MA
    
    %% Consumer Flows
    MA --> AD
    MA --> VN
    AA --> AD
    BA --> CU
    PDB --> AN
    SMO --> AN
    
    classDef source fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef processing fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef storage fill:#F5A623,stroke:#B8841A,color:#000
    classDef consumer fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class SH,US,EX,WH source
    class MA,AA,BA,TE processing
    class PDB,SDB,SMO,SF,CF storage
    class AD,VN,CU,AN consumer
```

## 👥 User Journey Data Flows

### Vendor Onboarding Flow
```mermaid
sequenceDiagram
    participant V as Vendor
    participant MA as Market App
    participant SAA as Shopify Admin API
    participant SMO as Metaobjects
    participant PDB as Prisma DB
    participant RS as Resend API
    
    V->>MA: Submit vendor registration
    MA->>MA: Validate form data
    MA->>SAA: Check existing metaobjects
    SAA->>MA: Return search results
    MA->>SMO: Create vendor metaobject
    SMO->>MA: Return vendor ID
    MA->>PDB: Store vendor settings
    PDB->>MA: Confirm storage
    MA->>RS: Send welcome email
    RS->>V: Welcome email delivered
    MA->>V: Display success message
    
    Note over V,RS: Approval Process
    MA->>MA: Check auto-approval settings
    alt Auto-approval enabled
        MA->>SMO: Update vendor status to approved
        MA->>RS: Send approval email
        RS->>V: Approval email delivered
    else Manual approval required
        MA->>MA: Queue for admin review
        MA->>RS: Send pending email
        RS->>V: Pending review email
    end
```

### Product Creation Flow
```mermaid
sequenceDiagram
    participant V as Vendor
    participant MA as Market App
    participant SAA as Shopify Admin API
    participant SF as Shopify Files
    participant SMO as Metaobjects
    participant WH as Webhooks
    
    V->>MA: Start product creation
    MA->>MA: Load vendor settings
    MA->>MA: Display product form
    V->>MA: Submit product data
    MA->>MA: Validate product data
    
    Note over V,WH: Image Upload Process
    MA->>SF: Upload product images (staged)
    SF->>MA: Return file URLs
    
    Note over V,WH: Product Creation
    MA->>SAA: Create product with variants
    SAA->>MA: Return product ID
    MA->>SMO: Link product to vendor
    SMO->>MA: Confirm link creation
    
    Note over V,WH: Webhook Processing
    SAA->>WH: Product created webhook
    WH->>MA: Process webhook
    MA->>MA: Apply approval logic
    
    alt Auto-approval enabled
        MA->>SAA: Publish product
        MA->>V: Product published notification
    else Manual approval
        MA->>MA: Queue for review
        MA->>V: Pending approval notification
    end
```

### Customer Purchase Flow
```mermaid
sequenceDiagram
    participant C as Customer
    participant BA as Buyer App
    participant SSA as Storefront API
    participant SH as Shopify Checkout
    participant WH as Webhooks
    participant MA as Market App
    participant V as Vendor
    participant RS as Resend API
    
    C->>BA: Browse products
    BA->>SSA: Fetch product catalog
    SSA->>BA: Return product data
    BA->>C: Display products
    
    C->>BA: Add products to cart
    BA->>BA: Update cart state
    BA->>C: Update cart display
    
    C->>BA: Proceed to checkout
    BA->>SSA: Create checkout session
    SSA->>BA: Return checkout URL
    BA->>SH: Redirect to Shopify checkout
    
    C->>SH: Complete purchase
    SH->>WH: Order created webhook
    WH->>MA: Process order webhook
    MA->>MA: Parse order data
    MA->>MA: Identify vendor products
    MA->>MA: Calculate vendor payouts
    MA->>MA: Store payout data
    MA->>RS: Send vendor notifications
    RS->>V: Order notification email
    MA->>RS: Send customer confirmation
    RS->>C: Order confirmation email
```

## 🔄 Real-time Data Synchronization

### Webhook Data Processing
```mermaid
graph TB
    subgraph "Webhook Data Processing Flow"
        subgraph "Webhook Reception"
            WR[Webhook Received] --> HV[HMAC Validation]
            HV --> JP[JSON Parsing]
            JP --> ET[Event Type Detection]
        end
        
        subgraph "Event Routing"
            ET --> OE[Order Events]
            ET --> PE[Product Events]
            ET --> CE[Customer Events]
            ET --> AE[App Events]
        end
        
        subgraph "Data Transformation"
            OE --> OT[Order Transform]
            PE --> PT[Product Transform]
            CE --> CT[Customer Transform]
            AE --> AT[App Transform]
        end
        
        subgraph "Data Persistence"
            OT --> PDB2[Store Order Data]
            PT --> SMO2[Update Metaobjects]
            CT --> PDB3[Store Customer Data]
            AT --> PDB4[Store App Data]
        end
        
        subgraph "Business Logic"
            PDB2 --> PC[Payout Calculation]
            SMO2 --> PA[Product Approval]
            PDB3 --> UN[User Notification]
            PDB4 --> AC[App Configuration]
        end
        
        subgraph "Notification System"
            PC --> VN2[Vendor Notification]
            PA --> AN[Admin Notification]
            UN --> EN[Email Notification]
            AC --> SN[System Notification]
        end
    end
    
    classDef reception fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef routing fill:#7ED321,stroke:#5BA517,color:#000
    classDef transform fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef persistence fill:#F5A623,stroke:#B8841A,color:#000
    classDef business fill:#50E3C2,stroke:#38A594,color:#000
    classDef notification fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class WR,HV,JP,ET reception
    class OE,PE,CE,AE routing
    class OT,PT,CT,AT transform
    class PDB2,SMO2,PDB3,PDB4 persistence
    class PC,PA,UN,AC business
    class VN2,AN,EN,SN notification
```

### Data Synchronization Patterns
```mermaid
graph TB
    subgraph "Data Synchronization Architecture"
        subgraph "Real-time Sync"
            RTS[Real-time Sync] --> WH2[Webhooks]
            RTS --> WS[WebSockets]
            RTS --> SSE[Server-Sent Events]
        end
        
        subgraph "Batch Sync"
            BS[Batch Sync] --> CRON[Cron Jobs]
            BS --> BG[Background Tasks]
            BS --> SCH[Scheduled Sync]
        end
        
        subgraph "Event-Driven Sync"
            EDS[Event-Driven Sync] --> UT[User Triggers]
            EDS --> ST[System Triggers]
            EDS --> API[API Triggers]
        end
        
        subgraph "Conflict Resolution"
            CR[Conflict Resolution] --> LW[Last Write Wins]
            CR --> TS[Timestamp Based]
            CR --> MR[Manual Resolution]
            CR --> VB[Version Based]
        end
    end
    
    classDef realtime fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef batch fill:#7ED321,stroke:#5BA517,color:#000
    classDef eventdriven fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef conflict fill:#F5A623,stroke:#B8841A,color:#000
    
    class RTS,WH2,WS,SSE realtime
    class BS,CRON,BG,SCH batch
    class EDS,UT,ST,API eventdriven
    class CR,LW,TS,MR,VB conflict
```

## 💾 Data Storage Patterns

### Database Data Flow
```mermaid
graph TB
    subgraph "Database Data Flow Architecture"
        subgraph "Market App Data (Prisma)"
            MAD[Market App Data] --> SESS[Session Data]
            MAD --> SET[Settings Data]
            MAD --> PAY[Payout Data]
            MAD --> QR[QR Code Data]
        end
        
        subgraph "Admin App Data (Sequelize)"
            AAD[Admin App Data] --> SHOP[Shop Data]
            AAD --> SESS2[Session Data]
            AAD --> CHAN[Channel Data]
            AAD --> LIST[Product Listings]
        end
        
        subgraph "Shopify Native Data"
            SND[Shopify Native Data] --> PROD[Products]
            SND --> ORD[Orders]
            SND --> CUST[Customers]
            SND --> META[Metaobjects]
        end
        
        subgraph "Data Relationships"
            DR[Data Relationships] --> FK[Foreign Keys]
            DR --> REF[References]
            DR --> JOIN[Join Tables]
            DR --> IDX[Indexes]
        end
        
        subgraph "Data Consistency"
            DC[Data Consistency] --> ACID[ACID Compliance]
            DC --> TX[Transactions]
            DC --> LOCK[Locking]
            DC --> VAL[Validation]
        end
    end
    
    classDef prisma fill:#2D3748,stroke:#1A202C,color:#fff
    classDef sequelize fill:#52B6E8,stroke:#3A8BC4,color:#000
    classDef shopify fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef relationship fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef consistency fill:#F5A623,stroke:#B8841A,color:#000
    
    class MAD,SESS,SET,PAY,QR prisma
    class AAD,SHOP,SESS2,CHAN,LIST sequelize
    class SND,PROD,ORD,CUST,META shopify
    class DR,FK,REF,JOIN,IDX relationship
    class DC,ACID,TX,LOCK,VAL consistency
```

### Data Migration Flow
```mermaid
sequenceDiagram
    participant DEV as Developer
    participant PRISMA as Prisma CLI
    participant PDB as Prisma DB
    participant SEQ as Sequelize CLI
    participant SDB as Sequelize DB
    participant SAA as Shopify Admin API
    
    Note over DEV,SAA: Prisma Migration
    DEV->>PRISMA: Create migration
    PRISMA->>PDB: Generate migration SQL
    DEV->>PRISMA: Apply migration
    PRISMA->>PDB: Execute migration
    PDB->>PRISMA: Confirm migration
    
    Note over DEV,SAA: Sequelize Migration
    DEV->>SEQ: Create migration
    SEQ->>SDB: Generate migration file
    DEV->>SEQ: Run migration
    SEQ->>SDB: Execute migration
    SDB->>SEQ: Confirm migration
    
    Note over DEV,SAA: Shopify Schema Updates
    DEV->>SAA: Update metaobject definitions
    SAA->>SAA: Validate schema
    SAA->>DEV: Confirm updates
    
    Note over DEV,SAA: Data Synchronization
    DEV->>DEV: Sync data between systems
    DEV->>SAA: Validate data integrity
    SAA->>DEV: Confirm data consistency
```

## 📊 Analytics Data Pipeline

### Analytics Data Flow
```mermaid
graph TB
    subgraph "Analytics Data Pipeline"
        subgraph "Data Collection"
            DC2[Data Collection] --> UE[User Events]
            DC2 --> SE[System Events]
            DC2 --> BE[Business Events]
            DC2 --> PE2[Performance Events]
        end
        
        subgraph "Data Processing"
            DP[Data Processing] --> AGG[Aggregation]
            DP --> FIL[Filtering]
            DP --> TRANS[Transformation]
            DP --> ENR[Enrichment]
        end
        
        subgraph "Data Storage"
            DS[Data Storage] --> OLTP[OLTP Database]
            DS --> OLAP[OLAP Database]
            DS --> DL[Data Lake]
            DS --> CACHE[Cache Layer]
        end
        
        subgraph "Data Analysis"
            DA[Data Analysis] --> REP[Reporting]
            DA --> DASH[Dashboards]
            DA --> ML[Machine Learning]
            DA --> PRED[Predictions]
        end
        
        subgraph "Data Export"
            DE[Data Export] --> API2[API Export]
            DE --> FILE[File Export]
            DE --> FEED[Data Feeds]
            DE --> INT[Integrations]
        end
    end
    
    classDef collection fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef processing fill:#7ED321,stroke:#5BA517,color:#000
    classDef storage fill:#F5A623,stroke:#B8841A,color:#000
    classDef analysis fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef export fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class DC2,UE,SE,BE,PE2 collection
    class DP,AGG,FIL,TRANS,ENR processing
    class DS,OLTP,OLAP,DL,CACHE storage
    class DA,REP,DASH,ML,PRED analysis
    class DE,API2,FILE,FEED,INT export
```

### Business Intelligence Flow
```mermaid
sequenceDiagram
    participant MA as Market App
    participant PDB as Prisma DB
    participant AN as Analytics Service
    participant DASH as Dashboard
    participant AD as Admin User
    
    Note over MA,AD: Vendor Performance Analytics
    MA->>PDB: Store vendor transactions
    PDB->>AN: Stream transaction data
    AN->>AN: Calculate metrics
    AN->>DASH: Update vendor KPIs
    DASH->>AD: Display vendor performance
    
    Note over MA,AD: Product Analytics
    MA->>PDB: Store product interactions
    PDB->>AN: Aggregate product data
    AN->>AN: Generate insights
    AN->>DASH: Update product metrics
    DASH->>AD: Show product performance
    
    Note over MA,AD: Revenue Analytics
    MA->>PDB: Store payout calculations
    PDB->>AN: Process revenue data
    AN->>AN: Calculate commissions
    AN->>DASH: Update revenue reports
    DASH->>AD: Display financial metrics
```

## 🔒 Data Security & Privacy

### Data Protection Flow
```mermaid
graph TB
    subgraph "Data Security & Privacy Architecture"
        subgraph "Data Classification"
            DC3[Data Classification] --> PII[Personal Information]
            DC3 --> FIN[Financial Data]
            DC3 --> BUS[Business Data]
            DC3 --> PUB[Public Data]
        end
        
        subgraph "Encryption"
            ENC[Encryption] --> EIT[Encryption in Transit]
            ENC --> EAR[Encryption at Rest]
            ENC --> EKM[Key Management]
            ENC --> HSM[Hardware Security]
        end
        
        subgraph "Access Control"
            AC2[Access Control] --> RBAC2[Role-Based Access]
            AC2 --> ABAC[Attribute-Based Access]
            AC2 --> MFA[Multi-Factor Auth]
            AC2 --> SSO[Single Sign-On]
        end
        
        subgraph "Privacy Compliance"
            PC4[Privacy Compliance] --> GDPR[GDPR Compliance]
            PC4 --> CCPA[CCPA Compliance]
            PC4 --> DPA[Data Processing Agreement]
            PC4 --> RTF[Right to be Forgotten]
        end
        
        subgraph "Audit & Monitoring"
            AM[Audit & Monitoring] --> AL[Access Logs]
            AM --> CT[Change Tracking]
            AM --> AM2[Anomaly Monitoring]
            AM --> IR[Incident Response]
        end
    end
    
    classDef classification fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef encryption fill:#C53030,stroke:#9B2C2C,color:#fff
    classDef access fill:#7ED321,stroke:#5BA517,color:#000
    classDef privacy fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef audit fill:#F5A623,stroke:#B8841A,color:#000
    
    class DC3,PII,FIN,BUS,PUB classification
    class ENC,EIT,EAR,EKM,HSM encryption
    class AC2,RBAC2,ABAC,MFA,SSO access
    class PC4,GDPR,CCPA,DPA,RTF privacy
    class AM,AL,CT,AM2,IR audit
```

## 🔄 Data Backup & Recovery

### Backup Strategy
```mermaid
graph TB
    subgraph "Data Backup & Recovery Architecture"
        subgraph "Backup Types"
            BT[Backup Types] --> FB[Full Backup]
            BT --> IB[Incremental Backup]
            BT --> DB[Differential Backup]
            BT --> CB[Continuous Backup]
        end
        
        subgraph "Backup Frequency"
            BF[Backup Frequency] --> RT[Real-time]
            BF --> HR[Hourly]
            BF --> DL[Daily]
            BF --> WK[Weekly]
        end
        
        subgraph "Storage Locations"
            SL[Storage Locations] --> LOC[Local Storage]
            SL --> CLD[Cloud Storage]
            SL --> REMOTE[Remote Sites]
            SL --> HYB[Hybrid Approach]
        end
        
        subgraph "Recovery Procedures"
            RP[Recovery Procedures] --> PIR[Point-in-Time Recovery]
            RP --> GR[Granular Recovery]
            RP --> DR[Disaster Recovery]
            RP --> BCP[Business Continuity]
        end
        
        subgraph "Testing & Validation"
            TV[Testing & Validation] --> BT2[Backup Testing]
            TV --> RT2[Recovery Testing]
            TV --> DV[Data Validation]
            TV --> PV[Process Validation]
        end
    end
    
    classDef backup fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef frequency fill:#7ED321,stroke:#5BA517,color:#000
    classDef storage fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef recovery fill:#F5A623,stroke:#B8841A,color:#000
    classDef testing fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class BT,FB,IB,DB,CB backup
    class BF,RT,HR,DL,WK frequency
    class SL,LOC,CLD,REMOTE,HYB storage
    class RP,PIR,GR,DR,BCP recovery
    class TV,BT2,RT2,DV,PV testing
```

## 📈 Performance Optimization

### Data Performance Flow
```mermaid
graph TB
    subgraph "Data Performance Optimization"
        subgraph "Query Optimization"
            QO[Query Optimization] --> IDX2[Database Indexes]
            QO --> QP[Query Planning]
            QO --> QC4[Query Caching]
            QO --> QB2[Query Batching]
        end
        
        subgraph "Caching Strategy"
            CS6[Caching Strategy] --> L1[L1 Cache (Memory)]
            CS6 --> L2[L2 Cache (Redis)]
            CS6 --> L3[L3 Cache (CDN)]
            CS6 --> APP[Application Cache]
        end
        
        subgraph "Data Partitioning"
            DP4[Data Partitioning] --> HP[Horizontal Partitioning]
            DP4 --> VP[Vertical Partitioning]
            DP4 --> FP[Functional Partitioning]
            DP4 --> TP[Temporal Partitioning]
        end
        
        subgraph "Connection Management"
            CM[Connection Management] --> POOL[Connection Pooling]
            CM --> LB[Load Balancing]
            CM --> REPL[Replication]
            CM --> SHARD[Sharding]
        end
    end
    
    classDef query fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef caching fill:#7ED321,stroke:#5BA517,color:#000
    classDef partitioning fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef connection fill:#F5A623,stroke:#B8841A,color:#000
    
    class QO,IDX2,QP,QC4,QB2 query
    class CS6,L1,L2,L3,APP caching
    class DP4,HP,VP,FP,TP partitioning
    class CM,POOL,LB,REPL,SHARD connection
```

---

**Previous:** [← API Integrations](./06-api-integrations.md) | **Next:** [Authentication & Security →](./08-authentication-security.md)