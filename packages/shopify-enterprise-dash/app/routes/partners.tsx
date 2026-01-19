import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState, useCallback } from 'react';
import { Page, Card, Tabs, Button, ButtonGroup, Banner, InlineStack, Badge } from '@shopify/polaris';
import {
  PartnerDashboard,
  PartnerDirectory,
  PartnerPerformance,
  AffiliateProgram,
  PartnerAnalytics,
  TransactionTracker,
  generateMockPartners,
  generateMockDashboardData,
  generateMockAffiliateLinks,
  generateMockReferrals,
  generateMockCommissions,
  generateMockApplications
} from '../components/Partners';

// Extend Window interface for environment variables
declare global {
  interface Window {
    __ENV__?: {
      VITE_SHOPIFY_PARTNER_ORG_ID?: string;
      VITE_SHOPIFY_PARTNER_API_TOKEN?: string;
      VITE_SHOPIFY_APP_ID?: string;
    };
  }
}

// Partner API configuration from environment
const PARTNER_API_CONFIG = {
  organizationId: typeof window !== 'undefined' 
    ? window.__ENV__?.VITE_SHOPIFY_PARTNER_ORG_ID || '3604544'
    : process.env.VITE_SHOPIFY_PARTNER_ORG_ID || '3604544',
  accessToken: typeof window !== 'undefined'
    ? window.__ENV__?.VITE_SHOPIFY_PARTNER_API_TOKEN || ''
    : process.env.SHOPIFY_PARTNER_CLIENT_API || '',
  appId: typeof window !== 'undefined'
    ? window.__ENV__?.VITE_SHOPIFY_APP_ID || ''
    : process.env.VITE_SHOPIFY_APP_ID || '',
};

export async function loader() {
  try {
    // In production, this would fetch from Supabase
    const partners = generateMockPartners();
    const dashboardData = generateMockDashboardData();
    const affiliateLinks = generateMockAffiliateLinks();
    const referrals = generateMockReferrals();
    const commissions = generateMockCommissions();
    const applications = generateMockApplications();

    // Pass Partner API config from server environment
    const partnerApiConfig = {
      organizationId: process.env.VITE_SHOPIFY_PARTNER_ORG_ID || '3604544',
      accessToken: process.env.SHOPIFY_PARTNER_CLIENT_API || '',
      appId: process.env.VITE_SHOPIFY_APP_ID || '',
    };

    return json({
      partners,
      dashboardData,
      affiliateLinks,
      referrals,
      commissions,
      applications,
      partnerApiConfig,
      error: null
    });
  } catch (error) {
    console.error("Error loading partner data:", error);
    return json({
      partners: generateMockPartners(),
      dashboardData: generateMockDashboardData(),
      affiliateLinks: generateMockAffiliateLinks(),
      referrals: generateMockReferrals(),
      commissions: generateMockCommissions(),
      applications: generateMockApplications(),
      partnerApiConfig: PARTNER_API_CONFIG,
      error: "Failed to load partner data"
    });
  }
}

export default function Partners() {
  const {
    partners,
    dashboardData,
    affiliateLinks,
    referrals,
    commissions,
    partnerApiConfig,
    error
  } = useLoaderData<typeof loader>();

  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback((selectedTabIndex: number) => {
    setSelected(selectedTabIndex);
  }, []);

  const tabs = [
    { id: 'overview', content: 'Overview' },
    { id: 'directory', content: 'Partner Directory' },
    { id: 'performance', content: 'Performance' },
    { id: 'affiliates', content: 'Affiliate Program' },
    { id: 'analytics', content: 'Partner API Analytics', badge: 'New' },
    { id: 'transactions', content: 'Transactions', badge: 'New' }
  ];

  const handleExport = () => {
    // In production, this would generate a CSV/Excel export
    console.log('Exporting partner data...');
  };

  const handleInvitePartner = () => {
    // In production, this would open an invite modal
    console.log('Opening partner invite modal...');
  };

  // Check if Partner API is configured
  const isPartnerApiConfigured = partnerApiConfig?.accessToken && partnerApiConfig?.organizationId;

  return (
    <Page
      title="Partner Portal"
      subtitle="Manage partners, track performance, and run affiliate programs"
      primaryAction={{
        content: 'Invite Partner',
        onAction: handleInvitePartner
      }}
      secondaryActions={[
        {
          content: 'Export Data',
          onAction: handleExport
        }
      ]}
    >
      {error && (
        <div className="mb-4">
          <Banner tone="warning">
            <p>{error}</p>
          </Banner>
        </div>
      )}

      {!isPartnerApiConfigured && (selected === 4 || selected === 5) && (
        <div className="mb-4">
          <Banner tone="info">
            <p>
              Partner API features require configuration. Set <code>VITE_SHOPIFY_PARTNER_ORG_ID</code> and{' '}
              <code>SHOPIFY_PARTNER_CLIENT_API</code> environment variables to enable real-time Partner API data.
            </p>
          </Banner>
        </div>
      )}

      <Card>
        <div className="p-4">
          <div className="flex justify-between items-center mb-6">
            <Tabs
              tabs={tabs.map(tab => ({
                ...tab,
                content: (
                  <InlineStack gap="200" blockAlign="center">
                    <span>{tab.content}</span>
                    {tab.badge && <Badge tone="info">{tab.badge}</Badge>}
                  </InlineStack>
                )
              }))}
              selected={selected}
              onSelect={handleTabChange}
            />
            <ButtonGroup>
              <Button onClick={() => window.location.reload()}>Refresh</Button>
            </ButtonGroup>
          </div>

          {selected === 0 && (
            <div className="mt-6">
              <PartnerDashboard
                data={dashboardData}
                partnerApiConfig={isPartnerApiConfigured ? {
                  organizationId: partnerApiConfig.organizationId,
                  accessToken: partnerApiConfig.accessToken,
                  appId: partnerApiConfig.appId || undefined,
                } : undefined}
              />
            </div>
          )}

          {selected === 1 && (
            <div className="mt-6">
              <PartnerDirectory
                partners={partners}
                onPartnerUpdate={(partner) => {
                  console.log('Partner updated:', partner);
                }}
              />
            </div>
          )}

          {selected === 2 && (
            <div className="mt-6">
              <PartnerPerformance
                partners={partners}
                commissions={commissions}
              />
            </div>
          )}

          {selected === 3 && (
            <div className="mt-6">
              <AffiliateProgram
                affiliateLinks={affiliateLinks}
                referrals={referrals}
                partners={partners}
                onCreateLink={(partnerId, code) => {
                  console.log('Creating affiliate link:', { partnerId, code });
                }}
              />
            </div>
          )}

          {selected === 4 && (
            <div className="mt-6">
              <PartnerAnalytics
                organizationId={partnerApiConfig?.organizationId}
                accessToken={partnerApiConfig?.accessToken}
                appId={partnerApiConfig?.appId || undefined}
              />
            </div>
          )}

          {selected === 5 && (
            <div className="mt-6">
              <TransactionTracker
                organizationId={partnerApiConfig?.organizationId}
                accessToken={partnerApiConfig?.accessToken}
              />
            </div>
          )}
        </div>
      </Card>
    </Page>
  );
}
