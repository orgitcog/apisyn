import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from 'react';
import { Page, Card, Tabs, _Layout, Button, ButtonGroup, Select } from '@shopify/polaris';
import { CalendarRange } from 'lucide-react';
import { ShopifyAnalytics } from '../components/Analytics/ShopifyAnalytics';
import {
  OrdersAnalytics,
  getMockOrdersAnalytics,
  ProductsAnalytics,
  getMockProductsAnalytics,
  CustomersAnalytics,
  getMockCustomersAnalytics,
  TrafficAnalytics,
  getMockTrafficAnalytics
} from '../components/Analytics';
import { getAnalytics } from '../lib/shopify';

export async function loader() {
  try {
    const analyticsData = await getAnalytics('MONTH');
    const ordersData = getMockOrdersAnalytics();
    const productsData = getMockProductsAnalytics();
    const customersData = getMockCustomersAnalytics();
    const trafficData = getMockTrafficAnalytics();

    return json({
      analyticsData,
      ordersData,
      productsData,
      customersData,
      trafficData,
      error: null
    });
  } catch (error) {
    console.error("Error loading analytics data:", error);
    return json({
      analyticsData: [],
      ordersData: getMockOrdersAnalytics(),
      productsData: getMockProductsAnalytics(),
      customersData: getMockCustomersAnalytics(),
      trafficData: getMockTrafficAnalytics(),
      error: "Failed to load analytics data"
    });
  }
}

export default function Analytics() {
  const { analyticsData, ordersData, productsData, customersData, trafficData, _error } = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(0);
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)),
    end: new Date(),
  });
  const [timeframe, setTimeframe] = useState('30d');

  const handleTabChange = (selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  };

  const handleTimeframeChange = (value: string) => {
    setTimeframe(value);
    const end = new Date();
    let start = new Date();
    
    switch(value) {
      case '7d':
        start = new Date(new Date().setDate(end.getDate() - 7));
        break;
      case '30d':
        start = new Date(new Date().setDate(end.getDate() - 30));
        break;
      case '90d':
        start = new Date(new Date().setDate(end.getDate() - 90));
        break;
      case 'ytd':
        start = new Date(end.getFullYear(), 0, 1);
        break;
      case '1y':
        start = new Date(new Date().setFullYear(end.getFullYear() - 1));
        break;
    }
    
    setDateRange({ start, end });
  };

  const tabs = [
    {
      id: 'sales',
      content: 'Sales',
    },
    {
      id: 'orders',
      content: 'Orders',
    },
    {
      id: 'products',
      content: 'Products',
    },
    {
      id: 'customers',
      content: 'Customers',
    },
    {
      id: 'traffic',
      content: 'Traffic',
    },
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };


  return (
    <Page title="Analytics Dashboard">
      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <ButtonGroup segmented>
                <Button 
                  onClick={() => handleTimeframeChange('7d')}
                  pressed={timeframe === '7d'}
                >
                  7D
                </Button>
                <Button 
                  onClick={() => handleTimeframeChange('30d')}
                  pressed={timeframe === '30d'}
                >
                  30D
                </Button>
                <Button 
                  onClick={() => handleTimeframeChange('90d')}
                  pressed={timeframe === '90d'}
                >
                  90D
                </Button>
                <Button 
                  onClick={() => handleTimeframeChange('ytd')}
                  pressed={timeframe === 'ytd'}
                >
                  YTD
                </Button>
                <Button 
                  onClick={() => handleTimeframeChange('1y')}
                  pressed={timeframe === '1y'}
                >
                  1Y
                </Button>
              </ButtonGroup>
              
              <div className="flex items-center border rounded-md p-2">
                <CalendarRange className="w-4 h-4 mr-2" />
                <span>{formatDate(dateRange.start)} - {formatDate(dateRange.end)}</span>
              </div>
            </div>
            
            <Select
              label="Compare with"
              labelHidden
              options={[
                {label: 'Previous period', value: 'previous'},
                {label: 'Previous year', value: 'last_year'},
                {label: 'No comparison', value: 'none'},
              ]}
              value="previous"
              onChange={() => {}}
            />
          </div>
          
          <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
          
          {selected === 0 && (
            <div className="mt-6">
              <ShopifyAnalytics analyticsData={analyticsData} />
            </div>
          )}

          {selected === 1 && (
            <div className="mt-6">
              <OrdersAnalytics data={ordersData} />
            </div>
          )}

          {selected === 2 && (
            <div className="mt-6">
              <ProductsAnalytics data={productsData} />
            </div>
          )}

          {selected === 3 && (
            <div className="mt-6">
              <CustomersAnalytics data={customersData} />
            </div>
          )}

          {selected === 4 && (
            <div className="mt-6">
              <TrafficAnalytics data={trafficData} />
            </div>
          )}
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: 'Revenue', value: '$24,521', change: '+8.1%' },
              { title: 'Orders', value: '486', change: '+12.3%' },
              { title: 'Conversion Rate', value: '12.3%', change: '+2.4%' }
            ].map((metric, i) => (
              <Card key={i}>
                <Card.Section>
                  <div className="py-4">
                    <div className="text-sm text-gray-500 mb-1">{metric.title}</div>
                    <div className="text-2xl font-semibold">{metric.value}</div>
                    <div className="flex items-center mt-2 text-sm">
                      <span className="text-emerald-600">{metric.change}</span>
                      <span className="ml-1 text-gray-500">vs previous period</span>
                    </div>
                  </div>
                </Card.Section>
              </Card>
            ))}
          </div>
        </div>
      </Card>
    </Page>
  );
}