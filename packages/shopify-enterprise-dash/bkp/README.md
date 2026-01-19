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

- **Frontend**: React 18 with TypeScript
- **UI Framework**: Shopify Polaris
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API Integration**: Shopify Admin API
- **Charts**: Recharts
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Date Handling**: date-fns
- **Development**: Vite, TypeScript, ESLint
- **Styling**: Tailwind CSS

## Prerequisites

- Node.js 18.x or higher
- Yarn 4.x or higher
- A Shopify Partner account
- A Supabase account

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SHOPIFY_ADMIN_API_URL=your_shopify_admin_api_url
VITE_SHOPIFY_ACCESS_TOKEN=your_shopify_access_token
```

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/shopify-enterprise-dashboard.git
   cd shopify-enterprise-dashboard
   ```

2. Install dependencies:
   ```bash
   yarn
   ```

3. Start the development server:
   ```bash
   yarn dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
├── src/
│   ├── components/     # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── lib/           # Utility functions and API clients
│   ├── pages/         # Page components
│   ├── store/         # Zustand store definitions
│   ├── context/       # React context providers
│   ├── styles/        # Global styles and Tailwind config
│   └── types/         # TypeScript type definitions
├── public/           # Static assets
└── supabase/        # Database migrations and configurations
```

## Key Features

### Multi-Store Management
- Connect and manage multiple Shopify stores
- Centralized dashboard for all store metrics
- Automated data synchronization

### Analytics Dashboard
- Real-time sales and order tracking
- Revenue analytics and trends
- Customer insights and behavior analysis
- Inventory management metrics

### User Management
- Role-based access control
- Custom permission sets
- User activity tracking
- Secure authentication

### Enterprise Features
- Data export capabilities
- Audit logging
- Automated backups
- API rate limiting protection

## Database Schema

The application uses the following main tables:

- `user_profiles`: User information and preferences
- `stores`: Connected Shopify store details
- `roles`: User role definitions
- `user_roles`: User-role assignments

## API Integration

The dashboard integrates with:

- Shopify Admin API
- Supabase REST and Realtime APIs
- Custom middleware for data synchronization

## Development

### Available Scripts

- `yarn dev`: Start development server
- `yarn build`: Build for production
- `yarn preview`: Preview production build
- `yarn lint`: Run ESLint
- `yarn typecheck`: Run TypeScript compiler

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