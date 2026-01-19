import React, { useState } from "react";
import {
  Page,
  Card,
  Layout,
  Button,
  ButtonGroup,
  Text,
  TextField,
  Select,
  Banner,
  Modal,
  _Form,
  FormLayout,
  ChoiceList,
} from "@shopify/polaris";
import { useTestMode } from "../../context/TestModeContext";
import { Play, Settings, Save, RefreshCw } from "lucide-react";

export function Playground() {
  const { isTestMode, toggleTestMode, testStoreData, updateTestStoreData } =
    useTestMode();
  const [modalActive, setModalActive] = useState(false);
  const [storeConfig, setStoreConfig] = useState({
    name: testStoreData.name,
    domain: testStoreData.domain,
    plan: testStoreData.plan,
    products: "100",
    orders: "1000",
    customers: "500",
  });

  const handleSaveConfig = () => {
    updateTestStoreData({
      ...testStoreData,
      ...storeConfig,
    });
    setModalActive(false);
  };

  const handleConfigChange = (field: string) => (value: string) => {
    setStoreConfig((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Page
      title="Playground"
      subtitle="Test and design your store topology in a safe environment"
      primaryAction={{
        content: isTestMode ? "Go Live" : "Enter Test Mode",
        icon: Play,
        onAction: toggleTestMode,
      }}
    >
      <Layout>
        <Layout.Section>
          <Banner
            title={isTestMode ? "Test Mode Active" : "Live Mode Active"}
            status={isTestMode ? "warning" : "success"}
          >
            <p>
              {isTestMode
                ? "You are currently in test mode. All operations are simulated."
                : "You are in live mode. All operations affect real data."}
            </p>
          </Banner>

          <Card sectioned title="Store Configuration">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <Text variant="headingMd" as="h3">
                    {storeConfig.name}
                  </Text>
                  <Text variant="bodySm" as="p" color="subdued">
                    {storeConfig.domain}
                  </Text>
                </div>
                <ButtonGroup>
                  <Button icon={Settings} onClick={() => setModalActive(true)}>
                    Configure
                  </Button>
                  <Button
                    icon={RefreshCw}
                    onClick={() => {
                      // TODO: Implement reset configuration functionality
                      alert(
                        "Reset configuration functionality not yet implemented",
                      );
                    }}
                  >
                    Reset
                  </Button>
                </ButtonGroup>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Text variant="headingSm">Products</Text>
                  <Text variant="headingLg">{storeConfig.products}</Text>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Text variant="headingSm">Orders</Text>
                  <Text variant="headingLg">{storeConfig.orders}</Text>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <Text variant="headingSm">Customers</Text>
                  <Text variant="headingLg">{storeConfig.customers}</Text>
                </div>
              </div>
            </div>
          </Card>

          <Card sectioned title="Test Scenarios">
            <div className="space-y-4">
              <Button fullWidth>Run Load Test</Button>
              <Button fullWidth>Simulate Orders</Button>
              <Button fullWidth>Generate Test Data</Button>
            </div>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card sectioned title="Test Mode Settings">
            <FormLayout>
              <ChoiceList
                title="Data Generation"
                choices={[
                  { label: "Use realistic data", value: "realistic" },
                  { label: "Use random data", value: "random" },
                ]}
                selected={["realistic"]}
              />
              <ChoiceList
                title="Error Simulation"
                choices={[
                  { label: "Simulate API errors", value: "api" },
                  { label: "Simulate network latency", value: "network" },
                ]}
                selected={[]}
              />
            </FormLayout>
          </Card>

          <Card sectioned title="Quick Actions">
            <div className="space-y-2">
              <Button fullWidth>Export Test Data</Button>
              <Button fullWidth>Import Test Data</Button>
              <Button fullWidth destructive>
                Reset All Data
              </Button>
            </div>
          </Card>
        </Layout.Section>
      </Layout>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title="Configure Test Store"
        primaryAction={{
          content: "Save Configuration",
          icon: Save,
          onAction: handleSaveConfig,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <TextField
              label="Store Name"
              value={storeConfig.name}
              onChange={handleConfigChange("name")}
            />
            <TextField
              label="Domain"
              value={storeConfig.domain}
              onChange={handleConfigChange("domain")}
            />
            <Select
              label="Plan"
              options={[
                { label: "Basic", value: "basic" },
                { label: "Professional", value: "professional" },
                { label: "Enterprise", value: "enterprise" },
              ]}
              value={storeConfig.plan}
              onChange={handleConfigChange("plan")}
            />
            <TextField
              label="Number of Products"
              type="number"
              value={storeConfig.products}
              onChange={handleConfigChange("products")}
            />
            <TextField
              label="Number of Orders"
              type="number"
              value={storeConfig.orders}
              onChange={handleConfigChange("orders")}
            />
            <TextField
              label="Number of Customers"
              type="number"
              value={storeConfig.customers}
              onChange={handleConfigChange("customers")}
            />
          </FormLayout>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
