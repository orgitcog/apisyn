import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  Badge,
  InlineStack,
  Box,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { checkAppHealth } from "../utils/app-integration";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  const healthStatus = await checkAppHealth();
  
  const systemInfo = {
    mainApp: {
      name: "Main Remix App",
      status: "running",
      version: "1.0.0",
      description: "Primary application coordinator and admin interface",
    },
    adminApp: {
      name: "Admin App",
      status: healthStatus.adminApp ? "running" : "offline",
      version: "1.0.0", 
      description: "Legacy Express admin application for channel management",
    },
    marketApp: {
      name: "Market App",
      status: healthStatus.marketApp ? "running" : "offline", 
      version: "1.0.0",
      description: "Remix marketplace application for vendor and product management",
    },
    buyerApp: {
      name: "Buyer App",
      status: healthStatus.buyerApp ? "running" : "offline",
      version: "1.0.0",
      description: "Next.js buyer portal for customer-facing functionality",
    },
  };

  const integrationStatus = {
    apps: Object.values(systemInfo).filter(app => app.status === "running").length,
    totalApps: Object.values(systemInfo).length,
    apiConnections: healthStatus,
    lastCheck: new Date().toISOString(),
  };

  return { systemInfo, integrationStatus };
};

export default function SystemStatus() {
  const { systemInfo, integrationStatus } = useLoaderData<typeof loader>();

  const appEntries = Object.entries(systemInfo);

  return (
    <Page>
      <TitleBar title="System Status & Integration" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Application Integration Status
                </Text>
                <Text as="p" variant="bodyMd">
                  Monitor the health and connectivity of all integrated applications in the marketplace ecosystem.
                </Text>
                <InlineStack gap="300">
                  <Button variant="primary" onClick={() => window.location.reload()}>
                    Refresh Status
                  </Button>
                  <Button>View Logs</Button>
                  <Button>Integration Settings</Button>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
          
          <Layout.Section variant="oneThird">
            <BlockStack gap="400">
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Integration Summary</Text>
                  <Box>
                    <Text as="p" variant="bodyMd">
                      <strong>{integrationStatus.apps}/{integrationStatus.totalApps}</strong> Apps Running
                    </Text>
                    <Text as="p" variant="bodyMd">
                      <strong>
                        {Object.values(integrationStatus.apiConnections).filter(Boolean).length}/
                        {Object.values(integrationStatus.apiConnections).length}
                      </strong> API Connections
                    </Text>
                    <Text as="p" variant="bodyMd" tone="subdued">
                      Last checked: {new Date(integrationStatus.lastCheck).toLocaleTimeString()}
                    </Text>
                  </Box>
                </BlockStack>
              </Card>
              
              <Card>
                <BlockStack gap="200">
                  <Text as="h3" variant="headingMd">Quick Actions</Text>
                  <BlockStack gap="200">
                    <Button fullWidth disabled={!integrationStatus.apiConnections.adminApp}>
                      Access Admin App
                    </Button>
                    <Button fullWidth disabled={!integrationStatus.apiConnections.marketApp}>
                      Access Market App
                    </Button>
                    <Button fullWidth disabled={!integrationStatus.apiConnections.buyerApp}>
                      Access Buyer App
                    </Button>
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
                  Application Health Status
                </Text>
                <BlockStack gap="400">
                  {appEntries.map(([key, app]) => (
                    <Card key={key} background="bg-surface-secondary">
                      <InlineStack align="space-between" blockAlign="center">
                        <BlockStack gap="100">
                          <InlineStack gap="200" blockAlign="center">
                            <Text as="h3" variant="headingSm">
                              {app.name}
                            </Text>
                            <Badge tone={app.status === "running" ? "success" : "critical"}>
                              {app.status}
                            </Badge>
                          </InlineStack>
                          <Text as="p" variant="bodySm" tone="subdued">
                            {app.description}
                          </Text>
                          <Text as="p" variant="bodySm" tone="subdued">
                            Version: {app.version}
                          </Text>
                        </BlockStack>
                        <InlineStack gap="200">
                          {app.status === "running" ? (
                            <Button size="slim">View Details</Button>
                          ) : (
                            <Button size="slim" tone="critical">
                              Troubleshoot
                            </Button>
                          )}
                        </InlineStack>
                      </InlineStack>
                    </Card>
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>

        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h2" variant="headingMd">
                  Integration Architecture
                </Text>
                <Text as="p" variant="bodyMd">
                  The marketplace system consists of multiple specialized applications working together:
                </Text>
                <BlockStack gap="300">
                  <Box padding="400" background="bg-surface-tertiary" borderRadius="200">
                    <Text as="p" variant="bodySm">
                      <strong>Main App (Remix):</strong> Central coordinator providing unified admin interface and routing to specialized apps
                    </Text>
                  </Box>
                  <Box padding="400" background="bg-surface-tertiary" borderRadius="200">
                    <Text as="p" variant="bodySm">
                      <strong>Admin App (Express):</strong> Legacy channel management system with GraphQL API for vendor administration
                    </Text>
                  </Box>
                  <Box padding="400" background="bg-surface-tertiary" borderRadius="200">
                    <Text as="p" variant="bodySm">
                      <strong>Market App (Remix):</strong> Modern marketplace functionality for vendor and product management
                    </Text>
                  </Box>
                  <Box padding="400" background="bg-surface-tertiary" borderRadius="200">
                    <Text as="p" variant="bodySm">
                      <strong>Buyer App (Next.js):</strong> Customer-facing portal for browsing and purchasing from vendors
                    </Text>
                  </Box>
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}