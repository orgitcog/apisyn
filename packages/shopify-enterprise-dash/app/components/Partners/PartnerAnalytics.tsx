import React, { useState, useMemo } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  SkeletonBodyText,
  SkeletonDisplayText,
  Banner,
  Button,
  DataTable,
  Filters,
  ChoiceList,
  DatePicker,
  Popover,
  Icon,
  Box,
  Divider,
  ProgressBar,
} from "@shopify/polaris";
import {
  RefreshMajor,
  CalendarMajor,
  AppsMajor,
  TransactionMajor,
  ChartVerticalMajor,
} from "@shopify/polaris-icons";
import {
  usePartnerApi,
  usePartnerStats,
  useTransactions,
  useAppEvents,
} from "../../src/hooks/usePartnerApi";

interface PartnerAnalyticsProps {
  organizationId?: string;
  accessToken?: string;
  appId?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: number;
  icon: React.ReactNode;
  isLoading?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  trend,
  icon,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <Card>
        <BlockStack gap="300">
          <SkeletonDisplayText size="small" />
          <SkeletonBodyText lines={1} />
        </BlockStack>
      </Card>
    );
  }

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center">
          <Text as="h3" variant="headingMd">
            {title}
          </Text>
          <Box>{icon}</Box>
        </InlineStack>
        <InlineStack align="space-between" blockAlign="end">
          <Text as="p" variant="heading2xl" fontWeight="bold">
            {typeof value === "number" ? value.toLocaleString() : value}
          </Text>
          {trend !== undefined && (
            <Badge tone={trend >= 0 ? "success" : "critical"}>
              {trend >= 0 ? "+" : ""}
              {trend}%
            </Badge>
          )}
        </InlineStack>
      </BlockStack>
    </Card>
  );
};

export const PartnerAnalytics: React.FC<PartnerAnalyticsProps> = ({
  organizationId,
  accessToken,
  appId,
}) => {
  const [dateRange, setDateRange] = useState<{
    start: Date;
    end: Date;
  }>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date(),
  });
  const [datePickerActive, setDatePickerActive] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string[]>([]);

  // Initialize Partner API
  const { client, isLoading: isConnecting, error: connectionError, isConnected } = usePartnerApi(
    organizationId && accessToken
      ? { organizationId, accessToken }
      : null
  );

  // Fetch stats
  const { stats, isLoading: isLoadingStats, refetch: refetchStats } = usePartnerStats(
    client,
    appId
  );

  // Fetch transactions
  const {
    transactions,
    isLoading: isLoadingTransactions,
    refetch: refetchTransactions,
    loadMore,
    hasMore,
  } = useTransactions(client, {
    first: 50,
    appId,
    createdAtMin: dateRange.start.toISOString(),
    createdAtMax: dateRange.end.toISOString(),
    types: transactionTypeFilter.length > 0 ? transactionTypeFilter : undefined,
  });

  // Fetch app events
  const { events, isLoading: isLoadingEvents, refetch: refetchEvents } = useAppEvents(
    client,
    appId || null,
    100
  );

  // Calculate event metrics
  const eventMetrics = useMemo(() => {
    if (!events?.edges) {
      return {
        installs: 0,
        uninstalls: 0,
        charges: 0,
        netGrowth: 0,
        installRate: 0,
      };
    }

    let installs = 0;
    let uninstalls = 0;
    let charges = 0;

    events.edges.forEach(({ node }) => {
      const eventType = node.type.toLowerCase();
      if (eventType.includes("install") && !eventType.includes("uninstall")) {
        installs++;
      } else if (eventType.includes("uninstall")) {
        uninstalls++;
      } else if (eventType.includes("charge") || eventType.includes("subscription")) {
        charges++;
      }
    });

    const netGrowth = installs - uninstalls;
    const installRate = installs > 0 ? Math.round((netGrowth / installs) * 100) : 0;

    return { installs, uninstalls, charges, netGrowth, installRate };
  }, [events]);

  // Format transactions for data table
  const transactionRows = useMemo(() => {
    if (!transactions?.edges) return [];

    return transactions.edges.map(({ node }) => [
      node.id.split("/").pop() || node.id,
      new Date(node.createdAt).toLocaleDateString(),
      new Date(node.createdAt).toLocaleTimeString(),
    ]);
  }, [transactions]);

  // Format events for data table
  const eventRows = useMemo(() => {
    if (!events?.edges) return [];

    return events.edges.slice(0, 20).map(({ node }) => [
      node.type,
      new Date(node.occurredAt).toLocaleDateString(),
      node.shop?.name || "N/A",
      node.shop?.myshopifyDomain || "N/A",
    ]);
  }, [events]);

  const handleRefreshAll = async () => {
    await Promise.all([refetchStats(), refetchTransactions(), refetchEvents()]);
  };

  const handleDateRangeChange = (range: { start: Date; end: Date }) => {
    setDateRange(range);
    setDatePickerActive(false);
  };

  if (!organizationId || !accessToken) {
    return (
      <Page title="Partner Analytics">
        <Banner tone="warning">
          <p>
            Partner API credentials are not configured. Please set your Organization ID and
            Access Token in the environment variables.
          </p>
        </Banner>
      </Page>
    );
  }

  if (connectionError) {
    return (
      <Page title="Partner Analytics">
        <Banner tone="critical">
          <p>Failed to connect to Partner API: {connectionError}</p>
        </Banner>
      </Page>
    );
  }

  const isLoading = isConnecting || isLoadingStats || isLoadingTransactions || isLoadingEvents;

  return (
    <Page
      title="Partner Analytics"
      subtitle="Real-time insights from Shopify Partner API"
      primaryAction={{
        content: "Refresh",
        icon: RefreshMajor,
        onAction: handleRefreshAll,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Date Range",
          icon: CalendarMajor,
          onAction: () => setDatePickerActive(true),
        },
      ]}
    >
      <Layout>
        {/* Connection Status */}
        <Layout.Section>
          <InlineStack gap="200" align="start">
            <Badge tone={isConnected ? "success" : "attention"}>
              {isConnected ? "Connected" : "Connecting..."}
            </Badge>
            <Text as="span" variant="bodySm" tone="subdued">
              Organization ID: {organizationId}
            </Text>
          </InlineStack>
        </Layout.Section>

        {/* Key Metrics */}
        <Layout.Section>
          <Text as="h2" variant="headingLg">
            Key Metrics
          </Text>
          <Box paddingBlockStart="400">
            <InlineStack gap="400" wrap={false}>
              <Box minWidth="200px">
                <MetricCard
                  title="Total Transactions"
                  value={stats?.totalTransactions || 0}
                  icon={<Icon source={TransactionMajor} />}
                  isLoading={isLoadingStats}
                />
              </Box>
              <Box minWidth="200px">
                <MetricCard
                  title="App Installs"
                  value={eventMetrics.installs}
                  trend={eventMetrics.installRate}
                  icon={<Icon source={AppsMajor} />}
                  isLoading={isLoadingEvents}
                />
              </Box>
              <Box minWidth="200px">
                <MetricCard
                  title="App Uninstalls"
                  value={eventMetrics.uninstalls}
                  icon={<Icon source={AppsMajor} />}
                  isLoading={isLoadingEvents}
                />
              </Box>
              <Box minWidth="200px">
                <MetricCard
                  title="Net Growth"
                  value={eventMetrics.netGrowth}
                  trend={eventMetrics.installRate}
                  icon={<Icon source={ChartVerticalMajor} />}
                  isLoading={isLoadingEvents}
                />
              </Box>
            </InlineStack>
          </Box>
        </Layout.Section>

        {/* Retention Progress */}
        {eventMetrics.installs > 0 && (
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text as="h3" variant="headingMd">
                  App Retention Rate
                </Text>
                <ProgressBar
                  progress={Math.max(0, Math.min(100, eventMetrics.installRate + 50))}
                  tone={eventMetrics.installRate >= 0 ? "success" : "critical"}
                  size="small"
                />
                <InlineStack align="space-between">
                  <Text as="span" variant="bodySm" tone="subdued">
                    {eventMetrics.installs} installs
                  </Text>
                  <Text as="span" variant="bodySm" tone="subdued">
                    {eventMetrics.uninstalls} uninstalls
                  </Text>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        )}

        <Layout.Section>
          <Divider />
        </Layout.Section>

        {/* App Events Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h3" variant="headingMd">
                  Recent App Events
                </Text>
                <Badge>{events?.edges?.length || 0} events</Badge>
              </InlineStack>
              {isLoadingEvents ? (
                <SkeletonBodyText lines={5} />
              ) : eventRows.length > 0 ? (
                <DataTable
                  columnContentTypes={["text", "text", "text", "text"]}
                  headings={["Event Type", "Date", "Shop Name", "Domain"]}
                  rows={eventRows}
                  footerContent={`Showing ${eventRows.length} of ${events?.edges?.length || 0} events`}
                />
              ) : (
                <Text as="p" tone="subdued">
                  No events found for this app.
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Transactions Table */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between">
                <Text as="h3" variant="headingMd">
                  Transactions
                </Text>
                <Badge>{transactions?.edges?.length || 0} transactions</Badge>
              </InlineStack>
              <Filters
                queryValue=""
                filters={[
                  {
                    key: "transactionType",
                    label: "Transaction Type",
                    filter: (
                      <ChoiceList
                        title="Transaction Type"
                        titleHidden
                        choices={[
                          { label: "App Sale", value: "APP_SALE" },
                          { label: "App Subscription", value: "APP_SUBSCRIPTION" },
                          { label: "Referral", value: "REFERRAL" },
                          { label: "Theme Sale", value: "THEME_SALE" },
                        ]}
                        selected={transactionTypeFilter}
                        onChange={setTransactionTypeFilter}
                        allowMultiple
                      />
                    ),
                    shortcut: true,
                  },
                ]}
                appliedFilters={
                  transactionTypeFilter.length > 0
                    ? [
                        {
                          key: "transactionType",
                          label: `Types: ${transactionTypeFilter.join(", ")}`,
                          onRemove: () => setTransactionTypeFilter([]),
                        },
                      ]
                    : []
                }
                onQueryChange={() => {}}
                onQueryClear={() => {}}
                onClearAll={() => setTransactionTypeFilter([])}
              />
              {isLoadingTransactions ? (
                <SkeletonBodyText lines={5} />
              ) : transactionRows.length > 0 ? (
                <>
                  <DataTable
                    columnContentTypes={["text", "text", "text"]}
                    headings={["Transaction ID", "Date", "Time"]}
                    rows={transactionRows}
                    footerContent={`Showing ${transactionRows.length} transactions`}
                  />
                  {hasMore && (
                    <InlineStack align="center">
                      <Button onClick={loadMore} loading={isLoadingTransactions}>
                        Load More
                      </Button>
                    </InlineStack>
                  )}
                </>
              ) : (
                <Text as="p" tone="subdued">
                  No transactions found for the selected period.
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Date Picker Popover */}
        <Popover
          active={datePickerActive}
          activator={<div />}
          onClose={() => setDatePickerActive(false)}
          preferredAlignment="right"
        >
          <Popover.Pane>
            <Box padding="400">
              <DatePicker
                month={selectedMonth.month}
                year={selectedMonth.year}
                onChange={(range) => {
                  handleDateRangeChange({
                    start: range.start,
                    end: range.end,
                  });
                }}
                onMonthChange={(month, year) => setSelectedMonth({ month, year })}
                selected={{
                  start: dateRange.start,
                  end: dateRange.end,
                }}
                allowRange
              />
            </Box>
          </Popover.Pane>
        </Popover>

        {/* API Info */}
        <Layout.Section>
          <Card>
            <BlockStack gap="200">
              <Text as="h3" variant="headingMd">
                API Information
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Connected to Shopify Partner API v2026-01
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Rate limit: 4 requests/second
              </Text>
              {stats && (
                <Text as="p" variant="bodySm" tone="subdued">
                  Available API versions: {stats.apiVersions}
                </Text>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default PartnerAnalytics;
