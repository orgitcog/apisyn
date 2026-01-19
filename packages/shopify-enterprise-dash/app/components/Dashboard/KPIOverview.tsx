import React from 'react';
import { Card, Text } from '@shopify/polaris';
import { BarChart, ShoppingCart, Store, ArrowUpRight, DollarSign } from 'lucide-react';

interface StoreData {
  revenue: number;
  orders: number;
  status: string;
}

export function KPIOverview({ stores }: { stores: StoreData[] }) {
  // Calculate KPIs
  const totalRevenue = stores.reduce((sum, store) => sum + store.revenue, 0);
  const totalOrders = stores.reduce((sum, store) => sum + store.orders, 0);
  const activeStores = stores.filter(store => store.status === 'active').length;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      change: '+12.3%',
      icon: DollarSign,
      color: 'text-emerald-600'
    },
    {
      title: 'Total Orders',
      value: totalOrders.toLocaleString(),
      change: '+8.1%',
      icon: ShoppingCart,
      color: 'text-blue-600'
    },
    {
      title: 'Active Stores',
      value: activeStores.toString(),
      change: '+2',
      icon: Store,
      color: 'text-purple-600'
    },
    {
      title: 'Avg Order Value',
      value: `$${avgOrderValue.toFixed(2)}`,
      change: '+5.4%',
      icon: BarChart,
      color: 'text-amber-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      {kpiCards.map((kpi, index) => (
        <Card key={index}>
          <Card.Section>
            <div className="flex items-start justify-between">
              <div>
                <Text variant="bodySm" as="p" color="subdued">{kpi.title}</Text>
                <div className="mt-1">
                  <Text variant="headingMd" as="h2">{kpi.value}</Text>
                </div>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className={`w-4 h-4 ${kpi.color} mr-1`} />
                  <Text variant="bodySm" as="p" color="success">{kpi.change} from last month</Text>
                </div>
              </div>
              <div className={`p-3 rounded-full bg-gray-100 ${kpi.color}`}>
                {React.createElement(kpi.icon, { className: 'w-5 h-5' })}
              </div>
            </div>
          </Card.Section>
        </Card>
      ))}
    </div>
  );
}