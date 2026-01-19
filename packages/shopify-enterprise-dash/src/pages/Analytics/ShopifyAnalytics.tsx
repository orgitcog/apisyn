import React from "react";
import { Card, DescriptionList } from "@shopify/polaris";

// This component displays analytics data from Shopify
const ShopifyAnalytics: React.FC = () => {
  return (
    <Card>
      <Card.Section>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-4">
            Shopify Store Performance
          </h3>

          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <div className="flex flex-col space-y-2">
              <div className="text-sm text-gray-500">
                Total Revenue (30 days)
              </div>
              <div className="text-2xl font-semibold">$24,521.00</div>
              <div className="flex items-center">
                <span className="text-emerald-600 text-sm">↑ 8.1%</span>
                <span className="ml-1 text-xs text-gray-500">
                  vs previous period
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <DescriptionList
                items={[
                  {
                    term: "Average Order Value",
                    description: "$86.42",
                  },
                  {
                    term: "Conversion Rate",
                    description: "3.2%",
                  },
                  {
                    term: "Returning Customer Rate",
                    description: "42%",
                  },
                ]}
              />
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <DescriptionList
                items={[
                  {
                    term: "Cart Abandonment Rate",
                    description: "68%",
                  },
                  {
                    term: "Top Selling Product",
                    description: "Premium Subscription",
                  },
                  {
                    term: "Gross Profit Margin",
                    description: "42%",
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </Card.Section>
    </Card>
  );
};

export default ShopifyAnalytics;
