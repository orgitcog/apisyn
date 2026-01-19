import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useCallback } from 'react';
import { Page, Card, Tabs, Button, ButtonGroup, Banner, Badge, BlockStack, InlineStack, Text } from '@shopify/polaris';
import {
  AccountsView,
  TransactionsView,
  InvoicesView,
  ReportsView
} from '../components/GnuCash';
import {
  getMockAccounts,
  getMockTransactions,
  getMockCustomers,
  getMockVendors,
  getMockInvoices,
  getMockBills,
  getMockProfitLossReport,
  getMockBalanceSheetReport,
  getMockCashFlowReport,
  getMockTrialBalanceReport,
  syncGnuCashData,
  type GnuCashConnectionStatus
} from '../lib/gnucash';

export async function loader() {
  try {
    // In production, these would be actual API calls
    const accounts = getMockAccounts();
    const transactions = getMockTransactions();
    const customers = getMockCustomers();
    const vendors = getMockVendors();
    const invoices = getMockInvoices();
    const bills = getMockBills();

    // Get date range for reports
    const endDate = new Date().toISOString();
    const startDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString();

    const profitLoss = getMockProfitLossReport(startDate, endDate);
    const balanceSheet = getMockBalanceSheetReport(endDate);
    const cashFlow = getMockCashFlowReport(startDate, endDate);
    const trialBalance = getMockTrialBalanceReport(endDate);

    const connectionStatus: GnuCashConnectionStatus = {
      connected: true,
      bookName: 'Enterprise Accounts',
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      version: '4.14',
      accounts: accounts.length,
      transactions: transactions.length
    };

    return json({
      accounts,
      transactions,
      customers,
      vendors,
      invoices,
      bills,
      profitLoss,
      balanceSheet,
      cashFlow,
      trialBalance,
      connectionStatus,
      error: null
    });
  } catch (error) {
    console.error("Error loading GnuCash data:", error);
    return json({
      accounts: [],
      transactions: [],
      customers: [],
      vendors: [],
      invoices: [],
      bills: [],
      profitLoss: null,
      balanceSheet: null,
      cashFlow: null,
      trialBalance: null,
      connectionStatus: { connected: false, bookName: '', lastSync: null, version: '', accounts: 0, transactions: 0 },
      error: "Failed to load GnuCash data"
    });
  }
}

export default function GnuCashIntegration() {
  const {
    accounts,
    transactions,
    customers,
    vendors,
    invoices,
    bills,
    profitLoss,
    balanceSheet,
    cashFlow,
    trialBalance,
    connectionStatus,
    error
  } = useLoaderData<typeof loader>();

  const [selected, setSelected] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'critical'; message: string } | null>(null);

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await syncGnuCashData();
      setSyncMessage({
        type: result.success ? 'success' : 'critical',
        message: result.message
      });
    } catch (_err) {
      setSyncMessage({
        type: 'critical',
        message: 'Sync failed. Please try again.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const tabs = [
    { id: 'accounts', content: 'Accounts' },
    { id: 'transactions', content: 'Transactions' },
    { id: 'invoices', content: 'Invoices & Bills' },
    { id: 'reports', content: 'Financial Reports' }
  ];

  return (
    <Page
      title="GnuCash Integration"
      subtitle="Open-source accounting integration for financial management"
      primaryAction={{
        content: isSyncing ? 'Syncing...' : 'Sync Now',
        loading: isSyncing,
        onAction: handleSync
      }}
      secondaryActions={[
        { content: 'Settings', onAction: () => console.log('Settings') },
        { content: 'Documentation', onAction: () => window.open('https://www.gnucash.org/docs/', '_blank') }
      ]}
    >
      <BlockStack gap="400">
        {/* Error Banner */}
        {error && (
          <Banner title="Connection Error" tone="critical">
            <p>{error}</p>
          </Banner>
        )}

        {/* Sync Message */}
        {syncMessage && (
          <Banner
            title={syncMessage.type === 'success' ? 'Sync Complete' : 'Sync Failed'}
            tone={syncMessage.type}
            onDismiss={() => setSyncMessage(null)}
          >
            <p>{syncMessage.message}</p>
          </Banner>
        )}

        {/* Connection Status */}
        <Card>
          <InlineStack align="space-between" blockAlign="center">
            <InlineStack gap="400">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <BlockStack gap="100">
                <InlineStack gap="200">
                  <Text as="h3" variant="headingMd">GnuCash</Text>
                  <Badge tone={connectionStatus.connected ? 'success' : 'critical'}>
                    {connectionStatus.connected ? 'Connected' : 'Disconnected'}
                  </Badge>
                </InlineStack>
                <Text as="p" variant="bodySm" tone="subdued">
                  {connectionStatus.bookName} • Version {connectionStatus.version}
                </Text>
              </BlockStack>
            </InlineStack>

            <InlineStack gap="600">
              <BlockStack gap="050">
                <Text as="p" variant="bodySm" tone="subdued">Accounts</Text>
                <Text as="p" variant="headingMd">{connectionStatus.accounts}</Text>
              </BlockStack>
              <BlockStack gap="050">
                <Text as="p" variant="bodySm" tone="subdued">Transactions</Text>
                <Text as="p" variant="headingMd">{connectionStatus.transactions}</Text>
              </BlockStack>
              <BlockStack gap="050">
                <Text as="p" variant="bodySm" tone="subdued">Last Sync</Text>
                <Text as="p" variant="bodyMd">{formatDate(connectionStatus.lastSync)}</Text>
              </BlockStack>
            </InlineStack>
          </InlineStack>
        </Card>

        {/* Main Content */}
        <Card>
          <div className="p-4">
            <div className="flex justify-between items-center mb-6">
              <Tabs tabs={tabs} selected={selected} onSelect={handleTabChange} />
              <ButtonGroup>
                <Button onClick={() => window.location.reload()}>Refresh</Button>
              </ButtonGroup>
            </div>

            {selected === 0 && (
              <div className="mt-6">
                <AccountsView accounts={accounts} />
              </div>
            )}

            {selected === 1 && (
              <div className="mt-6">
                <TransactionsView transactions={transactions} accounts={accounts} />
              </div>
            )}

            {selected === 2 && (
              <div className="mt-6">
                <InvoicesView
                  invoices={invoices}
                  bills={bills}
                  customers={customers}
                  vendors={vendors}
                />
              </div>
            )}

            {selected === 3 && profitLoss && balanceSheet && cashFlow && trialBalance && (
              <div className="mt-6">
                <ReportsView
                  profitLoss={profitLoss}
                  balanceSheet={balanceSheet}
                  cashFlow={cashFlow}
                  trialBalance={trialBalance}
                />
              </div>
            )}
          </div>
        </Card>
      </BlockStack>
    </Page>
  );
}
