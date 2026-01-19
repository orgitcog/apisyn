import React from "react";
import {
  Page,
  Card,
  Layout,
  Button,
  ButtonGroup,
  Text,
  Badge,
  Link,
  ProgressBar,
} from "@shopify/polaris";
import { GitBranch, Box, Play, Pause, RefreshCw } from "lucide-react";

export function Orchestrations() {
  const orchestrations = [
    {
      id: "orch1",
      name: "Order Processing Pipeline",
      description: "End-to-end order processing workflow",
      status: "running",
      type: "workflow",
      steps: [
        "Order Validation",
        "Inventory Check",
        "Payment Processing",
        "Fulfillment",
        "Notification",
      ],
      metrics: {
        throughput: 125,
        success_rate: 98.5,
        avg_duration: 45,
      },
    },
    {
      id: "orch2",
      name: "Data Sync Pipeline",
      description: "Multi-store data synchronization",
      status: "paused",
      type: "pipeline",
      steps: [
        "Data Extraction",
        "Transformation",
        "Validation",
        "Loading",
        "Verification",
      ],
      metrics: {
        throughput: 250,
        success_rate: 99.1,
        avg_duration: 30,
      },
    },
    {
      id: "orch3",
      name: "Analytics Pipeline",
      description: "Real-time analytics processing",
      status: "running",
      type: "streaming",
      steps: [
        "Data Collection",
        "Processing",
        "Aggregation",
        "Storage",
        "Visualization",
      ],
      metrics: {
        throughput: 500,
        success_rate: 97.8,
        avg_duration: 15,
      },
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge status="success">Running</Badge>;
      case "paused":
        return <Badge status="attention">Paused</Badge>;
      case "failed":
        return <Badge status="critical">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "workflow":
        return <GitBranch className="w-6 h-6" />;
      case "pipeline":
        return <Box className="w-6 h-6" />;
      case "streaming":
        return <RefreshCw className="w-6 h-6" />;
      default:
        return <Box className="w-6 h-6" />;
    }
  };

  return (
    <Page
      title="Orchestrations"
      subtitle="Manage and monitor workflow orchestrations"
      primaryAction={{
        content: "Create Orchestration",
        onAction: () => {
          // TODO: Implement create orchestration functionality
          alert("Create Orchestration functionality not yet implemented");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {orchestrations.map((orch) => (
              <Card key={orch.id}>
                <Card.Section>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gray-100 mr-3">
                        {getTypeIcon(orch.type)}
                      </div>
                      <div>
                        <Text variant="headingMd" as="h3">
                          {orch.name}
                        </Text>
                        {getStatusBadge(orch.status)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{orch.description}</p>

                  <div className="space-y-4 mb-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Text variant="bodySm">Success Rate</Text>
                        <Text variant="bodySm">
                          {orch.metrics.success_rate}%
                        </Text>
                      </div>
                      <ProgressBar
                        progress={orch.metrics.success_rate}
                        size="small"
                        color="success"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <Text variant="bodySm">Throughput</Text>
                        <Text variant="bodySm">
                          {orch.metrics.throughput}/min
                        </Text>
                      </div>
                      <ProgressBar
                        progress={orch.metrics.throughput / 10}
                        size="small"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <Text variant="headingSm" as="h4" className="mb-2">
                      Steps
                    </Text>
                    <div className="flex flex-wrap gap-2">
                      {orch.steps.map((step, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 rounded text-sm flex items-center"
                        >
                          <span className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-xs mr-2">
                            {index + 1}
                          </span>
                          {step}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Link url={`/orchestrations/${orch.id}`}>View Details</Link>
                    <ButtonGroup>
                      {orch.status === "running" ? (
                        <Button icon={Pause}>Pause</Button>
                      ) : (
                        <Button icon={Play}>Start</Button>
                      )}
                      <Button primary>Monitor</Button>
                    </ButtonGroup>
                  </div>
                </Card.Section>
              </Card>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Orchestration Health">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Overall Success Rate</Text>
                  <p className="text-gray-600">Across all orchestrations</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">98.5%</Text>
                  <Text variant="bodySm" color="success">
                    Above target
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Active Workflows</Text>
                  <p className="text-gray-600">
                    Currently running orchestrations
                  </p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">12/15</Text>
                  <Text variant="bodySm" color="success">
                    Normal operation
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Processing Rate</Text>
                  <p className="text-gray-600">Tasks per minute</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">875</Text>
                  <Text variant="bodySm" color="attention">
                    High load
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
