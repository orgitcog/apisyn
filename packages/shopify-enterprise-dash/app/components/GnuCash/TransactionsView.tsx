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
  Button,
  Modal,
  FormLayout
} from '@shopify/polaris';
import type { GnuCashTransaction, GnuCashAccount } from '../../lib/gnucash';

interface TransactionsViewProps {
  transactions: GnuCashTransaction[];
  accounts: GnuCashAccount[];
}

export function TransactionsView({ transactions, accounts }: TransactionsViewProps) {
  const [searchValue, setSearchValue] = useState('');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [reconcileFilter, setReconcileFilter] = useState<string>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<GnuCashTransaction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getReconcileStatus = (state: 'n' | 'c' | 'y') => {
    switch (state) {
      case 'y': return { label: 'Reconciled', tone: 'success' as const };
      case 'c': return { label: 'Cleared', tone: 'info' as const };
      default: return { label: 'Not Reconciled', tone: 'attention' as const };
    }
  };

  // Filter transactions
  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = txn.description.toLowerCase().includes(searchValue.toLowerCase()) ||
      txn.num.toLowerCase().includes(searchValue.toLowerCase());
    const matchesAccount = accountFilter === 'all' ||
      txn.splits.some(s => s.accountId === accountFilter);
    const matchesReconcile = reconcileFilter === 'all' ||
      txn.splits.some(s => s.reconcileState === reconcileFilter);

    return matchesSearch && matchesAccount && matchesReconcile;
  });

  // Calculate summary
  const totalInflow = filteredTransactions.reduce((sum, txn) => {
    const inflow = txn.splits.filter(s => s.amount > 0).reduce((s, split) => s + split.amount, 0);
    return sum + inflow;
  }, 0);

  const totalOutflow = filteredTransactions.reduce((sum, txn) => {
    const outflow = txn.splits.filter(s => s.amount < 0).reduce((s, split) => s + Math.abs(split.amount), 0);
    return sum + outflow;
  }, 0);

  const handleViewTransaction = (txn: GnuCashTransaction) => {
    setSelectedTransaction(txn);
    setIsModalOpen(true);
  };

  // Account options for filter
  const accountOptions = [
    { label: 'All Accounts', value: 'all' },
    ...accounts
      .filter(a => !a.placeholder)
      .map(a => ({ label: a.fullName, value: a.id }))
  ];

  // Table rows
  const rows = filteredTransactions.map(txn => {
    const primarySplit = txn.splits[0];
    const otherSplits = txn.splits.slice(1);
    const reconcileStatus = getReconcileStatus(primarySplit.reconcileState);

    return [
      formatDate(txn.date),
      txn.num || '-',
      <BlockStack gap="050" key={txn.id}>
        <Text as="span" variant="bodyMd">{txn.description}</Text>
        <Text as="span" variant="bodySm" tone="subdued">
          {otherSplits.length > 0 ? otherSplits.map(s => s.accountName).join(', ') : primarySplit.accountName}
        </Text>
      </BlockStack>,
      primarySplit.amount > 0 ? formatCurrency(primarySplit.amount) : '-',
      primarySplit.amount < 0 ? formatCurrency(Math.abs(primarySplit.amount)) : '-',
      <Badge key={`rec-${txn.id}`} tone={reconcileStatus.tone}>{reconcileStatus.label}</Badge>,
      <Button key={`view-${txn.id}`} size="slim" onClick={() => handleViewTransaction(txn)}>
        View
      </Button>
    ];
  });

  return (
    <BlockStack gap="400">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Transactions</Text>
            <Text as="p" variant="headingLg">{filteredTransactions.length}</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Inflow</Text>
            <Text as="p" variant="headingLg" tone="success">{formatCurrency(totalInflow)}</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Outflow</Text>
            <Text as="p" variant="headingLg" tone="critical">{formatCurrency(totalOutflow)}</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Net Change</Text>
            <Text as="p" variant="headingLg" tone={totalInflow - totalOutflow >= 0 ? 'success' : 'critical'}>
              {formatCurrency(totalInflow - totalOutflow)}
            </Text>
          </BlockStack>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <TextField
            label="Search"
            value={searchValue}
            onChange={setSearchValue}
            placeholder="Description or reference..."
            clearButton
            onClearButtonClick={() => setSearchValue('')}
            autoComplete="off"
          />
          <Select
            label="Account"
            options={accountOptions}
            value={accountFilter}
            onChange={setAccountFilter}
          />
          <Select
            label="Status"
            options={[
              { label: 'All', value: 'all' },
              { label: 'Reconciled', value: 'y' },
              { label: 'Cleared', value: 'c' },
              { label: 'Not Reconciled', value: 'n' }
            ]}
            value={reconcileFilter}
            onChange={setReconcileFilter}
          />
          <div style={{ alignSelf: 'flex-end' }}>
            <Button variant="primary">New Transaction</Button>
          </div>
        </div>
      </Card>

      {/* Transactions Table */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Transaction Register</Text>
          <DataTable
            columnContentTypes={['text', 'text', 'text', 'numeric', 'numeric', 'text', 'text']}
            headings={['Date', 'Ref #', 'Description', 'Inflow', 'Outflow', 'Status', 'Actions']}
            rows={rows}
          />
        </BlockStack>
      </Card>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Transaction Details"
          primaryAction={{
            content: 'Close',
            onAction: () => setIsModalOpen(false)
          }}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Card>
                <FormLayout>
                  <FormLayout.Group>
                    <div>
                      <Text as="p" variant="bodySm" tone="subdued">Date</Text>
                      <Text as="p" variant="bodyMd">{formatDate(selectedTransaction.date)}</Text>
                    </div>
                    <div>
                      <Text as="p" variant="bodySm" tone="subdued">Reference</Text>
                      <Text as="p" variant="bodyMd">{selectedTransaction.num || '-'}</Text>
                    </div>
                  </FormLayout.Group>
                  <div>
                    <Text as="p" variant="bodySm" tone="subdued">Description</Text>
                    <Text as="p" variant="bodyMd">{selectedTransaction.description}</Text>
                  </div>
                  {selectedTransaction.notes && (
                    <div>
                      <Text as="p" variant="bodySm" tone="subdued">Notes</Text>
                      <Text as="p" variant="bodyMd">{selectedTransaction.notes}</Text>
                    </div>
                  )}
                </FormLayout>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h4" variant="headingMd">Splits</Text>
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'text']}
                    headings={['Account', 'Amount', 'Status']}
                    rows={selectedTransaction.splits.map(split => {
                      const status = getReconcileStatus(split.reconcileState);
                      return [
                        split.accountName,
                        <Text
                          key={split.id}
                          as="span"
                          tone={split.amount >= 0 ? 'success' : 'critical'}
                        >
                          {formatCurrency(split.amount)}
                        </Text>,
                        <Badge key={`s-${split.id}`} tone={status.tone}>{status.label}</Badge>
                      ];
                    })}
                  />
                  <InlineStack align="end">
                    <Badge tone={selectedTransaction.isBalanced ? 'success' : 'critical'}>
                      {selectedTransaction.isBalanced ? 'Balanced' : 'Unbalanced'}
                    </Badge>
                  </InlineStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </BlockStack>
  );
}
