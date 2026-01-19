import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from 'react';
import { 
  Page, 
  Layout,
  Card,
  Form,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  Tabs,
  BlockStack,
  Select,
  Badge
} from '@shopify/polaris';
import { _Settings, Save, RefreshCw } from 'lucide-react';

interface SettingsData {
  general: {
    companyName: string;
    email: string;
    timezone: string;
  };
  notifications: {
    emailNotifications: boolean;
    syncAlerts: boolean;
    weeklyReports: boolean;
  };
  shopify: {
    apiUrl: string;
    hasCredentials: boolean;
  };
  supabase: {
    url: string;
    hasCredentials: boolean;
  };
}

// Note: VITE_ prefixed environment variables are intentionally exposed to the client
// as this is a client-side rendered application. Supabase anon key and Shopify API
// integration happens client-side. For production, consider implementing server-side
// API proxies for additional security.
const mockSettings: SettingsData = {
  general: {
    companyName: 'My Enterprise',
    email: 'admin@example.com',
    timezone: 'America/New_York',
  },
  notifications: {
    emailNotifications: true,
    syncAlerts: true,
    weeklyReports: false,
  },
  shopify: {
    apiUrl: process.env.VITE_SHOPIFY_ADMIN_API_URL || '',
    hasCredentials: !!(process.env.VITE_SHOPIFY_ADMIN_API_URL && process.env.VITE_SHOPIFY_ACCESS_TOKEN),
  },
  supabase: {
    url: process.env.VITE_SUPABASE_URL || '',
    hasCredentials: !!(process.env.VITE_SUPABASE_URL && process.env.VITE_SUPABASE_ANON_KEY),
  },
};

export async function loader() {
  return json({ settings: mockSettings });
}

export default function SettingsPage() {
  const { settings } = useLoaderData<typeof loader>();
  const [selected, setSelected] = useState(0);
  const [generalSettings, setGeneralSettings] = useState(settings.general);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleTabChange = (selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  };

  const handleGeneralChange = (field: keyof typeof generalSettings) => (value: string) => {
    setGeneralSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    // In a real app, this would save settings to Supabase
    console.log('Saving settings:', generalSettings);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const timezones = [
    { label: 'Eastern Time (ET)', value: 'America/New_York' },
    { label: 'Central Time (CT)', value: 'America/Chicago' },
    { label: 'Mountain Time (MT)', value: 'America/Denver' },
    { label: 'Pacific Time (PT)', value: 'America/Los_Angeles' },
    { label: 'UTC', value: 'UTC' },
  ];

  const tabs = [
    {
      id: 'general',
      content: 'General',
    },
    {
      id: 'integrations',
      content: 'Integrations',
    },
    {
      id: 'notifications',
      content: 'Notifications',
    },
    {
      id: 'security',
      content: 'Security',
    },
  ];

  return (
    <Page
      title="Settings"
      subtitle="Manage your enterprise dashboard settings"
    >
      {saveSuccess && (
        <div className="mb-4">
          <Banner status="success" onDismiss={() => setSaveSuccess(false)}>
            Settings saved successfully!
          </Banner>
        </div>
      )}

      <Layout>
        <Layout.Section>
          <Card>
            <div className="p-4">
              <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange}>
                {selected === 0 && (
                  <div className="mt-4">
                    <Form onSubmit={handleSaveSettings}>
                      <FormLayout>
                        <TextField
                          label="Company name"
                          value={generalSettings.companyName}
                          onChange={handleGeneralChange('companyName')}
                          autoComplete="organization"
                        />
                        <TextField
                          label="Email address"
                          type="email"
                          value={generalSettings.email}
                          onChange={handleGeneralChange('email')}
                          autoComplete="email"
                        />
                        <Select
                          label="Timezone"
                          options={timezones}
                          value={generalSettings.timezone}
                          onChange={(value) => setGeneralSettings(prev => ({ ...prev, timezone: value }))}
                        />
                        <div className="flex justify-end">
                          <Button submit variant="primary" icon={<Save className="w-4 h-4" />}>
                            Save settings
                          </Button>
                        </div>
                      </FormLayout>
                    </Form>
                  </div>
                )}

                {selected === 1 && (
                  <div className="mt-4 space-y-4">
                    <Card sectioned>
                      <BlockStack gap="400">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text as="h3" variant="headingMd">Shopify Integration</Text>
                            <Text as="p" variant="bodySm" color="subdued">
                              Connect your Shopify store to sync data automatically
                            </Text>
                          </div>
                          {settings.shopify.hasCredentials ? (
                            <Badge status="success">Connected</Badge>
                          ) : (
                            <Badge status="warning">Not configured</Badge>
                          )}
                        </div>
                        {settings.shopify.apiUrl && (
                          <Text as="p" variant="bodySm" color="subdued">
                            API URL: {settings.shopify.apiUrl}
                          </Text>
                        )}
                        <div className="flex gap-2">
                          <Button icon={<RefreshCw className="w-4 h-4" />}>
                            Test connection
                          </Button>
                          <Button>Configure</Button>
                        </div>
                      </BlockStack>
                    </Card>

                    <Card sectioned>
                      <BlockStack gap="400">
                        <div className="flex items-center justify-between">
                          <div>
                            <Text as="h3" variant="headingMd">Supabase Database</Text>
                            <Text as="p" variant="bodySm" color="subdued">
                              PostgreSQL database for storing enterprise data
                            </Text>
                          </div>
                          {settings.supabase.hasCredentials ? (
                            <Badge status="success">Connected</Badge>
                          ) : (
                            <Badge status="warning">Not configured</Badge>
                          )}
                        </div>
                        {settings.supabase.url && (
                          <Text as="p" variant="bodySm" color="subdued">
                            URL: {settings.supabase.url}
                          </Text>
                        )}
                        <div className="flex gap-2">
                          <Button icon={<RefreshCw className="w-4 h-4" />}>
                            Test connection
                          </Button>
                          <Button>Configure</Button>
                        </div>
                      </BlockStack>
                    </Card>

                    <Banner status="info">
                      <p>
                        To configure integrations, set the following environment variables in your <code>.env</code> file:
                      </p>
                      <ul className="list-disc ml-4 mt-2">
                        <li><code>VITE_SUPABASE_URL</code> - Your Supabase project URL</li>
                        <li><code>VITE_SUPABASE_ANON_KEY</code> - Your Supabase anonymous key</li>
                        <li><code>VITE_SHOPIFY_ADMIN_API_URL</code> - Your Shopify Admin API URL</li>
                        <li><code>VITE_SHOPIFY_ACCESS_TOKEN</code> - Your Shopify access token</li>
                      </ul>
                    </Banner>
                  </div>
                )}

                {selected === 2 && (
                  <div className="mt-4">
                    <Card sectioned>
                      <Text as="p" variant="bodyMd">
                        Configure notification preferences for your enterprise dashboard.
                      </Text>
                      <div className="mt-4">
                        <p className="text-gray-500">Notification settings coming soon...</p>
                      </div>
                    </Card>
                  </div>
                )}

                {selected === 3 && (
                  <div className="mt-4">
                    <Card sectioned>
                      <BlockStack gap="400">
                        <div>
                          <Text as="h3" variant="headingMd">Security Features</Text>
                          <Text as="p" variant="bodySm" color="subdued">
                            Your enterprise dashboard includes the following security features:
                          </Text>
                        </div>
                        <ul className="list-disc ml-6 space-y-2">
                          <li>Row-level security (RLS) policies on all database tables</li>
                          <li>Role-based access control (RBAC) for user permissions</li>
                          <li>Encrypted data storage with Supabase</li>
                          <li>Secure authentication with Supabase Auth</li>
                          <li>API rate limiting and request validation</li>
                          <li>Audit logging for all critical operations</li>
                        </ul>
                      </BlockStack>
                    </Card>
                  </div>
                )}
              </Tabs>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Card.Section>
              <Text as="h3" variant="headingMd">Quick Actions</Text>
              <div className="mt-4 space-y-2">
                <Button fullWidth icon={<RefreshCw className="w-4 h-4" />}>
                  Sync all stores
                </Button>
                <Button fullWidth>Export data</Button>
                <Button fullWidth>View audit log</Button>
              </div>
            </Card.Section>
          </Card>

          <Card>
            <Card.Section>
              <Text as="h3" variant="headingMd">System Status</Text>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Text as="span" variant="bodySm">Database</Text>
                  <Badge status={settings.supabase.hasCredentials ? "success" : "warning"}>
                    {settings.supabase.hasCredentials ? "Online" : "Not configured"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Text as="span" variant="bodySm">Shopify API</Text>
                  <Badge status={settings.shopify.hasCredentials ? "success" : "warning"}>
                    {settings.shopify.hasCredentials ? "Connected" : "Not configured"}
                  </Badge>
                </div>
                <div className="flex justify-between items-center">
                  <Text as="span" variant="bodySm">Last Sync</Text>
                  <Text as="span" variant="bodySm" color="subdued">
                    {new Date().toLocaleTimeString()}
                  </Text>
                </div>
              </div>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
