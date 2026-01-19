import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useFetcher } from "@remix-run/react";
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
  Modal,
  TextField,
  Select,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { adminAppApi, marketAppApi } from "../utils/app-integration";
import { useState, useCallback } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  // Get data from integrated apps with fallback
  const [organizations, vendorApplications, products] = await Promise.all([
    adminAppApi.getOrganizations(),
    adminAppApi.getVendorApplications(),
    marketAppApi.getProducts(),
  ]);

  // Get vendors from market app
  const vendors = await marketAppApi.getVendors();

  return json({
    organizations,
    vendorApplications,
    vendors,
    products,
    totalStats: {
      organizations: organizations.length,
      vendors: vendors.length,
      products: products.length,
      pendingApplications: vendorApplications.filter(app => app.status === "pending").length,
    }
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticate.admin(request);
  
  const formData = await request.formData();
  const action = formData.get("action");
  
  if (action === "approve_vendor") {
    const vendorId = formData.get("vendorId");
    if (vendorId) {
      await adminAppApi.approveVendor(vendorId.toString());
    }
  } else if (action === "approve_product") {
    const productId = formData.get("productId");
    if (productId) {
      await marketAppApi.approveProduct(productId.toString());
    }
  }
  
  return redirect("/app/admin-dashboard");
};

export default function AdminDashboard() {
  const { organizations, vendorApplications, products, totalStats } = useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const shopify = useAppBridge();
  
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  const handleApproveVendor = useCallback((vendorId: string) => {
    fetcher.submit(
      { action: "approve_vendor", vendorId },
      { method: "POST" }
    );
    shopify.toast.show("Vendor approval request sent");
  }, [fetcher, shopify]);

  const handleApproveProduct = useCallback((productId: string) => {
    fetcher.submit(
      { action: "approve_product", productId },
      { method: "POST" }
    );
    shopify.toast.show("Product approval request sent");
  }, [fetcher, shopify]);

  const organizationRows = organizations.map((org) => [
    org.name,
    <Badge tone={org.status === "active" ? "success" : "attention"} key={org.id}>
      {org.status}
    </Badge>,
    org.vendorCount.toString(),
    org.productCount.toString(),
    org.monthlyRevenue,
    <Button size="slim" onClick={() => setActiveModal(`org-${org.id}`)} key={`action-${org.id}`}>
      Manage
    </Button>,
  ]);

  const pendingApplications = vendorApplications.filter(app => app.status === "pending");
  const applicationRows = pendingApplications.map((app) => [
    app.vendorName,
    organizations.find(o => o.id === app.orgId)?.name || "Unknown",
    app.email,
    app.appliedDate,
    <InlineStack gap="200" key={app.id}>
      <Button 
        size="slim" 
        tone="success"
        loading={fetcher.state === "submitting"}
        onClick={() => handleApproveVendor(app.id)}
      >
        Approve
      </Button>
      <Button size="slim" tone="critical">
        Reject
      </Button>
    </InlineStack>,
  ]);

  const pendingProducts = products.filter(product => product.status === "pending_review");
  const productRows = pendingProducts.map((product) => [
    product.title,
    product.vendor,
    product.price,
    product.addedDate,
    <InlineStack gap="200" key={product.id}>
      <Button 
        size="slim" 
        tone="success"
        loading={fetcher.state === "submitting"}
        onClick={() => handleApproveProduct(product.id)}
      >
        Approve
      </Button>
      <Button size="slim" tone="critical">
        Reject
      </Button>
    </InlineStack>,
  ]);

  return (
    <Page>
      <TitleBar title="Admin Dashboard - Unified Management" />
      <BlockStack gap="500">
        {/* Executive Summary Cards */}
        <Layout>
          <Layout.Section>
            <InlineStack gap="400">
              <Card background="bg-surface-success-subdued">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Organizations</Text>
                  <Text as="p" variant="heading2xl">{totalStats.organizations}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Total Active</Text>
                </BlockStack>
              </Card>
              
              <Card background="bg-surface-info-subdued">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Vendors</Text>
                  <Text as="p" variant="heading2xl">{totalStats.vendors}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Across All Orgs</Text>
                </BlockStack>
              </Card>
              
              <Card background="bg-surface-warning-subdued">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Products</Text>
                  <Text as="p" variant="heading2xl">{totalStats.products}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Total Catalog</Text>
                </BlockStack>
              </Card>
              
              <Card background="bg-surface-critical-subdued">
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Pending</Text>
                  <Text as="p" variant="heading2xl">{totalStats.pendingApplications}</Text>
                  <Text as="p" variant="bodySm" tone="subdued">Need Review</Text>
                </BlockStack>
              </Card>
            </InlineStack>
          </Layout.Section>
        </Layout>

        {/* Pending Actions Section */}
        {(pendingApplications.length > 0 || pendingProducts.length > 0) && (
          <Layout>
            <Layout.Section>
              <Card>
                <BlockStack gap="400">
                  <Text as="h2" variant="headingMd">
                    ⚠️ Actions Required
                  </Text>
                  <Text as="p" variant="bodyMd">
                    The following items require admin approval across the integrated marketplace apps.
                  </Text>
                  
                  {pendingApplications.length > 0 && (
                    <BlockStack gap="300">
                      <Text as="h3" variant="headingSm">
                        Pending Vendor Applications ({pendingApplications.length})
                      </Text>
                      <DataTable
                        columnContentTypes={["text", "text", "text", "text", "text"]}
                        headings={["Vendor Name", "Organization", "Email", "Applied", "Actions"]}
                        rows={applicationRows}
                      />
                    </BlockStack>
                  )}
                  
                  {pendingProducts.length > 0 && (
                    <BlockStack gap="300">
                      <Text as="h3" variant="headingSm">
                        Products Pending Review ({pendingProducts.length})
                      </Text>
                      <DataTable
                        columnContentTypes={["text", "text", "text", "text", "text"]}
                        headings={["Product Title", "Vendor", "Price", "Added", "Actions"]}
                        rows={productRows}
                      />
                    </BlockStack>
                  )}
                </BlockStack>
              </Card>
            </Layout.Section>
          </Layout>
        )}

        {/* Organization Management */}
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between">
                  <Text as="h2" variant="headingMd">
                    Organization Management
                  </Text>
                  <Button variant="primary" onClick={() => setActiveModal("create-org")}>
                    Create Organization
                  </Button>
                </InlineStack>
                <DataTable
                  columnContentTypes={["text", "text", "numeric", "numeric", "text", "text"]}
                  headings={["Organization", "Status", "Vendors", "Products", "Revenue", "Actions"]}
                  rows={organizationRows}
                />
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Integration Status */}
        <Layout>
          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">App Integration Status</Text>
                <BlockStack gap="200">
                  <InlineStack align="space-between">
                    <Text>Main App</Text>
                    <Badge tone="success">Running</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text>Admin App</Text>
                    <Badge tone="info">Mock Data</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text>Market App</Text>
                    <Badge tone="info">Mock Data</Badge>
                  </InlineStack>
                  <InlineStack align="space-between">
                    <Text>Buyer App</Text>
                    <Badge tone="info">Mock Data</Badge>
                  </InlineStack>
                </BlockStack>
                <Button fullWidth onClick={() => setActiveModal("integration-help")}>
                  View Integration Guide
                </Button>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section>
            <Card>
              <BlockStack gap="300">
                <Text as="h3" variant="headingMd">Quick Actions</Text>
                <InlineStack gap="300">
                  <Button onClick={() => setActiveModal("bulk-actions")}>
                    Bulk Operations
                  </Button>
                  <Button onClick={() => setActiveModal("export-data")}>
                    Export Data
                  </Button>
                  <Button onClick={() => setActiveModal("system-settings")}>
                    System Settings
                  </Button>
                  <Button url="/app/system-status">
                    View System Status
                  </Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        {/* Modals */}
        <Modal
          open={activeModal === "create-org"}
          onClose={() => setActiveModal(null)}
          title="Create New Organization"
          primaryAction={{
            content: "Create Organization",
            onAction: () => {
              shopify.toast.show("Organization creation functionality would be implemented here");
              setActiveModal(null);
            },
          }}
          secondaryActions={[
            {
              content: "Cancel",
              onAction: () => setActiveModal(null),
            },
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <TextField
                label="Organization Name"
                value=""
                onChange={() => {}}
                autoComplete="organization"
              />
              <Select
                label="Organization Type"
                options={[
                  { label: "Vendor Marketplace", value: "marketplace" },
                  { label: "Corporate Partner", value: "corporate" },
                  { label: "Enterprise Client", value: "enterprise" },
                ]}
                value="marketplace"
                onChange={() => {}}
              />
              <TextField
                label="Contact Email"
                value=""
                onChange={() => {}}
                type="email"
                autoComplete="email"
              />
            </BlockStack>
          </Modal.Section>
        </Modal>

        <Modal
          open={activeModal === "integration-help"}
          onClose={() => setActiveModal(null)}
          title="App Integration Architecture"
          primaryAction={{
            content: "Got it",
            onAction: () => setActiveModal(null),
          }}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Text as="p">
                This unified admin dashboard integrates data from multiple specialized applications:
              </Text>
              <BlockStack gap="200">
                <Text as="p">
                  <strong>Admin App (Express):</strong> Handles organization and vendor management
                </Text>
                <Text as="p">
                  <strong>Market App (Remix):</strong> Manages products and marketplace functionality
                </Text>
                <Text as="p">
                  <strong>Buyer App (Next.js):</strong> Provides customer-facing portal
                </Text>
              </BlockStack>
              <Text as="p">
                Currently using mock data. In production, this would make API calls to each service.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      </BlockStack>
    </Page>
  );
}