import React from 'react';
import { Card, DataTable } from '@shopify/polaris';

interface ShopifyAnalyticsProps {
  analyticsData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
}

export function ShopifyAnalytics({ analyticsData }: ShopifyAnalyticsProps) {
  // Format the data for the DataTable
  const rows = analyticsData.map(item => [
    item.date,
    `$${item.revenue.toFixed(2)}`,
    item.orders.toString(),
    `$${(item.revenue / Math.max(item.orders, 1)).toFixed(2)}`
  ]);

  return (
    <Card title="Sales Analytics">
      <Card.Section>
        <DataTable
          columnContentTypes={['text', 'numeric', 'numeric', 'numeric']}
          headings={['Date', 'Revenue', 'Orders', 'Average Order Value']}
          rows={rows}
          totals={['', `$${analyticsData.reduce((acc, item) => acc + item.revenue, 0).toFixed(2)}`, 
                  analyticsData.reduce((acc, item) => acc + item.orders, 0).toString(), '']}
        />
      </Card.Section>
    </Card>
  );
}