import React, { useState } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  Filters,
  Modal,
  TextContainer,
  ButtonGroup,
  TextField,
  EmptySearchResult,
  Spinner,
} from "@shopify/polaris";
import {
  useSubscriptions,
  useCancelSubscription,
} from "../../hooks/useAppDirectData";
import { format, parseISO } from "date-fns";
import { Calendar, AlertCircle } from "lucide-react";

export function SubscriptionList() {
  const { data: subscriptions, isLoading, error } = useSubscriptions();
  const cancelSubscription = useCancelSubscription();

  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [cancelModalActive, setCancelModalActive] = useState(false);
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState("");
  const [cancelReason, setCancelReason] = useState("");

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  // Filter subscriptions based on search and status
  const filteredSubs = subscriptions
    ? subscriptions.filter((sub) => {
        const matchesSearch = sub.items.some((item) =>
          item.product.name.toLowerCase().includes(searchValue.toLowerCase()),
        );

        const matchesStatus = !selectedStatus || sub.status === selectedStatus;

        return matchesSearch && matchesStatus;
      })
    : [];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleStatusChange = (value: string | null) => {
    setSelectedStatus(value);
  };

  const handleCancelClick = (subscriptionId: string) => {
    setSelectedSubscriptionId(subscriptionId);
    setCancelReason("");
    setCancelModalActive(true);
  };

  const handleCancelSubscription = async () => {
    if (!selectedSubscriptionId || !cancelReason) return;

    try {
      await cancelSubscription.mutateAsync({
        subscriptionId: selectedSubscriptionId,
        reason: cancelReason,
      });

      setCancelModalActive(false);
      // Show success message or notification here
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      // Show error message
    }
  };

  if (isLoading) {
    return (
      <Card sectioned title="Active Subscriptions">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-500">Loading subscription data...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sectioned title="Active Subscriptions">
        <div className="bg-red-50 text-red-800 p-4 rounded">
          <p className="font-medium">Error loading subscriptions</p>
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
            Application Subscriptions
          </Text>
          <Button url="/apps/marketplace">Browse Apps</Button>
        </div>
      </Card.Section>

      <Card.Section>
        <Filters
          queryValue={searchValue}
          queryPlaceholder="Search subscriptions..."
          filters={[
            {
              key: "status",
              label: "Status",
              filter: (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange(null)}
                    pressed={selectedStatus === null}
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("ACTIVE")}
                    pressed={selectedStatus === "ACTIVE"}
                  >
                    Active
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("CANCELLED")}
                    pressed={selectedStatus === "CANCELLED"}
                  >
                    Cancelled
                  </Button>
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
        {filteredSubs && filteredSubs.length > 0 ? (
          <ResourceList
            resourceName={{ singular: "subscription", plural: "subscriptions" }}
            items={filteredSubs}
            renderItem={(sub) => {
              const { id, items, order, status, startDate, endDate } = sub;
              const appName = items[0]?.product.name || "Unknown App";

              let statusBadge;
              switch (status) {
                case "ACTIVE":
                  statusBadge = <Badge status="success">Active</Badge>;
                  break;
                case "CANCELLED":
                  statusBadge = <Badge status="critical">Cancelled</Badge>;
                  break;
                case "SUSPENDED":
                  statusBadge = <Badge status="warning">Suspended</Badge>;
                  break;
                default:
                  statusBadge = <Badge>{status}</Badge>;
              }

              return (
                <ResourceItem
                  id={id}
                  accessibilityLabel={`View details for ${appName} subscription`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-base font-medium mr-2">
                          {appName}
                        </h3>
                        {statusBadge}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <div className="flex items-center mt-1">
                          <Badge>{order.editionCode}</Badge>
                          <Badge status="info" className="ml-2">
                            {order.pricingDuration}
                          </Badge>
                        </div>
                        <div className="flex items-center mt-2">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>Started: {formatDate(startDate)}</span>
                          {endDate && (
                            <span className="ml-3">
                              Ended: {formatDate(endDate)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div>
                      {status === "ACTIVE" && (
                        <ButtonGroup>
                          <Button url={`/apps/subscriptions/${id}`} size="slim">
                            Details
                          </Button>
                          <Button
                            destructive
                            size="slim"
                            onClick={() => handleCancelClick(id)}
                          >
                            Cancel
                          </Button>
                        </ButtonGroup>
                      )}
                      {status === "CANCELLED" && (
                        <div className="text-sm text-gray-500">
                          {sub.notice && (
                            <div className="flex items-center text-red-500">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              <span>{sub.notice}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ResourceItem>
              );
            }}
          />
        ) : (
          <EmptySearchResult
            title="No subscriptions found"
            description="Try changing the filters or search term"
            withIllustration
          />
        )}
      </Card.Section>

      <Modal
        open={cancelModalActive}
        onClose={() => setCancelModalActive(false)}
        title="Cancel Subscription"
        primaryAction={{
          content: "Cancel Subscription",
          onAction: handleCancelSubscription,
          destructive: true,
          loading: cancelSubscription.isPending,
        }}
        secondaryActions={[
          {
            content: "Keep Subscription",
            onAction: () => setCancelModalActive(false),
          },
        ]}
      >
        <Modal.Section>
          <TextContainer>
            <p>
              Are you sure you want to cancel this subscription? This action
              cannot be undone.
            </p>
            <TextField
              label="Reason for cancellation"
              value={cancelReason}
              onChange={setCancelReason}
              multiline={4}
              required
              autoComplete="off"
            />
          </TextContainer>
        </Modal.Section>
      </Modal>
    </Card>
  );
}
