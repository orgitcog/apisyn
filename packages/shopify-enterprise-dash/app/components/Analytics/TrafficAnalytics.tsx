import React from 'react';
import { Card, DataTable, Badge, BlockStack, InlineStack, Text } from '@shopify/polaris';

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
  conversionRate: number;
  trend: 'up' | 'down' | 'stable';
}

export interface PagePerformance {
  path: string;
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnPage: string;
  bounceRate: number;
}

export interface ConversionFunnel {
  stage: string;
  count: number;
  percentage: number;
  dropoffRate: number;
}

export interface TrafficAnalyticsData {
  totalSessions: number;
  totalPageViews: number;
  uniqueVisitors: number;
  avgSessionDuration: string;
  bounceRate: number;
  conversionRate: number;
  trafficSources: TrafficSource[];
  topPages: PagePerformance[];
  conversionFunnel: ConversionFunnel[];
  dailyTraffic: { date: string; sessions: number; pageViews: number }[];
}

interface TrafficAnalyticsProps {
  data: TrafficAnalyticsData;
}

export function TrafficAnalytics({ data }: TrafficAnalyticsProps) {
  const {
    totalSessions,
    totalPageViews,
    uniqueVisitors,
    avgSessionDuration,
    bounceRate,
    conversionRate,
    trafficSources,
    topPages,
    conversionFunnel,
    dailyTraffic
  } = data;

  // Traffic source rows
  const sourceRows = trafficSources.map(source => {
    const trendBadge = source.trend === 'up'
      ? <Badge tone="success">↑</Badge>
      : source.trend === 'down'
        ? <Badge tone="critical">↓</Badge>
        : <Badge tone="info">→</Badge>;

    return [
      source.source,
      source.sessions.toLocaleString(),
      `${source.percentage.toFixed(1)}%`,
      `${source.conversionRate.toFixed(2)}%`,
      trendBadge
    ];
  });

  // Top pages rows
  const pageRows = topPages.map(page => [
    page.path,
    page.pageViews.toLocaleString(),
    page.uniqueVisitors.toLocaleString(),
    page.avgTimeOnPage,
    `${page.bounceRate.toFixed(1)}%`
  ]);

  // Daily traffic for mini chart
  const recentTraffic = dailyTraffic.slice(-14);
  const maxSessions = Math.max(...recentTraffic.map(t => t.sessions), 1);

  return (
    <BlockStack gap="400">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Sessions</Text>
            <Text as="p" variant="headingLg">{totalSessions.toLocaleString()}</Text>
            <Badge tone="success">+14.2%</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Page Views</Text>
            <Text as="p" variant="headingLg">{totalPageViews.toLocaleString()}</Text>
            <Badge tone="success">+18.7%</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Unique Visitors</Text>
            <Text as="p" variant="headingLg">{uniqueVisitors.toLocaleString()}</Text>
            <Badge tone="success">+9.3%</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Avg Duration</Text>
            <Text as="p" variant="headingLg">{avgSessionDuration}</Text>
            <Badge tone="info">+0.5%</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Bounce Rate</Text>
            <Text as="p" variant="headingLg">{bounceRate.toFixed(1)}%</Text>
            <Badge tone="warning">+2.1%</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Conversion</Text>
            <Text as="p" variant="headingLg">{conversionRate.toFixed(2)}%</Text>
            <Badge tone="success">+0.8%</Badge>
          </BlockStack>
        </Card>
      </div>

      {/* Traffic Trend Chart */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Traffic Trend (Last 14 Days)</Text>
          <div className="flex items-end justify-between h-32 gap-1">
            {recentTraffic.map((day, index) => {
              const date = new Date(day.date);
              const height = (day.sessions / maxSessions) * 100;

              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer"
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.sessions.toLocaleString()} sessions`}
                  ></div>
                  {index % 2 === 0 && (
                    <Text as="span" variant="bodySm" tone="subdued" alignment="center">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  )}
                </div>
              );
            })}
          </div>
        </BlockStack>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Conversion Funnel</Text>
          <div className="space-y-3">
            {conversionFunnel.map((stage, index) => {
              const width = Math.max(stage.percentage, 10);
              const isLast = index === conversionFunnel.length - 1;

              return (
                <div key={index}>
                  <InlineStack align="space-between">
                    <Text as="span" variant="bodyMd" fontWeight="semibold">{stage.stage}</Text>
                    <InlineStack gap="200">
                      <Text as="span" variant="bodyMd">{stage.count.toLocaleString()}</Text>
                      {!isLast && stage.dropoffRate > 0 && (
                        <Badge tone="critical">-{stage.dropoffRate.toFixed(1)}%</Badge>
                      )}
                    </InlineStack>
                  </InlineStack>
                  <div className="mt-1 bg-gray-100 rounded-full h-8 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-3"
                      style={{ width: `${width}%` }}
                    >
                      <Text as="span" variant="bodySm" fontWeight="semibold">
                        {stage.percentage.toFixed(1)}%
                      </Text>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </BlockStack>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Traffic Sources */}
        <Card>
          <BlockStack gap="400">
            <Text as="h3" variant="headingMd">Traffic Sources</Text>
            <DataTable
              columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'text']}
              headings={['Source', 'Sessions', 'Share', 'Conv. Rate', 'Trend']}
              rows={sourceRows}
            />
          </BlockStack>
        </Card>

        {/* Top Pages */}
        <Card>
          <BlockStack gap="400">
            <Text as="h3" variant="headingMd">Top Pages</Text>
            <DataTable
              columnContentTypes={['text', 'numeric', 'numeric', 'text', 'numeric']}
              headings={['Page', 'Views', 'Visitors', 'Avg Time', 'Bounce']}
              rows={pageRows}
            />
          </BlockStack>
        </Card>
      </div>
    </BlockStack>
  );
}

// Mock data generator for traffic analytics
export function getMockTrafficAnalytics(): TrafficAnalyticsData {
  const trafficSources: TrafficSource[] = [
    { source: 'Organic Search', sessions: 12450, percentage: 42.5, conversionRate: 3.2, trend: 'up' },
    { source: 'Direct', sessions: 8320, percentage: 28.4, conversionRate: 4.1, trend: 'stable' },
    { source: 'Social Media', sessions: 4180, percentage: 14.3, conversionRate: 2.1, trend: 'up' },
    { source: 'Email', sessions: 2890, percentage: 9.9, conversionRate: 5.8, trend: 'down' },
    { source: 'Referral', sessions: 1440, percentage: 4.9, conversionRate: 3.5, trend: 'up' }
  ];

  const topPages: PagePerformance[] = [
    { path: '/', pageViews: 28450, uniqueVisitors: 18920, avgTimeOnPage: '1:45', bounceRate: 35.2 },
    { path: '/products', pageViews: 15680, uniqueVisitors: 12340, avgTimeOnPage: '2:32', bounceRate: 28.4 },
    { path: '/products/featured', pageViews: 9840, uniqueVisitors: 8120, avgTimeOnPage: '3:15', bounceRate: 22.1 },
    { path: '/cart', pageViews: 6520, uniqueVisitors: 5890, avgTimeOnPage: '1:20', bounceRate: 45.8 },
    { path: '/checkout', pageViews: 4210, uniqueVisitors: 3980, avgTimeOnPage: '4:05', bounceRate: 18.3 }
  ];

  const conversionFunnel: ConversionFunnel[] = [
    { stage: 'Sessions', count: 29280, percentage: 100, dropoffRate: 0 },
    { stage: 'Product Views', count: 18650, percentage: 63.7, dropoffRate: 36.3 },
    { stage: 'Add to Cart', count: 8420, percentage: 28.8, dropoffRate: 54.8 },
    { stage: 'Checkout Started', count: 4210, percentage: 14.4, dropoffRate: 50.0 },
    { stage: 'Purchase Completed', count: 2890, percentage: 9.9, dropoffRate: 31.4 }
  ];

  const dailyTraffic = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (30 - i));
    const baseSessions = 800 + Math.floor(Math.random() * 400);
    // Weekend drop
    const dayOfWeek = date.getDay();
    const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.7 : 1;

    return {
      date: date.toISOString(),
      sessions: Math.floor(baseSessions * weekendMultiplier),
      pageViews: Math.floor(baseSessions * weekendMultiplier * 3.2)
    };
  });

  return {
    totalSessions: 29280,
    totalPageViews: 93696,
    uniqueVisitors: 21450,
    avgSessionDuration: '2:34',
    bounceRate: 42.3,
    conversionRate: 9.87,
    trafficSources,
    topPages,
    conversionFunnel,
    dailyTraffic
  };
}
