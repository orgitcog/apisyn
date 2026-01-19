import React, { useState } from "react";
import {
  Page,
  Card,
  Layout,
  Button,
  ButtonGroup,
  Text,
  Badge,
  TextField,
  Select,
  _Banner,
} from "@shopify/polaris";
import {
  Code2,
  Play,
  Terminal,
  Package,
  _RefreshCw,
  Database,
} from "lucide-react";

export function Webcontainers() {
  const [selectedTemplate, setSelectedTemplate] = useState("node");
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const containers = [
    {
      id: "container1",
      name: "Development Environment",
      template: "node",
      status: "running",
      resources: {
        cpu: 25,
        memory: 512,
        storage: 1024,
      },
    },
    {
      id: "container2",
      name: "Test Environment",
      template: "python",
      status: "stopped",
      resources: {
        cpu: 50,
        memory: 1024,
        storage: 2048,
      },
    },
    {
      id: "container3",
      name: "Database Container",
      template: "postgres",
      status: "running",
      resources: {
        cpu: 75,
        memory: 2048,
        storage: 5120,
      },
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "running":
        return <Badge status="success">Running</Badge>;
      case "stopped":
        return <Badge status="critical">Stopped</Badge>;
      case "starting":
        return <Badge status="attention">Starting</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStart = () => {
    setIsRunning(true);
    setLogs((prev) => [
      ...prev,
      "> Starting container...",
      "> Installing dependencies...",
    ]);

    // Simulate container startup
    setTimeout(() => {
      setLogs((prev) => [...prev, "> Container started successfully!"]);
    }, 2000);
  };

  const handleStop = () => {
    setIsRunning(false);
    setLogs((prev) => [
      ...prev,
      "> Stopping container...",
      "> Container stopped.",
    ]);
  };

  return (
    <Page
      title="Webcontainers"
      subtitle="Manage development environments in the browser"
      primaryAction={{
        content: "Create Container",
        icon: Code2,
        onAction: () => console.log("Create container"),
      }}
    >
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {containers.map((container) => (
              <Card key={container.id}>
                <Card.Section>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Text variant="headingMd" as="h3">
                        {container.name}
                      </Text>
                      {getStatusBadge(container.status)}
                    </div>
                    <div className="p-2 rounded-lg bg-gray-100">
                      <Code2 className="w-6 h-6" />
                    </div>
                  </div>

                  <div className="space-y-4 mb-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <Text variant="bodySm">CPU Usage</Text>
                        <Text variant="bodySm">{container.resources.cpu}%</Text>
                      </div>
                      <ProgressBar
                        progress={container.resources.cpu}
                        size="small"
                        color={
                          container.resources.cpu > 80 ? "critical" : "success"
                        }
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <Text variant="bodySm">Memory</Text>
                        <Text variant="bodySm">
                          {container.resources.memory}MB
                        </Text>
                      </div>
                      <ProgressBar
                        progress={Math.min(
                          Math.max(container.resources.memory / 40, 0),
                          100,
                        )}
                        size="small"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <Text variant="bodySm">Storage</Text>
                        <Text variant="bodySm">
                          {container.resources.storage}MB
                        </Text>
                      </div>
                      <ProgressBar
                        progress={Math.min(
                          Math.max(container.resources.storage / 100, 0),
                          100,
                        )}
                        size="small"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Badge>{container.template}</Badge>
                    <ButtonGroup>
                      <Button
                        icon={Terminal}
                        onClick={() => {
                          // TODO: Implement terminal functionality
                          alert(`Open terminal for container: ${container.id}`);
                        }}
                      >
                        Terminal
                      </Button>
                      <Button
                        icon={container.status === "running" ? Pause : Play}
                        onClick={() => {
                          // TODO: Implement container toggle functionality
                          alert(
                            `Toggle container ${container.id}: ${container.status === "running" ? "Stop" : "Start"}`,
                          );
                        }}
                        primary
                      >
                        {container.status === "running" ? "Stop" : "Start"}
                      </Button>
                    </ButtonGroup>
                  </div>
                </Card.Section>
              </Card>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card title="New Container">
            <Card.Section>
              <div className="space-y-4">
                <Select
                  label="Template"
                  options={[
                    { label: "Node.js", value: "node" },
                    { label: "Python", value: "python" },
                    { label: "PostgreSQL", value: "postgres" },
                    { label: "Redis", value: "redis" },
                    { label: "MongoDB", value: "mongodb" },
                  ]}
                  value={selectedTemplate}
                  onChange={setSelectedTemplate}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="CPU Cores"
                    type="number"
                    value="1"
                    onChange={() => {}}
                    suffix="cores"
                  />
                  <TextField
                    label="Memory"
                    type="number"
                    value="512"
                    onChange={() => {}}
                    suffix="MB"
                  />
                  <TextField
                    label="Storage"
                    type="number"
                    value="1024"
                    onChange={() => {}}
                    suffix="MB"
                  />
                </div>

                <div className="flex justify-between items-center">
                  <ButtonGroup>
                    <Button
                      icon={Package}
                      onClick={() => console.log("Configure packages")}
                    >
                      Packages
                    </Button>
                    <Button
                      icon={Database}
                      onClick={() => console.log("Configure volumes")}
                    >
                      Volumes
                    </Button>
                  </ButtonGroup>
                  <Button
                    primary
                    icon={isRunning ? Pause : Play}
                    onClick={isRunning ? handleStop : handleStart}
                  >
                    {isRunning ? "Stop Container" : "Start Container"}
                  </Button>
                </div>
              </div>
            </Card.Section>

            <Card.Section title="Container Logs">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-48 overflow-y-auto">
                {logs.map((log, index) => (
                  <div key={index} className="mb-1">
                    {log}
                  </div>
                ))}
                {isRunning && (
                  <div className="flex items-center text-green-400">
                    <span className="mr-2">●</span>
                    Container is running
                  </div>
                )}
              </div>
            </Card.Section>
          </Card>

          <Card sectioned title="Resource Usage">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Total Containers</Text>
                  <p className="text-gray-600">Active instances</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">3/5</Text>
                  <Text variant="bodySm" color="success">
                    Within limit
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">System Load</Text>
                  <p className="text-gray-600">Average CPU usage</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">45%</Text>
                  <Text variant="bodySm" color="success">
                    Normal
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Memory Usage</Text>
                  <p className="text-gray-600">Available memory</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">3.5GB</Text>
                  <Text variant="bodySm" color="attention">
                    Moderate usage
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
