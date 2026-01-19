import React from "react";
import {
  Page,
  Layout,
  Card,
  _ButtonGroup,
  _EmptyState,
} from "@shopify/polaris";
import { StoreMatrix } from "./components/StoreMatrix";
import { KPIOverview } from "./components/KPIOverview";
import { ShopifyStoreInfo } from "./components/ShopifyStoreInfo";
import { ShopifySyncButton } from "./components/ShopifySyncButton";
import { StoreConnect } from "../../components/Shopify/StoreConnect";
import { ConnectedStores } from "../../components/Shopify/ConnectedStores";
import { useAuth } from "../../context/AuthContext";

export function Dashboard() {
  const { _user } = useAuth();

  return (
    <Page title="Enterprise Overview" primaryAction={<ShopifySyncButton />}>
      <Layout>
        <Layout.Section>
          <StoreConnect />
        </Layout.Section>

        <Layout.Section>
          <ConnectedStores />
        </Layout.Section>

        <Layout.Section>
          <KPIOverview />
        </Layout.Section>

        <Layout.Section>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <Card>
                <StoreMatrix />
              </Card>
            </div>
            <div className="col-span-1">
              <ShopifyStoreInfo />
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
