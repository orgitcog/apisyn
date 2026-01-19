import React from "react";
import { Page, EmptyState, Card, Button } from "@shopify/polaris";

export function StoreVisits() {
  return (
    <Page title="Store Visits" subtitle="Schedule and manage in-store visits">
      <Card>
        <Card.Section>
          <EmptyState
            heading="Store Visits Feature Coming Soon"
            image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
          >
            <p>
              This feature is currently under development. It will allow you to
              schedule store visits, manage visit checklists, and collect
              in-store data from your field team.
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
