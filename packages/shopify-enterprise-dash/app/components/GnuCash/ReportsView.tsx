import React, { useState } from 'react';
import {
  Card,
  DataTable,
  Badge,
  BlockStack,
  InlineStack,
  Text,
  Select,
  Button,
  Tabs,
  Divider
} from '@shopify/polaris';
import type {
  ProfitLossReport,
  BalanceSheetReport,
  CashFlowReport,
  TrialBalanceReport
} from '../../lib/gnucash';

interface ReportsViewProps {
  profitLoss: ProfitLossReport;
  balanceSheet: BalanceSheetReport;
  cashFlow: CashFlowReport;
  trialBalance: TrialBalanceReport;
}

export function ReportsView({ profitLoss, balanceSheet, cashFlow, trialBalance }: ReportsViewProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [_period, setPeriod] = useState('ytd');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const tabs = [
    { id: 'pnl', content: 'Profit & Loss' },
    { id: 'balance', content: 'Balance Sheet' },
    { id: 'cashflow', content: 'Cash Flow' },
    { id: 'trial', content: 'Trial Balance' }
  ];

  const renderProfitLoss = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Income</Text>
            <Text as="span" variant="headingMd" tone="success">{formatCurrency(profitLoss.income.total)}</Text>
          </InlineStack>
          <DataTable
            columnContentTypes={['text', 'numeric']}
            headings={['Account', 'Amount']}
            rows={profitLoss.income.accounts.map(acc => [
              acc.name,
              formatCurrency(acc.amount)
            ])}
            totals={['Total Income', formatCurrency(profitLoss.income.total)]}
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Expenses</Text>
            <Text as="span" variant="headingMd" tone="critical">{formatCurrency(profitLoss.expenses.total)}</Text>
          </InlineStack>
          <DataTable
            columnContentTypes={['text', 'numeric']}
            headings={['Account', 'Amount']}
            rows={profitLoss.expenses.accounts.map(acc => [
              acc.name,
              formatCurrency(acc.amount)
            ])}
            totals={['Total Expenses', formatCurrency(profitLoss.expenses.total)]}
          />
        </BlockStack>
      </Card>

      <Card>
        <InlineStack align="space-between">
          <Text as="h3" variant="headingLg">Net Income</Text>
          <Text as="span" variant="headingLg" tone={profitLoss.netIncome >= 0 ? 'success' : 'critical'}>
            {formatCurrency(profitLoss.netIncome)}
          </Text>
        </InlineStack>
      </Card>
    </BlockStack>
  );

  const renderBalanceSheet = () => (
    <BlockStack gap="400">
      {/* Assets */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Assets</Text>

          <BlockStack gap="200">
            <Text as="h4" variant="bodyMd" fontWeight="semibold">Current Assets</Text>
            <DataTable
              columnContentTypes={['text', 'numeric']}
              headings={['Account', 'Amount']}
              rows={balanceSheet.assets.current.map(acc => [
                acc.name,
                formatCurrency(acc.amount)
              ])}
              totals={['Total Current Assets', formatCurrency(balanceSheet.assets.totalCurrent)]}
            />
          </BlockStack>

          <Divider />

          <BlockStack gap="200">
            <Text as="h4" variant="bodyMd" fontWeight="semibold">Fixed Assets</Text>
            <DataTable
              columnContentTypes={['text', 'numeric']}
              headings={['Account', 'Amount']}
              rows={balanceSheet.assets.fixed.map(acc => [
                acc.name,
                formatCurrency(acc.amount)
              ])}
              totals={['Total Fixed Assets', formatCurrency(balanceSheet.assets.totalFixed)]}
            />
          </BlockStack>

          <Divider />

          <InlineStack align="space-between">
            <Text as="span" variant="headingMd">Total Assets</Text>
            <Text as="span" variant="headingMd" tone="success">{formatCurrency(balanceSheet.assets.total)}</Text>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Liabilities */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Liabilities</Text>

          <BlockStack gap="200">
            <Text as="h4" variant="bodyMd" fontWeight="semibold">Current Liabilities</Text>
            <DataTable
              columnContentTypes={['text', 'numeric']}
              headings={['Account', 'Amount']}
              rows={balanceSheet.liabilities.current.map(acc => [
                acc.name,
                formatCurrency(acc.amount)
              ])}
              totals={['Total Current Liabilities', formatCurrency(balanceSheet.liabilities.totalCurrent)]}
            />
          </BlockStack>

          <Divider />

          <BlockStack gap="200">
            <Text as="h4" variant="bodyMd" fontWeight="semibold">Long-Term Liabilities</Text>
            <DataTable
              columnContentTypes={['text', 'numeric']}
              headings={['Account', 'Amount']}
              rows={balanceSheet.liabilities.longTerm.map(acc => [
                acc.name,
                formatCurrency(acc.amount)
              ])}
              totals={['Total Long-Term Liabilities', formatCurrency(balanceSheet.liabilities.totalLongTerm)]}
            />
          </BlockStack>

          <Divider />

          <InlineStack align="space-between">
            <Text as="span" variant="headingMd">Total Liabilities</Text>
            <Text as="span" variant="headingMd" tone="warning">{formatCurrency(balanceSheet.liabilities.total)}</Text>
          </InlineStack>
        </BlockStack>
      </Card>

      {/* Equity */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Equity</Text>
          <DataTable
            columnContentTypes={['text', 'numeric']}
            headings={['Account', 'Amount']}
            rows={[
              ...balanceSheet.equity.accounts.map(acc => [acc.name, formatCurrency(acc.amount)]),
              ['Retained Earnings', formatCurrency(balanceSheet.equity.retainedEarnings)]
            ]}
            totals={['Total Equity', formatCurrency(balanceSheet.equity.total)]}
          />
        </BlockStack>
      </Card>

      <Card>
        <InlineStack align="space-between">
          <Text as="h3" variant="headingLg">Total Liabilities & Equity</Text>
          <Text as="span" variant="headingLg">{formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}</Text>
        </InlineStack>
        <div className="mt-2">
          <Badge tone={balanceSheet.assets.total === balanceSheet.totalLiabilitiesAndEquity ? 'success' : 'critical'}>
            {balanceSheet.assets.total === balanceSheet.totalLiabilitiesAndEquity ? 'Balanced' : 'Unbalanced'}
          </Badge>
        </div>
      </Card>
    </BlockStack>
  );

  const renderCashFlow = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Operating Activities</Text>
          <DataTable
            columnContentTypes={['text', 'numeric']}
            headings={['Item', 'Amount']}
            rows={cashFlow.operatingActivities.items.map(item => [
              item.name,
              <Text key={item.name} as="span" tone={item.amount >= 0 ? 'success' : 'critical'}>
                {formatCurrency(item.amount)}
              </Text>
            ])}
            totals={['Net Cash from Operating Activities', formatCurrency(cashFlow.operatingActivities.total)]}
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Investing Activities</Text>
          <DataTable
            columnContentTypes={['text', 'numeric']}
            headings={['Item', 'Amount']}
            rows={cashFlow.investingActivities.items.map(item => [
              item.name,
              <Text key={item.name} as="span" tone={item.amount >= 0 ? 'success' : 'critical'}>
                {formatCurrency(item.amount)}
              </Text>
            ])}
            totals={['Net Cash from Investing Activities', formatCurrency(cashFlow.investingActivities.total)]}
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Financing Activities</Text>
          <DataTable
            columnContentTypes={['text', 'numeric']}
            headings={['Item', 'Amount']}
            rows={cashFlow.financingActivities.items.map(item => [
              item.name,
              <Text key={item.name} as="span" tone={item.amount >= 0 ? 'success' : 'critical'}>
                {formatCurrency(item.amount)}
              </Text>
            ])}
            totals={['Net Cash from Financing Activities', formatCurrency(cashFlow.financingActivities.total)]}
          />
        </BlockStack>
      </Card>

      <Card>
        <BlockStack gap="300">
          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">Net Change in Cash</Text>
            <Text as="span" variant="bodyMd" tone={cashFlow.netCashChange >= 0 ? 'success' : 'critical'}>
              {formatCurrency(cashFlow.netCashChange)}
            </Text>
          </InlineStack>
          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">Beginning Cash</Text>
            <Text as="span" variant="bodyMd">{formatCurrency(cashFlow.beginningCash)}</Text>
          </InlineStack>
          <Divider />
          <InlineStack align="space-between">
            <Text as="span" variant="headingMd">Ending Cash</Text>
            <Text as="span" variant="headingMd" tone="success">{formatCurrency(cashFlow.endingCash)}</Text>
          </InlineStack>
        </BlockStack>
      </Card>
    </BlockStack>
  );

  const renderTrialBalance = () => (
    <BlockStack gap="400">
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Trial Balance</Text>
          <DataTable
            columnContentTypes={['text', 'text', 'numeric', 'numeric']}
            headings={['Account', 'Type', 'Debit', 'Credit']}
            rows={trialBalance.accounts.map(acc => [
              acc.accountName,
              <Badge key={acc.accountName} tone="info">{acc.accountType}</Badge>,
              acc.debit > 0 ? formatCurrency(acc.debit) : '-',
              acc.credit > 0 ? formatCurrency(acc.credit) : '-'
            ])}
            totals={['Totals', '', formatCurrency(trialBalance.totalDebits), formatCurrency(trialBalance.totalCredits)]}
          />
        </BlockStack>
      </Card>

      <Card>
        <InlineStack align="space-between">
          <Text as="h3" variant="headingMd">Balance Status</Text>
          <Badge tone={trialBalance.isBalanced ? 'success' : 'critical'} size="large">
            {trialBalance.isBalanced ? 'Balanced - Debits = Credits' : 'Unbalanced - Check Entries'}
          </Badge>
        </InlineStack>
      </Card>
    </BlockStack>
  );

  return (
    <BlockStack gap="400">
      {/* Report Header */}
      <Card>
        <InlineStack align="space-between">
          <BlockStack gap="100">
            <Text as="h2" variant="headingLg">Financial Reports</Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Generated: {formatDate(profitLoss.generatedAt)}
            </Text>
          </BlockStack>
          <InlineStack gap="200">
            <Select
              label="Period"
              labelHidden
              options={[
                { label: 'Year to Date', value: 'ytd' },
                { label: 'Last Month', value: 'last_month' },
                { label: 'Last Quarter', value: 'last_quarter' },
                { label: 'Last Year', value: 'last_year' },
                { label: 'Custom', value: 'custom' }
              ]}
              value={_period}
              onChange={setPeriod}
            />
            <Button variant="primary">Export PDF</Button>
            <Button>Export Excel</Button>
          </InlineStack>
        </InlineStack>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Net Income</Text>
            <Text as="p" variant="headingLg" tone={profitLoss.netIncome >= 0 ? 'success' : 'critical'}>
              {formatCurrency(profitLoss.netIncome)}
            </Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Assets</Text>
            <Text as="p" variant="headingLg">{formatCurrency(balanceSheet.assets.total)}</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Liabilities</Text>
            <Text as="p" variant="headingLg">{formatCurrency(balanceSheet.liabilities.total)}</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Cash Position</Text>
            <Text as="p" variant="headingLg" tone="success">{formatCurrency(cashFlow.endingCash)}</Text>
          </BlockStack>
        </Card>
      </div>

      {/* Report Tabs */}
      <Card>
        <BlockStack gap="400">
          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />

          <div className="mt-4">
            {selectedTab === 0 && renderProfitLoss()}
            {selectedTab === 1 && renderBalanceSheet()}
            {selectedTab === 2 && renderCashFlow()}
            {selectedTab === 3 && renderTrialBalance()}
          </div>
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
