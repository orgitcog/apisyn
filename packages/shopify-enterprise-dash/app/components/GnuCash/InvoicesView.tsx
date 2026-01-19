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
  Tabs,
  Modal,
  ProgressBar
} from '@shopify/polaris';
import type { GnuCashInvoice, GnuCashBill, GnuCashCustomer, GnuCashVendor } from '../../lib/gnucash';

interface InvoicesViewProps {
  invoices: GnuCashInvoice[];
  bills: GnuCashBill[];
  customers: GnuCashCustomer[];
  vendors: GnuCashVendor[];
}

export function InvoicesView({ invoices, bills, customers, vendors }: InvoicesViewProps) {
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<GnuCashInvoice | null>(null);
  const [selectedBill, setSelectedBill] = useState<GnuCashBill | null>(null);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid': return { tone: 'success' as const, label: 'Paid' };
      case 'posted': return { tone: 'info' as const, label: 'Posted' };
      case 'draft': return { tone: 'attention' as const, label: 'Draft' };
      case 'overdue': return { tone: 'critical' as const, label: 'Overdue' };
      default: return { tone: 'info' as const, label: status };
    }
  };

  const tabs = [
    { id: 'invoices', content: `Invoices (${invoices.length})` },
    { id: 'bills', content: `Bills (${bills.length})` },
    { id: 'customers', content: `Customers (${customers.length})` },
    { id: 'vendors', content: `Vendors (${vendors.length})` }
  ];

  // Filter invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = inv.invoiceNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter bills
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.billNumber.toLowerCase().includes(searchValue.toLowerCase()) ||
      bill.vendorName.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate summaries
  const invoiceSummary = {
    total: invoices.reduce((sum, inv) => sum + inv.totalAmount, 0),
    paid: invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amountPaid, 0),
    outstanding: invoices.reduce((sum, inv) => sum + inv.amountDue, 0),
    overdue: invoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amountDue, 0)
  };

  const billSummary = {
    total: bills.reduce((sum, bill) => sum + bill.totalAmount, 0),
    paid: bills.filter(bill => bill.status === 'paid').reduce((sum, bill) => sum + bill.amountPaid, 0),
    outstanding: bills.reduce((sum, bill) => sum + bill.amountDue, 0)
  };

  // Invoice rows
  const invoiceRows = filteredInvoices.map(inv => {
    const status = getStatusBadge(inv.status);
    const paidPercentage = inv.totalAmount > 0 ? (inv.amountPaid / inv.totalAmount) * 100 : 0;

    return [
      inv.invoiceNumber,
      inv.customerName,
      formatDate(inv.dateOpened),
      formatDate(inv.dateDue),
      formatCurrency(inv.totalAmount),
      <div key={`progress-${inv.id}`} className="w-24">
        <ProgressBar progress={paidPercentage} size="small" tone={paidPercentage === 100 ? 'success' : 'primary'} />
        <Text as="span" variant="bodySm">{formatCurrency(inv.amountDue)} due</Text>
      </div>,
      <Badge key={`status-${inv.id}`} tone={status.tone}>{status.label}</Badge>,
      <Button key={`view-${inv.id}`} size="slim" onClick={() => { setSelectedInvoice(inv); setIsModalOpen(true); }}>
        View
      </Button>
    ];
  });

  // Bill rows
  const billRows = filteredBills.map(bill => {
    const status = getStatusBadge(bill.status);
    const paidPercentage = bill.totalAmount > 0 ? (bill.amountPaid / bill.totalAmount) * 100 : 0;

    return [
      bill.billNumber,
      bill.vendorName,
      formatDate(bill.dateOpened),
      formatDate(bill.dateDue),
      formatCurrency(bill.totalAmount),
      <div key={`progress-${bill.id}`} className="w-24">
        <ProgressBar progress={paidPercentage} size="small" tone={paidPercentage === 100 ? 'success' : 'primary'} />
        <Text as="span" variant="bodySm">{formatCurrency(bill.amountDue)} due</Text>
      </div>,
      <Badge key={`status-${bill.id}`} tone={status.tone}>{status.label}</Badge>,
      <Button key={`view-${bill.id}`} size="slim" onClick={() => { setSelectedBill(bill); setIsModalOpen(true); }}>
        View
      </Button>
    ];
  });

  // Customer rows
  const customerRows = customers.map(cust => [
    cust.name,
    cust.email,
    cust.phone,
    formatCurrency(cust.balance),
    formatCurrency(cust.creditLimit),
    cust.terms,
    <Badge key={`active-${cust.id}`} tone={cust.active ? 'success' : 'critical'}>
      {cust.active ? 'Active' : 'Inactive'}
    </Badge>
  ]);

  // Vendor rows
  const vendorRows = vendors.map(vend => [
    vend.name,
    vend.email,
    vend.phone,
    formatCurrency(vend.balance),
    vend.terms,
    <Badge key={`active-${vend.id}`} tone={vend.active ? 'success' : 'critical'}>
      {vend.active ? 'Active' : 'Inactive'}
    </Badge>
  ]);

  return (
    <BlockStack gap="400">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Receivables</Text>
            <Text as="p" variant="headingLg" tone="success">{formatCurrency(invoiceSummary.outstanding)}</Text>
            <Text as="p" variant="bodySm" tone="subdued">{invoices.filter(i => i.amountDue > 0).length} open invoices</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Overdue</Text>
            <Text as="p" variant="headingLg" tone="critical">{formatCurrency(invoiceSummary.overdue)}</Text>
            <Text as="p" variant="bodySm" tone="subdued">{invoices.filter(i => i.status === 'overdue').length} overdue</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Payables</Text>
            <Text as="p" variant="headingLg" tone="warning">{formatCurrency(billSummary.outstanding)}</Text>
            <Text as="p" variant="bodySm" tone="subdued">{bills.filter(b => b.amountDue > 0).length} open bills</Text>
          </BlockStack>
        </Card>
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Net Position</Text>
            <Text as="p" variant="headingLg" tone={invoiceSummary.outstanding - billSummary.outstanding >= 0 ? 'success' : 'critical'}>
              {formatCurrency(invoiceSummary.outstanding - billSummary.outstanding)}
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">Receivables - Payables</Text>
          </BlockStack>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <BlockStack gap="400">
          <Tabs tabs={tabs} selected={selectedTab} onSelect={setSelectedTab} />

          {/* Filters (for invoices/bills tabs) */}
          {(selectedTab === 0 || selectedTab === 1) && (
            <InlineStack gap="400">
              <div style={{ flex: 1 }}>
                <TextField
                  label="Search"
                  value={searchValue}
                  onChange={setSearchValue}
                  placeholder={selectedTab === 0 ? "Invoice # or customer..." : "Bill # or vendor..."}
                  clearButton
                  onClearButtonClick={() => setSearchValue('')}
                  autoComplete="off"
                />
              </div>
              <div style={{ width: '200px' }}>
                <Select
                  label="Status"
                  options={[
                    { label: 'All Status', value: 'all' },
                    { label: 'Draft', value: 'draft' },
                    { label: 'Posted', value: 'posted' },
                    { label: 'Paid', value: 'paid' },
                    { label: 'Overdue', value: 'overdue' }
                  ]}
                  value={statusFilter}
                  onChange={setStatusFilter}
                />
              </div>
              <div style={{ alignSelf: 'flex-end' }}>
                <Button variant="primary">
                  {selectedTab === 0 ? 'New Invoice' : 'New Bill'}
                </Button>
              </div>
            </InlineStack>
          )}

          {/* Invoices Table */}
          {selectedTab === 0 && (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'numeric', 'text', 'text', 'text']}
              headings={['Invoice #', 'Customer', 'Date', 'Due Date', 'Amount', 'Payment', 'Status', 'Actions']}
              rows={invoiceRows}
            />
          )}

          {/* Bills Table */}
          {selectedTab === 1 && (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'numeric', 'text', 'text', 'text']}
              headings={['Bill #', 'Vendor', 'Date', 'Due Date', 'Amount', 'Payment', 'Status', 'Actions']}
              rows={billRows}
            />
          )}

          {/* Customers Table */}
          {selectedTab === 2 && (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'numeric', 'numeric', 'text', 'text']}
              headings={['Name', 'Email', 'Phone', 'Balance', 'Credit Limit', 'Terms', 'Status']}
              rows={customerRows}
            />
          )}

          {/* Vendors Table */}
          {selectedTab === 3 && (
            <DataTable
              columnContentTypes={['text', 'text', 'text', 'numeric', 'text', 'text']}
              headings={['Name', 'Email', 'Phone', 'Balance', 'Terms', 'Status']}
              rows={vendorRows}
            />
          )}
        </BlockStack>
      </Card>

      {/* Invoice/Bill Detail Modal */}
      {(selectedInvoice || selectedBill) && (
        <Modal
          open={isModalOpen}
          onClose={() => { setIsModalOpen(false); setSelectedInvoice(null); setSelectedBill(null); }}
          title={selectedInvoice ? `Invoice ${selectedInvoice.invoiceNumber}` : `Bill ${selectedBill?.billNumber}`}
          primaryAction={{
            content: 'Close',
            onAction: () => { setIsModalOpen(false); setSelectedInvoice(null); setSelectedBill(null); }
          }}
          secondaryActions={[
            { content: 'Record Payment', onAction: () => console.log('Record payment') }
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              <Card>
                <InlineStack align="space-between">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">
                      {selectedInvoice ? 'Customer' : 'Vendor'}
                    </Text>
                    <Text as="p" variant="bodyMd" fontWeight="semibold">
                      {selectedInvoice?.customerName || selectedBill?.vendorName}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">Status</Text>
                    <Badge tone={getStatusBadge(selectedInvoice?.status || selectedBill?.status || '').tone}>
                      {getStatusBadge(selectedInvoice?.status || selectedBill?.status || '').label}
                    </Badge>
                  </BlockStack>
                </InlineStack>
              </Card>

              <Card>
                <BlockStack gap="300">
                  <Text as="h4" variant="headingMd">Line Items</Text>
                  <DataTable
                    columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric']}
                    headings={['Description', 'Qty', 'Unit Price', 'Tax', 'Total']}
                    rows={(selectedInvoice?.entries || selectedBill?.entries || []).map(entry => [
                      entry.description,
                      entry.quantity.toString(),
                      formatCurrency(entry.unitPrice),
                      formatCurrency(entry.taxAmount),
                      formatCurrency(entry.total)
                    ])}
                    totals={[
                      'Total',
                      '',
                      '',
                      '',
                      formatCurrency(selectedInvoice?.totalAmount || selectedBill?.totalAmount || 0)
                    ]}
                  />
                </BlockStack>
              </Card>

              <Card>
                <InlineStack align="space-between">
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">Amount Paid</Text>
                    <Text as="p" variant="headingMd" tone="success">
                      {formatCurrency(selectedInvoice?.amountPaid || selectedBill?.amountPaid || 0)}
                    </Text>
                  </BlockStack>
                  <BlockStack gap="100">
                    <Text as="p" variant="bodySm" tone="subdued">Amount Due</Text>
                    <Text as="p" variant="headingMd" tone="critical">
                      {formatCurrency(selectedInvoice?.amountDue || selectedBill?.amountDue || 0)}
                    </Text>
                  </BlockStack>
                </InlineStack>
              </Card>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </BlockStack>
  );
}
