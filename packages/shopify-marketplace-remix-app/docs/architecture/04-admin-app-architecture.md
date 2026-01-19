# Admin App Architecture

This document details the architecture of the legacy Admin App, built with Express.js and React, serving as the channel management and administrative interface.

## 🏗️ Application Overview

The Admin App is a legacy Express.js application with React frontend that provides channel management functionality and administrative tools for the marketplace. It uses a traditional MPA (Multi-Page Application) architecture with server-side rendering.

```mermaid
graph TB
    subgraph "Admin App Architecture"
        subgraph "Frontend Layer (Client)"
            RC[React Components] --> CUI[Channels UI]
            RC --> P[Polaris Components]
            RC --> AB[App Bridge]
            RC --> WP[Webpack Bundle]
        end
        
        subgraph "Server Layer (Express)"
            ES[Express Server] --> MW[Middleware Stack]
            MW --> AR[Auth Routes]
            MW --> WR[Webhook Routes]
            MW --> SR[Static Routes]
        end
        
        subgraph "GraphQL Layer"
            AS[Apollo Server] --> GS[GraphQL Schema]
            GS --> RES[Resolvers]
            RES --> SH[Shopify Handlers]
        end
        
        subgraph "Data Layer"
            SO[Sequelize ORM] --> SDB[(SQLite Database)]
            CSH[Custom Session Handler] --> SDB
            SH --> SA[Shopify APIs]
        end
        
        subgraph "External Services"
            SA --> SAA[Shopify Admin API]
            SA --> SSA[Shopify Storefront API]
            WH[Webhook System] --> SA
        end
    end
    
    %% Connections
    RC --> ES
    WP --> ES
    ES --> AS
    AS --> SO
    SO --> CSH
    
    classDef frontend fill:#61DAFB,stroke:#21A0C4,color:#000
    classDef server fill:#000000,stroke:#333,color:#fff
    classDef graphql fill:#E10098,stroke:#B8085A,color:#fff
    classDef data fill:#52B6E8,stroke:#3A8BC4,color:#000
    classDef external fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class RC,CUI,P,AB,WP frontend
    class ES,MW,AR,WR,SR server
    class AS,GS,RES,SH graphql
    class SO,SDB,CSH data
    class SA,SAA,SSA,WH external
```

## 📁 Directory Structure

```mermaid
graph TB
    subgraph "Admin App File Structure"
        subgraph "Frontend (app/)"
            AC[components/] --> RC[React Components]
            AS[styles/] --> CSS[Stylesheets]
            AJ[javascript/] --> JS[Client JavaScript]
        end
        
        subgraph "Backend (server/)"
            SI[index.js] --> SM[Main Server]
            SH[handlers/] --> API[API Handlers]
            SHP[helpers.js] --> UT[Utilities]
            CSS2[custom-session-storage.js] --> SS[Session Storage]
        end
        
        subgraph "Configuration"
            WC[webpack.config.js] --> WS[Webpack Setup]
            PC[package.json] --> PD[Dependencies]
            CC[config/] --> CD[Config Files]
        end
        
        subgraph "Database"
            M[models/] --> DM[Data Models]
            MIG[migrations/] --> MS[Migration Scripts]
        end
    end
    
    classDef frontend fill:#61DAFB,stroke:#21A0C4,color:#000
    classDef backend fill:#000000,stroke:#333,color:#fff
    classDef config fill:#F5A623,stroke:#B8841A,color:#000
    classDef database fill:#52B6E8,stroke:#3A8BC4,color:#000
    
    class AC,AS,AJ,RC,CSS,JS frontend
    class SI,SH,SHP,CSS2,SM,API,UT,SS backend
    class WC,PC,CC,WS,PD,CD config
    class M,MIG,DM,MS database
```

## 🛠️ Express Server Architecture

### Server Setup & Middleware Stack
```mermaid
graph TB
    subgraph "Express Server Flow"
        subgraph "Initialization"
            APP[Express App] --> AGS[Apollo GraphQL Server]
            AGS --> MW[Middleware Setup]
        end
        
        subgraph "Middleware Stack"
            MW --> CORS[CORS Headers]
            CORS --> JSON[JSON Parser]
            JSON --> HIST[History API Fallback]
            HIST --> WDM[Webpack Dev Middleware]
            WDM --> WHM[Webpack Hot Middleware]
        end
        
        subgraph "Route Handlers"
            WHM --> AUTH[Auth Routes]
            AUTH --> WH[Webhook Routes]
            WH --> STATIC[Static File Serving]
        end
        
        subgraph "Environment Handling"
            ENV[Environment Check] --> DEV[Development Mode]
            ENV --> PROD[Production Mode]
            DEV --> WDM
            PROD --> STATIC
        end
    end
    
    classDef init fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef middleware fill:#7ED321,stroke:#5BA517,color:#000
    classDef routes fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef environment fill:#F5A623,stroke:#B8841A,color:#000
    
    class APP,AGS,MW init
    class CORS,JSON,HIST,WDM,WHM middleware
    class AUTH,WH,STATIC routes
    class ENV,DEV,PROD environment
```

### Authentication Flow
```mermaid
sequenceDiagram
    participant SA as Shopify Admin
    participant AA as Admin App
    participant SAP as Shopify API
    participant SDB as SQLite DB
    
    SA->>AA: GET /auth (or /login)
    AA->>SAP: beginAuth with shop
    SAP->>AA: OAuth redirect URL
    AA->>SA: Redirect to Shopify OAuth
    SA->>AA: GET /auth/callback with code
    AA->>SAP: validateAuthCallback
    SAP->>AA: Session with access token
    AA->>AA: getOrCreateStorefrontAccessToken
    AA->>AA: getShopDetails
    AA->>SDB: Upsert shop data
    AA->>AA: registerWebhooks
    AA->>SA: Redirect to app with session
```

## 🔌 GraphQL Server Architecture

### Apollo Server Setup
```mermaid
graph TB
    subgraph "Apollo GraphQL Server"
        subgraph "Server Configuration"
            AS[Apollo Server] --> TD[Type Definitions]
            AS --> RES[Resolvers]
            AS --> CTX[Context Setup]
        end
        
        subgraph "Authentication Context"
            CTX --> AH[Auth Header Check]
            AH --> ST[Session Token Decode]
            ST --> SL[Session Loading]
            SL --> SC[Shop Context]
        end
        
        subgraph "Schema & Resolvers"
            TD --> GS[GraphQL Schema]
            RES --> QR[Query Resolvers]
            RES --> MR[Mutation Resolvers]
            QR --> SH[Shopify Handlers]
            MR --> SH
        end
        
        subgraph "Data Sources"
            SH --> SAA[Shopify Admin API]
            SH --> SSA[Shopify Storefront API]
            SH --> SDB[(Session Database)]
        end
    end
    
    classDef apollo fill:#E10098,stroke:#B8085A,color:#fff
    classDef auth fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef schema fill:#7ED321,stroke:#5BA517,color:#000
    classDef datasource fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class AS,TD,RES,CTX apollo
    class AH,ST,SL,SC auth
    class GS,QR,MR,SH schema
    class SAA,SSA,SDB datasource
```

### GraphQL Schema Structure
```mermaid
graph TB
    subgraph "GraphQL Type System"
        subgraph "Query Types"
            Q[Query] --> SP[shop]
            Q --> PR[products]
            Q --> OR[orders]
            Q --> CH[channels]
        end
        
        subgraph "Mutation Types"
            M[Mutation] --> CP[createProduct]
            M --> UP[updateProduct]
            M --> CC[createChannel]
            M --> UC[updateChannel]
        end
        
        subgraph "Custom Types"
            CT[Custom Types] --> SHOP[Shop]
            CT --> PROD[Product]
            CT --> ORD[Order]
            CT --> CHAN[Channel]
        end
        
        subgraph "Scalar Types"
            ST[Scalars] --> DT[DateTime]
            ST --> JSON[JSON]
            ST --> URL[URL]
        end
    end
    
    classDef query fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef mutation fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef types fill:#7ED321,stroke:#5BA517,color:#000
    classDef scalars fill:#F5A623,stroke:#B8841A,color:#000
    
    class Q,SP,PR,OR,CH query
    class M,CP,UP,CC,UC mutation
    class CT,SHOP,PROD,ORD,CHAN types
    class ST,DT,JSON,URL scalars
```

## 🗄️ Database Architecture

### Sequelize ORM Models
```mermaid
erDiagram
    Shop {
        string domain PK
        string storefrontAccessToken
        string name
        string country
        datetime createdAt
        datetime updatedAt
    }
    
    Session {
        string sessionId PK
        text sessionData
        datetime createdAt
        datetime updatedAt
    }
    
    Channel {
        int id PK
        string shopDomain FK
        string name
        string type
        json configuration
        boolean active
        datetime createdAt
        datetime updatedAt
    }
    
    ProductListing {
        int id PK
        string shopDomain FK
        string productId
        string channelId FK
        boolean published
        datetime publishedAt
        datetime createdAt
        datetime updatedAt
    }
    
    Shop ||--o{ Channel : "has many"
    Shop ||--o{ ProductListing : "has many"
    Channel ||--o{ ProductListing : "belongs to"
    Shop ||--o{ Session : "has sessions"
```

### Custom Session Storage
```mermaid
graph TB
    subgraph "Session Storage Architecture"
        subgraph "Session Interface"
            SI[Session Interface] --> SC[storeCallback]
            SI --> LC[loadCallback]
            SI --> DC[deleteCallback]
        end
        
        subgraph "Database Operations"
            SC --> UPS[Upsert Session]
            LC --> FS[Find Session]
            DC --> DS[Delete Session]
        end
        
        subgraph "Data Handling"
            UPS --> SER[JSON Serialize]
            FS --> DES[JSON Deserialize]
            DS --> VAL[Validation]
        end
        
        subgraph "Error Handling"
            SER --> EH[Error Handling]
            DES --> EH
            VAL --> EH
            EH --> LOG[Error Logging]
        end
    end
    
    classDef interface fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef database fill:#52B6E8,stroke:#3A8BC4,color:#000
    classDef data fill:#7ED321,stroke:#5BA517,color:#000
    classDef error fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class SI,SC,LC,DC interface
    class UPS,FS,DS database
    class SER,DES,VAL data
    class EH,LOG error
```

## 🎨 Frontend Architecture

### React Component Structure
```mermaid
graph TB
    subgraph "React Frontend Architecture"
        subgraph "Component Hierarchy"
            APP[App Component] --> Layout[Layout Components]
            Layout --> Pages[Page Components]
            Pages --> Features[Feature Components]
            Features --> UI[UI Components]
        end
        
        subgraph "State Management"
            SM[State Management] --> LS[Local State]
            SM --> CS[Component State]
            SM --> AS[Apollo State]
        end
        
        subgraph "Data Fetching"
            DF[Data Fetching] --> GQ[GraphQL Queries]
            DF --> GM[GraphQL Mutations]
            DF --> AC[Apollo Client]
        end
        
        subgraph "UI Libraries"
            UIL[UI Libraries] --> POL[Polaris]
            UIL --> CUI[Channels UI]
            UIL --> AB[App Bridge]
        end
    end
    
    classDef component fill:#61DAFB,stroke:#21A0C4,color:#000
    classDef state fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef data fill:#E10098,stroke:#B8085A,color:#fff
    classDef ui fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class APP,Layout,Pages,Features,UI component
    class SM,LS,CS,AS state
    class DF,GQ,GM,AC data
    class UIL,POL,CUI,AB ui
```

### Webpack Configuration
```mermaid
graph TB
    subgraph "Webpack Build Process"
        subgraph "Entry Points"
            EP[Entry Points] --> JS[JavaScript Entry]
            EP --> CSS[CSS Entry]
        end
        
        subgraph "Loaders"
            LO[Loaders] --> BL[Babel Loader]
            LO --> CL[CSS Loader]
            LO --> FL[File Loader]
            LO --> SL[Style Loader]
        end
        
        subgraph "Plugins"
            PL[Plugins] --> HWP[HTML Webpack Plugin]
            PL --> HMR[Hot Module Replacement]
            PL --> MW[Mini CSS Extract]
        end
        
        subgraph "Output"
            OP[Output] --> BP[Bundle Path]
            OP --> AP[Asset Path]
            OP --> PP[Public Path]
        end
        
        subgraph "Development vs Production"
            MODE[Mode] --> DEV[Development]
            MODE --> PROD[Production]
            DEV --> HMR
            PROD --> MW
        end
    end
    
    classDef entry fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef loader fill:#7ED321,stroke:#5BA517,color:#000
    classDef plugin fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef output fill:#F5A623,stroke:#B8841A,color:#000
    classDef mode fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class EP,JS,CSS entry
    class LO,BL,CL,FL,SL loader
    class PL,HWP,HMR,MW plugin
    class OP,BP,AP,PP output
    class MODE,DEV,PROD mode
```

## 🔗 API Integration Layer

### Shopify API Handlers
```mermaid
graph TB
    subgraph "API Handler Architecture"
        subgraph "Handler Organization"
            HF[Handler Files] --> PH[Product Handlers]
            HF --> OH[Order Handlers]
            HF --> SH[Shop Handlers]
            HF --> WH[Webhook Handlers]
        end
        
        subgraph "API Operations"
            AO[API Operations] --> CRUD[CRUD Operations]
            AO --> BATCH[Batch Operations]
            AO --> SEARCH[Search Operations]
        end
        
        subgraph "Data Transformation"
            DT[Data Transform] --> REQ[Request Transform]
            DT --> RESP[Response Transform]
            DT --> VAL[Validation]
        end
        
        subgraph "Error Handling"
            EH[Error Handling] --> RETRY[Retry Logic]
            EH --> LOG[Error Logging]
            EH --> FALLBACK[Fallback Strategy]
        end
    end
    
    classDef handler fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef operation fill:#7ED321,stroke:#5BA517,color:#000
    classDef transform fill:#F5A623,stroke:#B8841A,color:#000
    classDef error fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class HF,PH,OH,SH,WH handler
    class AO,CRUD,BATCH,SEARCH operation
    class DT,REQ,RESP,VAL transform
    class EH,RETRY,LOG,FALLBACK error
```

### Webhook System
```mermaid
graph TB
    subgraph "Webhook Processing Flow"
        subgraph "Webhook Reception"
            WR[Webhook Received] --> VER[HMAC Verification]
            VER --> PARSE[Parse Payload]
            PARSE --> ROUTE[Route to Handler]
        end
        
        subgraph "Event Processing"
            ROUTE --> PH[Product Events]
            ROUTE --> OH[Order Events]
            ROUTE --> AH[App Events]
            ROUTE --> UH[Uninstall Events]
        end
        
        subgraph "Business Logic"
            PH --> PU[Product Updates]
            OH --> OT[Order Tracking]
            AH --> AU[App Updates]
            UH --> CL[Cleanup Tasks]
        end
        
        subgraph "Response & Logging"
            PU --> RL[Response Logging]
            OT --> RL
            AU --> RL
            CL --> RL
            RL --> STATUS[200 OK Response]
        end
    end
    
    classDef reception fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef processing fill:#7ED321,stroke:#5BA517,color:#000
    classDef business fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef response fill:#F5A623,stroke:#B8841A,color:#000
    
    class WR,VER,PARSE,ROUTE reception
    class PH,OH,AH,UH processing
    class PU,OT,AU,CL business
    class RL,STATUS response
```

## 🔧 Helper Functions & Utilities

### Helper System Architecture
```mermaid
graph TB
    subgraph "Helper Function Organization"
        subgraph "Core Helpers"
            CH[Core Helpers] --> AUTH[Auth Helpers]
            CH --> API[API Helpers]
            CH --> DATA[Data Helpers]
        end
        
        subgraph "Shopify Utilities"
            SU[Shopify Utils] --> TOK[Token Management]
            SU --> REQ[Request Builders]
            SU --> RESP[Response Parsers]
        end
        
        subgraph "Database Utilities"
            DU[Database Utils] --> CONN[Connection Management]
            DU --> QUERY[Query Builders]
            DU --> MIGR[Migration Helpers]
        end
        
        subgraph "Common Utilities"
            CU[Common Utils] --> VAL[Validation]
            CU --> LOG[Logging]
            CU --> ERR[Error Handling]
        end
    end
    
    classDef core fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef shopify fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef database fill:#52B6E8,stroke:#3A8BC4,color:#000
    classDef common fill:#F5A623,stroke:#B8841A,color:#000
    
    class CH,AUTH,API,DATA core
    class SU,TOK,REQ,RESP shopify
    class DU,CONN,QUERY,MIGR database
    class CU,VAL,LOG,ERR common
```

## 🚀 Development & Build Process

### Development Workflow
```mermaid
graph LR
    subgraph "Development Process"
        subgraph "Local Development"
            CLI[Shopify CLI] --> TUNNEL[Tunnel Setup]
            TUNNEL --> DEV[Dev Server]
            DEV --> HMR[Hot Module Reload]
        end
        
        subgraph "Build Process"
            BP[Build Process] --> BABEL[Babel Transpilation]
            BABEL --> WEBPACK[Webpack Bundling]
            WEBPACK --> MINIFY[Minification]
        end
        
        subgraph "Database Setup"
            DB[Database Setup] --> MIGR[Run Migrations]
            MIGR --> SEED[Seed Data]
            SEED --> CONN[Test Connection]
        end
        
        subgraph "Environment Config"
            ENV[Environment] --> VARS[Environment Variables]
            VARS --> SCOPES[Shopify Scopes]
            SCOPES --> HOOKS[Webhook URLs]
        end
    end
    
    classDef dev fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef build fill:#7ED321,stroke:#5BA517,color:#000
    classDef database fill:#52B6E8,stroke:#3A8BC4,color:#000
    classDef environment fill:#F5A623,stroke:#B8841A,color:#000
    
    class CLI,TUNNEL,DEV,HMR dev
    class BP,BABEL,WEBPACK,MINIFY build
    class DB,MIGR,SEED,CONN database
    class ENV,VARS,SCOPES,HOOKS environment
```

## 📊 Legacy Considerations

### Migration Strategy
```mermaid
graph TB
    subgraph "Legacy to Modern Migration"
        subgraph "Current State"
            LEG[Legacy Express App] --> REACT16[React 16.14]
            LEG --> WEBPACK5[Webpack 5]
            LEG --> APOLLO3[Apollo 3]
        end
        
        subgraph "Migration Path"
            MP[Migration Process] --> API[API Modernization]
            MP --> COMP[Component Upgrade]
            MP --> STATE[State Management]
        end
        
        subgraph "Target State"
            MOD[Modern Stack] --> REACT18[React 18+]
            MOD --> VITE[Vite Build]
            MOD --> GQL[GraphQL Client]
        end
        
        subgraph "Compatibility Layer"
            CL[Compatibility] --> BRIDGE[API Bridge]
            CL --> ADAPTER[Data Adapters]
            CL --> WRAPPER[Component Wrappers]
        end
    end
    
    classDef legacy fill:#C53030,stroke:#9B2C2C,color:#fff
    classDef migration fill:#F5A623,stroke:#B8841A,color:#000
    classDef modern fill:#7ED321,stroke:#5BA517,color:#000
    classDef compatibility fill:#4A90E2,stroke:#2E5C8A,color:#fff
    
    class LEG,REACT16,WEBPACK5,APOLLO3 legacy
    class MP,API,COMP,STATE migration
    class MOD,REACT18,VITE,GQL modern
    class CL,BRIDGE,ADAPTER,WRAPPER compatibility
```

## 🔍 Performance & Optimization

### Performance Strategy
```mermaid
graph TB
    subgraph "Performance Optimization"
        subgraph "Frontend Performance"
            FP[Frontend Perf] --> CC[Code Splitting]
            FP --> LC[Lazy Loading]
            FP --> CACHE[Browser Caching]
        end
        
        subgraph "Backend Performance"
            BP[Backend Perf] --> CP[Connection Pooling]
            BP --> QO[Query Optimization]
            BP --> MC[Memory Caching]
        end
        
        subgraph "API Performance"
            AP[API Performance] --> RL[Rate Limiting]
            AP --> BF[Batch Fetching]
            AP --> PG[Pagination]
        end
        
        subgraph "Database Performance"
            DP[Database Perf] --> IDX[Indexing]
            DP --> QC[Query Caching]
            DP --> CONN[Connection Management]
        end
    end
    
    classDef frontend fill:#61DAFB,stroke:#21A0C4,color:#000
    classDef backend fill:#000000,stroke:#333,color:#fff
    classDef api fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef database fill:#52B6E8,stroke:#3A8BC4,color:#000
    
    class FP,CC,LC,CACHE frontend
    class BP,CP,QO,MC backend
    class AP,RL,BF,PG api
    class DP,IDX,QC,CONN database
```

---

**Previous:** [← Market App Architecture](./03-market-app-architecture.md) | **Next:** [Buyer App Architecture →](./05-buyer-app-architecture.md)