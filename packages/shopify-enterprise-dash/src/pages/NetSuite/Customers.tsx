import React from "react";
import { Page } from "@shopify/polaris";
import { CustomerList } from "../../components/NetSuite/CustomerList";

export function NetSuiteCustomers() {
  return (
    <Page
      title="NetSuite Customers"
      subtitle="View and manage customer data from NetSuite OneWorld"
    >
      <CustomerList />
    </Page>
  );
}
