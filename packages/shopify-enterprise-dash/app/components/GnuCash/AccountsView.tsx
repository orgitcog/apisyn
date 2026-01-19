import React, { useState } from 'react';
import {
  Card,
  DataTable,
  Badge,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Select,
  Button
} from '@shopify/polaris';
import { ChevronDownMinor, ChevronRightMinor } from '@shopify/polaris-icons';
import type { GnuCashAccount, AccountType } from '../../lib/gnucash';

interface AccountsViewProps {
  accounts: GnuCashAccount[];
}

const accountTypeBadge: Record<AccountType, { tone: 'success' | 'info' | 'attention' | 'warning' | 'critical'; label: string }> = {
  ASSET: { tone: 'success', label: 'Asset' },
  BANK: { tone: 'success', label: 'Bank' },
  CASH: { tone: 'success', label: 'Cash' },
  RECEIVABLE: { tone: 'info', label: 'Receivable' },
  LIABILITY: { tone: 'warning', label: 'Liability' },
  PAYABLE: { tone: 'warning', label: 'Payable' },
  CREDIT: { tone: 'warning', label: 'Credit' },
  EQUITY: { tone: 'attention', label: 'Equity' },
  INCOME: { tone: 'info', label: 'Income' },
  EXPENSE: { tone: 'critical', label: 'Expense' }
};

export function AccountsView({ accounts }: AccountsViewProps) {
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [expandedAccounts, setExpandedAccounts] = useState<Set<string>>(new Set(['acc-1', 'acc-11', 'acc-15', 'acc-18', 'acc-22']));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  // Build account hierarchy
  const buildHierarchy = (accounts: GnuCashAccount[]): GnuCashAccount[] => {
    const accountMap = new Map<string, GnuCashAccount>();
    const rootAccounts: GnuCashAccount[] = [];

    // Create map
    accounts.forEach(acc => accountMap.set(acc.id, { ...acc, children: [] }));

    // Build tree
    accounts.forEach(acc => {
      const account = accountMap.get(acc.id)!;
      if (acc.parentId && accountMap.has(acc.parentId)) {
        const parent = accountMap.get(acc.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(account);
      } else if (!acc.parentId) {
        rootAccounts.push(account);
      }
    });

    return rootAccounts;
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      account.fullName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = typeFilter === 'all' || account.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const toggleExpand = (accountId: string) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  // Flatten for table display with indentation
  const flattenAccounts = (accts: GnuCashAccount[], level = 0): Array<GnuCashAccount & { level: number; hasChildren: boolean }> => {
    const result: Array<GnuCashAccount & { level: number; hasChildren: boolean }> = [];

    accts.forEach(account => {
      const hasChildren = account.children && account.children.length > 0;
      result.push({ ...account, level, hasChildren });

      if (hasChildren && expandedAccounts.has(account.id)) {
        result.push(...flattenAccounts(account.children!, level + 1));
      }
    });

    return result;
  };

  const hierarchy = buildHierarchy(filteredAccounts);
  const flatAccounts = flattenAccounts(hierarchy);

  // Calculate summary by type
  const summaryByType = accounts.reduce((acc, account) => {
    if (!account.placeholder) {
      const type = account.type;
      if (!acc[type]) acc[type] = 0;
      acc[type] += account.balance;
    }
    return acc;
  }, {} as Record<string, number>);

  // Table rows
  const rows = flatAccounts.map(account => {
    const badge = accountTypeBadge[account.type] || { tone: 'info' as const, label: account.type };
    const indent = account.level * 20;

    return [
      <div key={account.id} style={{ paddingLeft: `${indent}px` }} className="flex items-center gap-2">
        {account.hasChildren ? (
          <Button
            icon={expandedAccounts.has(account.id) ? ChevronDownMinor : ChevronRightMinor}
            variant="plain"
            onClick={() => toggleExpand(account.id)}
            accessibilityLabel={expandedAccounts.has(account.id) ? 'Collapse' : 'Expand'}
          />
        ) : (
          <span className="w-7" />
        )}
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight={account.placeholder ? 'bold' : 'regular'}>
            {account.name}
          </Text>
          {account.description && (
            <Text as="span" variant="bodySm" tone="subdued">{account.description}</Text>
          )}
        </BlockStack>
      </div>,
      <Badge key={`type-${account.id}`} tone={badge.tone}>{badge.label}</Badge>,
      account.commodity,
      <Text key={`bal-${account.id}`} as="span" variant="bodyMd" fontWeight={account.placeholder ? 'bold' : 'regular'}>
        {formatCurrency(account.balance)}
      </Text>,
      account.balance !== account.reconciledBalance ? (
        <Text key={`rec-${account.id}`} as="span" tone="caution">
          {formatCurrency(account.reconciledBalance)}
        </Text>
      ) : (
        <Text key={`rec-${account.id}`} as="span" tone="success">
          {formatCurrency(account.reconciledBalance)}
        </Text>
      )
    ];
  });

  return (
    <BlockStack gap="400">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Assets</Text>
            <Text as="p" variant="headingLg" tone="success">
              {formatCurrency((summaryByType['ASSET'] || 0) + (summaryByType['BANK'] || 0) + (summaryByType['CASH'] || 0) + (summaryByType['RECEIVABLE'] || 0))}
            </Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Liabilities</Text>
            <Text as="p" variant="headingLg" tone="warning">
              {formatCurrency((summaryByType['LIABILITY'] || 0) + (summaryByType['PAYABLE'] || 0) + (summaryByType['CREDIT'] || 0))}
            </Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Equity</Text>
            <Text as="p" variant="headingLg">
              {formatCurrency(summaryByType['EQUITY'] || 0)}
            </Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Income</Text>
            <Text as="p" variant="headingLg" tone="success">
              {formatCurrency(summaryByType['INCOME'] || 0)}
            </Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Expenses</Text>
            <Text as="p" variant="headingLg" tone="critical">
              {formatCurrency(summaryByType['EXPENSE'] || 0)}
            </Text>
          </BlockStack>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <InlineStack gap="400">
          <div style={{ flex: 1 }}>
            <TextField
              label="Search accounts"
              value={searchValue}
              onChange={setSearchValue}
              placeholder="Search by name..."
              clearButton
              onClearButtonClick={() => setSearchValue('')}
              autoComplete="off"
            />
          </div>
          <div style={{ width: '200px' }}>
            <Select
              label="Account type"
              options={[
                { label: 'All Types', value: 'all' },
                { label: 'Asset', value: 'ASSET' },
                { label: 'Bank', value: 'BANK' },
                { label: 'Cash', value: 'CASH' },
                { label: 'Receivable', value: 'RECEIVABLE' },
                { label: 'Liability', value: 'LIABILITY' },
                { label: 'Payable', value: 'PAYABLE' },
                { label: 'Credit', value: 'CREDIT' },
                { label: 'Equity', value: 'EQUITY' },
                { label: 'Income', value: 'INCOME' },
                { label: 'Expense', value: 'EXPENSE' }
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
            />
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <Button onClick={() => setExpandedAccounts(new Set(accounts.map(a => a.id)))}>
              Expand All
            </Button>
          </div>
          <div style={{ alignSelf: 'flex-end' }}>
            <Button onClick={() => setExpandedAccounts(new Set())}>
              Collapse All
            </Button>
          </div>
        </InlineStack>
      </Card>

      {/* Chart of Accounts */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Chart of Accounts</Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {accounts.filter(a => !a.placeholder).length} accounts
            </Text>
          </InlineStack>
          <DataTable
            columnContentTypes={['text', 'text', 'text', 'numeric', 'numeric']}
            headings={['Account', 'Type', 'Currency', 'Balance', 'Reconciled']}
            rows={rows}
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
