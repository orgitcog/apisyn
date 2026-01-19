import React, { useState, useRef, useEffect } from "react";
import {
  Page,
  Card,
  Layout,
  Button,
  ButtonGroup,
  Text,
  Badge,
  ProgressBar,
  Select,
  TextField,
} from "@shopify/polaris";
import { Play, Pause, RotateCcw, Settings, BarChart } from "lucide-react";

export function Simulations() {
  const [selectedSimulation, setSelectedSimulation] = useState("load-test");
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(30);
  const [virtualUsers, setVirtualUsers] = useState(1000);
  const [rps, setRps] = useState(100);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup interval on component unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Input validation functions
  const validateAndSetDuration = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1440) {
      // Max 24 hours
      setDuration(numValue);
    }
  };

  const validateAndSetVirtualUsers = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 100000) {
      // Max 100k users
      setVirtualUsers(numValue);
    }
  };

  const validateAndSetRps = (value: string) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 10000) {
      // Max 10k RPS
      setRps(numValue);
    }
  };

  const simulations = [
    {
      id: "load-test",
      name: "Load Testing",
      description: "Simulate high traffic scenarios",
      status: "ready",
      type: "performance",
      metrics: {
        users: 1000,
        duration: 30,
        rps: 100,
      },
    },
    {
      id: "failover",
      name: "Failover Testing",
      description: "Test system resilience and recovery",
      status: "ready",
      type: "reliability",
      metrics: {
        nodes: 5,
        scenarios: 3,
        duration: 15,
      },
    },
    {
      id: "scaling",
      name: "Auto-scaling Test",
      description: "Verify automatic resource scaling",
      status: "running",
      type: "performance",
      metrics: {
        min_nodes: 2,
        max_nodes: 10,
        duration: 45,
      },
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ready":
        return <Badge status="success">Ready</Badge>;
      case "running":
        return <Badge status="attention">Running</Badge>;
      case "failed":
        return <Badge status="critical">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleStart = () => {
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    setIsRunning(true);
    setProgress(0);

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Simulate progress
    intervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsRunning(false);
          return 100;
        }
        return prev + 1;
      });
    }, 100);
  };

  const handleStop = () => {
    // Clear the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    setProgress(0);

    // Clear the interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <Page
      title="Simulations"
      subtitle="Run and monitor system simulations"
      primaryAction={{
        content: isRunning ? "Stop Simulation" : "Start Simulation",
        icon: isRunning ? Pause : Play,
        onAction: isRunning ? handleStop : handleStart,
        disabled: !selectedSimulation,
      }}
    >
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {simulations.map((sim) => (
              <Card key={sim.id}>
                <Card.Section>
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <Text variant="headingMd" as="h3">
                        {sim.name}
                      </Text>
                      {getStatusBadge(sim.status)}
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{sim.description}</p>

                  <div className="space-y-4 mb-4">
                    {Object.entries(sim.metrics).map(([key, value]) => (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <Text variant="bodySm">
                            {key.replace(/_/g, " ").toUpperCase()}
                          </Text>
                          <Text variant="bodySm">{value}</Text>
                        </div>
                        <ProgressBar
                          progress={Math.min(Math.max(value / 10, 0), 100)}
                          size="small"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <ButtonGroup>
                      <Button
                        icon={Settings}
                        onClick={() => {
                          // TODO: Implement configure functionality
                          alert(`Configure simulation: ${sim.id}`);
                        }}
                      >
                        Configure
                      </Button>
                      <Button
                        icon={BarChart}
                        onClick={() => {
                          // TODO: Implement results view functionality
                          alert(`View results for: ${sim.id}`);
                        }}
                      >
                        Results
                      </Button>
                    </ButtonGroup>
                  </div>
                </Card.Section>
              </Card>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card title="Simulation Control">
            <Card.Section>
              <div className="space-y-4">
                <Select
                  label="Select Simulation"
                  options={simulations.map((sim) => ({
                    label: sim.name,
                    value: sim.id,
                  }))}
                  value={selectedSimulation}
                  onChange={setSelectedSimulation}
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <TextField
                    label="Duration (minutes)"
                    type="number"
                    value={duration.toString()}
                    onChange={validateAndSetDuration}
                    min={1}
                    max={1440}
                    helpText="Maximum 24 hours (1440 minutes)"
                  />
                  <TextField
                    label="Virtual Users"
                    type="number"
                    value={virtualUsers.toString()}
                    onChange={validateAndSetVirtualUsers}
                    min={1}
                    max={100000}
                    helpText="Maximum 100,000 users"
                  />
                  <TextField
                    label="Requests per Second"
                    type="number"
                    value={rps.toString()}
                    onChange={validateAndSetRps}
                    min={1}
                    max={10000}
                    helpText="Maximum 10,000 RPS"
                  />
                </div>

                {isRunning && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <Text variant="bodySm">Simulation Progress</Text>
                      <Text variant="bodySm">{progress}%</Text>
                    </div>
                    <ProgressBar
                      progress={progress}
                      size="medium"
                      color="primary"
                    />
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <ButtonGroup>
                    <Button
                      icon={RotateCcw}
                      onClick={() => {
                        // Clear the interval if running
                        if (intervalRef.current) {
                          clearInterval(intervalRef.current);
                          intervalRef.current = null;
                        }
                        setProgress(0);
                        setIsRunning(false);
                        // Reset input values to defaults
                        setDuration(30);
                        setVirtualUsers(1000);
                        setRps(100);
                      }}
                    >
                      Reset
                    </Button>
                    <Button
                      icon={Settings}
                      onClick={() => {
                        // TODO: Implement settings functionality
                        alert("Configure simulation settings");
                      }}
                    >
                      Settings
                    </Button>
                  </ButtonGroup>
                  <Button
                    primary
                    icon={isRunning ? Pause : Play}
                    onClick={isRunning ? handleStop : handleStart}
                  >
                    {isRunning ? "Stop Simulation" : "Start Simulation"}
                  </Button>
                </div>
              </div>
            </Card.Section>
          </Card>

          <Card sectioned title="Real-time Metrics">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Response Time</Text>
                  <p className="text-gray-600">Average response time</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">245ms</Text>
                  <Text variant="bodySm" color="success">
                    Within SLA
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Error Rate</Text>
                  <p className="text-gray-600">Request failures</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">0.1%</Text>
                  <Text variant="bodySm" color="success">
                    Below threshold
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Throughput</Text>
                  <p className="text-gray-600">Requests per second</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">892</Text>
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
