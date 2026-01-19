# Technology Stack

This document details the complete technology stack used across all applications in the Shopify Marketplace ecosystem.

## 🏗️ Technology Stack Overview

```mermaid
graph TB
    subgraph "Frontend Technologies"
        subgraph "Market App Frontend"
            MR[Remix React]
            MV[Vite Build Tool]
            MP[Polaris UI]
            MAB[App Bridge React]
        end
        
        subgraph "Admin App Frontend"
            AR[React 16.14]
            AW[Webpack]
            ACU[Channels UI]
            AAB[App Bridge]
        end
        
        subgraph "Buyer App Frontend"
            BN[Next.js]
            BR[React 18]
            BM[Material-UI]
            BV[Vercel/Static]
        end
    end
    
    subgraph "Backend Technologies"
        subgraph "Market App Backend"
            MRS[Remix Server]
            MN[Node.js 18+]
            MP2[Prisma ORM]
            MG[GraphQL Codegen]
        end
        
        subgraph "Admin App Backend"
            AE[Express.js]
            AAN[Node.js]
            AS[Sequelize ORM]
            AAG[Apollo GraphQL]
        end
    end
    
    subgraph "Database Technologies"
        MSQ[(SQLite/PostgreSQL)]
        ASQ[(SQLite)]
        SMO[Shopify Metaobjects]
    end
    
    subgraph "External Services"
        SA[Shopify APIs]
        SR[Resend Email]
        SC[Cloudflare]
        SGH[GitHub Actions]
    end
    
    %% Connections
    MR --> MRS
    MV --> MRS
    MP --> MR
    MAB --> MR
    MRS --> MP2
    MP2 --> MSQ
    MRS --> SA
    
    AR --> AE
    AW --> AR
    ACU --> AR
    AAB --> AR
    AE --> AS
    AS --> ASQ
    AE --> AAG
    AAG --> SA
    
    BN --> BR
    BM --> BR
    BN --> SA
    
    MRS --> SR
    MRS --> SC
    AE --> SC
    BN --> SC
    
    classDef frontend fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef backend fill:#7ED321,stroke:#5BA517,color:#000
    classDef database fill:#F5A623,stroke:#B8841A,color:#000
    classDef external fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class MR,MV,MP,MAB,AR,AW,ACU,AAB,BN,BR,BM,BV frontend
    class MRS,MN,MP2,MG,AE,AAN,AS,AAG backend
    class MSQ,ASQ,SMO database
    class SA,SR,SC,SGH external
```

## 📦 Detailed Technology Breakdown

### Market App (Primary Application)

#### Frontend Stack
```mermaid
graph LR
    subgraph "Market App Frontend"
        R[React 19.1.1] --> RM[Remix 2.16.1]
        RM --> V[Vite 7.1.3]
        P[Polaris 13.9.5] --> R
        AB[App Bridge React 4.1.6] --> R
        TS[TypeScript 5.2.2] --> R
    end
    
    classDef react fill:#61DAFB,stroke:#21A0C4,color:#000
    classDef build fill:#646CFF,stroke:#4B5563,color:#fff
    classDef ui fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class R,RM react
    class V,TS build
    class P,AB ui
```

**Key Technologies:**
- **React 19.1.1**: Latest React with concurrent features
- **Remix 2.16.1**: Full-stack React framework with SSR
- **Vite 7.1.3**: Fast build tool and dev server
- **TypeScript 5.2.2**: Type safety and developer experience
- **Shopify Polaris 13.9.5**: Shopify's design system
- **App Bridge React 4.1.6**: Shopify admin integration

#### Backend Stack
```mermaid
graph LR
    subgraph "Market App Backend"
        N[Node.js 18.20+] --> SR[Shopify Remix 3.7.0]
        SR --> P[Prisma 6.2.1]
        P --> DB[(SQLite/PostgreSQL)]
        GC[GraphQL Codegen] --> SR
        ZV[Zod Validation] --> SR
    end
    
    classDef node fill:#339933,stroke:#2D7A2D,color:#fff
    classDef orm fill:#2D3748,stroke:#1A202C,color:#fff
    classDef db fill:#F5A623,stroke:#B8841A,color:#000
    
    class N node
    class SR,GC,ZV orm
    class P,DB db
```

**Key Technologies:**
- **Node.js 18.20+**: Runtime environment
- **Shopify App Remix 3.7.0**: Shopify's Remix integration
- **Prisma 6.2.1**: Modern ORM with type safety
- **GraphQL Codegen**: Automatic type generation
- **SQLite**: Development database
- **PostgreSQL**: Production database

### Admin App (Legacy)

#### Frontend Stack
```mermaid
graph LR
    subgraph "Admin App Frontend"
        R[React 16.14] --> W[Webpack 5.65]
        CU[Channels UI 1.0.3] --> R
        AB[App Bridge 2.0.5] --> R
        P[Polaris 9.18.0] --> R
        B[Babel 7.16] --> W
    end
    
    classDef react fill:#61DAFB,stroke:#21A0C4,color:#000
    classDef build fill:#1C78C0,stroke:#0F4C75,color:#fff
    classDef ui fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class R react
    class W,B build
    class CU,AB,P ui
```

**Key Technologies:**
- **React 16.14**: Stable React version
- **Webpack 5.65**: Module bundler
- **Channels UI 1.0.3**: Shopify channels design system
- **App Bridge 2.0.5**: Shopify admin integration
- **Babel 7.16**: JavaScript transpilation

#### Backend Stack
```mermaid
graph LR
    subgraph "Admin App Backend"
        N[Node.js] --> E[Express 4.17.1]
        E --> AG[Apollo GraphQL 3.6.0]
        E --> S[Sequelize 6.12.0]
        S --> DB[(SQLite)]
        AC[Apollo Client 3.5.6] --> AG
    end
    
    classDef node fill:#339933,stroke:#2D7A2D,color:#fff
    classDef server fill:#000000,stroke:#333,color:#fff
    classDef graphql fill:#E10098,stroke:#B8085A,color:#fff
    classDef orm fill:#52B6E8,stroke:#3A8BC4,color:#000
    classDef db fill:#F5A623,stroke:#B8841A,color:#000
    
    class N node
    class E server
    class AG,AC graphql
    class S orm
    class DB db
```

**Key Technologies:**
- **Express 4.17.1**: Web application framework
- **Apollo Server 3.6.0**: GraphQL server
- **Sequelize 6.12.0**: Promise-based ORM
- **SQLite**: Database for sessions and configuration

### Buyer App (Customer Frontend)

#### Frontend Stack
```mermaid
graph LR
    subgraph "Buyer App Frontend"
        N[Next.js 13+] --> R[React 18.2]
        M[Material-UI 5+] --> R
        TS[TypeScript] --> N
        GQL[GraphQL] --> N
        V[Vercel] --> N
    end
    
    classDef next fill:#000000,stroke:#333,color:#fff
    classDef react fill:#61DAFB,stroke:#21A0C4,color:#000
    classDef ui fill:#007FFF,stroke:#0056CC,color:#fff
    classDef deploy fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class N next
    class R react
    class M,TS ui
    class GQL,V deploy
```

**Key Technologies:**
- **Next.js**: React framework with SSG/SSR
- **React 18.2**: Modern React with concurrent features
- **Material-UI**: Google's Material Design components
- **TypeScript**: Type safety
- **GraphQL**: Data fetching from Shopify Storefront API

## 🔧 Development Tools & Build Process

### Package Management
```mermaid
graph TB
    subgraph "Package Managers"
        P[PNPM] --> MA[Market App]
        Y[Yarn] --> AA[Admin App]
        N[NPM] --> BA[Buyer App]
    end
    
    subgraph "Workspaces"
        PW[PNPM Workspace] --> MA
        PW --> EXT[Extensions]
    end
    
    classDef pm fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef workspace fill:#7ED321,stroke:#5BA517,color:#000
    
    class P,Y,N pm
    class PW workspace
```

### Build & Bundling
```mermaid
graph LR
    subgraph "Build Tools"
        V[Vite] --> MA[Market App]
        W[Webpack] --> AA[Admin App]
        N[Next.js] --> BA[Buyer App]
    end
    
    subgraph "Transpilation"
        TS[TypeScript] --> V
        TS --> W
        TS --> N
        B[Babel] --> W
    end
    
    classDef build fill:#646CFF,stroke:#4B5563,color:#fff
    classDef transpile fill:#3178C6,stroke:#235A97,color:#fff
    
    class V,W,N build
    class TS,B transpile
```

### Code Quality & Linting
```mermaid
graph TB
    subgraph "Code Quality Tools"
        E[ESLint] --> ALL[All Apps]
        P[Prettier] --> ALL
        TS[TypeScript] --> ALL
        H[Husky] --> ALL
    end
    
    subgraph "Testing"
        J[Jest] --> AA[Admin App]
        V[Vitest] --> MA[Market App]
        RT[React Testing Library] --> ALL
    end
    
    classDef quality fill:#4B5563,stroke:#374151,color:#fff
    classDef testing fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class E,P,TS,H quality
    class J,V,RT testing
```

## 🗄️ Database Technologies

### Database Comparison
| Feature | Market App (Prisma) | Admin App (Sequelize) | Shopify Metaobjects |
|---------|---------------------|------------------------|---------------------|
| **ORM/ODM** | Prisma 6.2.1 | Sequelize 6.12.0 | Native GraphQL |
| **Database** | SQLite → PostgreSQL | SQLite | Shopify Native |
| **Migrations** | Prisma Migrate | Sequelize CLI | Version controlled |
| **Type Safety** | Full TypeScript | Partial | GraphQL Schema |
| **Performance** | High (compiled queries) | Good | Optimized by Shopify |

### Data Storage Strategy
```mermaid
graph TB
    subgraph "Application Data"
        PS[Sessions & Settings] --> PDB[(Prisma DB)]
        CS[Channels & Config] --> SDB[(Sequelize DB)]
    end
    
    subgraph "Business Data"
        VD[Vendor Data] --> MO[Metaobjects]
        PD[Product Data] --> SP[Shopify Products]
        OD[Order Data] --> SO[Shopify Orders]
    end
    
    subgraph "Media & Assets"
        PI[Product Images] --> SF[Shopify Files]
        VA[Vendor Assets] --> CF[Cloudflare]
    end
    
    classDef appdata fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef bizdata fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef media fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class PS,CS,PDB,SDB appdata
    class VD,PD,OD,MO,SP,SO bizdata
    class PI,VA,SF,CF media
```

## 🚀 Deployment & Infrastructure

### Hosting Platforms
```mermaid
graph TB
    subgraph "Production Hosting"
        V[Vercel] --> MA[Market App]
        V --> BA[Buyer App]
        H[Heroku/Railway] --> AA[Admin App]
        S[Shopify] --> EXT[Extensions]
    end
    
    subgraph "Development"
        SC[Shopify CLI] --> LOCAL[Local Development]
        NGrok[Ngrok/Cloudflare] --> LOCAL
    end
    
    classDef hosting fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef dev fill:#4A90E2,stroke:#2E5C8A,color:#fff
    
    class V,H,S hosting
    class SC,NGrok,LOCAL dev
```

### CI/CD Pipeline
```mermaid
graph LR
    subgraph "Development Flow"
        DEV[Development] --> GH[GitHub]
        GH --> GA[GitHub Actions]
        GA --> TEST[Tests & Linting]
        TEST --> BUILD[Build]
        BUILD --> DEPLOY[Deploy]
    end
    
    subgraph "Deployment Targets"
        DEPLOY --> VPROD[Vercel Production]
        DEPLOY --> HPROD[Heroku Production]
        DEPLOY --> SPROD[Shopify App Store]
    end
    
    classDef dev fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef cicd fill:#7ED321,stroke:#5BA517,color:#000
    classDef deploy fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class DEV,GH dev
    class GA,TEST,BUILD cicd
    class DEPLOY,VPROD,HPROD,SPROD deploy
```

## 📡 External Services & APIs

### Service Integration Map
```mermaid
graph TB
    subgraph "Shopify Services"
        SAA[Admin API] --> APPS[All Apps]
        SSA[Storefront API] --> BA[Buyer App]
        SWH[Webhooks] --> MA[Market App]
        SAB[App Bridge] --> MA
        SPC[Partner API] --> MA
    end
    
    subgraph "Third-Party Services"
        RS[Resend Email] --> MA
        CF[Cloudflare CDN] --> ALL[All Apps]
        GA[Google Analytics] --> BA
        ST[Stripe Payments] --> MA
    end
    
    subgraph "Development Services"
        GH[GitHub] --> ALL
        NGK[Ngrok] --> DEV[Development]
        SC[Shopify CLI] --> DEV
    end
    
    classDef shopify fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef thirdparty fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef dev fill:#4A90E2,stroke:#2E5C8A,color:#fff
    
    class SAA,SSA,SWH,SAB,SPC shopify
    class RS,CF,GA,ST thirdparty
    class GH,NGK,SC dev
```

## 🔧 Configuration Management

### Environment Configuration
```mermaid
graph TB
    subgraph "Environment Files"
        ENV[.env] --> MA[Market App]
        ENVL[.env.local] --> BA[Buyer App]
        ENVC[config/config.json] --> AA[Admin App]
    end
    
    subgraph "Configuration Sources"
        TOML[shopify.app.toml] --> MA
        PKG[package.json] --> ALL[All Apps]
        TS[tsconfig.json] --> ALL
    end
    
    subgraph "Runtime Config"
        SV[Shopify Variables] --> MA
        NV[Next.js Variables] --> BA
        EV[Express Variables] --> AA
    end
    
    classDef config fill:#F5A623,stroke:#B8841A,color:#000
    classDef runtime fill:#7ED321,stroke:#5BA517,color:#000
    
    class ENV,ENVL,ENVC,TOML,PKG,TS config
    class SV,NV,EV runtime
```

## 📊 Performance & Monitoring

### Performance Stack
- **Monitoring**: Shopify App Performance Dashboard
- **Error Tracking**: Remix built-in error boundaries
- **Logging**: Console logging with structured data
- **Caching**: Cloudflare CDN + Browser caching
- **Database**: Connection pooling and query optimization

### Development Experience
- **Hot Reload**: Vite (Market App), Webpack HMR (Admin App), Next.js Fast Refresh (Buyer App)
- **Type Checking**: TypeScript in all applications
- **Code Formatting**: Prettier with ESLint integration
- **Version Control**: Git with conventional commits

---

**Previous:** [← System Overview](./01-system-overview.md) | **Next:** [Market App Architecture →](./03-market-app-architecture.md)