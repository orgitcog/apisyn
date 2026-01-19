import React, { useState, useMemo, useCallback } from "react";
import {
  Page,
  Layout,
  Card,
  Text,
  BlockStack,
  InlineStack,
  Badge,
  SkeletonBodyText,
  Banner,
  Button,
  DataTable,
  Filters,
  ChoiceList,
  TextField,
  Select,
  Box,
  Divider,
  EmptyState,
  Pagination,
  Icon,
} from "@shopify/polaris";
import {
  RefreshMajor,
  ExportMinor,
  SearchMinor,
  FilterMajor,
  TransactionMajor,
} from "@shopify/polaris-icons";
import {
  usePartnerApi,
  useTransactions,
} from "../../src/hooks/usePartnerApi";

interface TransactionTrackerProps {
  organizationId?: string;
  accessToken?: string;
}

type SortDirection = "ascending" | "descending";

interface SortConfig {
  column: number;
  direction: SortDirection;
}

export const TransactionTracker: React.FC<TransactionTrackerProps> = ({
  organizationId,
  accessToken,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    column: 1,
    direction: "descending",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 25;

  // Calculate date range based on filter
  const dateRange = useMemo(() => {
    const now = new Date();
    let start: Date | undefined;

    switch (dateRangeFilter) {
      case "today":
        start = new Date(now.setHours(0, 0, 0, 0));
        break;
      case "week":
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "quarter":
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case "year":
        start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        start = undefined;
    }

    return {
      createdAtMin: start?.toISOString(),
      createdAtMax: new Date().toISOString(),
    };
  }, [dateRangeFilter]);

  // Initialize Partner API
  const { client, isLoading: isConnecting, error: connectionError, isConnected } = usePartnerApi(
    organizationId && accessToken
      ? { organizationId, accessToken }
      : null
  );

  // Fetch transactions
  const {
    transactions,
    isLoading: isLoadingTransactions,
    error: transactionsError,
    refetch: refetchTransactions,
    loadMore,
    hasMore,
  } = useTransactions(client, {
    first: 100,
    types: transactionTypeFilter.length > 0 ? transactionTypeFilter : undefined,
    ...dateRange,
  });

  // Filter and sort transactions
  const processedTransactions = useMemo(() => {
    if (!transactions?.edges) return [];

    let filtered = transactions.edges.map(({ node }) => ({
      id: node.id,
      shortId: node.id.split("/").pop() || node.id,
      createdAt: new Date(node.createdAt),
      dateStr: new Date(node.createdAt).toLocaleDateString(),
      timeStr: new Date(node.createdAt).toLocaleTimeString(),
    }));

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.shortId.toLowerCase().includes(query) ||
          t.dateStr.toLowerCase().includes(query)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortConfig.column) {
        case 0: // ID
          comparison = a.shortId.localeCompare(b.shortId);
          break;
        case 1: // Date
          comparison = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        default:
          comparison = 0;
      }
      return sortConfig.direction === "ascending" ? comparison : -comparison;
    });

    return filtered;
  }, [transactions, searchQuery, sortConfig]);

  // Paginate results
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return processedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [processedTransactions, currentPage]);

  const totalPages = Math.ceil(processedTransactions.length / itemsPerPage);

  // Format for data table
  const tableRows = useMemo(() => {
    return paginatedTransactions.map((t) => [
      t.shortId,
      t.dateStr,
      t.timeStr,
      <Badge key={t.id} tone="info">
        Transaction
      </Badge>,
    ]);
  }, [paginatedTransactions]);

  const handleSort = useCallback((column: number, direction: SortDirection) => {
    setSortConfig({ column, direction });
  }, []);

  const handleExport = useCallback(() => {
    if (!processedTransactions.length) return;

    const csvContent = [
      ["Transaction ID", "Date", "Time"].join(","),
      ...processedTransactions.map((t) =>
        [t.shortId, t.dateStr, t.timeStr].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  }, [processedTransactions]);

  const handleClearFilters = useCallback(() => {
    setSearchQuery("");
    setTransactionTypeFilter([]);
    setDateRangeFilter("all");
    setCurrentPage(1);
  }, []);

  if (!organizationId || !accessToken) {
    return (
      <Page title="Transaction Tracker">
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
      <Page title="Transaction Tracker">
        <Banner tone="critical">
          <p>Failed to connect to Partner API: {connectionError}</p>
        </Banner>
      </Page>
    );
  }

  const isLoading = isConnecting || isLoadingTransactions;

  const appliedFilters = [];
  if (transactionTypeFilter.length > 0) {
    appliedFilters.push({
      key: "type",
      label: `Types: ${transactionTypeFilter.join(", ")}`,
      onRemove: () => setTransactionTypeFilter([]),
    });
  }
  if (dateRangeFilter !== "all") {
    appliedFilters.push({
      key: "date",
      label: `Date: ${dateRangeFilter}`,
      onRemove: () => setDateRangeFilter("all"),
    });
  }

  return (
    <Page
      title="Transaction Tracker"
      subtitle="Monitor and analyze Partner API transactions"
      primaryAction={{
        content: "Refresh",
        icon: RefreshMajor,
        onAction: refetchTransactions,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: "Export CSV",
          icon: ExportMinor,
          onAction: handleExport,
          disabled: processedTransactions.length === 0,
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
              Organization: {organizationId}
            </Text>
          </InlineStack>
        </Layout.Section>

        {/* Summary Cards */}
        <Layout.Section>
          <InlineStack gap="400">
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">
                    Total Transactions
                  </Text>
                  <Icon source={TransactionMajor} tone="base" />
                </InlineStack>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {transactions?.edges?.length || 0}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  {dateRangeFilter === "all" ? "All time" : `Last ${dateRangeFilter}`}
                </Text>
              </BlockStack>
            </Card>
            <Card>
              <BlockStack gap="200">
                <InlineStack align="space-between">
                  <Text as="h3" variant="headingMd">
                    Filtered Results
                  </Text>
                  <Icon source={FilterMajor} tone="base" />
                </InlineStack>
                <Text as="p" variant="heading2xl" fontWeight="bold">
                  {processedTransactions.length}
                </Text>
                <Text as="p" variant="bodySm" tone="subdued">
                  Matching current filters
                </Text>
              </BlockStack>
            </Card>
          </InlineStack>
        </Layout.Section>

        <Layout.Section>
          <Divider />
        </Layout.Section>

        {/* Filters and Search */}
        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack gap="400" align="space-between" blockAlign="end">
                <Box minWidth="300px">
                  <TextField
                    label="Search"
                    labelHidden
                    placeholder="Search by transaction ID..."
                    value={searchQuery}
                    onChange={setSearchQuery}
                    prefix={<Icon source={SearchMinor} />}
                    clearButton
                    onClearButtonClick={() => setSearchQuery("")}
                    autoComplete="off"
                  />
                </Box>
                <Box minWidth="200px">
                  <Select
                    label="Date Range"
                    labelHidden
                    options={[
                      { label: "All Time", value: "all" },
                      { label: "Today", value: "today" },
                      { label: "Last 7 Days", value: "week" },
                      { label: "Last 30 Days", value: "month" },
                      { label: "Last 90 Days", value: "quarter" },
                      { label: "Last Year", value: "year" },
                    ]}
                    value={dateRangeFilter}
                    onChange={setDateRangeFilter}
                  />
                </Box>
              </InlineStack>

              <Filters
                queryValue=""
                filters={[
                  {
                    key: "type",
                    label: "Transaction Type",
                    filter: (
                      <ChoiceList
                        title="Transaction Type"
                        titleHidden
                        choices={[
                          { label: "App Sale", value: "APP_SALE" },
                          { label: "App Subscription", value: "APP_SUBSCRIPTION" },
                          { label: "App Usage", value: "APP_USAGE" },
                          { label: "Referral", value: "REFERRAL" },
                          { label: "Theme Sale", value: "THEME_SALE" },
                          { label: "Service Sale", value: "SERVICE_SALE" },
                        ]}
                        selected={transactionTypeFilter}
                        onChange={setTransactionTypeFilter}
                        allowMultiple
                      />
                    ),
                    shortcut: true,
                  },
                ]}
                appliedFilters={appliedFilters}
                onQueryChange={() => {}}
                onQueryClear={() => {}}
                onClearAll={handleClearFilters}
              />
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
                {processedTransactions.length > 0 && (
                  <Text as="span" variant="bodySm" tone="subdued">
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, processedTransactions.length)} of{" "}
                    {processedTransactions.length}
                  </Text>
                )}
              </InlineStack>

              {isLoading ? (
                <SkeletonBodyText lines={10} />
              ) : tableRows.length > 0 ? (
                <>
                  <DataTable
                    columnContentTypes={["text", "text", "text", "text"]}
                    headings={["Transaction ID", "Date", "Time", "Type"]}
                    rows={tableRows}
                    sortable={[true, true, false, false]}
                    defaultSortDirection="descending"
                    initialSortColumnIndex={1}
                    onSort={handleSort}
                  />
                  {totalPages > 1 && (
                    <InlineStack align="center">
                      <Pagination
                        hasPrevious={currentPage > 1}
                        hasNext={currentPage < totalPages}
                        onPrevious={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        onNext={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      />
                    </InlineStack>
                  )}
                  {hasMore && (
                    <InlineStack align="center">
                      <Button onClick={loadMore} loading={isLoadingTransactions}>
                        Load More from API
                      </Button>
                    </InlineStack>
                  )}
                </>
              ) : (
                <EmptyState
                  heading="No transactions found"
                  image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                >
                  <p>
                    {searchQuery || appliedFilters.length > 0
                      ? "Try adjusting your filters or search query."
                      : "No transactions have been recorded yet."}
                  </p>
                </EmptyState>
              )}
            </BlockStack>
          </Card>
        </Layout.Section>

        {/* Error Display */}
        {transactionsError && (
          <Layout.Section>
            <Banner tone="critical">
              <p>Error loading transactions: {transactionsError}</p>
            </Banner>
          </Layout.Section>
        )}
      </Layout>
    </Page>
  );
};

export default TransactionTracker;
