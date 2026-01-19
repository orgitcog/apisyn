import React, { useState } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  _Avatar,
  Badge,
  Button,
  ButtonGroup,
  Pagination,
  TextField,
  EmptySearchResult,
  Text,
} from "@shopify/polaris";
import { useTestMode } from "../../../context/TestModeContext";
import { Download, RefreshCw } from "lucide-react";

export function StoreMatrix() {
  const { organizations } = useTestMode();
  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  // Flatten stores from all organizations
  const allStores = organizations.flatMap((org) =>
    org.stores.map((store) => ({
      ...store,
      organizationName: org.name,
    })),
  );

  // Filter stores based on search and status
  const filteredStores = allStores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      store.domain.toLowerCase().includes(searchValue.toLowerCase()) ||
      store.organizationName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus =
      selectedStatus === null || store.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const _handleStatusChange = (value: string | null) => {
    setSelectedStatus(value);
  };

  const refreshData = () => {
    // In a real app, this would refresh data from the API
    console.log("Refreshing data...");
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    let statusProps: {
      status: "success" | "critical" | "warning" | "new";
      children: string;
    } = {
      status: "new",
      children: "Unknown",
    };

    switch (status) {
      case "active":
        statusProps = { status: "success", children: "Active" };
        break;
      case "inactive":
        statusProps = { status: "critical", children: "Inactive" };
        break;
      case "pending":
        statusProps = { status: "warning", children: "Pending" };
        break;
    }

    return <Badge {...statusProps} />;
  };

  // Define the rows for the DataTable
  const _rows = filteredStores.map((store) => [
    store.name,
    store.organizationName,
    store.domain,
    `$${store.metrics.revenue.toLocaleString()}`,
    store.metrics.orders.toLocaleString(),
    <StatusBadge key={`status-${store.id}`} status={store.status} />,
    formatDate(store.lastSync),
  ]);

  return (
    <>
      <Card.Section>
        <div className="flex justify-between items-center mb-4">
          <Text variant="headingMd" as="h2">
            Store Performance
          </Text>
          <ButtonGroup>
            <Button
              onClick={refreshData}
              icon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button icon={<Download className="w-4 h-4" />}>Export</Button>
          </ButtonGroup>
        </div>
      </Card.Section>

      <Card.Section>
        <div className="mb-4">
          <ResourceList
            resourceName={{ singular: "store", plural: "stores" }}
            items={filteredStores}
            renderItem={(store) => (
              <ResourceItem
                id={store.id}
                accessibilityLabel={`View details for ${store.name}`}
                name={store.name}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <Text variant="bodyMd" as="h3" fontWeight="bold">
                      {store.name}
                    </Text>
                    <div className="text-sm text-gray-500">
                      {store.organizationName} • {store.domain}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="mb-1">
                      <Text variant="bodyMd">
                        ${store.metrics.revenue.toLocaleString()}
                      </Text>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Text variant="bodySm" color="subdued">
                        {store.metrics.orders} orders
                      </Text>
                      <StatusBadge status={store.status} />
                    </div>
                  </div>
                </div>
              </ResourceItem>
            )}
            filterControl={
              <TextField
                label="Search stores"
                value={searchValue}
                onChange={handleSearchChange}
                autoComplete="off"
                labelHidden
                placeholder="Search by name, domain, or organization..."
              />
            }
          />
        </div>

        {filteredStores.length === 0 && (
          <EmptySearchResult
            title="No stores found"
            description="Try changing the filters or search term"
            withIllustration
          />
        )}
      </Card.Section>

      <Card.Section>
        <div className="flex items-center justify-center">
          <Pagination
            hasPrevious
            onPrevious={() => {}}
            hasNext
            onNext={() => {}}
          />
        </div>
      </Card.Section>
    </>
  );
}
