import React from 'react';
import { Card, DataTable, Badge, ProgressBar, BlockStack, InlineStack, Text } from '@shopify/polaris';

export interface OrderAnalyticsData {
  date: string;
  totalOrders: number;
  fulfilledOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  averageOrderValue: number;
  totalRevenue: number;
}

interface OrdersAnalyticsProps {
  data: OrderAnalyticsData[];
}

export function OrdersAnalytics({ data }: OrdersAnalyticsProps) {
  // Calculate summary metrics
  const totalOrders = data.reduce((acc, item) => acc + item.totalOrders, 0);
  const totalFulfilled = data.reduce((acc, item) => acc + item.fulfilledOrders, 0);
  const totalPending = data.reduce((acc, item) => acc + item.pendingOrders, 0);
  const totalCancelled = data.reduce((acc, item) => acc + item.cancelledOrders, 0);
  const totalRevenue = data.reduce((acc, item) => acc + item.totalRevenue, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  const fulfillmentRate = totalOrders > 0 ? (totalFulfilled / totalOrders) * 100 : 0;
  const cancellationRate = totalOrders > 0 ? (totalCancelled / totalOrders) * 100 : 0;

  // Format the data for the DataTable
  const rows = data.slice(-10).reverse().map(item => {
    const date = new Date(item.date);
    return [
      date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      item.totalOrders.toString(),
      item.fulfilledOrders.toString(),
      item.pendingOrders.toString(),
      item.cancelledOrders.toString(),
      `$${item.averageOrderValue.toFixed(2)}`,
      `$${item.totalRevenue.toFixed(2)}`
    ];
  });

  return (
    <BlockStack gap="400">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Orders</Text>
            <Text as="p" variant="headingLg">{totalOrders.toLocaleString()}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="success">+12.5%</Badge>
              <Text as="span" variant="bodySm" tone="subdued">vs last period</Text>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Avg Order Value</Text>
            <Text as="p" variant="headingLg">${avgOrderValue.toFixed(2)}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="success">+5.2%</Badge>
              <Text as="span" variant="bodySm" tone="subdued">vs last period</Text>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Fulfillment Rate</Text>
            <Text as="p" variant="headingLg">{fulfillmentRate.toFixed(1)}%</Text>
            <ProgressBar progress={fulfillmentRate} size="small" tone="success" />
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Cancellation Rate</Text>
            <Text as="p" variant="headingLg">{cancellationRate.toFixed(1)}%</Text>
            <ProgressBar progress={cancellationRate} size="small" tone="critical" />
          </BlockStack>
        </Card>
      </div>

      {/* Order Status Breakdown */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Order Status Breakdown</Text>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Text as="p" variant="headingLg" tone="success">{totalFulfilled}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Fulfilled</Text>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <Text as="p" variant="headingLg" tone="caution">{totalPending}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Pending</Text>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <Text as="p" variant="headingLg" tone="critical">{totalCancelled}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Cancelled</Text>
            </div>
          </div>
        </BlockStack>
      </Card>

      {/* Orders Table */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Daily Order Summary</Text>
          <DataTable
            columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric', 'numeric']}
            headings={['Date', 'Orders', 'Fulfilled', 'Pending', 'Cancelled', 'Avg Value', 'Revenue']}
            rows={rows}
            totals={[
              'Total',
              totalOrders.toString(),
              totalFulfilled.toString(),
              totalPending.toString(),
              totalCancelled.toString(),
              `$${avgOrderValue.toFixed(2)}`,
              `$${totalRevenue.toFixed(2)}`
            ]}
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// Mock data generator for orders analytics
export function getMockOrdersAnalytics(): OrderAnalyticsData[] {
  const data: OrderAnalyticsData[] = [];
  const currentDate = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(currentDate.getDate() - (30 - i));

    const totalOrders = Math.floor(Math.random() * 50) + 20;
    const fulfilledOrders = Math.floor(totalOrders * (0.7 + Math.random() * 0.2));
    const cancelledOrders = Math.floor(Math.random() * 5);
    const pendingOrders = totalOrders - fulfilledOrders - cancelledOrders;
    const averageOrderValue = Math.floor(Math.random() * 80) + 40;

    data.push({
      date: date.toISOString(),
      totalOrders,
      fulfilledOrders,
      pendingOrders: Math.max(0, pendingOrders),
      cancelledOrders,
      averageOrderValue,
      totalRevenue: totalOrders * averageOrderValue
    });
  }

  return data;
}
