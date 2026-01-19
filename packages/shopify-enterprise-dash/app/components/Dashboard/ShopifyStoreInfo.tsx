import { Card, TextContainer } from '@shopify/polaris';

interface ShopPlan {
  displayName?: string;
  shopifyPlus?: boolean;
}

interface ShopInfo {
  name?: string;
  myshopifyDomain?: string;
  email?: string;
  plan?: ShopPlan;
}

export function ShopifyStoreInfo({ shopInfo }: { shopInfo: ShopInfo | null }) {
  if (!shopInfo) {
    return (
      <Card sectioned title="Store Information">
        <TextContainer>
          <p className="text-red-500">
            No store information available
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Check your Shopify API credentials or connection
          </p>
        </TextContainer>
      </Card>
    );
  }

  return (
    <Card sectioned title="Store Information">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-500">Store Name</p>
          <p className="font-medium">{shopInfo.name}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">URL</p>
          <p className="font-medium">{shopInfo.myshopifyDomain}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Email</p>
          <p className="font-medium">{shopInfo.email}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500">Plan</p>
          <p className="font-medium">
            {shopInfo.plan?.displayName}
            {shopInfo.plan?.shopifyPlus && ' (Shopify Plus)'}
          </p>
        </div>
      </div>
    </Card>
  );
}
