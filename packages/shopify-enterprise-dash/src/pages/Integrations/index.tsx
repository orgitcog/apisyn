import React from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  Badge,
  Button,
  ButtonGroup,
  List,
  Link,
} from "@shopify/polaris";
import {
  ShoppingBag,
  Database,
  MessageSquare,
  Building2,
  Store,
  Brain,
  Briefcase,
  BookOpen,
  RefreshCw,
} from "lucide-react";

export function Integrations() {
  const integrations = [
    {
      id: "shopify",
      name: "Shopify",
      description: "E-commerce platform integration via Admin API",
      icon: ShoppingBag,
      status: "active",
      features: [
        "Store management",
        "Product catalog",
        "Order processing",
        "Customer data",
        "Analytics",
      ],
      docs: "https://shopify.dev/docs/api/admin-rest",
    },
    {
      id: "supabase",
      name: "Supabase",
      description: "Database and authentication provider",
      icon: Database,
      status: "active",
      features: [
        "PostgreSQL database",
        "Authentication",
        "Row-level security",
        "Real-time subscriptions",
      ],
      docs: "https://supabase.com/docs",
    },
    {
      id: "openai",
      name: "OpenAI",
      description: "AI-powered chat and content generation",
      icon: Brain,
      status: "active",
      features: [
        "Chat completions",
        "Content moderation",
        "Fine-tuning",
        "Usage monitoring",
      ],
      docs: "https://platform.openai.com/docs",
    },
    {
      id: "appdirect",
      name: "AppDirect",
      description: "Enterprise application marketplace",
      icon: Store,
      status: "active",
      features: [
        "App marketplace",
        "Subscription management",
        "User management",
        "Event handling",
      ],
      docs: "https://help.appdirect.com/api",
    },
    {
      id: "netsuite",
      name: "NetSuite",
      description: "Enterprise resource planning integration",
      icon: Building2,
      status: "active",
      features: [
        "Customer management",
        "Transaction tracking",
        "Financial data",
        "Subsidiary management",
      ],
      docs: "https://docs.oracle.com/en/cloud/saas/netsuite/ns-online-help/chapter_N3427749.html",
    },
    {
      id: "quickbooks",
      name: "QuickBooks",
      description: "Accounting and financial management",
      icon: Briefcase,
      status: "active",
      features: [
        "Customer data",
        "Invoice management",
        "Payment tracking",
        "Financial reports",
      ],
      docs: "https://developer.intuit.com/app/developer/qbo/docs/develop",
    },
    {
      id: "repsly",
      name: "Repsly",
      description: "Field team and retail execution management",
      icon: Store,
      status: "active",
      features: [
        "Field team management",
        "Store visits",
        "Inventory tracking",
        "Performance analytics",
      ],
      docs: "https://api.repsly.com/v3/docs",
    },
    {
      id: "sillytavern",
      name: "SillyTavern",
      description: "AI character and chat management",
      icon: MessageSquare,
      status: "active",
      features: [
        "Character management",
        "Chat interactions",
        "Voice settings",
        "Analytics",
      ],
      docs: "https://docs.sillytavern.app",
    },
    {
      id: "wlns",
      name: "Wellness Center",
      description: "Wellness and spa management system",
      icon: BookOpen,
      status: "active",
      features: [
        "Center management",
        "Practitioner scheduling",
        "Service booking",
        "Client management",
      ],
      docs: "#",
    },
  ];

  return (
    <Page
      title="Integrations"
      subtitle="Manage and monitor your external service connections"
      primaryAction={{
        content: "Sync All",
        icon: RefreshCw,
        onAction: () => {
          // TODO: Implement sync all functionality
          alert("Syncing all integrations...");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <Card.Section>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gray-100 mr-3">
                        {React.createElement(integration.icon, {
                          className: "w-6 h-6 text-gray-700",
                        })}
                      </div>
                      <div>
                        <Text variant="headingMd" as="h3">
                          {integration.name}
                        </Text>
                        <Badge status="success">{integration.status}</Badge>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">
                    {integration.description}
                  </p>

                  <div className="mb-4">
                    <Text variant="headingSm" as="h4" className="mb-2">
                      Features
                    </Text>
                    <List type="bullet">
                      {integration.features.map((feature, index) => (
                        <List.Item key={index}>{feature}</List.Item>
                      ))}
                    </List>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Link url={integration.docs} external>
                      View Documentation
                    </Link>
                    <ButtonGroup>
                      <Button>Configure</Button>
                      <Button primary>Test Connection</Button>
                    </ButtonGroup>
                  </div>
                </Card.Section>
              </Card>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Integration Health">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">API Rate Limits</Text>
                  <p className="text-gray-600">
                    Monitoring API usage across all integrations
                  </p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">85%</Text>
                  <Text variant="bodySm" color="success">
                    Within limits
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Data Sync Status</Text>
                  <p className="text-gray-600">
                    Last sync completed successfully
                  </p>
                </div>
                <div className="text-right">
                  <Text variant="bodySm" color="success">
                    5 minutes ago
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Error Rate</Text>
                  <p className="text-gray-600">Monitoring integration errors</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">0.1%</Text>
                  <Text variant="bodySm" color="success">
                    Below threshold
                  </Text>
                </div>
              </div>
            </div>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
