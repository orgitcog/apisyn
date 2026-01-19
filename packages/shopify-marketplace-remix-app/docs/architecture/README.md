# Technical Architecture Documentation

This directory contains comprehensive technical architecture documentation for the Shopify Marketplace Remix App project.

## 📚 Documentation Structure

### System Architecture
- [**System Overview**](./01-system-overview.md) - High-level architecture and component relationships
- [**Technology Stack**](./02-technology-stack.md) - Technologies, frameworks, and tools used

### Application Architecture
- [**Market App Architecture**](./03-market-app-architecture.md) - Main Remix marketplace application
- [**Admin App Architecture**](./04-admin-app-architecture.md) - Legacy Express/React admin application  
- [**Buyer App Architecture**](./05-buyer-app-architecture.md) - Next.js buyer/customer frontend

### Integration & Data Flow
- [**API Integrations**](./06-api-integrations.md) - Shopify APIs and external service integrations
- [**Data Flow**](./07-data-flow.md) - Data movement between components and systems
- [**Authentication & Security**](./08-authentication-security.md) - Auth flows and security patterns

### Deployment & Operations
- [**Deployment Architecture**](./09-deployment-architecture.md) - Infrastructure and deployment patterns
- [**Development Workflow**](./10-development-workflow.md) - Development, build, and deployment processes

## 🎯 Quick Navigation

### For Developers
Start with [System Overview](./01-system-overview.md) to understand the overall architecture, then dive into specific app architectures based on what you're working on.

### For DevOps/Infrastructure
Focus on [Deployment Architecture](./09-deployment-architecture.md) and [Technology Stack](./02-technology-stack.md).

### For Product/Business
Review [System Overview](./01-system-overview.md) and [Data Flow](./07-data-flow.md) to understand business logic and user flows.

## 🔧 Diagram Conventions

All architecture diagrams use [Mermaid](https://mermaid.js.org/) notation and follow these conventions:

- **Blue** components: Core applications
- **Green** components: External services (Shopify APIs)
- **Orange** components: Data storage
- **Purple** components: Infrastructure/deployment
- **Gray** components: External systems

## 📋 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| System Overview | ✅ Complete | 2024-01-20 |
| Technology Stack | ✅ Complete | 2024-01-20 |
| Market App Architecture | ✅ Complete | 2024-01-20 |
| Admin App Architecture | ✅ Complete | 2024-01-20 |
| Buyer App Architecture | ✅ Complete | 2024-01-20 |
| API Integrations | ✅ Complete | 2024-01-20 |
| Data Flow | ✅ Complete | 2024-01-20 |
| Authentication & Security | ✅ Complete | 2024-01-20 |
| Deployment Architecture | ✅ Complete | 2024-01-20 |
| Development Workflow | ✅ Complete | 2024-01-20 |

---

*This documentation is maintained by the development team and is updated with each major architectural change.*