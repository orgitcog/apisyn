# Shopify Enterprise Dashboard

A powerful enterprise-grade dashboard for managing multiple Shopify stores, built with React, Shopify Polaris, and Supabase.

## Features

- 🏪 **Multi-Store Management**: Centralized control for multiple Shopify stores
- 📊 **Advanced Analytics**: Real-time metrics and performance insights
- 👥 **User Management**: Role-based access control with customizable permissions
- 🔄 **Data Synchronization**: Automated sync between Shopify and local database
- 🎨 **Modern UI**: Built with Shopify Polaris design system
- 🛡️ **Enterprise Security**: Row-level security and authentication
- 📱 **Responsive Design**: Optimized for all devices and screen sizes

## Tech Stack

- **Frontend Framework**: React 18 with TypeScript
- **Meta Framework**: Remix 2.x for routing and server-side rendering
- **UI Framework**: Shopify Polaris v12 (with BlockStack, InlineStack components)
- **Data Fetching**: TanStack Query (React Query) v5
- **Database**: Supabase (PostgreSQL with Row-Level Security)
- **Authentication**: Supabase Auth
- **API Integration**: Shopify Admin API, GraphQL
- **Charts & Visualization**: Recharts, Chart.js
- **Icons**: Lucide React
- **Drag & Drop**: @dnd-kit
- **Date Handling**: date-fns
- **HTTP Client**: Axios
- **Build Tool**: Remix with esbuild
- **Styling**: Tailwind CSS + Shopify Polaris CSS
- **Package Manager**: Yarn 4.x with Corepack

## Prerequisites

- Node.js 18.x or higher
- Yarn 4.x or higher
- A Shopify Partner account
- A Supabase account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Shopify Configuration
VITE_SHOPIFY_ADMIN_API_URL=your_shopify_admin_api_url
VITE_SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
```

See `.env.example` for a template. The application will work with mock data if these are not configured, allowing you to explore the UI without requiring live integrations.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/shopify-enterprise-dashboard.git
   cd shopify-enterprise-dashboard
   ```

2. Enable Corepack (required for Yarn 4):
   ```bash
   corepack enable
   ```

3. Install dependencies:
   ```bash
   yarn install
   ```

4. Configure environment variables (optional):
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

5. Build the application:
   ```bash
   yarn build
   ```

6. Start the development server:
   ```bash
   yarn dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── components/     # Reusable UI components
│   │   ├── Analytics/  # Analytics-specific components
│   │   ├── Dashboard/  # Dashboard components (KPIs, Store Matrix, etc.)
│   │   └── Layout/     # Layout components (Navigation, TopBar)
│   ├── lib/           # Utility functions and API clients
│   │   ├── shopify.ts # Shopify API integration
│   │   └── supabase.ts # Supabase client and database operations
│   ├── routes/        # Remix routes (pages)
│   │   ├── _index.tsx # Dashboard home
│   │   ├── analytics.tsx # Analytics page
│   │   ├── users.tsx  # User management
│   │   ├── roles.tsx  # Role management
│   │   ├── reports.tsx # Reports page
│   │   └── settings.tsx # Settings page
│   ├── styles/        # Global styles and Tailwind config
│   └── root.tsx       # Root layout with providers
├── supabase/
│   └── migrations/    # Database migrations and schema
├── src/               # Additional source files (legacy/deprecated)
└── public/           # Static assets
```

## Key Features

### Multi-Store Management
- Connect and manage multiple Shopify stores from a single dashboard
- Centralized view of all store metrics and performance
- Real-time synchronization with Shopify Admin API
- CRUD operations for store management

### Analytics Dashboard
- Real-time sales and order tracking with interactive charts
- Revenue analytics and trend visualization
- Customer insights and behavior analysis
- Inventory management metrics
- Customizable date ranges and comparison periods

### User Management
- Role-based access control (RBAC) with 5 predefined roles
- Custom role creation with granular permissions
- User activity tracking and audit logging
- Secure authentication via Supabase Auth
- Bulk user operations

### Role Management
- Predefined roles: Admin, Manager, Editor, Analyst, Support
- Create custom roles with specific permission sets
- Priority-based role hierarchy
- Permission categories: read, write, delete, manage_users, settings

### Reports & Analytics
- Generate and download reports in various formats
- Pre-built report templates (Sales, Analytics, Users)
- Customizable date ranges and filters
- Report history and status tracking

### Enterprise Features
- Data export capabilities for all entities
- Comprehensive audit logging
- Automated data synchronization with Shopify
- API rate limiting protection
- Row-level security (RLS) on all database tables

## Database Schema

The application uses Supabase (PostgreSQL) with the following main tables:

- `user_profiles`: User information, preferences, and authentication details
- `stores`: Connected Shopify store details with revenue and order metrics
- `roles`: Role definitions with permission arrays and priority levels
- `user_roles`: User-role assignments (many-to-many relationship)
- `shopify_connections`: Shopify store connection credentials and sync status
- `order_summary`: Aggregated order data from Shopify stores

All tables are protected with Row Level Security (RLS) policies that ensure users can only access data they own or have permission to view.

## API Integration

The dashboard integrates with:

- Shopify Admin API
- Supabase REST and Realtime APIs
- Custom middleware for data synchronization

## Development

### Available Scripts

- `yarn dev`: Start development server (Remix)
- `yarn build`: Build for production
- `yarn start`: Start production server
- `yarn typecheck`: Run TypeScript type checking
- `yarn clean`: Clean build artifacts and dependencies

### Code Style

The project uses ESLint and TypeScript for code quality. Follow these guidelines:

- Use TypeScript for all new code
- Follow the Shopify Polaris design system
- Write unit tests for critical functionality
- Use React Query for data fetching
- Implement proper error handling

## Deployment

1. Build the project:
   ```bash
   yarn build
   ```

2. Deploy the `dist` directory to your hosting provider

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@yourdomain.com or open an issue in the GitHub repository.

## Acknowledgments

- [Shopify Polaris](https://polaris.shopify.com/)
- [Supabase](https://supabase.com/)
- [React Query](https://tanstack.com/query/latest)
- [Vite](https://vitejs.dev/)