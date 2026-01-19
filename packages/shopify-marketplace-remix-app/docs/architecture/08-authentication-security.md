# Authentication & Security

This document details the comprehensive authentication, authorization, and security architecture across all applications in the Shopify Marketplace ecosystem.

## 🔐 Security Architecture Overview

```mermaid
graph TB
    subgraph "Security Architecture"
        subgraph "Authentication Layer"
            AUTH[Authentication] --> OAUTH[OAuth 2.0]
            AUTH --> JWT[JWT Tokens]
            AUTH --> SESS[Session Management]
            AUTH --> MFA[Multi-Factor Auth]
        end
        
        subgraph "Authorization Layer"
            AUTHZ[Authorization] --> RBAC[Role-Based Access]
            AUTHZ --> PBAC[Permission-Based Access]
            AUTHZ --> SCOPE[Scope Management]
            AUTHZ --> POL[Policy Engine]
        end
        
        subgraph "Data Security"
            DS[Data Security] --> ENC[Encryption]
            DS --> HASH[Hashing]
            DS --> SIGN[Digital Signatures]
            DS --> MASK[Data Masking]
        end
        
        subgraph "Network Security"
            NS[Network Security] --> TLS[TLS/SSL]
            NS --> CORS[CORS]
            NS --> CSP[Content Security Policy]
            NS --> HSTS[HSTS Headers]
        end
        
        subgraph "Application Security"
            AS[Application Security] --> VAL[Input Validation]
            AS --> SAN[Sanitization]
            AS --> XSS[XSS Protection]
            AS --> CSRF[CSRF Protection]
        end
        
        subgraph "Infrastructure Security"
            IS[Infrastructure Security] --> WAF[Web Application Firewall]
            IS --> DDP[DDoS Protection]
            IS --> IDS[Intrusion Detection]
            IS --> VPN[VPN Access]
        end
    end
    
    classDef auth fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef authz fill:#7ED321,stroke:#5BA517,color:#000
    classDef data fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef network fill:#F5A623,stroke:#B8841A,color:#000
    classDef application fill:#96CEB4,stroke:#5A9B7C,color:#000
    classDef infrastructure fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class AUTH,OAUTH,JWT,SESS,MFA auth
    class AUTHZ,RBAC,PBAC,SCOPE,POL authz
    class DS,ENC,HASH,SIGN,MASK data
    class NS,TLS,CORS,CSP,HSTS network
    class AS,VAL,SAN,XSS,CSRF application
    class IS,WAF,DDP,IDS,VPN infrastructure
```

## 🔑 Authentication Flows

### Shopify OAuth Flow
```mermaid
sequenceDiagram
    participant M as Merchant
    participant SA as Shopify Admin
    participant MA as Market App
    participant SAP as Shopify API
    participant PDB as Prisma DB
    
    M->>SA: Install marketplace app
    SA->>MA: GET /auth with shop parameter
    MA->>SAP: beginAuth(shop, redirectUri, scopes)
    SAP->>MA: Return authorization URL
    MA->>SA: Redirect to Shopify OAuth
    SA->>SA: Merchant grants permissions
    SA->>MA: GET /auth/callback with code
    MA->>SAP: validateAuthCallback(code)
    SAP->>MA: Return session with access token
    MA->>SAP: getStorefrontAccessToken()
    SAP->>MA: Return storefront token
    MA->>SAP: getShopDetails()
    SAP->>MA: Return shop information
    MA->>PDB: Store session and shop data
    PDB->>MA: Confirm storage
    MA->>SAP: registerWebhooks()
    SAP->>MA: Confirm webhook registration
    MA->>SA: Redirect to app with session
```

### Session Token Validation
```mermaid
graph TB
    subgraph "Session Token Validation Flow"
        subgraph "Token Reception"
            TR[Token Reception] --> REQ[Request Headers]
            REQ --> AUTH2[Authorization Header]
            AUTH2 --> BEAR[Bearer Token]
        end
        
        subgraph "Token Extraction"
            BEAR --> EXT[Extract JWT]
            EXT --> DEC[Decode Token]
            DEC --> VER[Verify Signature]
            VER --> EXP[Check Expiration]
        end
        
        subgraph "Payload Validation"
            EXP --> PAY[Extract Payload]
            PAY --> ISS[Verify Issuer]
            ISS --> AUD[Verify Audience]
            AUD --> SHOP[Extract Shop Domain]
        end
        
        subgraph "Session Loading"
            SHOP --> LOAD[Load Session]
            LOAD --> VALID[Validate Session]
            VALID --> CTX[Create Context]
            CTX --> NEXT[Continue Request]
        end
        
        subgraph "Error Handling"
            VER --> ERR[Token Invalid]
            EXP --> ERR2[Token Expired]
            VALID --> ERR3[Session Invalid]
            ERR --> REJECT[Reject Request]
            ERR2 --> REJECT
            ERR3 --> REJECT
        end
    end
    
    classDef reception fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef extraction fill:#7ED321,stroke:#5BA517,color:#000
    classDef validation fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef session fill:#F5A623,stroke:#B8841A,color:#000
    classDef error fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class TR,REQ,AUTH2,BEAR reception
    class EXT,DEC,VER,EXP extraction
    class PAY,ISS,AUD,SHOP validation
    class LOAD,VALID,CTX,NEXT session
    class ERR,ERR2,ERR3,REJECT error
```

### Multi-Application Authentication
```mermaid
graph TB
    subgraph "Multi-App Authentication Architecture"
        subgraph "Market App (Remix)"
            MAA[Market App Auth] --> PRISMA[Prisma Session Storage]
            MAA --> REMIX[Remix Auth Utilities]
            MAA --> OAUTH2[OAuth Integration]
        end
        
        subgraph "Admin App (Express)"
            AAA[Admin App Auth] --> CUSTOM[Custom Session Storage]
            AAA --> APOLLO[Apollo Context]
            AAA --> EXPRESS[Express Middleware]
        end
        
        subgraph "Buyer App (Next.js)"
            BAA[Buyer App Auth] --> STOREFRONT[Storefront Token]
            BAA --> CUSTOMER[Customer Auth]
            BAA --> NEXTAUTH[NextAuth.js]
        end
        
        subgraph "Theme Extensions"
            TEA[Theme Extension Auth] --> PROXY[App Proxy]
            TEA --> HMAC[HMAC Validation]
            TEA --> PUBLIC[Public Access]
        end
        
        subgraph "Shared Authentication"
            SA2[Shared Auth] --> SHOPIFY[Shopify Platform]
            SA2 --> TOKENS[Token Management]
            SA2 --> SCOPES[Scope Management]
        end
    end
    
    classDef marketapp fill:#2D3748,stroke:#1A202C,color:#fff
    classDef adminapp fill:#000000,stroke:#333,color:#fff
    classDef buyerapp fill:#0070F3,stroke:#0051CC,color:#fff
    classDef extensions fill:#50E3C2,stroke:#38A594,color:#000
    classDef shared fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class MAA,PRISMA,REMIX,OAUTH2 marketapp
    class AAA,CUSTOM,APOLLO,EXPRESS adminapp
    class BAA,STOREFRONT,CUSTOMER,NEXTAUTH buyerapp
    class TEA,PROXY,HMAC,PUBLIC extensions
    class SA2,SHOPIFY,TOKENS,SCOPES shared
```

## 🛡️ Authorization System

### Role-Based Access Control (RBAC)
```mermaid
graph TB
    subgraph "RBAC Architecture"
        subgraph "Roles"
            ROLES[Roles] --> ADMIN[Admin]
            ROLES --> VENDOR[Vendor]
            ROLES --> MERCHANT[Merchant]
            ROLES --> CUSTOMER[Customer]
        end
        
        subgraph "Permissions"
            PERMS[Permissions] --> READ[Read]
            PERMS --> WRITE[Write]
            PERMS --> DELETE[Delete]
            PERMS --> APPROVE[Approve]
            PERMS --> MANAGE[Manage]
        end
        
        subgraph "Resources"
            RES[Resources] --> PRODUCTS[Products]
            RES --> ORDERS[Orders]
            RES --> VENDORS[Vendors]
            RES --> SETTINGS[Settings]
            RES --> PAYOUTS[Payouts]
        end
        
        subgraph "Role Assignments"
            RA[Role Assignments] --> USER[User Assignment]
            RA --> INHERIT[Permission Inheritance]
            RA --> OVERRIDE[Permission Override]
            RA --> TEMP[Temporary Permissions]
        end
        
        subgraph "Access Control"
            AC[Access Control] --> GUARD[Route Guards]
            AC --> MIDDLEWARE[Auth Middleware]
            AC --> POLICY[Policy Enforcement]
            AC --> AUDIT[Access Auditing]
        end
    end
    
    classDef roles fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef permissions fill:#7ED321,stroke:#5BA517,color:#000
    classDef resources fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef assignments fill:#F5A623,stroke:#B8841A,color:#000
    classDef access fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class ROLES,ADMIN,VENDOR,MERCHANT,CUSTOMER roles
    class PERMS,READ,WRITE,DELETE,APPROVE,MANAGE permissions
    class RES,PRODUCTS,ORDERS,VENDORS,SETTINGS,PAYOUTS resources
    class RA,USER,INHERIT,OVERRIDE,TEMP assignments
    class AC,GUARD,MIDDLEWARE,POLICY,AUDIT access
```

### Permission Matrix
```mermaid
graph TB
    subgraph "Permission Matrix"
        subgraph "Admin Permissions"
            AP[Admin Permissions] --> APA[All Products Access]
            AP --> AOA[All Orders Access]
            AP --> AVA[All Vendors Access]
            AP --> ASA[System Settings Access]
            AP --> ARA[Reporting Access]
        end
        
        subgraph "Vendor Permissions"
            VP[Vendor Permissions] --> VPP[Own Products Only]
            VP --> VPO[Own Orders Only]
            VP --> VPS[Own Settings Only]
            VP --> VPR[Own Reports Only]
        end
        
        subgraph "Merchant Permissions"
            MP[Merchant Permissions] --> MPA[Approve Products]
            MP --> MPO[View All Orders]
            MP --> MPS[System Configuration]
            MP --> MPV[Vendor Management]
        end
        
        subgraph "Customer Permissions"
            CP[Customer Permissions] --> CPP[Browse Products]
            CP --> CPO[Own Orders Only]
            CP --> CPA[Account Management]
            CP --> CPR[Review Products]
        end
    end
    
    classDef admin fill:#C53030,stroke:#9B2C2C,color:#fff
    classDef vendor fill:#7ED321,stroke:#5BA517,color:#000
    classDef merchant fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef customer fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class AP,APA,AOA,AVA,ASA,ARA admin
    class VP,VPP,VPO,VPS,VPR vendor
    class MP,MPA,MPO,MPS,MPV merchant
    class CP,CPP,CPO,CPA,CPR customer
```

## 🔒 Data Security

### Encryption Strategy
```mermaid
graph TB
    subgraph "Encryption Architecture"
        subgraph "Encryption in Transit"
            EIT[Encryption in Transit] --> TLS13[TLS 1.3]
            EIT --> CERT[SSL Certificates]
            EIT --> HSTS2[HSTS Headers]
            EIT --> PERFECT[Perfect Forward Secrecy]
        end
        
        subgraph "Encryption at Rest"
            EAR[Encryption at Rest] --> AES[AES-256]
            EAR --> DATABASE[Database Encryption]
            EAR --> FILES[File Encryption]
            EAR --> BACKUP[Backup Encryption]
        end
        
        subgraph "Key Management"
            KM[Key Management] --> GEN[Key Generation]
            KM --> ROT[Key Rotation]
            KM --> STORE[Secure Storage]
            KM --> ESCROW[Key Escrow]
        end
        
        subgraph "Hashing & Signing"
            HS[Hashing & Signing] --> HASH2[SHA-256]
            HS --> HMAC3[HMAC-SHA256]
            HS --> RSA[RSA Signatures]
            HS --> SALT[Password Salting]
        end
    end
    
    classDef transit fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef rest fill:#7ED321,stroke:#5BA517,color:#000
    classDef keys fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef hashing fill:#F5A623,stroke:#B8841A,color:#000
    
    class EIT,TLS13,CERT,HSTS2,PERFECT transit
    class EAR,AES,DATABASE,FILES,BACKUP rest
    class KM,GEN,ROT,STORE,ESCROW keys
    class HS,HASH2,HMAC3,RSA,SALT hashing
```

### Sensitive Data Handling
```mermaid
sequenceDiagram
    participant U as User
    participant APP as Application
    participant VAL as Validator
    participant ENC as Encryption Service
    participant DB as Database
    participant AUDIT as Audit Log
    
    U->>APP: Submit sensitive data
    APP->>VAL: Validate input
    VAL->>APP: Return validation result
    
    alt Data is valid
        APP->>ENC: Encrypt sensitive fields
        ENC->>APP: Return encrypted data
        APP->>DB: Store encrypted data
        DB->>APP: Confirm storage
        APP->>AUDIT: Log data access
        AUDIT->>APP: Confirm audit entry
        APP->>U: Confirm data saved
    else Data is invalid
        APP->>U: Return validation errors
    end
    
    Note over U,AUDIT: Data Retrieval
    U->>APP: Request sensitive data
    APP->>DB: Query encrypted data
    DB->>APP: Return encrypted data
    APP->>ENC: Decrypt sensitive fields
    ENC->>APP: Return decrypted data
    APP->>AUDIT: Log data access
    APP->>U: Return masked/filtered data
```

## 🛡️ Application Security

### Input Validation & Sanitization
```mermaid
graph TB
    subgraph "Input Security Architecture"
        subgraph "Validation Layer"
            VL[Validation Layer] --> TYPE[Type Validation]
            VL --> FORMAT[Format Validation]
            VL --> RANGE[Range Validation]
            VL --> REGEX[Regex Validation]
        end
        
        subgraph "Sanitization Layer"
            SL[Sanitization Layer] --> HTML[HTML Sanitization]
            SL --> SQL[SQL Injection Prevention]
            SL --> XSS2[XSS Prevention]
            SL --> CMD[Command Injection Prevention]
        end
        
        subgraph "Output Encoding"
            OE[Output Encoding] --> HTMLENC[HTML Encoding]
            OE --> URLENC[URL Encoding]
            OE --> JSENC[JavaScript Encoding]
            OE --> CSSENC[CSS Encoding]
        end
        
        subgraph "Content Security"
            CS[Content Security] --> CSP2[Content Security Policy]
            CS --> CORS2[CORS Policy]
            CS --> REFERRER[Referrer Policy]
            CS --> FEATURE[Feature Policy]
        end
    end
    
    classDef validation fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef sanitization fill:#7ED321,stroke:#5BA517,color:#000
    classDef encoding fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef content fill:#F5A623,stroke:#B8841A,color:#000
    
    class VL,TYPE,FORMAT,RANGE,REGEX validation
    class SL,HTML,SQL,XSS2,CMD sanitization
    class OE,HTMLENC,URLENC,JSENC,CSSENC encoding
    class CS,CSP2,CORS2,REFERRER,FEATURE content
```

### CSRF & XSS Protection
```mermaid
graph TB
    subgraph "Client-Side Attack Protection"
        subgraph "CSRF Protection"
            CSRF2[CSRF Protection] --> TOKEN[CSRF Tokens]
            CSRF2 --> SAME[SameSite Cookies]
            CSRF2 --> ORIGIN[Origin Validation]
            CSRF2 --> REFERER[Referer Validation]
        end
        
        subgraph "XSS Protection"
            XSS3[XSS Protection] --> ESCAPE[Output Escaping]
            XSS3 --> VALIDATE[Input Validation]
            XSS3 --> CSP3[Content Security Policy]
            XSS3 --> HTTPONLY[HttpOnly Cookies]
        end
        
        subgraph "Session Security"
            SS2[Session Security] --> SECURE[Secure Cookies]
            SS2 --> REGENERATE[Session Regeneration]
            SS2 --> TIMEOUT[Session Timeout]
            SS2 --> FIXATION[Session Fixation Prevention]
        end
        
        subgraph "Browser Security"
            BS[Browser Security] --> HSTS3[HSTS Headers]
            BS --> NOSNIFF[X-Content-Type-Options]
            BS → FRAME[X-Frame-Options]
            BS → XSS4[X-XSS-Protection]
        end
    end
    
    classDef csrf fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef xss fill:#C53030,stroke:#9B2C2C,color:#fff
    classDef session fill:#7ED321,stroke:#5BA517,color:#000
    classDef browser fill:#BD10E0,stroke:#8B0A99,color:#fff
    
    class CSRF2,TOKEN,SAME,ORIGIN,REFERER csrf
    class XSS3,ESCAPE,VALIDATE,CSP3,HTTPONLY xss
    class SS2,SECURE,REGENERATE,TIMEOUT,FIXATION session
    class BS,HSTS3,NOSNIFF,FRAME,XSS4 browser
```

## 🔍 Security Monitoring & Auditing

### Security Monitoring
```mermaid
graph TB
    subgraph "Security Monitoring Architecture"
        subgraph "Threat Detection"
            TD[Threat Detection] --> ANOMALY[Anomaly Detection]
            TD --> BEHAVIOR[Behavioral Analysis]
            TD --> SIGNATURE[Signature-Based Detection]
            TD --> ML2[Machine Learning Detection]
        end
        
        subgraph "Access Monitoring"
            AM2[Access Monitoring] --> LOGIN[Login Attempts]
            AM2 --> PERM[Permission Changes]
            AM2 --> ADMIN2[Admin Actions]
            AM2 --> API3[API Access]
        end
        
        subgraph "Data Monitoring"
            DM[Data Monitoring] --> ACCESS[Data Access]
            DM --> EXPORT[Data Export]
            DM --> MODIFY[Data Modification]
            DM --> DELETE2[Data Deletion]
        end
        
        subgraph "Infrastructure Monitoring"
            IM[Infrastructure Monitoring] --> NETWORK[Network Traffic]
            IM --> SERVER[Server Health]
            IM --> DATABASE2[Database Activity]
            IM --> FILE2[File System Changes]
        end
        
        subgraph "Incident Response"
            IR[Incident Response] --> ALERT[Alert Generation]
            IR --> ESCALATION[Escalation Procedures]
            IR --> CONTAINMENT[Threat Containment]
            IR --> RECOVERY[Recovery Procedures]
        end
    end
    
    classDef detection fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef access fill:#7ED321,stroke:#5BA517,color:#000
    classDef data fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef infrastructure fill:#F5A623,stroke:#B8841A,color:#000
    classDef incident fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class TD,ANOMALY,BEHAVIOR,SIGNATURE,ML2 detection
    class AM2,LOGIN,PERM,ADMIN2,API3 access
    class DM,ACCESS,EXPORT,MODIFY,DELETE2 data
    class IM,NETWORK,SERVER,DATABASE2,FILE2 infrastructure
    class IR,ALERT,ESCALATION,CONTAINMENT,RECOVERY incident
```

### Audit Trail System
```mermaid
sequenceDiagram
    participant U as User
    participant APP as Application
    participant AUTH3 as Auth Service
    participant AUDIT2 as Audit Service
    participant LOG as Log Storage
    participant SIEM as SIEM System
    
    U->>APP: Perform action
    APP->>AUTH3: Validate permissions
    AUTH3->>APP: Return authorization result
    
    alt Action authorized
        APP->>APP: Execute action
        APP->>AUDIT2: Log action details
        AUDIT2->>AUDIT2: Enrich log data
        AUDIT2->>LOG: Store audit entry
        LOG->>AUDIT2: Confirm storage
        AUDIT2->>SIEM: Send security event
        SIEM->>SIEM: Analyze for threats
        APP->>U: Return action result
    else Action not authorized
        APP->>AUDIT2: Log unauthorized attempt
        AUDIT2->>SIEM: Send security alert
        APP->>U: Return access denied
    end
```

## 🚨 Compliance & Governance

### Compliance Framework
```mermaid
graph TB
    subgraph "Compliance & Governance Architecture"
        subgraph "Regulatory Compliance"
            RC[Regulatory Compliance] --> GDPR2[GDPR]
            RC --> CCPA2[CCPA]
            RC --> PCI[PCI DSS]
            RC --> SOX[SOX Compliance]
        end
        
        subgraph "Data Governance"
            DG[Data Governance] --> CLASSIFY[Data Classification]
            DG --> RETENTION[Data Retention]
            DG --> DISPOSAL[Data Disposal]
            DG --> LINEAGE[Data Lineage]
        end
        
        subgraph "Privacy Controls"
            PC5[Privacy Controls] --> CONSENT[Consent Management]
            PC5 --> OPTOUT[Opt-out Mechanisms]
            PC5 --> PORTABILITY[Data Portability]
            PC5 --> ERASURE[Right to Erasure]
        end
        
        subgraph "Risk Management"
            RM[Risk Management] --> ASSESSMENT[Risk Assessment]
            RM --> MITIGATION[Risk Mitigation]
            RM --> MONITORING2[Risk Monitoring]
            RM --> REPORTING2[Risk Reporting]
        end
        
        subgraph "Audit & Reporting"
            AR2[Audit & Reporting] --> INTERNAL[Internal Audits]
            AR2 --> EXTERNAL[External Audits]
            AR2 --> COMPLIANCE2[Compliance Reports]
            AR2 --> CERTIFY[Certifications]
        end
    end
    
    classDef regulatory fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef governance fill:#7ED321,stroke:#5BA517,color:#000
    classDef privacy fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef risk fill:#F5A623,stroke:#B8841A,color:#000
    classDef audit fill:#96CEB4,stroke:#5A9B7C,color:#000
    
    class RC,GDPR2,CCPA2,PCI,SOX regulatory
    class DG,CLASSIFY,RETENTION,DISPOSAL,LINEAGE governance
    class PC5,CONSENT,OPTOUT,PORTABILITY,ERASURE privacy
    class RM,ASSESSMENT,MITIGATION,MONITORING2,REPORTING2 risk
    class AR2,INTERNAL,EXTERNAL,COMPLIANCE2,CERTIFY audit
```

## 🔧 Security Best Practices

### Security Implementation Checklist
```mermaid
graph TB
    subgraph "Security Implementation Checklist"
        subgraph "Authentication"
            AUTH4[Authentication] --> STRONG[Strong Passwords]
            AUTH4 --> MFA2[Multi-Factor Auth]
            AUTH4 --> TOKEN2[Secure Tokens]
            AUTH4 --> EXPIRY[Token Expiry]
        end
        
        subgraph "Authorization"
            AUTHZ2[Authorization] --> PRINCIPLE[Least Privilege]
            AUTHZ2 --> SEPARATION[Separation of Duties]
            AUTHZ2 --> REGULAR[Regular Reviews]
            AUTHZ2 --> TEMP2[Temporary Access]
        end
        
        subgraph "Data Protection"
            DP5[Data Protection] --> ENCRYPT[Encrypt Sensitive Data]
            DP5 --> BACKUP2[Secure Backups]
            DP5 --> MASKING[Data Masking]
            DP5 --> MINIMIZATION[Data Minimization]
        end
        
        subgraph "Application Security"
            AS2[Application Security] --> VALIDATION2[Input Validation]
            AS2 --> UPDATES[Security Updates]
            AS2 --> TESTING2[Security Testing]
            AS2 --> REVIEW[Code Review]
        end
        
        subgraph "Infrastructure Security"
            IS2[Infrastructure Security] --> HARDENING[System Hardening]
            IS2 --> MONITORING3[Security Monitoring]
            IS2 --> PATCHING[Regular Patching]
            IS2 --> ISOLATION[Network Isolation]
        end
    end
    
    classDef auth fill:#4A90E2,stroke:#2E5C8A,color:#fff
    classDef authz fill:#7ED321,stroke:#5BA517,color:#000
    classDef data fill:#BD10E0,stroke:#8B0A99,color:#fff
    classDef application fill:#F5A623,stroke:#B8841A,color:#000
    classDef infrastructure fill:#C53030,stroke:#9B2C2C,color:#fff
    
    class AUTH4,STRONG,MFA2,TOKEN2,EXPIRY auth
    class AUTHZ2,PRINCIPLE,SEPARATION,REGULAR,TEMP2 authz
    class DP5,ENCRYPT,BACKUP2,MASKING,MINIMIZATION data
    class AS2,VALIDATION2,UPDATES,TESTING2,REVIEW application
    class IS2,HARDENING,MONITORING3,PATCHING,ISOLATION infrastructure
```

---

**Previous:** [← Data Flow](./07-data-flow.md) | **Next:** [Deployment Architecture →](./09-deployment-architecture.md)