import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Button,
  InlineStack,
  Badge,
  DataTable,
  Box,
  Link,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock buyer data - in real implementation, this would integrate with buyer-app API
  const buyers = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      company: "ABC Corp",
      status: "active",
      totalOrders: 12,
      totalSpent: "$2,450",
      lastOrder: "2024-09-05",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.j@company.com",
      company: "Tech Innovations",
      status: "active", 
      totalOrders: 8,
      totalSpent: "$1,890",
      lastOrder: "2024-09-03",
    },
    {
      id: "3",
      name: "Mike Wilson",
      email: "m.wilson@retail.com",
      company: "Retail Solutions",
      status: "inactive",
      totalOrders: 3,
      totalSpent: "$750",
      lastOrder: "2024-08-15",
    },
  ];

  const recentOrders = [
    {
      id: "ORD-001",
      buyerName: "John Smith",
      company: "ABC Corp",
      amount: "$145.50",
      status: "delivered",
      orderDate: "2024-09-05",
      items: 3,
    },
    {
      id: "ORD-002",
      buyerName: "Sarah Johnson", 
      company: "Tech Innovations",
      amount: "$89.99",
      status: "shipped",
      orderDate: "2024-09-03",
      items: 1,
    },
    {
      id: "ORD-003",
      buyerName: "David Lee",
      company: "Global Trading",
      amount: "$320.00",
      status: "processing",
      orderDate: "2024-09-02",
      items: 5,
    },
  ];

  return { buyers, recentOrders };
};

export default function Buyers() {
  const { buyers, recentOrders } = useLoaderData<typeof loader>();

  const buyerRows = buyers.map((buyer) => [
    buyer.name,
    buyer.email,
    buyer.company,
    <Badge tone={buyer.status === "active" ? "success" : "subdued"} key={buyer.id}>
      {buyer.status}
    </Badge>,
    buyer.totalOrders.toString(),
    buyer.totalSpent,
    buyer.lastOrder,
  ]);

  const orderRows = recentOrders.map((order) => [
    order.id,
    order.buyerName,
    order.company,
    order.amount,
    <Badge tone={
      order.status === "delivered" ? "success" : 
      order.status === "shipped" ? "info" : "attention"
    } key={order.id}>
      {order.status}
    </Badge>,
    order.items.toString(),
    order.orderDate,
  ]);

  return (
    <Page>
      <TitleBar title="Buyer Portal Management" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Buyer Portal Overview
                </Text>
                <Text as="p" variant="bodyMd">
                  Manage buyer accounts, track orders, and monitor buyer portal activity. This interface provides insights into buyer behavior and portal usage.
                </Text>
                <InlineStack gap="300">
                  <Button variant="primary">Manage Buyer Accounts</Button>
                  <Button>View Order Analytics</Button>
                  <Button>Portal Settings</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Buyer Portal Stats</Text>
                  <Box>
                    <Text as="p" variant="bodyMd">
                      <strong>{buyers.length}</strong> Registered Buyers
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>{buyers.filter(b => b.status === "active").length}</strong> Active Buyers
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>{buyers.reduce((sum, b) => sum + b.totalOrders, 0)}</strong> Total Orders
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>$5,090</strong> Total Revenue
                    </Text>
                  </Box>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Portal Tools</Text>
                  <BlockStack gap="200">
                    <Link url="/app/buyers/accounts" removeUnderline>
                      <Button fullWidth>Manage Accounts</Button>
                    </Link>
                    <Link url="/app/buyers/orders" removeUnderline>
                      <Button fullWidth>Order Management</Button>
                    </Link>
                    <Link url="/app/buyers/analytics" removeUnderline>
                      <Button fullWidth>Buyer Analytics</Button>
                    </Link>
                    <Button fullWidth>Access Buyer Portal</Button>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Buyer Accounts
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "numeric", "text", "text"]}
                  headings={["Name", "Email", "Company", "Status", "Orders", "Total Spent", "Last Order"]}
                  rows={buyerRows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Recent Orders
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text", "numeric", "text"]}
                  headings={["Order ID", "Buyer", "Company", "Amount", "Status", "Items", "Date"]}
                  rows={orderRows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}