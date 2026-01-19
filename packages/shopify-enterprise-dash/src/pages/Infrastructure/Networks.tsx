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
import { Network, Wifi, Globe, Activity, _Server } from "lucide-react";
import { useNetworks, useNetworkMetrics } from "../../hooks/useNetticaData";

export function Networks() {
  const { data: networks, _isLoading, error } = useNetworks();
  const { data: _metrics } = useNetworkMetrics("net1");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge status="success">Active</Badge>;
      case "inactive":
        return <Badge status="critical">Inactive</Badge>;
      case "pending":
        return <Badge status="attention">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getNetworkIcon = (type: string) => {
    switch (type) {
      case "mesh":
        return <Network className="w-6 h-6" />;
      case "hub-spoke":
        return <Wifi className="w-6 h-6" />;
      case "point-to-point":
        return <Activity className="w-6 h-6" />;
      default:
        return <Globe className="w-6 h-6" />;
    }
  };

  if (error) {
    return (
      <Page title="Network Management">
        <Card>
          <Card.Section>
            <div className="text-center py-6">
              <Text variant="headingMd" as="h2" color="critical">
                Error loading networks
              </Text>
              <p className="mt-2 text-gray-600">
                There was a problem loading the network data. Please try again
                later.
              </p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                Retry
              </Button>
            </div>
          </Card.Section>
        </Card>
      </Page>
    );
  }

  return (
    <Page
      title="Network Management"
      subtitle="Monitor and manage network infrastructure"
      primaryAction={{
        content: "Add Network",
        onAction: () => {
          // TODO: Implement add network functionality
          alert("Add Network functionality not yet implemented");
        },
      }}
    >
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {networks?.map((network) => (
              <Card key={network.id}>
                <Card.Section>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gray-100 mr-3">
                        {getNetworkIcon(network.type)}
                      </div>
                      <div>
                        <Text variant="headingMd" as="h3">
                          {network.name}
                        </Text>
                        {getStatusBadge(network.status)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{network.description}</p>

                  <div className="space-y-4 mb-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Text variant="bodySm">Nodes</Text>
                        <Text variant="bodySm">{network.nodes}</Text>
                      </div>
                      <ProgressBar
                        progress={Math.min(
                          Math.max((network.nodes / 20) * 100, 0),
                          100,
                        )}
                        size="small"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <Text variant="bodySm">Bandwidth Usage</Text>
                        <Text variant="bodySm">
                          {network.bandwidth_usage.toFixed(1)} Mbps
                        </Text>
                      </div>
                      <ProgressBar
                        progress={Math.min(
                          Math.max((network.bandwidth_usage / 1000) * 100, 0),
                          100,
                        )}
                        size="small"
                        color="success"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
                      Region: {network.region}
                    </span>
                    <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-sm">
                      Type: {network.type}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Link url={`/networks/${network.id}`}>View Details</Link>
                    <ButtonGroup>
                      <Button>Configure</Button>
                      <Button primary>Monitor</Button>
                    </ButtonGroup>
                  </div>
                </Card.Section>
              </Card>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Network Health">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Overall Health</Text>
                  <p className="text-gray-600">Network infrastructure status</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">98.5%</Text>
                  <Text variant="bodySm" color="success">
                    Healthy
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Active Connections</Text>
                  <p className="text-gray-600">Current network connections</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">1,245</Text>
                  <Text variant="bodySm" color="success">
                    Normal load
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Bandwidth Usage</Text>
                  <p className="text-gray-600">Network throughput</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">4.2 GB/s</Text>
                  <Text variant="bodySm" color="attention">
                    High usage
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
