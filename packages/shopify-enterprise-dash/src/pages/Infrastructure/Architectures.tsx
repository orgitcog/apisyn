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
} from "@shopify/polaris";
import { Box, GitBranch, Server, _Database, _Globe, Cloud } from "lucide-react";

export function Architectures() {
  const architectures = [
    {
      id: "arch1",
      name: "Microservices Architecture",
      description: "Distributed system with independent services",
      status: "active",
      type: "microservices",
      components: [
        "API Gateway",
        "Service Discovery",
        "Message Queue",
        "Data Services",
      ],
      technologies: ["Node.js", "Docker", "Kubernetes", "Redis"],
    },
    {
      id: "arch2",
      name: "Event-Driven Architecture",
      description: "Asynchronous event processing system",
      status: "development",
      type: "event-driven",
      components: ["Event Bus", "Event Processors", "Event Store", "Consumers"],
      technologies: ["Apache Kafka", "RabbitMQ", "Node.js", "MongoDB"],
    },
    {
      id: "arch3",
      name: "Serverless Architecture",
      description: "Cloud-native serverless functions",
      status: "planning",
      type: "serverless",
      components: ["Lambda Functions", "API Gateway", "DynamoDB", "S3"],
      technologies: ["AWS Lambda", "API Gateway", "DynamoDB", "S3"],
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge status="success">Active</Badge>;
      case "development":
        return <Badge status="attention">Development</Badge>;
      case "planning":
        return <Badge status="info">Planning</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getArchitectureIcon = (type: string) => {
    switch (type) {
      case "microservices":
        return <Server className="w-6 h-6" />;
      case "event-driven":
        return <GitBranch className="w-6 h-6" />;
      case "serverless":
        return <Cloud className="w-6 h-6" />;
      default:
        return <Box className="w-6 h-6" />;
    }
  };

  return (
    <Page
      title="System Architectures"
      subtitle="Manage and monitor system architectures"
      primaryAction={{
        content: "Add Architecture",
        onAction: () => console.log("Add architecture"),
      }}
    >
      <Layout>
        <Layout.Section>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {architectures.map((arch) => (
              <Card key={arch.id}>
                <Card.Section>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className="p-2 rounded-lg bg-gray-100 mr-3">
                        {getArchitectureIcon(arch.type)}
                      </div>
                      <div>
                        <Text variant="headingMd" as="h3">
                          {arch.name}
                        </Text>
                        {getStatusBadge(arch.status)}
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{arch.description}</p>

                  <div className="mb-4">
                    <Text variant="headingSm" as="h4" className="mb-2">
                      Components
                    </Text>
                    <div className="flex flex-wrap gap-2">
                      {arch.components.map((component, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 rounded text-sm"
                        >
                          {component}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <Text variant="headingSm" as="h4" className="mb-2">
                      Technologies
                    </Text>
                    <div className="flex flex-wrap gap-2">
                      {arch.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <Link url={`/architectures/${arch.id}`}>View Details</Link>
                    <ButtonGroup>
                      <Button>Edit</Button>
                      <Button primary>Deploy</Button>
                    </ButtonGroup>
                  </div>
                </Card.Section>
              </Card>
            ))}
          </div>
        </Layout.Section>

        <Layout.Section>
          <Card sectioned title="Architecture Health">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Service Health</Text>
                  <p className="text-gray-600">
                    Monitoring service availability
                  </p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">99.9%</Text>
                  <Text variant="bodySm" color="success">
                    All systems operational
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Deployment Status</Text>
                  <p className="text-gray-600">
                    Latest deployments across all architectures
                  </p>
                </div>
                <div className="text-right">
                  <Text variant="bodySm" color="success">
                    Last deployed 5 minutes ago
                  </Text>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Text variant="headingSm">Resource Usage</Text>
                  <p className="text-gray-600">Monitoring system resources</p>
                </div>
                <div className="text-right">
                  <Text variant="headingLg">65%</Text>
                  <Text variant="bodySm" color="success">
                    Within limits
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
