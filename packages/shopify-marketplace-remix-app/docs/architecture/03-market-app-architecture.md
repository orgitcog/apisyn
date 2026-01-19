# Market App Architecture

This document details the architecture of the primary Market App, built with Remix framework and serving as the core marketplace application.

## 🏗️ Application Overview

The Market App is the central hub of the Shopify Marketplace ecosystem, built with Remix for full-stack React development. It handles vendor management, product workflows, and marketplace administration.

```mermaid
graph TB
    subgraph "Market App Architecture"
        subgraph "Frontend Layer"
            UI[Polaris UI Components]
            AB[App Bridge Integration]
            RC[React Components]
            RL[Remix Loaders/Actions]
        end
        
        subgraph "Business Logic Layer"
            VM[Vendor Management]
            PM[Product Management]
            OM[Order Management]
            PS[Payout System]
            AM[Approval Workflows]
        end
        
        subgraph "Data Access Layer"
            PO[Prisma ORM]
            SAI[Shopify API Integration]
            MOS[Metaobject Service]
            WH[Webhook Handlers]
        end
        
        subgraph "External Integrations"
            SA[Shopify Admin API]
            SSA[Shopify Storefront API]
            RS[Resend Email Service]
            CF[Cloudflare Services]
        end
        
        subgraph "Storage Layer"
            PDB[(Prisma Database)]
            SMO[Shopify Metaobjects]
            SF[Shopify Files]
        end
    end
    
    %% Frontend connections
    UI --> RC
    AB --> RC
    RC --> RL
    
    %% Business logic connections
    RL --> VM
    RL --> PM
    RL --> OM
    RL --> PS
    RL --> AM
    
    %% Data access connections
    VM --> PO
    PM --> SAI
    OM --> MOS
    PS --> WH
    AM --> SAI
    
    PO --> PDB
    SAI --> SA
    SAI --> SSA
    MOS --> SMO
    WH --> SA
    
    %% External service connections
    VM --> RS
    PM --> CF
    OM --> SF
    
    classDef frontend fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef business fill:#7ED321,stroke:#5BA517,color:#000
    classDef data fill:#F5A623,stroke:#B8841A,color:#000
    classDef external fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef storage fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class UI,AB,RC,RL frontend
    class VM,PM,OM,PS,AM business
    class PO,SAI,MOS,WH data
    class SA,SSA,RS,CF external
    class PDB,SMO,SF storage
```

## 📁 Directory Structure

```mermaid
graph TB
    subgraph "Market App File Structure"
        subgraph "app/"
            R[routes/] --> RG[Route Groups]
            C[components/] --> CC[Common Components]
            L[lib/] --> LS[Shared Libraries]
            T[types/] --> TD[Type Definitions]
            S[styles/] --> SS[Stylesheet]
        end
        
        subgraph "routes/ Structure"
            API[app.api.*] --> APIR[API Routes]
            ADMIN[app.admin.*] --> ADMINR[Admin Routes]
            VENDOR[app.vendor.*] --> VENDORR[Vendor Routes]
            WEB[webhooks.*] --> WEBR[Webhook Routes]
        end
        
        subgraph "Key Directories"
            EXT[extensions/] --> TE[Theme Extensions]
            PRI[prisma/] --> PDB[Database Schema]
            PUB[public/] --> PA[Public Assets]
        end
    end
    
    classDef core fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef routes fill:#7ED321,stroke:#5BA517,color:#000
    classDef support fill:#F5A623,stroke:#B8841A,color:#000
    
    class R,C,L,T,S core
    class API,ADMIN,VENDOR,WEB,APIR,ADMINR,VENDORR,WEBR routes
    class EXT,PRI,PUB,TE,PDB,PA support
```

## 🔀 Route Architecture

### Route Organization
```mermaid
graph LR
    subgraph "Route Hierarchy"
        subgraph "Public Routes"
            I[app._index] --> H[Home Dashboard]
            L[app.login] --> A[Authentication]
            S[app.settings] --> C[Configuration]
        end
        
        subgraph "Admin Routes"
            AA[app.admin._index] --> AD[Admin Dashboard]
            AV[app.admin.vendors] --> AVD[Vendor Management]
            AP[app.admin.products] --> APD[Product Approval]
            AO[app.admin.orders] --> AOD[Order Management]
            APY[app.admin.payouts] --> APYD[Payout Management]
        end
        
        subgraph "Vendor Routes"
            VA[app.vendor._index] --> VD[Vendor Dashboard]
            VP[app.vendor.products] --> VPD[Product Management]
            VO[app.vendor.orders] --> VOD[Order Tracking]
            VS[app.vendor.settings] --> VSD[Vendor Settings]
        end
        
        subgraph "API Routes"
            AR[app.api.*] --> GQLR[GraphQL Resolvers]
            WR[webhooks.*] --> WHR[Webhook Handlers]
        end
    end
    
    classDef public fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef admin fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef vendor fill:#7ED321,stroke:#5BA517,color:#000
    classDef api fill:#F5A623,stroke:#B8841A,color:#000
    
    class I,L,S,H,A,C public
    class AA,AV,AP,AO,APY,AD,AVD,APD,AOD,APYD admin
    class VA,VP,VO,VS,VD,VPD,VOD,VSD vendor
    class AR,WR,GQLR,WHR api
```

## 🔧 Core Modules

### Vendor Management Module
```mermaid
graph TB
    subgraph "Vendor Management Flow"
        VR[Vendor Registration] --> VV[Validation]
        VV --> MO[Create Metaobject]
        MO --> ES[Email Service]
        ES --> AS[Approval Status]
        AS --> ND[Notify Dashboard]
        
        subgraph "Vendor Operations"
            VS[Vendor Settings] --> UST[Update Settings]
            VP[Vendor Profile] --> UPR[Update Profile]
            VD[Vendor Disable] --> WHO[Webhook Out]
        end
        
        subgraph "Data Storage"
            MO --> SMO[Shopify Metaobjects]
            UST --> PDB[(Prisma DB)]
            UPR --> SMO
        end
    end
    
    classDef process fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef operation fill:#7ED321,stroke:#5BA517,color:#000
    classDef storage fill:#F5A623,stroke:#B8841A,color:#000
    
    class VR,VV,MO,ES,AS,ND process
    class VS,VP,VD,UST,UPR,WHO operation
    class SMO,PDB storage
```

### Product Management Module
```mermaid
graph TB
    subgraph "Product Lifecycle"
        PC[Product Creation] --> SU[Staged Upload]
        SU --> VA[Variant Assignment]
        VA --> II[Image Integration]
        II --> AA[Approval Assignment]
        AA --> PS[Publication Status]
        
        subgraph "Approval Workflow"
            AUTO[Auto Approval] --> PUB[Publish Product]
            MAN[Manual Approval] --> REV[Review Queue]
            REV --> APP[Approve/Reject]
            APP --> NOT[Notify Vendor]
        end
        
        subgraph "Product Updates"
            PE[Product Edit] --> VS[Version Control]
            VS --> UPD[Update Process]
            UPD --> SYN[Sync to Shopify]
        end
    end
    
    classDef lifecycle fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef approval fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef update fill:#7ED321,stroke:#5BA517,color:#000
    
    class PC,SU,VA,II,AA,PS lifecycle
    class AUTO,MAN,REV,APP,NOT,PUB approval
    class PE,VS,UPD,SYN update
```

### Order Management Module
```mermaid
graph TB
    subgraph "Order Processing Flow"
        WH[Webhook Received] --> OP[Order Parsing]
        OP --> VR[Vendor Resolution]
        VR --> PC[Payout Calculation]
        PC --> OT[Order Tagging]
        OT --> VN[Vendor Notification]
        
        subgraph "Payout Management"
            PC --> PS[Payout Schedule]
            PS --> PT[Payout Tracking]
            PT --> SP[Stripe Processing]
            SP --> PN[Payout Notification]
        end
        
        subgraph "Order Tracking"
            OT --> OS[Order Status]
            OS --> ST[Shipping Tracking]
            ST --> DN[Delivery Notification]
        end
    end
    
    classDef processing fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef payout fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef tracking fill:#7ED321,stroke:#5BA517,color:#000
    
    class WH,OP,VR,PC,OT,VN processing
    class PS,PT,SP,PN payout
    class OS,ST,DN tracking
```

## 🗄️ Data Models

### Prisma Schema Structure
```mermaid
erDiagram
    Session {
        string id PK
        string shop
        string state
        boolean isOnline
        datetime expires
        string accessToken
        string scope
    }
    
    QRCode {
        int id PK
        string title
        string shop
        string productId
        string productHandle
        string productVariantId
        string destination
        int scans
        datetime createdAt
    }
    
    AppSettings {
        int id PK
        string shop
        json vendorSettings
        json productSettings
        json payoutSettings
        boolean autoApproval
        datetime updatedAt
    }
    
    VendorPayout {
        int id PK
        string vendorId
        string orderId
        decimal amount
        string currency
        string status
        datetime createdAt
        datetime paidAt
    }
    
    Session ||--o{ QRCode : "belongs to shop"
    AppSettings ||--o{ VendorPayout : "configures payouts"
```

### Metaobject Schema (Shopify)
```mermaid
graph TB
    subgraph "Vendor Metaobject"
        VM[vendor_profile] --> VF[Vendor Fields]
        VF --> VN[name: String]
        VF --> VE[email: String]  
        VF --> VS[status: Enum]
        VF --> VD[description: Text]
        VF --> VC[commission: Number]
        VF --> VA[approved: Boolean]
    end
    
    subgraph "Product-Vendor Link"
        PV[product_vendor] --> PF[Product Fields]
        PF --> PI[product_id: String]
        PF --> VI[vendor_id: Reference]
        PF --> PS[status: Enum]
        PF --> PA[approved_at: DateTime]
    end
    
    subgraph "Settings Metaobject"
        SM[marketplace_settings] --> SF[Settings Fields]
        SF --> CAT[categories: JSON]
        SF --> VAR[variants: JSON]
        SF --> COM[commission: Number]
        SF --> AUT[auto_approval: Boolean]
    end
    
    classDef metaobject fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef fields fill:#4A90E2,stroke:#2E5C8A,color:#fff
    
    class VM,PV,SM metaobject
    class VF,VN,VE,VS,VD,VC,VA,PF,PI,VI,PS,PA,SF,CAT,VAR,COM,AUT fields
```

## 🔌 API Integration Layer

### Shopify API Integration
```mermaid
graph LR
    subgraph "API Clients"
        AC[Admin Client] --> SAA[Shopify Admin API]
        SC[Storefront Client] --> SSA[Shopify Storefront API]
        GC[GraphQL Client] --> GQL[Generated Types]
    end
    
    subgraph "API Operations"
        PROD[Product Operations] --> AC
        ORD[Order Operations] --> AC
        MET[Metaobject Operations] --> AC
        CUST[Customer Operations] --> SC
        CART[Cart Operations] --> SC
    end
    
    subgraph "Data Transformations"
        DT[Data Transformers] --> PROD
        DT --> ORD
        DT --> MET
        VL[Validation Layer] --> DT
        TC[Type Conversion] --> VL
    end
    
    classDef client fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef operation fill:#7ED321,stroke:#5BA517,color:#000
    classDef transform fill:#F5A623,stroke:#B8841A,color:#000
    
    class AC,SC,GC,SAA,SSA,GQL client
    class PROD,ORD,MET,CUST,CART operation
    class DT,VL,TC transform
```

### Webhook System
```mermaid
graph TB
    subgraph "Webhook Processing"
        WR[Webhook Received] --> WV[Webhook Validation]
        WV --> WP[Webhook Parsing]
        WP --> ER[Event Routing]
        
        subgraph "Event Handlers"
            ER --> OH[Order Handler]
            ER --> PH[Product Handler]
            ER --> AH[App Handler]
            ER --> UH[Uninstall Handler]
        end
        
        subgraph "Processing Actions"
            OH --> PC[Payout Calculation]
            PH --> PA[Product Approval]
            AH --> AU[App Update]
            UH --> CL[Cleanup]
        end
        
        subgraph "Response & Logging"
            PC --> RL[Response Logging]
            PA --> RL
            AU --> RL
            CL --> RL
            RL --> WS[Webhook Status]
        end
    end
    
    classDef webhook fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef handler fill:#7ED321,stroke:#5BA517,color:#000
    classDef action fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef logging fill:#F5A623,stroke:#B8841A,color:#000
    
    class WR,WV,WP,ER webhook
    class OH,PH,AH,UH handler
    class PC,PA,AU,CL action
    class RL,WS logging
```

## 🎨 Theme Extensions

### Extension Architecture
```mermaid
graph TB
    subgraph "Theme App Extensions"
        subgraph "Vendor Info Extension"
            VIE[Vendor Info Block] --> PDP[Product Detail Page]
            VIE --> VID[Vendor Information Display]
            VIE --> VIL[Vendor Profile Link]
        end
        
        subgraph "Collection Extension"
            CE[Collection Block] --> CP[Collection Page]
            CE --> VCP[Vendor Collection Page]
            CE --> VCF[Vendor Collection Filter]
        end
        
        subgraph "Account Extension"
            AE[Account Block] --> AP[Account Page]
            AE --> VD[Vendor Dashboard]
            AE --> OT[Order Tracking]
        end
        
        subgraph "Admin Extensions"
            OAB[Order Admin Block] --> OAP[Order Admin Page]
            OAB --> VPI[Vendor Payout Info]
            OAB --> VOI[Vendor Order Info]
        end
    end
    
    subgraph "Extension Communication"
        API[App Proxy API] --> VIE
        API --> CE
        API --> AE
        GQL[GraphQL API] --> OAB
    end
    
    classDef extension fill:#50E3C2,stroke:#38A594,color:#000
    classDef page fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef api fill:#F5A623,stroke:#B8841A,color:#000
    
    class VIE,CE,AE,OAB extension
    class PDP,CP,AP,OAP,VID,VIL,VCP,VCF,VD,OT,VPI,VOI page
    class API,GQL api
```

## 🔐 Authentication & Authorization

### Authentication Flow
```mermaid
sequenceDiagram
    participant SA as Shopify Admin
    participant MA as Market App
    participant SAP as Shopify API
    participant PDB as Prisma DB
    
    SA->>MA: Install app / Access app
    MA->>SAP: OAuth flow initiation
    SAP->>MA: Authorization code
    MA->>SAP: Exchange for access token
    SAP->>MA: Access token + shop info
    MA->>PDB: Store session data
    MA->>SA: App authenticated & loaded
    
    Note over MA,PDB: Session stored with Prisma
    Note over MA,SAP: API calls use stored token
```

### Authorization Layers
```mermaid
graph TB
    subgraph "Authorization Architecture"
        subgraph "Route Protection"
            RL[Route Loader] --> AC[Auth Check]
            AC --> SS[Session Storage]
            SS --> AT[Access Token]
        end
        
        subgraph "Role-Based Access"
            RBA[Role Check] --> AR[Admin Role]
            RBA --> VR[Vendor Role]
            RBA --> MR[Merchant Role]
        end
        
        subgraph "Permission System"
            PS[Permission Service] --> PP[Product Permissions]
            PS --> OP[Order Permissions]
            PS --> SP[Settings Permissions]
        end
        
        subgraph "API Authorization"
            AA[API Auth] --> SV[Scope Validation]
            AA --> RT[Rate Limiting]
            AA --> WV[Webhook Validation]
        end
    end
    
    classDef auth fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef role fill:#7ED321,stroke:#5BA517,color:#000
    classDef permission fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef api fill:#F5A623,stroke:#B8841A,color:#000
    
    class RL,AC,SS,AT auth
    class RBA,AR,VR,MR role
    class PS,PP,OP,SP permission
    class AA,SV,RT,WV api
```

## 🚀 Performance Optimizations

### Remix Performance Features
```mermaid
graph LR
    subgraph "Performance Strategies"
        subgraph "Server-Side"
            SSR[Server-Side Rendering] --> HC[HTTP Caching]
            LD[Loader Deduplication] --> BD[Boundary Dehydration]
            PL[Parallel Loading] --> RA[Resource Preloading]
        end
        
        subgraph "Client-Side"
            CS[Code Splitting] --> LL[Lazy Loading]
            PC[Prefetch Components] --> IC[Incremental Caching]
            OL[Optimistic Loading] --> PU[Progressive Updates]
        end
        
        subgraph "Data Optimization"
            QO[Query Optimization] --> IC2[Index Coverage]
            DP[Data Pagination] --> BF[Batch Fetching]
            CD[Cache Duration] --> SWR[Stale While Revalidate]
        end
    end
    
    classDef server fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef client fill:#7ED321,stroke:#5BA517,color:#000
    classDef data fill:#F5A623,stroke:#B8841A,color:#000
    
    class SSR,LD,PL,HC,BD,RA server
    class CS,PC,OL,LL,IC,PU client
    class QO,DP,CD,IC2,BF,SWR data
```

## 📊 Monitoring & Observability

### Application Monitoring
```mermaid
graph TB
    subgraph "Monitoring Stack"
        subgraph "Error Tracking"
            EB[Error Boundaries] --> EL[Error Logging]
            EL --> EC[Error Collection]
            EC --> EA[Error Analysis]
        end
        
        subgraph "Performance Monitoring"
            PM[Performance Metrics] --> LT[Load Times]
            PM --> RT[Response Times]
            PM --> RU[Resource Usage]
        end
        
        subgraph "Business Metrics"
            BM[Business Monitoring] --> VC[Vendor Conversions]
            BM --> PT[Product Transactions]
            BM --> OR[Order Revenue]
        end
        
        subgraph "Infrastructure"
            IM[Infrastructure Metrics] --> DU[Database Usage]
            IM --> AU[API Usage]
            IM --> MU[Memory Usage]
        end
    end
    
    classDef error fill:#C53030,stroke:#9B2C2C,color:#fff
    classDef performance fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef business fill:#7ED321,stroke:#5BA517,color:#000
    classDef infrastructure fill:#F5A623,stroke:#B8841A,color:#000
    
    class EB,EL,EC,EA error
    class PM,LT,RT,RU performance
    class BM,VC,PT,OR business
    class IM,DU,AU,MU infrastructure
```

---

**Previous:** [← Technology Stack](./02-technology-stack.md) | **Next:** [Admin App Architecture →](./04-admin-app-architecture.md)