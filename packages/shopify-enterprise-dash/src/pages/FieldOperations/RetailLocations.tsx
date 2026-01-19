import React from "react";
import { Page, EmptyState, Card, Button } from "@shopify/polaris";

export function RetailLocations() {
  return (
    <Page
      title="Retail Locations"
      subtitle="Manage all your retail store locations"
    >
      <Card>
        <Card.Section>
          <EmptyState
            heading="Retail Locations Feature Coming Soon"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              This feature is currently under development. It will allow you to
              manage all your retail store locations, store details, contacts,
              and performance metrics in one place.
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
