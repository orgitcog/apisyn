import React from "react";
import { Page } from "@shopify/polaris";
import { AppList } from "../../components/AppDirect/AppList";

export function AppMarketplace() {
  return (
    <Page
      title="App Marketplace"
      subtitle="Browse and install applications for your Shopify Enterprise Dashboard"
    >
      <AppList />
    </Page>
  );
}
