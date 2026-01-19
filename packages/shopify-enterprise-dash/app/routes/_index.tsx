import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page, Layout, Card, _ButtonGroup } from '@shopify/polaris';
import { KPIOverview } from '../components/Dashboard/KPIOverview';
import { StoreMatrix } from '../components/Dashboard/StoreMatrix';
import { ShopifyStoreInfo } from '../components/Dashboard/ShopifyStoreInfo';
import { ShopifySyncButton } from '../components/Dashboard/ShopifySyncButton';
import { getStores } from "../lib/supabase";
import { getShopInfo } from "../lib/shopify";

export async function loader() {
  try {
    const stores = await getStores();
    const shopInfo = await getShopInfo();
    
    return json({ 
      stores, 
      shopInfo,
      error: null 
    });
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    return json({ 
      stores: [], 
      shopInfo: null,
      error: "Failed to load dashboard data" 
    });
  }
}

export default function Dashboard() {
  const { stores, shopInfo, _error } = useLoaderData<typeof loader>();

  return (
    <Page 
      title="Enterprise Overview"
      primaryAction={<ShopifySyncButton />}
    >
      <Layout>
        <Layout.Section>
          <KPIOverview stores={stores} />
        </Layout.Section>
        <Layout.Section>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="col-span-2">
              <Card>
                <StoreMatrix stores={stores} />
              </Card>
            </div>
            <div className="col-span-1">
              <ShopifyStoreInfo shopInfo={shopInfo} />
            </div>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}