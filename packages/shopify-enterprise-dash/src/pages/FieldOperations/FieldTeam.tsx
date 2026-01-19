import React from "react";
import { Page, EmptyState, Card, Button } from "@shopify/polaris";

export function FieldTeam() {
  return (
    <Page
      title="Field Team Management"
      subtitle="Manage your field representatives and teams"
    >
      <Card>
        <Card.Section>
          <EmptyState
            heading="Field Team Management Coming Soon"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              This feature is currently under development. It will allow you to
              manage your field representatives, assign territories, and track
              performance metrics.
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
