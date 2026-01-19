import React from "react";
import { Page, EmptyState, Card, Button } from "@shopify/polaris";

export function TerritoryMap() {
  return (
    <Page
      title="Territory Map"
      subtitle="Visualize and manage sales territories"
    >
      <Card>
        <Card.Section>
          <EmptyState
            heading="Territory Map Feature Coming Soon"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              This feature is currently under development. It will provide an
              interactive map to visualize your sales territories, assigned
              representatives, and store locations.
            </p>
            <div className="mt-4">
              <Button primary>Request Early Access</Button>
            </div>
          </EmptyState>
        </Card.Section>
      </Card>
    </Page>
  );
}
