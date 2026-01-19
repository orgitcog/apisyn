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
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Mock data for organization admin - in real implementation, this would come from the admin-app API
  const organizations = [
    {
      id: "1",
      name: "Acme Vendors Inc",
      status: "active",
      vendorCount: 12,
      productCount: 145,
      monthlyRevenue: "$12,450",
    },
    {
      id: "2", 
      name: "Global Marketplace Co",
      status: "pending",
      vendorCount: 8,
      productCount: 89,
      monthlyRevenue: "$8,720",
    },
    {
      id: "3",
      name: "Retail Partners LLC",
      status: "active",
      vendorCount: 23,
      productCount: 312,
      monthlyRevenue: "$18,990",
    },
  ];

  const vendorApplications = [
    {
      id: "1",
      vendorName: "Tech Gadgets Pro",
      orgId: "1",
      appliedDate: "2024-09-01",
      status: "pending",
      email: "contact@techgadgets.com",
    },
    {
      id: "2",
      vendorName: "Fashion Forward",
      orgId: "2", 
      appliedDate: "2024-09-05",
      status: "approved",
      email: "hello@fashionforward.com",
    },
  ];

  return { organizations, vendorApplications };
};

export default function OrgAdmin() {
  const { organizations, vendorApplications } = useLoaderData<typeof loader>();

  const organizationRows = organizations.map((org) => [
    org.name,
    <Badge tone={org.status === "active" ? "success" : "attention"} key={org.id}>
      {org.status}
    </Badge>,
    org.vendorCount.toString(),
    org.productCount.toString(),
    org.monthlyRevenue,
  ]);

  const applicationRows = vendorApplications.map((app) => [
    app.vendorName,
    organizations.find(o => o.id === app.orgId)?.name || "Unknown",
    app.email,
    app.appliedDate,
    <Badge tone={app.status === "approved" ? "success" : "attention"} key={app.id}>
      {app.status}
    </Badge>,
  ]);

  return (
    <Page>
      <TitleBar title="Organization Admin" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Organization Management
                </Text>
                <Text as="p" variant="bodyMd">
                  Manage marketplace organizations, vendor applications, and administrative settings.
                </Text>
                <InlineStack gap="300">
                  <Button variant="primary">Create Organization</Button>
                  <Button>Manage Settings</Button>
                  <Button>View Reports</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Quick Stats</Text>
                  <Box>
                    <Text as="p" variant="bodyMd">
                      <strong>3</strong> Organizations
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>43</strong> Total Vendors
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>546</strong> Total Products
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>$40,160</strong> Monthly Revenue
                    </Text>
                  </Box>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Admin Tools</Text>
                  <BlockStack gap="200">
                    <Button fullWidth>Access Legacy Admin</Button>
                    <Button fullWidth>Export Data</Button>
                    <Button fullWidth>System Settings</Button>
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
                  Organizations
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "numeric", "text"]}
                  headings={["Organization", "Status", "Vendors", "Products", "Revenue"]}
                  rows={organizationRows}
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
                  Vendor Applications
                </Text>
                <DataTable
                  columnContentTypes={["text", "text", "text", "text", "text"]}
                  headings={["Vendor Name", "Organization", "Email", "Applied", "Status"]}
                  rows={applicationRows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}