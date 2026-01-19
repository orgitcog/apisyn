# API Integrations

This document details the comprehensive API integration strategy across all applications in the Shopify Marketplace ecosystem, including Shopify APIs, external services, and inter-app communication.

## 🔌 API Integration Overview

```mermaid
graph TB
    subgraph "API Integration Architecture"
        subgraph "Core Applications"
            MA[Market App<br/>Remix]
            AA[Admin App<br/>Express]
            BA[Buyer App<br/>Next.js]
        end
        
        subgraph "Shopify APIs"
            SAA[Shopify Admin API<br/>GraphQL + REST]
            SSA[Shopify Storefront API<br/>GraphQL]
            SPA[Shopify Partner API<br/>REST]
            SMO[Metaobjects API<br/>GraphQL]
        end
        
        subgraph "External Services"
            RS[Resend Email API<br/>REST]
            CF[Cloudflare API<br/>REST]
            SP[Stripe API<br/>REST]
            GA[Google Analytics<br/>Measurement Protocol]
        end
        
        subgraph "Theme Extensions"
            TE[Theme App Extensions<br/>Liquid + JavaScript]
            AP[App Proxy<br/>HTTP Requests]
        end
        
        subgraph "Webhooks"
            WH[Shopify Webhooks<br/>HTTP POST]
            AWH[App Webhooks<br/>Custom Events]
        end
    end
    
    %% API Connections
    MA --> SAA
    MA --> SSA
    MA --> SMO
    MA --> RS
    MA --> SP
    
    AA --> SAA
    AA --> SPA
    
    BA --> SSA
    BA --> GA
    
    TE --> AP
    AP --> MA
    
    SAA --> WH
    WH --> MA
    WH --> AA
    
    classDef app fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef shopify fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef external fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef extension fill:#50E3C2,stroke:#38A594,color:#000
    classDef webhook fill:#F5A623,stroke:#B8841A,color:#000
    
    class MA,AA,BA app
    class SAA,SSA,SPA,SMO shopify
    class RS,CF,SP,GA external
    class TE,AP extension
    class WH,AWH webhook
```

## 🛍️ Shopify API Integration

### Admin API Integration
```mermaid
graph TB
    subgraph "Shopify Admin API Integration"
        subgraph "Authentication"
            AUTH[OAuth 2.0] --> AT[Access Token]
            AT --> AR[API Requests]
            AR --> SC[Scope Validation]
        end
        
        subgraph "GraphQL Operations"
            GQL[GraphQL Client] --> QR[Query Operations]
            GQL --> MU[Mutation Operations]
            GQL --> SU[Subscription Operations]
            
            QR --> PQ[Product Queries]
            QR --> OQ[Order Queries]
            QR --> CQ[Customer Queries]
            QR --> MQ[Metaobject Queries]
            
            MU --> PM[Product Mutations]
            MU --> OM[Order Mutations]
            MU --> MM[Metaobject Mutations]
            MU --> FM[File Mutations]
        end
        
        subgraph "REST Operations"
            REST[REST Client] --> GET[GET Requests]
            REST --> POST[POST Requests]
            REST --> PUT[PUT Requests]
            REST --> DELETE[DELETE Requests]
            
            GET --> RG[Resource Retrieval]
            POST --> RC[Resource Creation]
            PUT --> RU[Resource Updates]
            DELETE --> RD[Resource Deletion]
        end
        
        subgraph "Rate Limiting"
            RL[Rate Limiting] --> BL[Bucket Limiting]
            RL --> RL2[Request Limiting]
            RL --> RH[Rate Headers]
            RL --> BA[Backoff Algorithm]
        end
    end
    
    classDef auth fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef graphql fill:#E10098,stroke:#B8085A,color:#fff
    classDef rest fill:#7ED321,stroke:#5BA517,color:#000
    classDef ratelimit fill:#F5A623,stroke:#B8841A,color:#000
    
    class AUTH,AT,AR,SC auth
    class GQL,QR,MU,SU,PQ,OQ,CQ,MQ,PM,OM,MM,FM graphql
    class REST,GET,POST,PUT,DELETE,RG,RC,RU,RD rest
    class RL,BL,RL2,RH,BA ratelimit
```

### Storefront API Integration
```mermaid
graph TB
    subgraph "Shopify Storefront API Integration"
        subgraph "Public Access"
            PA[Public Access] --> ST[Storefront Token]
            ST --> PQ2[Public Queries]
            PQ2 --> CORS[CORS Handling]
        end
        
        subgraph "Product Operations"
            PO[Product Operations] --> PL[Product Listing]
            PO --> PD[Product Details]
            PO --> PC[Product Collections]
            PO --> PS[Product Search]
            PO --> PV[Product Variants]
            PO --> PI[Product Images]
        end
        
        subgraph "Customer Operations"
            CO[Customer Operations] --> CL[Customer Login]
            CO --> CR[Customer Registration]
            CO --> CP[Customer Profile]
            CO --> CO2[Customer Orders]
        end
        
        subgraph "Checkout Operations"
            CHO[Checkout Operations] --> CC[Create Checkout]
            CHO --> UC[Update Checkout]
            CHO --> CL2[Checkout Lines]
            CHO --> CA[Checkout Attributes]
            CHO --> CD[Checkout Discounts]
            CHO --> CS[Checkout Shipping]
        end
        
        subgraph "Cart Operations"
            CAO[Cart Operations] --> CAC[Cart Creation]
            CAO --> CAU[Cart Updates]
            CAO --> CAL[Cart Lines Management]
            CAO --> CAA[Cart Attributes]
        end
    end
    
    classDef public fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef product fill:#7ED321,stroke:#5BA517,color:#000
    classDef customer fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef checkout fill:#F5A623,stroke:#B8841A,color:#000
    classDef cart fill:#50E3C2,stroke:#38A594,color:#000
    
    class PA,ST,PQ2,CORS public
    class PO,PL,PD,PC,PS,PV,PI product
    class CO,CL,CR,CP,CO2 customer
    class CHO,CC,UC,CL2,CA,CD,CS checkout
    class CAO,CAC,CAU,CAL,CAA cart
```

### Metaobjects API Strategy
```mermaid
graph TB
    subgraph "Metaobjects API Integration"
        subgraph "Vendor Management"
            VM[Vendor Metaobjects] --> VC[Vendor Creation]
            VM --> VU[Vendor Updates]
            VM --> VQ[Vendor Queries]
            VM --> VD[Vendor Deletion]
        end
        
        subgraph "Product-Vendor Links"
            PVL[Product-Vendor Links] --> PVC[Create Links]
            PVL --> PVU[Update Links]
            PVL --> PVQ[Query Links]
            PVL --> PVR[Remove Links]
        end
        
        subgraph "Settings Management"
            SM[Settings Metaobjects] --> SC2[Settings Creation]
            SM --> SU[Settings Updates]
            SM --> SQ[Settings Queries]
            SM --> SV[Settings Validation]
        end
        
        subgraph "Approval Workflow"
            AW[Approval Workflow] --> AS[Approval Status]
            AW --> AT2[Approval Tracking]
            AW --> AN[Approval Notifications]
            AW --> AH[Approval History]
        end
        
        subgraph "Bulk Operations"
            BO[Bulk Operations] --> BCO[Bulk Create]
            BO --> BUO[Bulk Update]
            BO → BDO[Bulk Delete]
            BO → BQO[Bulk Query]
        end
    end
    
    classDef vendor fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef productlink fill:#7ED321,stroke:#5BA517,color:#000
    classDef settings fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef approval fill:#F5A623,stroke:#B8841A,color:#000
    classDef bulk fill:#50E3C2,stroke:#38A594,color:#000
    
    class VM,VC,VU,VQ,VD vendor
    class PVL,PVC,PVU,PVQ,PVR productlink
    class SM,SC2,SU,SQ,SV settings
    class AW,AS,AT2,AN,AH approval
    class BO,BCO,BUO,BDO,BQO bulk
```

## 📧 External Service Integrations

### Email Service (Resend API)
```mermaid
sequenceDiagram
    participant MA as Market App
    participant RS as Resend API
    participant V as Vendor
    participant A as Admin
    
    Note over MA,A: Vendor Registration Flow
    MA->>RS: Send welcome email
    RS->>V: Welcome email delivered
    
    Note over MA,A: Product Approval Flow
    MA->>RS: Send approval notification
    RS->>V: Approval email delivered
    
    Note over MA,A: Order Notification Flow
    MA->>RS: Send order notification
    RS->>V: Order email delivered
    
    Note over MA,A: Payout Notification Flow
    MA->>RS: Send payout notification
    RS->>V: Payout email delivered
    
    Note over MA,A: Admin Alerts
    MA->>RS: Send admin alert
    RS->>A: Alert email delivered
```

### Payment Processing (Stripe API)
```mermaid
graph TB
    subgraph "Stripe Integration Architecture"
        subgraph "Payment Setup"
            PS[Payment Setup] --> AC[Account Creation]
            PS --> VV[Vendor Verification]
            PS --> BK[Bank Details]
            PS --> TX[Tax Information]
        end
        
        subgraph "Payout Management"
            PM[Payout Management] --> PC[Payout Calculation]
            PM --> PS2[Payout Scheduling]
            PM --> PT[Payout Transfer]
            PM --> PN[Payout Notification]
        end
        
        subgraph "Transaction Handling"
            TH[Transaction Handling] --> TT[Transaction Tracking]
            TH --> TD[Transaction Details]
            TH --> TR[Transaction Reporting]
            TH --> TF[Transaction Fees]
        end
        
        subgraph "Compliance & Security"
            CS[Compliance & Security] --> KYC[KYC Verification]
            CS --> AML[AML Compliance]
            CS --> PCI[PCI Compliance]
            CS --> FD[Fraud Detection]
        end
    end
    
    classDef setup fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef payout fill:#7ED321,stroke:#5BA517,color:#000
    classDef transaction fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef compliance fill:#F5A623,stroke:#B8841A,color:#000
    
    class PS,AC,VV,BK,TX setup
    class PM,PC,PS2,PT,PN payout
    class TH,TT,TD,TR,TF transaction
    class CS,KYC,AML,PCI,FD compliance
```

### Cloudflare Integration
```mermaid
graph TB
    subgraph "Cloudflare Service Integration"
        subgraph "CDN Services"
            CDN[CDN Services] --> AC2[Asset Caching]
            CDN --> IC[Image Compression]
            CDN --> OPT[Optimization]
            CDN --> GL[Global Distribution]
        end
        
        subgraph "Security Services"
            SS[Security Services] --> WAF[Web Application Firewall]
            SS --> DDP[DDoS Protection]
            SS --> SSL[SSL/TLS Termination]
            SS --> BOT[Bot Management]
        end
        
        subgraph "Performance Services"
            PS3[Performance Services] --> MIN[Minification]
            PS3 --> COM[Compression]
            PS3 --> PO[Polish Optimization]
            PS3 --> PR[Preload Rules]
        end
        
        subgraph "Analytics Services"
            AS3[Analytics Services] --> WA[Web Analytics]
            AS3 --> PA2[Performance Analytics]
            AS3 --> SA[Security Analytics]
            AS3 --> CA2[Cache Analytics]
        end
    end
    
    classDef cdn fill:#F38020,stroke:#CC6A00,color:#fff
    classDef security fill:#C53030,stroke:#9B2C2C,color:#fff
    classDef performance fill:#7ED321,stroke:#5BA517,color:#000
    classDef analytics fill:#4A90E2,stroke:#2E5C8A,color:#fff
    
    class CDN,AC2,IC,OPT,GL cdn
    class SS,WAF,DDP,SSL,BOT security
    class PS3,MIN,COM,PO,PR performance
    class AS3,WA,PA2,SA,CA2 analytics
```

## 🔔 Webhook System

### Webhook Architecture
```mermaid
graph TB
    subgraph "Webhook System Architecture"
        subgraph "Webhook Sources"
            SWH[Shopify Webhooks] --> OW[Order Webhooks]
            SWH --> PW[Product Webhooks]
            SWH --> CW[Customer Webhooks]
            SWH --> AW2[App Webhooks]
        end
        
        subgraph "Webhook Processing"
            WP[Webhook Processing] --> WV[Webhook Validation]
            WP --> WR[Webhook Routing]
            WP --> WH2[Webhook Handling]
            WP --> WL[Webhook Logging]
        end
        
        subgraph "Event Handlers"
            EH[Event Handlers] --> OH[Order Handler]
            EH --> PH[Product Handler]
            EH --> VH[Vendor Handler]
            EH --> AH2[App Handler]
        end
        
        subgraph "Business Logic"
            BL[Business Logic] --> PC2[Payout Calculation]
            BL --> PA[Product Approval]
            BL --> VN[Vendor Notification]
            BL --> AU[Analytics Update]
        end
        
        subgraph "Response Handling"
            RH[Response Handling] --> SR[Success Response]
            RH --> ER[Error Response]
            RH --> RT[Retry Logic]
            RH --> RL3[Rate Limiting]
        end
    end
    
    classDef source fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef processing fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef handler fill:#7ED321,stroke:#5BA517,color:#000
    classDef business fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef response fill:#F5A623,stroke:#B8841A,color:#000
    
    class SWH,OW,PW,CW,AW2 source
    class WP,WV,WR,WH2,WL processing
    class EH,OH,PH,VH,AH2 handler
    class BL,PC2,PA,VN,AU business
    class RH,SR,ER,RT,RL3 response
```

### Webhook Event Flow
```mermaid
sequenceDiagram
    participant S as Shopify
    participant MA as Market App
    participant DB as Database
    participant RS as Resend API
    participant V as Vendor
    
    Note over S,V: Order Creation Flow
    S->>MA: Order Created Webhook
    MA->>MA: Validate HMAC
    MA->>MA: Parse Order Data
    MA->>DB: Query Vendor Info
    DB->>MA: Return Vendor Data
    MA->>MA: Calculate Payout
    MA->>DB: Store Payout Data
    MA->>RS: Send Order Notification
    RS->>V: Email Delivered
    MA->>S: 200 OK Response
    
    Note over S,V: Product Update Flow
    S->>MA: Product Updated Webhook
    MA->>MA: Validate Event
    MA->>DB: Update Product Status
    MA->>MA: Check Approval Rules
    MA->>RS: Send Update Notification
    RS->>V: Email Delivered
    MA->>S: 200 OK Response
```

## 🔗 Theme Extension Integration

### App Proxy Architecture
```mermaid
graph TB
    subgraph "Theme Extension Integration"
        subgraph "Extension Types"
            VE[Vendor Info Extension] --> PDP[Product Detail Page]
            CE[Collection Extension] --> CP[Collection Page]
            AE[Account Extension] --> AP2[Account Page]
            OE[Order Admin Extension] --> OAP[Order Admin Page]
        end
        
        subgraph "App Proxy System"
            APS[App Proxy] --> AR2[API Routes]
            APS --> RR[Request Routing]
            APS --> DT[Data Transformation]
            APS --> RT2[Response Templates]
        end
        
        subgraph "Data Flow"
            DF[Data Flow] --> REQ[Request Processing]
            DF --> VLD[Validation]
            DF --> DAT[Data Retrieval]
            DF --> RES[Response Generation]
        end
        
        subgraph "Security & Caching"
            SC3[Security & Caching] --> HMAC[HMAC Validation]
            SC3 --> CORS2[CORS Headers]
            SC3 --> CACHE[Response Caching]
            SC3 --> RL4[Rate Limiting]
        end
    end
    
    classDef extension fill:#50E3C2,stroke:#38A594,color:#000
    classDef proxy fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef dataflow fill:#7ED321,stroke:#5BA517,color:#000
    classDef security fill:#F5A623,stroke:#B8841A,color:#000
    
    class VE,CE,AE,OE,PDP,CP,AP2,OAP extension
    class APS,AR2,RR,DT,RT2 proxy
    class DF,REQ,VLD,DAT,RES dataflow
    class SC3,HMAC,CORS2,CACHE,RL4 security
```

### Extension Communication Flow
```mermaid
sequenceDiagram
    participant T as Theme
    participant AP as App Proxy
    participant MA as Market App
    participant SAA as Shopify Admin API
    participant SMO as Metaobjects
    
    Note over T,SMO: Vendor Info Display
    T->>AP: Request vendor info
    AP->>MA: Route to vendor handler
    MA->>SMO: Query vendor metaobject
    SMO->>MA: Return vendor data
    MA->>MA: Format response
    MA->>AP: Return formatted data
    AP->>T: Render vendor info
    
    Note over T,SMO: Product Collection Display
    T->>AP: Request vendor products
    AP->>MA: Route to product handler
    MA->>SAA: Query products by vendor
    SAA->>MA: Return product list
    MA->>MA: Apply filters
    MA->>AP: Return product data
    AP->>T: Render product grid
```

## 📊 API Error Handling & Monitoring

### Error Handling Strategy
```mermaid
graph TB
    subgraph "API Error Handling Architecture"
        subgraph "Error Classification"
            EC[Error Classification] --> CE2[Client Errors (4xx)]
            EC --> SE[Server Errors (5xx)]
            EC --> NE[Network Errors]
            EC --> BE[Business Logic Errors]
        end
        
        subgraph "Error Recovery"
            ER2[Error Recovery] --> RT3[Retry Logic]
            ER2 --> FB[Fallback Strategies]
            ER2 --> CB[Circuit Breaker]
            ER2 --> GD[Graceful Degradation]
        end
        
        subgraph "Error Reporting"
            ERP[Error Reporting] --> EL[Error Logging]
            ERP --> ENM[Error Notifications]
            ERP --> EM[Error Metrics]
            ERP → EA[Error Analytics]
        end
        
        subgraph "Recovery Actions"
            RA[Recovery Actions] --> AR3[Automatic Retry]
            RA → MR[Manual Review]
            RA → CC2[Compensation Logic]
            RA → UC2[User Communication]
        end
    end
    
    classDef classification fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef recovery fill:#7ED321,stroke:#5BA517,color:#000
    classDef reporting fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef actions fill:#F5A623,stroke:#B8841A,color:#000
    
    class EC,CE2,SE,NE,BE classification
    class ER2,RT3,FB,CB,GD recovery
    class ERP,EL,ENM,EM,EA reporting
    class RA,AR3,MR,CC2,UC2 actions
```

### API Monitoring & Analytics
```mermaid
graph TB
    subgraph "API Monitoring System"
        subgraph "Performance Metrics"
            PM2[Performance Metrics] --> RT4[Response Times]
            PM2 --> TH2[Throughput]
            PM2 --> UP[Uptime]
            PM2 --> ER3[Error Rates]
        end
        
        subgraph "Usage Analytics"
            UA2[Usage Analytics] --> AC3[API Call Volume]
            UA2 --> EP[Endpoint Popularity]
            UA2 --> UV[User Volumes]
            UA2 --> GU[Geographic Usage]
        end
        
        subgraph "Business Metrics"
            BM3[Business Metrics] --> VC2[Vendor Conversions]
            BM3 --> PC3[Product Conversions]
            BM3 --> OR[Order Revenue]
            BM3 → SR2[Success Rates]
        end
        
        subgraph "Alerting System"
            AS4[Alerting System] → TA[Threshold Alerts]
            AS4 → AA2[Anomaly Alerts]
            AS4 → CA3[Critical Alerts]
            AS4 → EA2[Escalation Alerts]
        end
    end
    
    classDef performance fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef usage fill:#7ED321,stroke:#5BA517,color:#000
    classDef business fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef alerting fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class PM2,RT4,TH2,UP,ER3 performance
    class UA2,AC3,EP,UV,GU usage
    class BM3,VC2,PC3,OR,SR2 business
    class AS4,TA,AA2,CA3,EA2 alerting
```

## 🔐 API Security & Compliance

### Security Implementation
```mermaid
graph TB
    subgraph "API Security Architecture"
        subgraph "Authentication"
            AUTH3[Authentication] --> OA2[OAuth 2.0]
            AUTH3 --> JWT[JWT Tokens]
            AUTH3 → API[API Keys]
            AUTH3 → HMAC2[HMAC Signatures]
        end
        
        subgraph "Authorization"
            AUTHZ[Authorization] → RBAC[Role-Based Access]
            AUTHZ → SC4[Scope Control]
            AUTHZ → PERM[Permission Checks]
            AUTHZ → POL[Policy Enforcement]
        end
        
        subgraph "Data Protection"
            DP3[Data Protection] → ENC2[Encryption in Transit]
            DP3 → ENCR[Encryption at Rest]
            DP3 → MASK[Data Masking]
            DP3 → ANON[Anonymization]
        end
        
        subgraph "Threat Protection"
            TP[Threat Protection] → RL5[Rate Limiting]
            TP → IDS[Intrusion Detection]
            TP → WAF2[Web Application Firewall]
            TP → BOT2[Bot Protection]
        end
    end
    
    classDef auth fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef authz fill:#7ED321,stroke:#5BA517,color:#000
    classDef protection fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef threat fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class AUTH3,OA2,JWT,API,HMAC2 auth
    class AUTHZ,RBAC,SC4,PERM,POL authz
    class DP3,ENC2,ENCR,MASK,ANON protection
    class TP,RL5,IDS,WAF2,BOT2 threat
```

## 📈 API Performance Optimization

### Performance Strategy
```mermaid
graph TB
    subgraph "API Performance Optimization"
        subgraph "Caching Strategy"
            CS5[Caching Strategy] → RC[Response Caching]
            CS5 → QC3[Query Caching]
            CS5 → DC[Database Caching]
            CS5 → CDN4[CDN Caching]
        end
        
        subgraph "Request Optimization"
            RO[Request Optimization] → BF2[Batch Requests]
            RO → FQ[Field Selection]
            RO → PG2[Pagination]
            RO → COMP[Compression]
        end
        
        subgraph "Response Optimization"
            RO2[Response Optimization] → MIN2[Response Minification]
            RO2 → FIL[Response Filtering]
            RO2 → GZ2[Gzip Compression]
            RO2 → ETG[ETag Headers]
        end
        
        subgraph "Connection Optimization"
            CO5[Connection Optimization] → CP2[Connection Pooling]
            CO5 → KA[Keep-Alive]
            CO5 → MP[Multiplexing]
            CO5 → HTTP2[HTTP/2 Support]
        end
    end
    
    classDef caching fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef request fill:#7ED321,stroke:#5BA517,color:#000
    classDef response fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef connection fill:#F5A623,stroke:#B8841A,color:#000
    
    class CS5,RC,QC3,DC,CDN4 caching
    class RO,BF2,FQ,PG2,COMP request
    class RO2,MIN2,FIL,GZ2,ETG response
    class CO5,CP2,KA,MP,HTTP2 connection
```

---

**Previous:** [← Buyer App Architecture](./05-buyer-app-architecture.md) | **Next:** [Data Flow →](./07-data-flow.md)