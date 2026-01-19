# Installation Guide

## Prerequisites

Before installing the dashboard, ensure you have:

- Node.js 18.x or higher
- Yarn 4.x or higher
- A Shopify Partner account
- A Supabase account

## Environment Setup

1. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SHOPIFY_ADMIN_API_URL=your_shopify_admin_api_url
VITE_SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
```

2. Configure Supabase:
   - Create a new project
   - Set up authentication
   - Apply database migrations

3. Configure Shopify:
   - Create a custom app in your Partner account
   - Generate Admin API credentials
   - Set appropriate app permissions

## Installation Steps

1. Clone the repository:
```bash
git clone https://github.com/yourusername/shopify-enterprise-dashboard.git
cd shopify-enterprise-dashboard
```

2. Install dependencies:
```bash
yarn
```

3. Start development server:
```bash
yarn dev
```

4. Open [http://localhost:5173](http://localhost:5173)

## Verification

Verify the installation by:

1. Checking the console for any errors
2. Confirming Supabase connection
3. Testing Shopify API connectivity
4. Verifying authentication flow