# System Overview

This document provides a high-level overview of the Shopify Marketplace Remix App architecture, including all applications, their relationships, and core workflows.

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Shopify Marketplace Ecosystem"
        subgraph "Core Applications"
            MA[Market App<br/>Remix Framework<br/>Main Marketplace]
            AA[Admin App<br/>Express + React<br/>Legacy Admin]
            BA[Buyer App<br/>Next.js<br/>Customer Frontend]
        end
        
        subgraph "Shopify APIs"
            SAA[Shopify Admin API<br/>GraphQL + REST]
            SSA[Shopify Storefront API<br/>GraphQL]
            SWH[Shopify Webhooks<br/>Event Notifications]
        end
        
        subgraph "Data Layer"
            PDB[(Prisma DB<br/>SQLite/PostgreSQL)]
            SDB[(Sequelize DB<br/>SQLite)]
            MO[Metaobjects<br/>Shopify Native Storage]
        end
        
        subgraph "External Services"
            RS[Resend API<br/>Email Service]
            CF[Cloudflare<br/>CDN & Tunneling]
        end
        
        subgraph "Theme Extensions"
            VE[Vendor Info Extension]
            CE[Collection Extension]  
            AE[Account Page Extension]
            OE[Order Admin Block]
        end
    end
    
    %% Application Connections
    MA --> SAA
    MA --> SSA
    MA --> SWH
    MA --> PDB
    MA --> MO
    MA --> RS
    
    AA --> SAA
    AA --> SDB
    AA --> SWH
    
    BA --> SSA
    
    %% Extension Connections
    MA --> VE
    MA --> CE
    MA --> AE
    MA --> OE
    
    %% External Connections
    MA --> CF
    BA --> CF
    
    %% Inter-App Communication
    MA -.-> AA
    MA -.-> BA
    
    classDef coreApp fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef shopifyAPI fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef database fill:#F5A623,stroke:#B8841A,color:#000
    classDef external fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef extension fill:#50E3C2,stroke:#38A594,color:#000
    
    class MA,AA,BA coreApp
    class SAA,SSA,SWH shopifyAPI
    class PDB,SDB,MO database
    class RS,CF external
    class VE,CE,AE,OE extension
```

## 📱 Application Overview

### Market App (Primary Application)
- **Framework**: Remix (React-based full-stack framework)
- **Purpose**: Main marketplace application for vendors and marketplace management
- **Key Features**:
  - Vendor onboarding and management
  - Product creation and approval workflows
  - Order management and payouts
  - Marketplace administration
  - Theme app extensions

### Admin App (Legacy)
- **Framework**: Express.js + React
- **Purpose**: Legacy admin functionality and channel management
- **Key Features**:
  - Channel management
  - Shop configuration
  - Legacy admin workflows
  - GraphQL server with Apollo

### Buyer App (Customer Frontend)
- **Framework**: Next.js
- **Purpose**: Customer-facing marketplace frontend
- **Key Features**:
  - Product browsing and search
  - Shopping cart and checkout
  - Vendor profiles
  - Multi-vendor marketplace experience

## 🔄 Core Workflows

### Vendor Onboarding Flow
```mermaid
sequenceDiagram
    participant V as Vendor
    participant MA as Market App
    participant SAA as Shopify Admin API
    participant MO as Metaobjects
    participant RS as Resend API
    
    V->>MA: Complete vendor registration
    MA->>MO: Create vendor metaobject
    MA->>SAA: Set up vendor permissions
    MA->>RS: Send welcome email
    MA->>V: Display onboarding status
```

### Product Creation & Approval Flow
```mermaid
sequenceDiagram
    participant V as Vendor
    participant MA as Market App
    participant SAA as Shopify Admin API
    participant MO as Metaobjects
    participant A as Admin
    
    V->>MA: Create product
    MA->>SAA: Upload product with staged upload
    MA->>MO: Link product to vendor
    MA->>A: Notify for approval (if manual approval)
    A->>MA: Approve/reject product
    MA->>SAA: Update product status
    MA->>V: Notify approval status
```

### Customer Purchase Flow
```mermaid
sequenceDiagram
    participant C as Customer
    participant BA as Buyer App
    participant SSA as Storefront API
    participant MA as Market App
    participant V as Vendor
    
    C->>BA: Browse products
    BA->>SSA: Fetch product data
    C->>BA: Add to cart & checkout
    BA->>SSA: Process checkout
    SSA->>MA: Webhook: Order created
    MA->>V: Notify new order
    MA->>MA: Calculate vendor payout
```

## 🛠️ Technology Integration Points

### Shopify Integration
- **Admin API**: Product management, order processing, metaobject operations
- **Storefront API**: Customer-facing product data and checkout
- **Webhooks**: Real-time event processing for orders, products, and app lifecycle
- **App Bridge**: Embedded app experience within Shopify admin

### Database Strategy
- **Market App**: Uses Prisma with SQLite (production: PostgreSQL)
- **Admin App**: Uses Sequelize with SQLite
- **Metaobjects**: Native Shopify storage for vendor and product metadata

### Theme Extensions
- **Vendor Info Extension**: Displays vendor information on product pages
- **Collection Extension**: Shows vendor-specific collections
- **Account Extension**: Vendor dashboard in customer accounts
- **Admin Order Block**: Vendor information in admin order view

## 🔐 Security & Authentication

### OAuth Flow
```mermaid
sequenceDiagram
    participant S as Shop Owner
    participant SA as Shopify Admin
    participant MA as Market App
    participant API as Shopify API
    
    S->>SA: Install marketplace app
    SA->>MA: OAuth authorization request
    MA->>API: Validate authorization
    API->>MA: Return access token
    MA->>MA: Store session data
    MA->>S: App installation complete
```

### Session Management
- **Market App**: Uses Prisma session storage with encrypted tokens
- **Admin App**: Custom session storage with database persistence
- **Cross-App**: Independent session management per application

## 📊 Data Architecture

### Data Flow Hierarchy
```mermaid
graph TD
    subgraph "Shopify Core"
        SP[Shopify Products]
        SO[Shopify Orders]
        SC[Shopify Customers]
    end
    
    subgraph "Marketplace Data"
        MO[Metaobjects<br/>Vendor Info]
        VS[Vendor Settings]
        PS[Product Settings]
    end
    
    subgraph "Application Data"
        PDB[(Market App DB<br/>Sessions, Settings)]
        SDB[(Admin DB<br/>Channels, Config)]
    end
    
    SP --> MO
    SO --> VS
    MO --> PDB
    VS --> PDB
    PS --> SDB
    
    classDef shopify fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef meta fill:#50E3C2,stroke:#38A594,color:#000
    classDef appdb fill:#F5A623,stroke:#B8841A,color:#000
    
    class SP,SO,SC shopify
    class MO,VS,PS meta
    class PDB,SDB appdb
```

## 🚀 Deployment Model

The system follows a multi-app deployment strategy:
- **Market App**: Primary Remix application (main domain)
- **Admin App**: Legacy Express app (subdomain or separate domain)
- **Buyer App**: Next.js static/SSR deployment (customer-facing domain)
- **Extensions**: Deployed via Shopify CLI to Shopify's infrastructure

## 📈 Scalability Considerations

### Horizontal Scaling
- Each app can be scaled independently
- Database connections managed per app
- Shopify API rate limiting handled per app

### Performance Optimization
- **Market App**: Server-side rendering with Remix
- **Buyer App**: Static generation with Next.js
- **Admin App**: Client-side rendering with React
- **CDN**: Cloudflare for static assets and API acceleration

---

**Next:** [Technology Stack →](./02-technology-stack.md)