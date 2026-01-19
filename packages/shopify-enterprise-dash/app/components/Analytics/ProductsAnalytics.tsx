import React from 'react';
import { Card, DataTable, Badge, ProgressBar, BlockStack, InlineStack, Text, Thumbnail } from '@shopify/polaris';
import { ImageMajor } from '@shopify/polaris-icons';

export interface ProductPerformance {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitsSold: number;
  revenue: number;
  stockLevel: number;
  reorderPoint: number;
}

export interface ProductAnalyticsData {
  topProducts: ProductPerformance[];
  totalProductsSold: number;
  totalRevenue: number;
  lowStockCount: number;
  outOfStockCount: number;
  categoryBreakdown: { category: string; revenue: number; percentage: number }[];
}

interface ProductsAnalyticsProps {
  data: ProductAnalyticsData;
}

export function ProductsAnalytics({ data }: ProductsAnalyticsProps) {
  const { topProducts, totalProductsSold, totalRevenue, lowStockCount, outOfStockCount, categoryBreakdown } = data;

  // Format top products for the DataTable
  const productRows = topProducts.map(product => {
    const stockStatus = product.stockLevel === 0
      ? 'Out of Stock'
      : product.stockLevel <= product.reorderPoint
        ? 'Low Stock'
        : 'In Stock';

    const stockTone = product.stockLevel === 0
      ? 'critical'
      : product.stockLevel <= product.reorderPoint
        ? 'warning'
        : 'success';

    return [
      <InlineStack gap="300" align="start" blockAlign="center" key={product.id}>
        <Thumbnail source={ImageMajor} alt={product.name} size="small" />
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">{product.name}</Text>
          <Text as="span" variant="bodySm" tone="subdued">{product.sku}</Text>
        </BlockStack>
      </InlineStack>,
      product.category,
      product.unitsSold.toLocaleString(),
      `$${product.revenue.toLocaleString()}`,
      product.stockLevel.toString(),
      <Badge key={`badge-${product.id}`} tone={stockTone}>{stockStatus}</Badge>
    ];
  });

  return (
    <BlockStack gap="400">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Units Sold</Text>
            <Text as="p" variant="headingLg">{totalProductsSold.toLocaleString()}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="success">+8.3%</Badge>
              <Text as="span" variant="bodySm" tone="subdued">vs last period</Text>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Product Revenue</Text>
            <Text as="p" variant="headingLg">${totalRevenue.toLocaleString()}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="success">+15.2%</Badge>
              <Text as="span" variant="bodySm" tone="subdued">vs last period</Text>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Low Stock Items</Text>
            <Text as="p" variant="headingLg">{lowStockCount}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="warning">Needs attention</Badge>
            </InlineStack>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Out of Stock</Text>
            <Text as="p" variant="headingLg">{outOfStockCount}</Text>
            <InlineStack gap="200" align="start">
              <Badge tone="critical">Action required</Badge>
            </InlineStack>
          </BlockStack>
        </Card>
      </div>

      {/* Category Breakdown */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Revenue by Category</Text>
          <BlockStack gap="300">
            {categoryBreakdown.map((cat, index) => (
              <div key={index}>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">{cat.category}</Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">${cat.revenue.toLocaleString()}</Text>
                </InlineStack>
                <div className="mt-1">
                  <ProgressBar progress={cat.percentage} size="small" tone="primary" />
                </div>
                <Text as="p" variant="bodySm" tone="subdued">{cat.percentage.toFixed(1)}% of total revenue</Text>
              </div>
            ))}
          </BlockStack>
        </BlockStack>
      </Card>

      {/* Top Products Table */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Top Performing Products</Text>
          <DataTable
            columnContentTypes={['text', 'text', 'numeric', 'numeric', 'numeric', 'text']}
            headings={['Product', 'Category', 'Units Sold', 'Revenue', 'Stock', 'Status']}
            rows={productRows}
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}

// Mock data generator for products analytics
export function getMockProductsAnalytics(): ProductAnalyticsData {
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Beauty'];
  const productNames = [
    'Wireless Bluetooth Headphones',
    'Premium Cotton T-Shirt',
    'Smart LED Light Bulb Set',
    'Yoga Mat Pro',
    'Organic Face Moisturizer',
    'Portable Power Bank',
    'Designer Sunglasses',
    'Kitchen Knife Set',
    'Running Shoes Elite',
    'Anti-Aging Serum'
  ];

  const topProducts: ProductPerformance[] = productNames.map((name, index) => {
    const stockLevel = Math.floor(Math.random() * 200);
    const reorderPoint = 25;

    return {
      id: `prod-${index + 1}`,
      name,
      sku: `SKU-${1000 + index}`,
      category: categories[index % categories.length],
      unitsSold: Math.floor(Math.random() * 500) + 50,
      revenue: Math.floor(Math.random() * 15000) + 1000,
      stockLevel,
      reorderPoint
    };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = topProducts.reduce((acc, p) => acc + p.revenue, 0);

  const categoryBreakdown = categories.map(category => {
    const categoryRevenue = topProducts
      .filter(p => p.category === category)
      .reduce((acc, p) => acc + p.revenue, 0);

    return {
      category,
      revenue: categoryRevenue,
      percentage: totalRevenue > 0 ? (categoryRevenue / totalRevenue) * 100 : 0
    };
  }).sort((a, b) => b.revenue - a.revenue);

  return {
    topProducts,
    totalProductsSold: topProducts.reduce((acc, p) => acc + p.unitsSold, 0),
    totalRevenue,
    lowStockCount: topProducts.filter(p => p.stockLevel > 0 && p.stockLevel <= p.reorderPoint).length,
    outOfStockCount: topProducts.filter(p => p.stockLevel === 0).length,
    categoryBreakdown
  };
}
