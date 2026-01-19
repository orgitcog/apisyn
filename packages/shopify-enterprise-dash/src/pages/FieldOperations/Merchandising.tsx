import React from "react";
import { Page, EmptyState, Card, Button } from "@shopify/polaris";

export function Merchandising() {
  return (
    <Page
      title="Merchandising"
      subtitle="Manage product merchandising across retail locations"
    >
      <Card>
        <Card.Section>
          <EmptyState
            heading="Merchandising Feature Coming Soon"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              This feature is currently under development. It will allow you to
              manage product merchandising, planograms, and retail compliance
              across your locations.
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
