# Project Structure

## Directory Layout

```
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Analytics/  # Analytics components
│   │   ├── Dashboard/  # Dashboard components
│   │   ├── Layout/     # Layout components
│   │   └── Shopify/    # Shopify-specific components
│   │
│   ├── hooks/         # Custom React hooks
│   │   ├── useShopifyData.ts
│   │   ├── useAnalytics.ts
│   │   └── useAuth.ts
│   │
│   ├── lib/           # Utility functions and API clients
│   │   ├── shopify.ts  # Shopify API client
│   │   ├── supabase.ts # Supabase client
│   │   └── utils.ts    # Helper functions
│   │
│   ├── pages/         # Page components
│   │   ├── Dashboard/
│   │   ├── Analytics/
│   │   └── Settings/
│   │
│   ├── store/         # Zustand store definitions
│   ├── context/       # React context providers
│   ├── styles/        # Global styles
│   └── types/         # TypeScript types
│
├── public/           # Static assets
└── supabase/        # Database configuration
    ├── migrations/   # SQL migrations
    └── config.json   # Supabase config
```

## Key Directories

### Components
Reusable UI components organized by feature area. Each component should:
- Be self-contained
- Have clear props interface
- Include documentation
- Follow Polaris guidelines

### Hooks
Custom React hooks for:
- Data fetching
- State management
- Feature logic
- Shared functionality

### Library
Utility functions and API clients:
- API integration
- Helper functions
- Type definitions
- Constants

### Pages
Top-level page components:
- Route handlers
- Layout composition
- Data fetching
- Error boundaries