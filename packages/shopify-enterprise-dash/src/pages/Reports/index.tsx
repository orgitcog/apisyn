import React from "react";
import {
  Page,
  Card,
  Tabs,
  _Layout,
  Button,
  _Icon,
  EmptyState,
  _ButtonGroup,
  _Text,
} from "@shopify/polaris";
import {
  _Download,
  BarChart,
  ArrowRightLeft,
  Users,
  DollarSign,
  Box,
  Calendar,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Reports() {
  const [selected, setSelected] = React.useState(0);
  const navigate = useNavigate();

  const handleTabChange = (selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  };

  const tabs = [
    {
      id: "saved",
      content: "Saved Reports",
    },
    {
      id: "scheduled",
      content: "Scheduled Reports",
    },
    {
      id: "custom",
      content: "Custom Reports",
    },
  ];

  const reportTemplates = [
    {
      title: "Sales by Store",
      description: "View revenue performance across all stores",
      icon: <DollarSign className="w-5 h-5" />,
      category: "Sales",
    },
    {
      title: "Order Fulfillment",
      description: "Monitor order processing and shipping times",
      icon: <Box className="w-5 h-5" />,
      category: "Orders",
    },
    {
      title: "Customer Acquisition",
      description: "Track new vs returning customers",
      icon: <Users className="w-5 h-5" />,
      category: "Customers",
    },
    {
      title: "Inventory Levels",
      description: "Monitor stock levels across all stores",
      icon: <ArrowRightLeft className="w-5 h-5" />,
      category: "Inventory",
    },
    {
      title: "Monthly Performance",
      description: "Comprehensive monthly business overview",
      icon: <Calendar className="w-5 h-5" />,
      category: "Overview",
    },
    {
      title: "Product Performance",
      description: "Analyze top and underperforming products",
      icon: <BarChart className="w-5 h-5" />,
      category: "Products",
    },
  ];

  return (
    <Page
      title="Reports"
      primaryAction={{
        content: "Create Report",
        icon: Plus,
        onAction: () => navigate("/reports/builder"),
      }}
    >
      <Card>
        <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />

        {selected === 0 && (
          <EmptyState
            heading="No saved reports yet"
            action={{
              content: "Create Report",
              onAction: () => navigate("/reports/builder"),
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>Save frequently used reports for quick access.</p>
          </EmptyState>
        )}

        {selected === 1 && (
          <EmptyState
            heading="No scheduled reports"
            action={{
              content: "Create Schedule",
              onAction: () => navigate("/reports/builder"),
            }}
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              Set up reports to be automatically emailed to you and your team.
            </p>
          </EmptyState>
        )}

        {selected === 2 && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Report Templates</h3>
              <p className="text-gray-500">
                Start with one of our pre-built reports or create your own
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {reportTemplates.map((template, index) => (
                <Card key={index}>
                  <Card.Section>
                    <div className="flex items-start">
                      <div className="mr-4 p-2 bg-gray-100 rounded-md">
                        {template.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{template.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {template.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {template.category}
                          </span>
                          <Button
                            size="slim"
                            onClick={() => navigate("/reports/builder")}
                          >
                            Use template
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Section>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </Page>
  );
}
