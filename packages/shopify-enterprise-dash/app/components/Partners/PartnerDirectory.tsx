import React, { useState, useCallback } from 'react';
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
  Avatar,
  Modal,
  FormLayout
} from '@shopify/polaris';
import type { Partner, PartnerType, PartnerTier, PartnerStatus } from './types';

interface PartnerDirectoryProps {
  partners: Partner[];
  onPartnerUpdate?: (partner: Partner) => void;
}

const tierBadgeTone: Record<PartnerTier, 'success' | 'info' | 'attention' | 'warning'> = {
  platinum: 'success',
  gold: 'attention',
  silver: 'info',
  bronze: 'warning'
};

const statusBadgeTone: Record<PartnerStatus, 'success' | 'info' | 'attention' | 'critical'> = {
  active: 'success',
  inactive: 'critical',
  pending: 'attention',
  suspended: 'critical'
};

const typeLabels: Record<PartnerType, string> = {
  agency: 'Agency',
  integrator: 'Integrator',
  reseller: 'Reseller',
  developer: 'Developer',
  affiliate: 'Affiliate'
};

export function PartnerDirectory({ partners, onPartnerUpdate }: PartnerDirectoryProps) {
  const [searchValue, setSearchValue] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSearchChange = useCallback((value: string) => setSearchValue(value), []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Filter partners
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      partner.company.toLowerCase().includes(searchValue.toLowerCase()) ||
      partner.email.toLowerCase().includes(searchValue.toLowerCase());
    const matchesType = typeFilter === 'all' || partner.type === typeFilter;
    const matchesTier = tierFilter === 'all' || partner.tier === tierFilter;
    const matchesStatus = statusFilter === 'all' || partner.status === statusFilter;

    return matchesSearch && matchesType && matchesTier && matchesStatus;
  });

  const handleViewPartner = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsModalOpen(true);
  };

  const handleUpdateStatus = (newStatus: PartnerStatus) => {
    if (selectedPartner && onPartnerUpdate) {
      onPartnerUpdate({ ...selectedPartner, status: newStatus });
    }
    setIsModalOpen(false);
  };

  // Format table rows
  const rows = filteredPartners.map(partner => [
    <InlineStack gap="300" align="start" blockAlign="center" key={partner.id}>
      <Avatar customer name={partner.name} size="sm" />
      <BlockStack gap="050">
        <Text as="span" variant="bodyMd" fontWeight="semibold">{partner.name}</Text>
        <Text as="span" variant="bodySm" tone="subdued">{partner.company}</Text>
      </BlockStack>
    </InlineStack>,
    <Badge key={`type-${partner.id}`} tone="info">{typeLabels[partner.type]}</Badge>,
    <Badge key={`tier-${partner.id}`} tone={tierBadgeTone[partner.tier]}>
      {partner.tier.charAt(0).toUpperCase() + partner.tier.slice(1)}
    </Badge>,
    <Badge key={`status-${partner.id}`} tone={statusBadgeTone[partner.status]}>
      {partner.status.charAt(0).toUpperCase() + partner.status.slice(1)}
    </Badge>,
    partner.region,
    formatCurrency(partner.totalRevenue),
    `${partner.commissionRate}%`,
    <Button key={`view-${partner.id}`} size="slim" onClick={() => handleViewPartner(partner)}>
      View
    </Button>
  ]);

  return (
    <BlockStack gap="400">
      {/* Filters */}
      <Card>
        <BlockStack gap="400">
          <Text as="h3" variant="headingMd">Filter Partners</Text>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <TextField
              label="Search"
              value={searchValue}
              onChange={handleSearchChange}
              placeholder="Name, company, or email"
              clearButton
              onClearButtonClick={() => setSearchValue('')}
              autoComplete="off"
            />
            <Select
              label="Partner Type"
              options={[
                { label: 'All Types', value: 'all' },
                { label: 'Agency', value: 'agency' },
                { label: 'Integrator', value: 'integrator' },
                { label: 'Reseller', value: 'reseller' },
                { label: 'Developer', value: 'developer' },
                { label: 'Affiliate', value: 'affiliate' }
              ]}
              value={typeFilter}
              onChange={setTypeFilter}
            />
            <Select
              label="Tier"
              options={[
                { label: 'All Tiers', value: 'all' },
                { label: 'Platinum', value: 'platinum' },
                { label: 'Gold', value: 'gold' },
                { label: 'Silver', value: 'silver' },
                { label: 'Bronze', value: 'bronze' }
              ]}
              value={tierFilter}
              onChange={setTierFilter}
            />
            <Select
              label="Status"
              options={[
                { label: 'All Status', value: 'all' },
                { label: 'Active', value: 'active' },
                { label: 'Inactive', value: 'inactive' },
                { label: 'Pending', value: 'pending' },
                { label: 'Suspended', value: 'suspended' }
              ]}
              value={statusFilter}
              onChange={setStatusFilter}
            />
          </div>
        </BlockStack>
      </Card>

      {/* Partner List */}
      <Card>
        <BlockStack gap="400">
          <InlineStack align="space-between">
            <Text as="h3" variant="headingMd">Partner Directory</Text>
            <Text as="span" variant="bodySm" tone="subdued">
              {filteredPartners.length} of {partners.length} partners
            </Text>
          </InlineStack>
          <DataTable
            columnContentTypes={['text', 'text', 'text', 'text', 'text', 'numeric', 'numeric', 'text']}
            headings={['Partner', 'Type', 'Tier', 'Status', 'Region', 'Revenue', 'Commission', 'Actions']}
            rows={rows}
          />
        </BlockStack>
      </Card>

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <Modal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={`Partner Details: ${selectedPartner.company}`}
          primaryAction={{
            content: 'Close',
            onAction: () => setIsModalOpen(false)
          }}
          secondaryActions={[
            {
              content: selectedPartner.status === 'active' ? 'Suspend' : 'Activate',
              destructive: selectedPartner.status === 'active',
              onAction: () => handleUpdateStatus(selectedPartner.status === 'active' ? 'suspended' : 'active')
            }
          ]}
        >
          <Modal.Section>
            <BlockStack gap="400">
              {/* Contact Info */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h4" variant="headingMd">Contact Information</Text>
                  <FormLayout>
                    <FormLayout.Group>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Contact Name</Text>
                        <Text as="p" variant="bodyMd">{selectedPartner.name}</Text>
                      </div>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Email</Text>
                        <Text as="p" variant="bodyMd">{selectedPartner.email}</Text>
                      </div>
                    </FormLayout.Group>
                    <FormLayout.Group>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Phone</Text>
                        <Text as="p" variant="bodyMd">{selectedPartner.phone}</Text>
                      </div>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Website</Text>
                        <Text as="p" variant="bodyMd">{selectedPartner.website || 'N/A'}</Text>
                      </div>
                    </FormLayout.Group>
                  </FormLayout>
                </BlockStack>
              </Card>

              {/* Partner Details */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h4" variant="headingMd">Partnership Details</Text>
                  <FormLayout>
                    <FormLayout.Group>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Partner Type</Text>
                        <Badge tone="info">{typeLabels[selectedPartner.type]}</Badge>
                      </div>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Tier</Text>
                        <Badge tone={tierBadgeTone[selectedPartner.tier]}>
                          {selectedPartner.tier.charAt(0).toUpperCase() + selectedPartner.tier.slice(1)}
                        </Badge>
                      </div>
                    </FormLayout.Group>
                    <FormLayout.Group>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Region</Text>
                        <Text as="p" variant="bodyMd">{selectedPartner.region}</Text>
                      </div>
                      <div>
                        <Text as="p" variant="bodySm" tone="subdued">Commission Rate</Text>
                        <Text as="p" variant="bodyMd">{selectedPartner.commissionRate}%</Text>
                      </div>
                    </FormLayout.Group>
                    <div>
                      <Text as="p" variant="bodySm" tone="subdued">Specialties</Text>
                      <InlineStack gap="200">
                        {selectedPartner.specialties.map((specialty, i) => (
                          <Badge key={i}>{specialty}</Badge>
                        ))}
                      </InlineStack>
                    </div>
                  </FormLayout>
                </BlockStack>
              </Card>

              {/* Performance Metrics */}
              <Card>
                <BlockStack gap="300">
                  <Text as="h4" variant="headingMd">Performance Metrics</Text>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Text as="p" variant="headingLg">{selectedPartner.totalReferrals}</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Total Referrals</Text>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Text as="p" variant="headingLg">{formatCurrency(selectedPartner.totalRevenue)}</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Total Revenue</Text>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Text as="p" variant="headingLg">{formatCurrency(selectedPartner.paidCommission)}</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Paid Commission</Text>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <Text as="p" variant="headingLg">{formatCurrency(selectedPartner.pendingCommission)}</Text>
                      <Text as="p" variant="bodySm" tone="subdued">Pending</Text>
                    </div>
                  </div>
                </BlockStack>
              </Card>

              {/* Dates */}
              <InlineStack align="space-between">
                <Text as="span" variant="bodySm" tone="subdued">
                  Joined: {formatDate(selectedPartner.joinedAt)}
                </Text>
                <Text as="span" variant="bodySm" tone="subdued">
                  Last Active: {formatDate(selectedPartner.lastActiveAt)}
                </Text>
              </InlineStack>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </BlockStack>
  );
}
