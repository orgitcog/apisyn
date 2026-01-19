import React, { useState } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  Filters,
  Thumbnail,
  ButtonGroup,
  Modal,
  _TextField,
  Select,
  EmptySearchResult,
  Spinner,
} from "@shopify/polaris";
import {
  useApplications,
  useCreateSubscription,
} from "../../hooks/useAppDirectData";
import { AppDirectApplication } from "../../lib/appdirect";
import { ExternalLink, Download } from "lucide-react";

export function AppList() {
  const { data: applications, isLoading, error } = useApplications();
  const createSubscription = useCreateSubscription();

  const [searchValue, setSearchValue] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [modalActive, setModalActive] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppDirectApplication | null>(
    null,
  );
  const [selectedPlan, setSelectedPlan] = useState("");

  // Filter applications based on search and category
  const filteredApps = applications
    ? applications.filter((app) => {
        const matchesSearch =
          app.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          app.description.toLowerCase().includes(searchValue.toLowerCase()) ||
          app.provider.name.toLowerCase().includes(searchValue.toLowerCase());

        const matchesCategory =
          !selectedCategory || app.category === selectedCategory;

        return matchesSearch && matchesCategory;
      })
    : [];

  // Get unique categories for filter
  const categories = applications
    ? [...new Set(applications.map((app) => app.category))].sort()
    : [];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleCategoryChange = (value: string | null) => {
    setSelectedCategory(value);
  };

  const handleInstallClick = (app: AppDirectApplication) => {
    setSelectedApp(app);
    setSelectedPlan(app.pricing.edition);
    setModalActive(true);
  };

  const handleInstallApp = async () => {
    if (!selectedApp) return;

    try {
      await createSubscription.mutateAsync({
        applicationId: selectedApp.id,
        plan: selectedPlan,
        account: {
          // Sample account data
          accountIdentifier: "account-12345",
          name: "Example Store",
          email: "store@example.com",
        },
      });

      setModalActive(false);
      // Show success message or notification here
    } catch (error) {
      console.error("Error installing app:", error);
      // Show error message
    }
  };

  if (isLoading) {
    return (
      <Card sectioned title="Application Marketplace">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-500">
              Loading marketplace applications...
            </p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sectioned title="Application Marketplace">
        <div className="bg-red-50 text-red-800 p-4 rounded">
          <p className="font-medium">Error loading marketplace applications</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Section>
        <div className="flex justify-between items-center mb-4">
          <Text variant="headingMd" as="h2">
            Application Marketplace
          </Text>
          <Button url="https://marketplace.appdirect.com" external>
            Visit AppDirect Marketplace
          </Button>
        </div>
      </Card.Section>

      <Card.Section>
        <Filters
          queryValue={searchValue}
          queryPlaceholder="Search applications..."
          filters={[
            {
              key: "category",
              label: "Category",
              filter: (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleCategoryChange(null)}
                    pressed={selectedCategory === null}
                  >
                    All Categories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category}
                      onClick={() => handleCategoryChange(category)}
                      pressed={selectedCategory === category}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              ),
              shortcut: true,
            },
          ]}
          onQueryChange={handleSearchChange}
          onQueryClear={() => setSearchValue("")}
        />
      </Card.Section>

      <Card.Section>
        {filteredApps && filteredApps.length > 0 ? (
          <ResourceList
            resourceName={{ singular: "application", plural: "applications" }}
            items={filteredApps}
            renderItem={(app) => {
              const {
                id,
                name,
                description,
                logo,
                status,
                category,
                provider,
                pricing,
              } = app;

              let statusBadge;
              switch (status) {
                case "ACTIVE":
                  statusBadge = <Badge status="success">Active</Badge>;
                  break;
                case "INACTIVE":
                  statusBadge = <Badge status="critical">Inactive</Badge>;
                  break;
                default:
                  statusBadge = <Badge>{status}</Badge>;
              }

              return (
                <ResourceItem
                  id={id}
                  accessibilityLabel={`View details for ${name}`}
                  media={<Thumbnail source={logo} alt={name} size="medium" />}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-base font-medium mr-2">{name}</h3>
                        {statusBadge}
                      </div>
                      <Text variant="bodyMd" as="p" color="subdued">
                        {provider.name}
                      </Text>
                      <p className="text-sm mt-2">{description}</p>
                      <div className="mt-2">
                        <Badge>{category}</Badge>
                        <Badge status="info" className="ml-2">
                          {pricing.model === "SUBSCRIPTION"
                            ? "Subscription"
                            : "One-time purchase"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text variant="bodySm" as="p">
                        <span className="font-bold">${pricing.price}</span>{" "}
                        {pricing.currency}/
                        {pricing.model === "SUBSCRIPTION"
                          ? "month"
                          : "one-time"}
                      </Text>
                      {pricing.trial && (
                        <Text variant="bodySm" as="p" color="success">
                          {pricing.trial.duration}{" "}
                          {pricing.trial.unit.toLowerCase()} free trial
                        </Text>
                      )}
                      <div className="mt-4">
                        <ButtonGroup>
                          <Button
                            url={app.website}
                            external
                            size="slim"
                            icon={ExternalLink}
                          >
                            Details
                          </Button>
                          <Button
                            primary
                            size="slim"
                            icon={Download}
                            onClick={() => handleInstallClick(app)}
                          >
                            Install
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                  </div>
                </ResourceItem>
              );
            }}
          />
        ) : (
          <EmptySearchResult
            title="No applications found"
            description="Try changing the filters or search term"
            withIllustration
          />
        )}
      </Card.Section>

      <Modal
        open={modalActive}
        onClose={() => setModalActive(false)}
        title={`Install ${selectedApp?.name}`}
        primaryAction={{
          content: "Install Application",
          onAction: handleInstallApp,
          loading: createSubscription.isPending,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          {selectedApp && (
            <div>
              <div className="flex items-center mb-4">
                <Thumbnail
                  source={selectedApp.logo}
                  alt={selectedApp.name}
                  size="small"
                />
                <div className="ml-4">
                  <Text variant="headingMd" as="h3">
                    {selectedApp.name}
                  </Text>
                  <Text variant="bodyMd" as="p" color="subdued">
                    {selectedApp.provider.name}
                  </Text>
                </div>
              </div>

              <p className="mb-4">{selectedApp.description}</p>

              <Select
                label="Subscription Plan"
                options={[
                  {
                    label: `${selectedApp.pricing.edition} - $${selectedApp.pricing.price}/${selectedApp.pricing.model === "SUBSCRIPTION" ? "month" : "one-time"}`,
                    value: selectedApp.pricing.edition,
                  },
                ]}
                value={selectedPlan}
                onChange={setSelectedPlan}
              />

              {selectedApp.pricing.trial && (
                <div className="mt-4 p-4 bg-green-50 rounded-md">
                  <Text variant="bodyMd" as="p" color="success">
                    Includes {selectedApp.pricing.trial.duration}{" "}
                    {selectedApp.pricing.trial.unit.toLowerCase()} free trial
                  </Text>
                </div>
              )}
            </div>
          )}
        </Modal.Section>
      </Modal>
    </Card>
  );
}
