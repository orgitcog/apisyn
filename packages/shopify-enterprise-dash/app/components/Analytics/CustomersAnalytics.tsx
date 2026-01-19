import React from 'react';
import { Card, DataTable, Badge, ProgressBar, BlockStack, InlineStack, Text, Avatar } from '@shopify/polaris';

export interface CustomerSegment {
  name: string;
  count: number;
  revenue: number;
  percentage: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate: string;
  segment: 'VIP' | 'Regular' | 'New' | 'At Risk';
}

export interface CustomerAnalyticsData {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  averageLifetimeValue: number;
  customerRetentionRate: number;
  segments: CustomerSegment[];
  topCustomers: TopCustomer[];
  acquisitionTrend: { date: string; newCustomers: number; returningCustomers: number }[];
}

interface CustomersAnalyticsProps {
  data: CustomerAnalyticsData;
}

export function CustomersAnalytics({ data }: CustomersAnalyticsProps) {
  const {
    totalCustomers,
    newCustomers,
    averageLifetimeValue,
    customerRetentionRate,
    segments,
    topCustomers,
    acquisitionTrend
  } = data;

  const newCustomerRate = totalCustomers > 0 ? (newCustomers / totalCustomers) * 100 : 0;

  // Format top customers for DataTable
  const customerRows = topCustomers.map(customer => {
    const segmentTone = {
      'VIP': 'success',
      'Regular': 'info',
      'New': 'attention',
      'At Risk': 'warning'
    }[customer.segment] as 'success' | 'info' | 'attention' | 'warning';

    const lastOrder = new Date(customer.lastOrderDate);

    return [
      <InlineStack gap="300" align="start" blockAlign="center" key={customer.id}>
        <Avatar customer name={customer.name} size="sm" />
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">{customer.name}</Text>
          <Text as="span" variant="bodySm" tone="subdued">{customer.email}</Text>
        </BlockStack>
      </InlineStack>,
      customer.totalOrders.toString(),
      `$${customer.totalSpent.toLocaleString()}`,
      lastOrder.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      <Badge key={`badge-${customer.id}`} tone={segmentTone}>{customer.segment}</Badge>
    ];
  });

  // Customer acquisition trend for mini chart display
  const recentTrend = acquisitionTrend.slice(-7);
  const maxNewCustomers = Math.max(...recentTrend.map(t => t.newCustomers), 1);

  return (
    <BlockStack gap="400">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Customers</Text>
            <Text as="p" variant="headingLg">{totalCustomers.toLocaleString()}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="success">+{newCustomers} new</Badge>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Avg Lifetime Value</Text>
            <Text as="p" variant="headingLg">${averageLifetimeValue.toFixed(2)}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="success">+12.4%</Badge>
              <Text as="span" variant="bodySm" tone="subdued">vs last period</Text>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Retention Rate</Text>
            <Text as="p" variant="headingLg">{customerRetentionRate.toFixed(1)}%</Text>
            <ProgressBar progress={customerRetentionRate} size="small" tone="success" />
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">New Customer Rate</Text>
            <Text as="p" variant="headingLg">{newCustomerRate.toFixed(1)}%</Text>
            <ProgressBar progress={newCustomerRate} size="small" tone="primary" />
          </BlockStack>
        </Card>
      </div>

      {/* Customer Segments */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Customer Segments</Text>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {segments.map((segment, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <Text as="p" variant="headingMd">{segment.count.toLocaleString()}</Text>
                <Text as="p" variant="bodySm" fontWeight="semibold">{segment.name}</Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  ${segment.revenue.toLocaleString()} revenue
                </Text>
                <div className="mt-2">
                  <ProgressBar progress={segment.percentage} size="small" />
                </div>
              </div>
            ))}
          </div>
        </BlockStack>
      </Card>

      {/* Customer Acquisition Trend */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Weekly Acquisition Trend</Text>
            <InlineStack gap="400">
              <InlineStack gap="100">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <Text as="span" variant="bodySm">New</Text>
              </InlineStack>
              <InlineStack gap="100">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <Text as="span" variant="bodySm">Returning</Text>
              </InlineStack>
            </InlineStack>
          </InlineStack>
          <div className="flex items-end justify-between h-32 gap-2">
            {recentTrend.map((day, index) => {
              const date = new Date(day.date);
              const newHeight = (day.newCustomers / maxNewCustomers) * 100;
              const returningHeight = (day.returningCustomers / maxNewCustomers) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="flex items-end gap-1 h-24">
                    <div
                      className="w-3 bg-green-500 rounded-t"
                      style={{ height: `${Math.max(newHeight, 5)}%` }}
                      title={`New: ${day.newCustomers}`}
                    ></div>
                    <div
                      className="w-3 bg-blue-500 rounded-t"
                      style={{ height: `${Math.max(returningHeight, 5)}%` }}
                      title={`Returning: ${day.returningCustomers}`}
                    ></div>
                  </div>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </Text>
                </div>
              );
            })}
          </div>
        </BlockStack>
      </Card>

      {/* Top Customers Table */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Top Customers</Text>
          <DataTable
            columnContentTypes={['text', 'numeric', 'numeric', 'text', 'text']}
            headings={['Customer', 'Orders', 'Total Spent', 'Last Order', 'Segment']}
            rows={customerRows}
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// Mock data generator for customers analytics
export function getMockCustomersAnalytics(): CustomerAnalyticsData {
  const customerNames = [
    { first: 'Sarah', last: 'Johnson' },
    { first: 'Michael', last: 'Chen' },
    { first: 'Emily', last: 'Rodriguez' },
    { first: 'David', last: 'Williams' },
    { first: 'Jessica', last: 'Brown' },
    { first: 'James', last: 'Miller' },
    { first: 'Amanda', last: 'Davis' },
    { first: 'Robert', last: 'Garcia' }
  ];

  const segments: ('VIP' | 'Regular' | 'New' | 'At Risk')[] = ['VIP', 'Regular', 'New', 'At Risk'];

  const topCustomers: TopCustomer[] = customerNames.map((name, index) => {
    const segment = segments[index % segments.length];
    const baseSpent = segment === 'VIP' ? 5000 : segment === 'Regular' ? 1000 : 200;

    return {
      id: `cust-${index + 1}`,
      name: `${name.first} ${name.last}`,
      email: `${name.first.toLowerCase()}.${name.last.toLowerCase()}@email.com`,
      totalOrders: Math.floor(Math.random() * 50) + (segment === 'VIP' ? 20 : 5),
      totalSpent: Math.floor(Math.random() * baseSpent) + baseSpent,
      lastOrderDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      segment
    };
  }).sort((a, b) => b.totalSpent - a.totalSpent);

  const totalCustomers = 2847;
  const newCustomers = 342;
  const returningCustomers = totalCustomers - newCustomers;

  const acquisitionTrend = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    return {
      date: date.toISOString(),
      newCustomers: Math.floor(Math.random() * 20) + 5,
      returningCustomers: Math.floor(Math.random() * 40) + 20
    };
  });

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    averageLifetimeValue: 287.45,
    customerRetentionRate: 68.5,
    segments: [
      { name: 'VIP Customers', count: 156, revenue: 78500, percentage: 35 },
      { name: 'Regular', count: 1842, revenue: 92100, percentage: 41 },
      { name: 'New Customers', count: 342, revenue: 34200, percentage: 15 },
      { name: 'At Risk', count: 507, revenue: 20280, percentage: 9 }
    ],
    topCustomers,
    acquisitionTrend
  };
}
