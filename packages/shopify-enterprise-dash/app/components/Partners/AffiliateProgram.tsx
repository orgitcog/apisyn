import React, { useState, useCallback } from 'react';
import {
  Card,
  DataTable,
  Badge,
  BlockStack,
  InlineStack,
  Text,
  TextField,
  Button,
  Modal,
  FormLayout,
  Select,
  Banner,
  Tooltip,
  Icon
} from '@shopify/polaris';
import { ClipboardMinor, LinkMinor } from '@shopify/polaris-icons';
import type { AffiliateLink, Referral, Partner } from './types';

interface AffiliateProgramProps {
  affiliateLinks: AffiliateLink[];
  referrals: Referral[];
  partners: Partner[];
  onCreateLink?: (partnerId: string, code: string) => void;
}

export function AffiliateProgram({ affiliateLinks, referrals, partners, onCreateLink }: AffiliateProgramProps) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newLinkPartnerId, setNewLinkPartnerId] = useState('');
  const [newLinkCode, setNewLinkCode] = useState('');
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getPartnerName = (partnerId: string) => {
    const partner = partners.find(p => p.id === partnerId);
    return partner?.company || 'Unknown Partner';
  };

  const handleCopyLink = useCallback((linkId: string, code: string) => {
    const fullUrl = `https://yourstore.com/signup?ref=${code}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLinkId(linkId);
    setTimeout(() => setCopiedLinkId(null), 2000);
  }, []);

  const handleCreateLink = () => {
    if (onCreateLink && newLinkPartnerId && newLinkCode) {
      onCreateLink(newLinkPartnerId, newLinkCode);
    }
    setIsCreateModalOpen(false);
    setNewLinkPartnerId('');
    setNewLinkCode('');
  };

  // Calculate summary metrics
  const totalClicks = affiliateLinks.reduce((sum, link) => sum + link.clicks, 0);
  const totalConversions = affiliateLinks.reduce((sum, link) => sum + link.conversions, 0);
  const totalRevenue = affiliateLinks.reduce((sum, link) => sum + link.revenue, 0);
  const overallConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

  // Filter referrals
  const filteredReferrals = statusFilter === 'all'
    ? referrals
    : referrals.filter(r => r.status === statusFilter);

  // Affiliate link rows
  const linkRows = affiliateLinks.map(link => {
    const conversionRate = link.clicks > 0 ? (link.conversions / link.clicks) * 100 : 0;

    return [
      <InlineStack gap="200" align="start" blockAlign="center" key={link.id}>
        <Icon source={LinkMinor} tone="subdued" />
        <BlockStack gap="050">
          <Text as="span" variant="bodyMd" fontWeight="semibold">{link.code}</Text>
          <Text as="span" variant="bodySm" tone="subdued">{getPartnerName(link.partnerId)}</Text>
        </BlockStack>
      </InlineStack>,
      link.clicks.toLocaleString(),
      link.conversions.toLocaleString(),
      `${conversionRate.toFixed(1)}%`,
      formatCurrency(link.revenue),
      <Badge key={`status-${link.id}`} tone={link.isActive ? 'success' : 'critical'}>
        {link.isActive ? 'Active' : 'Inactive'}
      </Badge>,
      <InlineStack gap="200" key={`actions-${link.id}`}>
        <Tooltip content={copiedLinkId === link.id ? 'Copied!' : 'Copy link'}>
          <Button
            icon={ClipboardMinor}
            size="slim"
            onClick={() => handleCopyLink(link.id, link.code)}
          />
        </Tooltip>
      </InlineStack>
    ];
  });

  // Referral rows
  const referralRows = filteredReferrals.slice(0, 15).map(referral => [
    <BlockStack gap="050" key={referral.id}>
      <Text as="span" variant="bodyMd">{referral.customerName}</Text>
      <Text as="span" variant="bodySm" tone="subdued">{referral.customerEmail}</Text>
    </BlockStack>,
    getPartnerName(referral.partnerId),
    formatDate(referral.createdAt),
    <Badge key={`status-${referral.id}`} tone={
      referral.status === 'converted' ? 'success' :
      referral.status === 'qualified' ? 'info' :
      referral.status === 'pending' ? 'attention' : 'critical'
    }>
      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
    </Badge>,
    referral.status === 'converted' ? formatCurrency(referral.revenue) : '-',
    referral.status === 'converted' ? formatCurrency(referral.commission) : '-'
  ]);

  // Partner options for dropdown
  const partnerOptions = [
    { label: 'Select a partner', value: '' },
    ...partners
      .filter(p => p.status === 'active' && (p.type === 'affiliate' || p.type === 'reseller'))
      .map(p => ({ label: p.company, value: p.id }))
  ];

  return (
    <BlockStack gap="400">
      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Clicks</Text>
            <Text as="p" variant="headingXl">{totalClicks.toLocaleString()}</Text>
            <Badge tone="info">All affiliate links</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Total Conversions</Text>
            <Text as="p" variant="headingXl">{totalConversions.toLocaleString()}</Text>
            <Badge tone="success">{overallConversionRate.toFixed(1)}% rate</Badge>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Affiliate Revenue</Text>
            <Text as="p" variant="headingXl">{formatCurrency(totalRevenue)}</Text>
            <Text as="span" variant="bodySm" tone="subdued">
              ${(totalRevenue / Math.max(totalConversions, 1)).toFixed(0)} avg order
            </Text>
          </BlockStack>
        </Card>

        <Card>
          <BlockStack gap="200">
            <Text as="p" variant="bodySm" tone="subdued">Active Links</Text>
            <Text as="p" variant="headingXl">{affiliateLinks.filter(l => l.isActive).length}</Text>
            <Text as="span" variant="bodySm" tone="subdued">
              of {affiliateLinks.length} total
            </Text>
          </BlockStack>
        </Card>
      </div>

      {/* Program Info Banner */}
      <Banner title="Affiliate Program" tone="info">
        <p>Partners earn commission on every successful referral. Standard commission rates range from 10-20% based on partner tier.</p>
      </Banner>

      {/* Affiliate Links */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Affiliate Links</Text>
            <Button onClick={() => setIsCreateModalOpen(true)}>Create New Link</Button>
          </InlineStack>
          <DataTable
            columnContentTypes={['text', 'numeric', 'numeric', 'numeric', 'numeric', 'text', 'text']}
            headings={['Link Code', 'Clicks', 'Conversions', 'Conv. Rate', 'Revenue', 'Status', 'Actions']}
            rows={linkRows}
          />
        </BlockStack>
      </Card>

      {/* Recent Referrals */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Recent Referrals</Text>
            <Select
              label="Status"
              labelHidden
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Pending', value: 'pending' },
                { label: 'Qualified', value: 'qualified' },
                { label: 'Converted', value: 'converted' },
                { label: 'Rejected', value: 'rejected' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </InlineStack>
          <DataTable
            columnContentTypes={['text', 'text', 'text', 'text', 'numeric', 'numeric']}
            headings={['Customer', 'Referred By', 'Date', 'Status', 'Revenue', 'Commission']}
            rows={referralRows}
          />
          {filteredReferrals.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No referrals match the selected filter
            </div>
          )}
        </BlockStack>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Referral Conversion Funnel</Text>
          <div className="space-y-3">
            {[
              { stage: 'Link Clicks', count: totalClicks, percentage: 100 },
              { stage: 'Referrals Created', count: referrals.length, percentage: (referrals.length / totalClicks) * 100 },
              { stage: 'Qualified Leads', count: referrals.filter(r => r.status === 'qualified' || r.status === 'converted').length, percentage: (referrals.filter(r => r.status === 'qualified' || r.status === 'converted').length / totalClicks) * 100 },
              { stage: 'Converted', count: totalConversions, percentage: overallConversionRate }
            ].map((stage, index) => (
              <div key={index}>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd" fontWeight="semibold">{stage.stage}</Text>
                  <Text as="span" variant="bodyMd">{stage.count.toLocaleString()}</Text>
                </InlineStack>
                <div className="mt-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${Math.max(stage.percentage, 5)}%` }}
                  >
                    {stage.percentage > 10 && (
                      <Text as="span" variant="bodySm" fontWeight="semibold">
                        {stage.percentage.toFixed(1)}%
                      </Text>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </BlockStack>
      </Card>

      {/* Create Link Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Affiliate Link"
        primaryAction={{
          content: 'Create Link',
          onAction: handleCreateLink,
          disabled: !newLinkPartnerId || !newLinkCode
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setIsCreateModalOpen(false)
          }
        ]}
      >
        <Modal.Section>
          <FormLayout>
            <Select
              label="Partner"
              options={partnerOptions}
              value={newLinkPartnerId}
              onChange={setNewLinkPartnerId}
              helpText="Only active affiliate and reseller partners are shown"
            />
            <TextField
              label="Link Code"
              value={newLinkCode}
              onChange={setNewLinkCode}
              placeholder="e.g., PARTNER2024"
              helpText="This will be used in the referral URL: /signup?ref=CODE"
              autoComplete="off"
            />
            {newLinkCode && (
              <Banner tone="info">
                <p>Preview URL: https://yourstore.com/signup?ref={newLinkCode.toUpperCase()}</p>
              </Banner>
            )}
          </FormLayout>
        </Modal.Section>
      </Modal>
    </BlockStack>
  );
}
