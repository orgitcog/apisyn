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
} from "@shopify/polaris";
import { _Braces, Play, Download, Copy, RefreshCw } from "lucide-react";

export function MermaidAI() {
  const [diagram, setDiagram] = useState("");
  const [diagramType, setDiagramType] = useState("flowchart");
  const [generatedCode, setGeneratedCode] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = () => {
    setIsGenerating(true);
    setError(null);

    // Simulate AI generation
    setTimeout(() => {
      const mockDiagram = `graph TD
    A[Start] --> B{Is it working?}
    B -- Yes --> C[Great!]
    B -- No --> D[Debug]
    D --> B
    C --> E[Deploy]`;

      setGeneratedCode(mockDiagram);
      setIsGenerating(false);
    }, 1500);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCode);
  };

  const handleDownload = () => {
    const blob = new Blob([generatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "diagram.mmd";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Page
      title="Mermaid AI"
      subtitle="Generate and visualize diagrams using AI"
      primaryAction={{
        content: "Generate Diagram",
        icon: Play,
        onAction: handleGenerate,
        loading: isGenerating,
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <div className="mb-4">
                <Select
                  label="Diagram Type"
                  options={[
                    { label: "Flowchart", value: "flowchart" },
                    { label: "Sequence Diagram", value: "sequence" },
                    { label: "Class Diagram", value: "class" },
                    { label: "Entity Relationship", value: "er" },
                    { label: "State Diagram", value: "state" },
                    { label: "Gantt Chart", value: "gantt" },
                  ]}
                  value={diagramType}
                  onChange={setDiagramType}
                />
              </div>

              <TextField
                label="Describe your diagram"
                value={diagram}
                onChange={setDiagram}
                multiline={4}
                placeholder="Describe what you want to visualize, e.g., 'Create a flowchart showing the user authentication process'"
                autoComplete="off"
              />
            </Card.Section>

            {error && (
              <Card.Section>
                <Banner status="critical" onDismiss={() => setError(null)}>
                  <p>{error}</p>
                </Banner>
              </Card.Section>
            )}

            {generatedCode && (
              <Card.Section>
                <div className="mb-4 flex justify-between items-center">
                  <Text variant="headingMd" as="h3">
                    Generated Diagram
                  </Text>
                  <ButtonGroup>
                    <Button icon={Copy} onClick={handleCopy}>
                      Copy
                    </Button>
                    <Button icon={Download} onClick={handleDownload}>
                      Download
                    </Button>
                    <Button
                      icon={RefreshCw}
                      onClick={handleGenerate}
                      loading={isGenerating}
                    >
                      Regenerate
                    </Button>
                  </ButtonGroup>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="whitespace-pre-wrap font-mono text-sm">
                    {generatedCode}
                  </pre>
                </div>

                <div className="mt-4">
                  <Text variant="headingMd" as="h3" className="mb-2">
                    Preview
                  </Text>
                  <div className="bg-white border rounded-lg p-4">
                    {/* In a real implementation, render the Mermaid diagram here */}
                    <div className="text-center text-gray-500">
                      Diagram preview would be rendered here
                    </div>
                  </div>
                </div>
              </Card.Section>
            )}
          </Card>
        </Layout.Section>

        <Layout.Section secondary>
          <Card>
            <Card.Section title="Templates">
              <div className="space-y-2">
                {[
                  "User Authentication Flow",
                  "API Architecture",
                  "Database Schema",
                  "CI/CD Pipeline",
                  "Microservices Communication",
                ].map((template, index) => (
                  <Button
                    key={index}
                    onClick={() =>
                      setDiagram(
                        `Generate a diagram for ${template.toLowerCase()}`,
                      )
                    }
                    fullWidth
                    textAlign="left"
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </Card.Section>

            <Card.Section title="Tips">
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Be specific about the relationships between components</li>
                <li>Mention any specific styling preferences</li>
                <li>Include error handling and edge cases</li>
                <li>Specify diagram direction (TD, LR, etc.)</li>
              </ul>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
