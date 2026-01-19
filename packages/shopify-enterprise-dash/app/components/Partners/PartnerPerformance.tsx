import React, { useState } from 'react';
import {
  Card,
  DataTable,
  Badge,
  BlockStack,
  InlineStack,
  Text,
  Select,
  ProgressBar
} from '@shopify/polaris';
import type { Partner, Commission } from './types';

interface PartnerPerformanceProps {
  partners: Partner[];
  commissions: Commission[];
}

export function PartnerPerformance({ partners, commissions }: PartnerPerformanceProps) {
  const [sortBy, setSortBy] = useState<'revenue' | 'referrals' | 'commission'>('revenue');
  const [period, setPeriod] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  // Sort partners based on selection
  const sortedPartners = [...partners]
    .filter(p => p.status === 'active')
    .sort((a, b) => {
      switch (sortBy) {
        case 'revenue':
          return b.totalRevenue - a.totalRevenue;
        case 'referrals':
          return b.totalReferrals - a.totalReferrals;
        case 'commission':
          return (b.paidCommission + b.pendingCommission) - (a.paidCommission + a.pendingCommission);
        default:
          return 0;
      }
    });

  const topPartner = sortedPartners[0];
  const maxRevenue = topPartner?.totalRevenue || 1;

  // Calculate aggregate metrics
  const totalRevenue = partners.reduce((sum, p) => sum + p.totalRevenue, 0);
  const totalReferrals = partners.reduce((sum, p) => sum + p.totalReferrals, 0);
  const _avgConversionRate = partners.length > 0
    ? (partners.filter(p => p.totalReferrals > 0).reduce((sum, p) => {
        const conversionRate = (p.totalRevenue / p.totalReferrals) > 0 ? 1 : 0;
        return sum + conversionRate;
      }, 0) / partners.filter(p => p.totalReferrals > 0).length) * 100
    : 0;

  // Commission status breakdown
  const pendingCommissions = commissions.filter(c => c.status === 'pending');
  const approvedCommissions = commissions.filter(c => c.status === 'approved');
  const paidCommissions = commissions.filter(c => c.status === 'paid');

  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalApproved = approvedCommissions.reduce((sum, c) => sum + c.amount, 0);
  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.amount, 0);

  // Leaderboard rows
  const leaderboardRows = sortedPartners.slice(0, 10).map((partner, index) => {
    const revenuePercentage = (partner.totalRevenue / maxRevenue) * 100;

    return [
      <InlineStack gap="200" align="start" blockAlign="center" key={partner.id}>
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          index === 0 ? 'bg-yellow-400 text-yellow-900' :
          index === 1 ? 'bg-gray-300 text-gray-700' :
          index === 2 ? 'bg-orange-400 text-orange-900' :
          'bg-gray-100 text-gray-600'
        }`}>
          {index + 1}
        </div>
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">{partner.company}</Text>
          <Text as="span" variant="bodySm" tone="subdued">{partner.name}</Text>
        </BlockStack>
      </InlineStack>,
      <Badge key={`tier-${partner.id}`} tone={
        partner.tier === 'platinum' ? 'success' :
        partner.tier === 'gold' ? 'attention' :
        partner.tier === 'silver' ? 'info' : 'warning'
      }>
        {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
      </Badge>,
      partner.totalReferrals.toString(),
      formatCurrency(partner.totalRevenue),
      <div key={`bar-${partner.id}`} className="w-32">
        <ProgressBar progress={revenuePercentage} size="small" tone="success" />
      </div>,
      formatCurrency(partner.paidCommission + partner.pendingCommission)
    ];
  });

  // Commission breakdown rows
  const commissionRows = commissions.slice(0, 8).map(commission => [
    commission.partnerName,
    commission.period,
    formatCurrency(commission.amount),
    commission.referralCount.toString(),
    <Badge key={`status-${commission.id}`} tone={
      commission.status === 'paid' ? 'success' :
      commission.status === 'approved' ? 'info' :
      commission.status === 'pending' ? 'attention' : 'critical'
    }>
      {commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}
    </Badge>,
    commission.payoutDate || '-'
  ]);

  return (
    <BlockStack gap="400">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Partner Revenue</Text>
            <Text as="p" variant="headingXl">{formatCurrency(totalRevenue)}</Text>
            <Badge tone="success">All time</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Referrals</Text>
            <Text as="p" variant="headingXl">{totalReferrals.toLocaleString()}</Text>
            <Text as="span" variant="bodySm" tone="subdued">
              ${(totalRevenue / totalReferrals).toFixed(2)} avg value
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Active Partners</Text>
            <Text as="p" variant="headingXl">{partners.filter(p => p.status === 'active').length}</Text>
            <Text as="span" variant="bodySm" tone="subdued">
              of {partners.length} total
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Avg Revenue/Partner</Text>
            <Text as="p" variant="headingXl">
              {formatCurrency(partners.length > 0 ? totalRevenue / partners.length : 0)}
            </Text>
            <Badge tone="info">Per partner</Badge>
          </BlockStack>
        </Card>
      </div>

      {/* Commission Pipeline */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Commission Pipeline</Text>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border-l-4 border-yellow-400 bg-yellow-50 rounded">
              <Text as="p" variant="headingLg">{formatCurrency(totalPending)}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Pending Review</Text>
              <Text as="p" variant="bodySm">{pendingCommissions.length} payouts</Text>
            </div>
            <div className="p-4 border-l-4 border-blue-400 bg-blue-50 rounded">
              <Text as="p" variant="headingLg">{formatCurrency(totalApproved)}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Approved - Awaiting Payout</Text>
              <Text as="p" variant="bodySm">{approvedCommissions.length} payouts</Text>
            </div>
            <div className="p-4 border-l-4 border-green-400 bg-green-50 rounded">
              <Text as="p" variant="headingLg">{formatCurrency(totalPaid)}</Text>
              <Text as="p" variant="bodySm" tone="subdued">Paid Out</Text>
              <Text as="p" variant="bodySm">{paidCommissions.length} payouts</Text>
            </div>
          </div>
        </BlockStack>
      </Card>

      {/* Partner Leaderboard */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Partner Leaderboard</Text>
            <InlineStack gap="200">
              <Select
                label="Sort by"
                labelHidden
                options={[
                  { label: 'Revenue', value: 'revenue' },
                  { label: 'Referrals', value: 'referrals' },
                  { label: 'Commission', value: 'commission' }
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as 'revenue' | 'referrals' | 'commission')}
              />
              <Select
                label="Period"
                labelHidden
                options={[
                  { label: 'All Time', value: 'all' },
                  { label: 'This Month', value: 'month' },
                  { label: 'This Quarter', value: 'quarter' },
                  { label: 'This Year', value: 'year' }
                ]}
                value={period}
                onChange={setPeriod}
              />
            </InlineStack>
          </InlineStack>
          <DataTable
            columnContentTypes={['text', 'text', 'numeric', 'numeric', 'text', 'numeric']}
            headings={['Partner', 'Tier', 'Referrals', 'Revenue', 'Performance', 'Commission']}
            rows={leaderboardRows}
          />
        </BlockStack>
      </Card>

      {/* Commission Details */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Recent Commission Activity</Text>
          <DataTable
            columnContentTypes={['text', 'text', 'numeric', 'numeric', 'text', 'text']}
            headings={['Partner', 'Period', 'Amount', 'Referrals', 'Status', 'Payout Date']}
            rows={commissionRows}
          />
        </BlockStack>
      </Card>
    </BlockStack>
  );
}
