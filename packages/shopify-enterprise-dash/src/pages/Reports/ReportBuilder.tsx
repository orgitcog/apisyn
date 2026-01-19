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
  _DropZone,
  Stack,
  _Banner,
} from "@shopify/polaris";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  BarChart,
  _LineChart,
  _PieChart,
  Download,
  Save,
  Play,
  Settings,
} from "lucide-react";

interface ReportComponent {
  id: string;
  type: "chart" | "table" | "metric" | "filter";
  title: string;
  config: Record<string, any>;
}

export function ReportBuilder() {
  const [reportName, setReportName] = useState("New Report");
  const [components, setComponents] = useState<ReportComponent[]>([]);
  const [selectedDataSource, setSelectedDataSource] = useState("orders");
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setComponents((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addComponent = (type: ReportComponent["type"]) => {
    const newComponent: ReportComponent = {
      id: `component-${Date.now()}`,
      type,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      config: {},
    };
    setComponents([...components, newComponent]);
  };

  const renderComponentPreview = (component: ReportComponent) => {
    switch (component.type) {
      case "chart":
        return (
          <div className="bg-gray-50 p-4 rounded-lg min-h-[200px] flex items-center justify-center">
            <BarChart className="w-8 h-8 text-gray-400" />
            <Text variant="bodySm" as="p" color="subdued" className="ml-2">
              Chart Preview
            </Text>
          </div>
        );
      case "table":
        return (
          <div className="bg-gray-50 p-4 rounded-lg min-h-[200px]">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Column 1
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                    Column 2
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-4 py-2 text-sm text-gray-500">Data</td>
                  <td className="px-4 py-2 text-sm text-gray-500">Data</td>
                </tr>
              </tbody>
            </table>
          </div>
        );
      case "metric":
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Text variant="headingLg" as="p">
              $12,345
            </Text>
            <Text variant="bodySm" as="p" color="subdued">
              Sample Metric
            </Text>
          </div>
        );
      case "filter":
        return (
          <div className="bg-gray-50 p-4 rounded-lg">
            <Select
              label="Filter"
              options={[
                { label: "All", value: "all" },
                { label: "Last 7 days", value: "7d" },
                { label: "Last 30 days", value: "30d" },
              ]}
              value="all"
              onChange={() => {}}
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Page
      title="Report Builder"
      subtitle="Create custom reports by dragging and dropping components"
      primaryAction={{
        content: isPreviewMode ? "Edit Report" : "Preview Report",
        icon: isPreviewMode ? Settings : Play,
        onAction: () => setIsPreviewMode(!isPreviewMode),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <div className="flex justify-between items-center mb-6">
                <TextField
                  label="Report Name"
                  value={reportName}
                  onChange={setReportName}
                  autoComplete="off"
                />
                <ButtonGroup>
                  <Button icon={Save}>Save Draft</Button>
                  <Button icon={Download} primary>
                    Export
                  </Button>
                </ButtonGroup>
              </div>

              <div className="mb-6">
                <Select
                  label="Data Source"
                  options={[
                    { label: "Orders", value: "orders" },
                    { label: "Products", value: "products" },
                    { label: "Customers", value: "customers" },
                    { label: "Inventory", value: "inventory" },
                  ]}
                  value={selectedDataSource}
                  onChange={setSelectedDataSource}
                />
              </div>

              {!isPreviewMode && (
                <div className="mb-6">
                  <Text variant="headingSm" as="h3" className="mb-4">
                    Add Components
                  </Text>
                  <ButtonGroup>
                    <Button
                      onClick={() => addComponent("chart")}
                      icon={BarChart}
                    >
                      Add Chart
                    </Button>
                    <Button onClick={() => addComponent("table")}>
                      Add Table
                    </Button>
                    <Button onClick={() => addComponent("metric")}>
                      Add Metric
                    </Button>
                    <Button onClick={() => addComponent("filter")}>
                      Add Filter
                    </Button>
                  </ButtonGroup>
                </div>
              )}

              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={components}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-4">
                    {components.map((component) => (
                      <Card key={component.id}>
                        <Card.Section>
                          <div className="flex justify-between items-center mb-4">
                            <TextField
                              label="Component Title"
                              value={component.title}
                              onChange={(value) => {
                                const updatedComponents = components.map((c) =>
                                  c.id === component.id
                                    ? { ...c, title: value }
                                    : c,
                                );
                                setComponents(updatedComponents);
                              }}
                              autoComplete="off"
                            />
                            {!isPreviewMode && (
                              <Button
                                plain
                                destructive
                                onClick={() => {
                                  setComponents(
                                    components.filter(
                                      (c) => c.id !== component.id,
                                    ),
                                  );
                                }}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                          {renderComponentPreview(component)}
                        </Card.Section>
                      </Card>
                    ))}
                  </div>
                </SortableContext>
              </DndContext>

              {components.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-12 text-center">
                  <Text variant="headingMd" as="p" color="subdued">
                    Drag and drop components here to build your report
                  </Text>
                  <Text
                    variant="bodySm"
                    as="p"
                    color="subdued"
                    className="mt-2"
                  >
                    Start by adding a chart, table, or metric from the toolbar
                    above
                  </Text>
                </div>
              )}
            </Card.Section>
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card title="Report Settings">
            <Card.Section>
              <Stack vertical spacing="tight">
                <Select
                  label="Update Frequency"
                  options={[
                    { label: "Real-time", value: "realtime" },
                    { label: "Hourly", value: "hourly" },
                    { label: "Daily", value: "daily" },
                    { label: "Weekly", value: "weekly" },
                  ]}
                  value="realtime"
                  onChange={() => {}}
                />
                <Select
                  label="Export Format"
                  options={[
                    { label: "PDF", value: "pdf" },
                    { label: "Excel", value: "excel" },
                    { label: "CSV", value: "csv" },
                  ]}
                  value="pdf"
                  onChange={() => {}}
                />
                <TextField
                  label="Report Description"
                  multiline={3}
                  placeholder="Enter a description for this report..."
                />
              </Stack>
            </Card.Section>

            <Card.Section title="Sharing">
              <Stack vertical spacing="tight">
                <Select
                  label="Visibility"
                  options={[
                    { label: "Private", value: "private" },
                    { label: "Team", value: "team" },
                    { label: "Organization", value: "org" },
                  ]}
                  value="private"
                  onChange={() => {}}
                />
                <TextField
                  label="Share with Email"
                  type="email"
                  placeholder="Enter email address..."
                />
                <Button fullWidth>Add Recipient</Button>
              </Stack>
            </Card.Section>

            <Card.Section title="Automation">
              <Stack vertical spacing="tight">
                <Select
                  label="Schedule"
                  options={[
                    { label: "Never", value: "never" },
                    { label: "Daily", value: "daily" },
                    { label: "Weekly", value: "weekly" },
                    { label: "Monthly", value: "monthly" },
                  ]}
                  value="never"
                  onChange={() => {}}
                />
                <TextField
                  label="Recipients"
                  placeholder="Enter email addresses..."
                  helpText="Separate multiple emails with commas"
                />
              </Stack>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
