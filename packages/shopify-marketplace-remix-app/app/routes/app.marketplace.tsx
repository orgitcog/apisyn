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

  // Mock marketplace data - in real implementation, this would integrate with market-app API
  const vendors = [
    {
      id: "1",
      name: "Tech Solutions Pro",
      email: "contact@techsolutions.com",
      status: "active",
      productCount: 24,
      totalSales: "$5,240",
      joinDate: "2024-08-15",
    },
    {
      id: "2",
      name: "Fashion Hub",
      email: "hello@fashionhub.com", 
      status: "pending",
      productCount: 12,
      totalSales: "$2,180",
      joinDate: "2024-09-01",
    },
    {
      id: "3",
      name: "Home Essentials",
      email: "info@homeessentials.com",
      status: "active",
      productCount: 45,
      totalSales: "$8,750",
      joinDate: "2024-07-22",
    },
  ];

  const recentProducts = [
    {
      id: "1",
      title: "Wireless Bluetooth Headphones",
      vendor: "Tech Solutions Pro",
      status: "published",
      price: "$89.99",
      addedDate: "2024-09-08",
    },
    {
      id: "2",
      title: "Summer Dress Collection",
      vendor: "Fashion Hub",
      status: "pending_review",
      price: "$45.00",
      addedDate: "2024-09-07",
    },
    {
      id: "3",
      title: "Kitchen Utensil Set",
      vendor: "Home Essentials", 
      status: "published",
      price: "$32.50",
      addedDate: "2024-09-06",
    },
  ];

  return { vendors, recentProducts };
};

export default function Marketplace() {
  const { vendors, recentProducts } = useLoaderData<typeof loader>();

  const vendorRows = vendors.map((vendor) => [
    vendor.name,
    vendor.email,
    <Badge tone={vendor.status === "active" ? "success" : "attention"} key={vendor.id}>
      {vendor.status}
    </Badge>,
    vendor.productCount.toString(),
    vendor.totalSales,
    vendor.joinDate,
  ]);

  const productRows = recentProducts.map((product) => [
    product.title,
    product.vendor,
    <Badge tone={product.status === "published" ? "success" : "attention"} key={product.id}>
      {product.status === "published" ? "Published" : "Pending Review"}
    </Badge>,
    product.price,
    product.addedDate,
  ]);

  return (
    <Page>
      <TitleBar title="Marketplace Management" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Marketplace Overview
                </Text>
                <Text as="p" variant="bodyMd">
                  Manage vendors, review products, and monitor marketplace activity. This interface integrates with the marketplace app functionality.
                </Text>
                <InlineStack gap="300">
                  <Button variant="primary">Review Pending Products</Button>
                  <Button>Manage Vendors</Button>
                  <Button>View Analytics</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Marketplace Stats</Text>
                  <Box>
                    <Text as="p" variant="bodyMd">
                      <strong>{vendors.length}</strong> Active Vendors
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>{vendors.reduce((sum, v) => sum + v.productCount, 0)}</strong> Total Products
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>{recentProducts.filter(p => p.status === "pending_review").length}</strong> Pending Reviews
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>$16,170</strong> Total Sales
                    </Text>
                  </Box>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Quick Actions</Text>
                  <BlockStack gap="200">
                    <Link url="/app/marketplace/vendors" removeUnderline>
                      <Button fullWidth>Manage All Vendors</Button>
                    </Link>
                    <Link url="/app/marketplace/products" removeUnderline>
                      <Button fullWidth>Review Products</Button>
                    </Link>
                    <Link url="/app/marketplace/settings" removeUnderline>
                      <Button fullWidth>Marketplace Settings</Button>
                    </Link>
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
                  Vendors
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "text", "numeric", "text", "text"]}
                  headings={["Vendor Name", "Email", "Status", "Products", "Sales", "Joined"]}
                  rows={vendorRows}
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
                  Recent Products
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text"]}
                  headings={["Product Title", "Vendor", "Status", "Price", "Added"]}
                  rows={productRows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}