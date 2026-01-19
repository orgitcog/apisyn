import React, { useState } from "react";
import {
  Page,
  _Layout,
  Card,
  FormLayout,
  TextField,
  Select,
  SettingToggle,
  TextContainer,
  Button,
  Tabs,
} from "@shopify/polaris";

export function Settings() {
  const [selected, setSelected] = useState(0);
  const [userEmail, setUserEmail] = useState("admin@example.com");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [currency, setCurrency] = useState("USD");
  const [timezone, setTimezone] = useState("America/New_York");
  const [apiKey, _setApiKey] = useState("••••••••••••••••");
  const [showRealKey, setShowRealKey] = useState(false);

  const handleTabChange = (selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  };

  const tabs = [
    {
      id: "general",
      content: "General",
    },
    {
      id: "account",
      content: "Account",
    },
    {
      id: "notifications",
      content: "Notifications",
    },
    {
      id: "api",
      content: "API Access",
    },
    {
      id: "billing",
      content: "Billing & Invoices",
    },
  ];

  const renderTabContent = () => {
    switch (selected) {
      case 0: // General
        return (
          <Card sectioned>
            <FormLayout>
              <Select
                label="Currency"
                options={[
                  { label: "USD - US Dollar", value: "USD" },
                  { label: "EUR - Euro", value: "EUR" },
                  { label: "GBP - British Pound", value: "GBP" },
                  { label: "CAD - Canadian Dollar", value: "CAD" },
                  { label: "AUD - Australian Dollar", value: "AUD" },
                ]}
                value={currency}
                onChange={setCurrency}
              />
              <Select
                label="Timezone"
                options={[
                  {
                    label: "Eastern Time (US & Canada)",
                    value: "America/New_York",
                  },
                  {
                    label: "Central Time (US & Canada)",
                    value: "America/Chicago",
                  },
                  {
                    label: "Pacific Time (US & Canada)",
                    value: "America/Los_Angeles",
                  },
                  { label: "UTC", value: "UTC" },
                  { label: "London", value: "Europe/London" },
                ]}
                value={timezone}
                onChange={setTimezone}
              />
              <SettingToggle
                action={{
                  content: "Customize theme",
                  onAction: () => console.log("Theme customization clicked"),
                }}
                enabled={true}
              >
                <div>
                  <TextContainer>
                    <p>Dashboard theme</p>
                    <p>
                      <span className="text-gray-500">Current: </span>
                      <span className="font-medium">Default</span>
                    </p>
                  </TextContainer>
                </div>
              </SettingToggle>
            </FormLayout>
          </Card>
        );
      case 1: // Account
        return (
          <Card sectioned>
            <FormLayout>
              <TextField
                label="Email"
                value={userEmail}
                onChange={setUserEmail}
                autoComplete="email"
              />
              <TextField label="Name" value="Admin User" onChange={() => {}} />
              <TextField
                label="Role"
                value="Enterprise Administrator"
                disabled
              />
              <div className="mt-4">
                <Button primary>Update account information</Button>
              </div>
              <div className="mt-6 pt-6 border-t">
                <Button destructive>Delete account</Button>
              </div>
            </FormLayout>
          </Card>
        );
      case 2: // Notifications
        return (
          <Card sectioned>
            <SettingToggle
              action={{
                content: notificationsEnabled ? "Disable" : "Enable",
                onAction: () => setNotificationsEnabled(!notificationsEnabled),
              }}
              enabled={notificationsEnabled}
            >
              <div>
                <TextContainer>
                  <p>Email notifications</p>
                  <p className="text-gray-500">
                    Receive email notifications for important events, reports,
                    and alerts
                  </p>
                </TextContainer>
              </div>
            </SettingToggle>

            <div className="mt-6">
              <p className="font-medium mb-4">Notification preferences</p>
              {[
                "Store updates",
                "User activity",
                "System alerts",
                "Reports",
                "Billing",
              ].map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-t"
                >
                  <div>
                    <p>{item}</p>
                    <p className="text-sm text-gray-500">
                      Receive notifications about {item.toLowerCase()}
                    </p>
                  </div>
                  <SettingToggle
                    action={{
                      content: "Toggle",
                      onAction: () => {},
                    }}
                    enabled={true}
                  />
                </div>
              ))}
            </div>
          </Card>
        );
      case 3: // API Access
        return (
          <Card sectioned>
            <FormLayout>
              <div className="mb-4">
                <p className="font-medium">API Key</p>
                <p className="text-sm text-gray-500 mb-4">
                  Use this key to authenticate API requests to the Shopify
                  Enterprise API
                </p>
                <div className="flex items-center">
                  <TextField
                    value={showRealKey ? "api_key_12345abcdef67890" : apiKey}
                    onChange={() => {}}
                    readOnly
                    connectedRight={
                      <Button onClick={() => setShowRealKey(!showRealKey)}>
                        {showRealKey ? "Hide" : "Show"}
                      </Button>
                    }
                  />
                </div>
                <div className="mt-2">
                  <Button>Regenerate API Key</Button>
                </div>
              </div>

              <div className="mt-6">
                <p className="font-medium mb-2">API Usage</p>
                <div className="bg-gray-100 p-4 rounded">
                  <div className="flex justify-between mb-1">
                    <span>Rate limit</span>
                    <span>100 requests/minute</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 w-1/4"></div>
                  </div>
                  <div className="flex justify-between mt-1 text-sm">
                    <span>25/100 used</span>
                    <span className="text-green-600">75% available</span>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Button primary>View API documentation</Button>
              </div>
            </FormLayout>
          </Card>
        );
      case 4: // Billing & Invoices
        return (
          <Card sectioned>
            <p className="font-medium mb-4">Current Plan</p>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md mb-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">Enterprise Plan</h3>
                  <p className="text-gray-500">
                    Unlimited stores, advanced analytics, premium support
                  </p>
                </div>
                <Button primary>Upgrade</Button>
              </div>
            </div>

            <p className="font-medium mb-4">Payment Method</p>
            <div className="flex items-center mb-6">
              <div className="bg-gray-100 p-2 rounded mr-3">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="2"
                    y="5"
                    width="20"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="M2 10H22" stroke="currentColor" strokeWidth="2" />
                </svg>
              </div>
              <div>
                <p>Visa ending in 4242</p>
                <p>Expires 05/2026</p>
                <p className="text-sm text-gray-500">Default payment method</p>
              </div>
              <div className="ml-auto">
                <Button plain>Edit</Button>
              </div>
            </div>

            <p className="font-medium mb-4">Billing History</p>
            <div className="border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Invoice
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[
                    {
                      date: "2025-03-01",
                      desc: "Enterprise Plan - Monthly",
                      amount: "$299.00",
                      status: "Paid",
                    },
                    {
                      date: "2025-02-01",
                      desc: "Enterprise Plan - Monthly",
                      amount: "$299.00",
                      status: "Paid",
                    },
                    {
                      date: "2025-01-01",
                      desc: "Enterprise Plan - Monthly",
                      amount: "$299.00",
                      status: "Paid",
                    },
                  ].map((invoice, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {invoice.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {invoice.desc}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {invoice.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        {invoice.status}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <Button plain>Download</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <Page title="Settings">
      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
        <div className="p-4">{renderTabContent()}</div>
      </Card>
    </Page>
  );
}
