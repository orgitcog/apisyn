import React from "react";
import { Page } from "@shopify/polaris";
import { SubscriptionList } from "../../components/AppDirect/SubscriptionList";

export function AppSubscriptions() {
  return (
    <Page
      title="App Subscriptions"
      subtitle="Manage your active application subscriptions"
    >
      <SubscriptionList />
    </Page>
  );
}
