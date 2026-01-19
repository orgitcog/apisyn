// Partner Portal Types

export type PartnerType = 'reseller' | 'affiliate' | 'integrator' | 'developer' | 'agency';
export type PartnerTier = 'bronze' | 'silver' | 'gold' | 'platinum';
export type PartnerStatus = 'active' | 'inactive' | 'pending' | 'suspended';

export interface Partner {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  type: PartnerType;
  tier: PartnerTier;
  status: PartnerStatus;
  website?: string;
  specialties: string[];
  region: string;
  joinedAt: string;
  lastActiveAt: string;
  totalRevenue: number;
  totalReferrals: number;
  commissionRate: number;
  pendingCommission: number;
  paidCommission: number;
}

export interface PartnerMetrics {
  partnerId: string;
  period: string;
  referrals: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
  commission: number;
}

export interface AffiliateLink {
  id: string;
  partnerId: string;
  code: string;
  targetUrl: string;
  clicks: number;
  conversions: number;
  revenue: number;
  createdAt: string;
  isActive: boolean;
}

export interface Referral {
  id: string;
  affiliateLinkId: string;
  partnerId: string;
  customerName: string;
  customerEmail: string;
  status: 'pending' | 'qualified' | 'converted' | 'rejected';
  revenue: number;
  commission: number;
  createdAt: string;
  convertedAt?: string;
}

export interface Commission {
  id: string;
  partnerId: string;
  partnerName: string;
  period: string;
  amount: number;
  status: 'pending' | 'approved' | 'paid' | 'cancelled';
  referralCount: number;
  payoutDate?: string;
  paymentMethod?: string;
}

export interface PartnerApplication {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  partnerType: PartnerType;
  experience: string;
  monthlyRevenue: string;
  reason: string;
  status: 'pending' | 'under_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
}

export interface PartnerDashboardData {
  totalPartners: number;
  activePartners: number;
  pendingApplications: number;
  totalRevenue: number;
  totalCommissions: number;
  pendingPayouts: number;
  partnersByTier: { tier: PartnerTier; count: number }[];
  partnersByType: { type: PartnerType; count: number }[];
  recentActivity: { date: string; action: string; partner: string }[];
  monthlyMetrics: { month: string; revenue: number; partners: number; commissions: number }[];
}

// Mock data generators
export function generateMockPartners(): Partner[] {
  const partners: Partner[] = [
    {
      id: 'p1',
      name: 'John Anderson',
      company: 'TechFlow Solutions',
      email: 'john@techflow.io',
      phone: '+1 (555) 123-4567',
      type: 'integrator',
      tier: 'gold',
      status: 'active',
      website: 'https://techflow.io',
      specialties: ['Shopify Plus', 'Custom Integrations', 'API Development'],
      region: 'North America',
      joinedAt: '2023-03-15T00:00:00Z',
      lastActiveAt: new Date().toISOString(),
      totalRevenue: 245000,
      totalReferrals: 48,
      commissionRate: 15,
      pendingCommission: 3200,
      paidCommission: 36750
    },
    {
      id: 'p2',
      name: 'Sarah Chen',
      company: 'Digital Commerce Agency',
      email: 'sarah@dcagency.com',
      phone: '+1 (555) 234-5678',
      type: 'agency',
      tier: 'platinum',
      status: 'active',
      website: 'https://dcagency.com',
      specialties: ['E-commerce Strategy', 'Store Design', 'Conversion Optimization'],
      region: 'North America',
      joinedAt: '2022-08-20T00:00:00Z',
      lastActiveAt: new Date().toISOString(),
      totalRevenue: 520000,
      totalReferrals: 87,
      commissionRate: 20,
      pendingCommission: 8500,
      paidCommission: 104000
    },
    {
      id: 'p3',
      name: 'Marcus Weber',
      company: 'E-Com Affiliates',
      email: 'marcus@ecomaffiliates.de',
      phone: '+49 30 12345678',
      type: 'affiliate',
      tier: 'silver',
      status: 'active',
      website: 'https://ecomaffiliates.de',
      specialties: ['Affiliate Marketing', 'Content Creation', 'SEO'],
      region: 'Europe',
      joinedAt: '2023-06-10T00:00:00Z',
      lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      totalRevenue: 78000,
      totalReferrals: 156,
      commissionRate: 10,
      pendingCommission: 1200,
      paidCommission: 7800
    },
    {
      id: 'p4',
      name: 'Emily Rodriguez',
      company: 'ShopDev Studios',
      email: 'emily@shopdevstudios.com',
      phone: '+1 (555) 345-6789',
      type: 'developer',
      tier: 'gold',
      status: 'active',
      website: 'https://shopdevstudios.com',
      specialties: ['Theme Development', 'App Development', 'Custom Features'],
      region: 'North America',
      joinedAt: '2023-01-05T00:00:00Z',
      lastActiveAt: new Date().toISOString(),
      totalRevenue: 189000,
      totalReferrals: 34,
      commissionRate: 12,
      pendingCommission: 2100,
      paidCommission: 22680
    },
    {
      id: 'p5',
      name: 'Kenji Tanaka',
      company: 'Asia Commerce Partners',
      email: 'kenji@asiacommerce.jp',
      phone: '+81 3 1234 5678',
      type: 'reseller',
      tier: 'silver',
      status: 'active',
      website: 'https://asiacommerce.jp',
      specialties: ['Market Expansion', 'Localization', 'Regional Support'],
      region: 'Asia Pacific',
      joinedAt: '2023-09-01T00:00:00Z',
      lastActiveAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      totalRevenue: 95000,
      totalReferrals: 28,
      commissionRate: 18,
      pendingCommission: 4500,
      paidCommission: 17100
    },
    {
      id: 'p6',
      name: 'Lisa Thompson',
      company: 'Retail Innovators',
      email: 'lisa@retailinnovators.co',
      phone: '+1 (555) 456-7890',
      type: 'agency',
      tier: 'bronze',
      status: 'pending',
      website: 'https://retailinnovators.co',
      specialties: ['Retail Strategy', 'Omnichannel'],
      region: 'North America',
      joinedAt: '2024-01-10T00:00:00Z',
      lastActiveAt: '2024-01-10T00:00:00Z',
      totalRevenue: 0,
      totalReferrals: 0,
      commissionRate: 10,
      pendingCommission: 0,
      paidCommission: 0
    },
    {
      id: 'p7',
      name: 'Ahmed Hassan',
      company: 'MENA Digital',
      email: 'ahmed@menadigital.ae',
      phone: '+971 4 123 4567',
      type: 'reseller',
      tier: 'gold',
      status: 'active',
      website: 'https://menadigital.ae',
      specialties: ['Middle East Markets', 'Arabic Localization', 'Payment Gateways'],
      region: 'Middle East',
      joinedAt: '2023-04-22T00:00:00Z',
      lastActiveAt: new Date().toISOString(),
      totalRevenue: 312000,
      totalReferrals: 62,
      commissionRate: 15,
      pendingCommission: 5800,
      paidCommission: 46800
    },
    {
      id: 'p8',
      name: 'Carlos Mendez',
      company: 'LatAm Solutions',
      email: 'carlos@latamsolutions.mx',
      phone: '+52 55 1234 5678',
      type: 'integrator',
      tier: 'silver',
      status: 'inactive',
      website: 'https://latamsolutions.mx',
      specialties: ['Latin America Markets', 'ERP Integration', 'Logistics'],
      region: 'Latin America',
      joinedAt: '2022-11-15T00:00:00Z',
      lastActiveAt: '2023-08-20T00:00:00Z',
      totalRevenue: 67000,
      totalReferrals: 19,
      commissionRate: 12,
      pendingCommission: 0,
      paidCommission: 8040
    }
  ];

  return partners;
}

export function generateMockAffiliateLinks(): AffiliateLink[] {
  return [
    { id: 'al1', partnerId: 'p3', code: 'ECOM2024', targetUrl: '/signup?ref=ECOM2024', clicks: 2450, conversions: 156, revenue: 78000, createdAt: '2023-06-10T00:00:00Z', isActive: true },
    { id: 'al2', partnerId: 'p2', code: 'DCA-PROMO', targetUrl: '/signup?ref=DCA-PROMO', clicks: 3200, conversions: 87, revenue: 520000, createdAt: '2022-08-20T00:00:00Z', isActive: true },
    { id: 'al3', partnerId: 'p1', code: 'TECHFLOW', targetUrl: '/signup?ref=TECHFLOW', clicks: 1890, conversions: 48, revenue: 245000, createdAt: '2023-03-15T00:00:00Z', isActive: true },
    { id: 'al4', partnerId: 'p4', code: 'SHOPDEV', targetUrl: '/signup?ref=SHOPDEV', clicks: 980, conversions: 34, revenue: 189000, createdAt: '2023-01-05T00:00:00Z', isActive: true },
    { id: 'al5', partnerId: 'p5', code: 'ASIASHOP', targetUrl: '/signup?ref=ASIASHOP', clicks: 1240, conversions: 28, revenue: 95000, createdAt: '2023-09-01T00:00:00Z', isActive: true },
    { id: 'al6', partnerId: 'p7', code: 'MENAD2024', targetUrl: '/signup?ref=MENAD2024', clicks: 2100, conversions: 62, revenue: 312000, createdAt: '2023-04-22T00:00:00Z', isActive: true }
  ];
}

export function generateMockReferrals(): Referral[] {
  const referrals: Referral[] = [];
  const statuses: Referral['status'][] = ['pending', 'qualified', 'converted', 'rejected'];
  const names = ['Alex Kim', 'Jordan Lee', 'Taylor Swift', 'Morgan Chase', 'Casey Jones', 'Riley Adams', 'Quinn Murphy', 'Avery Brooks'];

  for (let i = 0; i < 20; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const revenue = status === 'converted' ? Math.floor(Math.random() * 10000) + 1000 : 0;

    referrals.push({
      id: `ref-${i + 1}`,
      affiliateLinkId: `al${(i % 6) + 1}`,
      partnerId: `p${(i % 8) + 1}`,
      customerName: names[i % names.length],
      customerEmail: `${names[i % names.length].toLowerCase().replace(' ', '.')}@example.com`,
      status,
      revenue,
      commission: revenue * 0.15,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      convertedAt: status === 'converted' ? new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000).toISOString() : undefined
    });
  }

  return referrals.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function generateMockCommissions(): Commission[] {
  return [
    { id: 'c1', partnerId: 'p2', partnerName: 'Digital Commerce Agency', period: '2024-01', amount: 8500, status: 'pending', referralCount: 12, payoutDate: '2024-02-15' },
    { id: 'c2', partnerId: 'p7', partnerName: 'MENA Digital', period: '2024-01', amount: 5800, status: 'pending', referralCount: 8, payoutDate: '2024-02-15' },
    { id: 'c3', partnerId: 'p5', partnerName: 'Asia Commerce Partners', period: '2024-01', amount: 4500, status: 'approved', referralCount: 6 },
    { id: 'c4', partnerId: 'p1', partnerName: 'TechFlow Solutions', period: '2024-01', amount: 3200, status: 'pending', referralCount: 5 },
    { id: 'c5', partnerId: 'p4', partnerName: 'ShopDev Studios', period: '2024-01', amount: 2100, status: 'approved', referralCount: 4 },
    { id: 'c6', partnerId: 'p3', partnerName: 'E-Com Affiliates', period: '2024-01', amount: 1200, status: 'pending', referralCount: 15 },
    { id: 'c7', partnerId: 'p2', partnerName: 'Digital Commerce Agency', period: '2023-12', amount: 9200, status: 'paid', referralCount: 14, payoutDate: '2024-01-15', paymentMethod: 'Wire Transfer' },
    { id: 'c8', partnerId: 'p7', partnerName: 'MENA Digital', period: '2023-12', amount: 6100, status: 'paid', referralCount: 9, payoutDate: '2024-01-15', paymentMethod: 'Wire Transfer' }
  ];
}

export function generateMockApplications(): PartnerApplication[] {
  return [
    {
      id: 'app1',
      companyName: 'Growth Partners Inc',
      contactName: 'Michael Brown',
      email: 'michael@growthpartners.com',
      phone: '+1 (555) 567-8901',
      website: 'https://growthpartners.com',
      partnerType: 'agency',
      experience: '5+ years in e-commerce consulting',
      monthlyRevenue: '$100,000 - $500,000',
      reason: 'Looking to expand our service offerings with Shopify Plus implementations',
      status: 'pending',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'app2',
      companyName: 'Nordic Commerce AB',
      contactName: 'Erik Johansson',
      email: 'erik@nordiccommerce.se',
      phone: '+46 8 123 456 78',
      website: 'https://nordiccommerce.se',
      partnerType: 'reseller',
      experience: '10+ years in Nordic e-commerce market',
      monthlyRevenue: '$500,000+',
      reason: 'Seeking to become authorized reseller for Scandinavian market',
      status: 'under_review',
      submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 'app3',
      companyName: 'AppForge Labs',
      contactName: 'Priya Sharma',
      email: 'priya@appforge.io',
      phone: '+91 98765 43210',
      website: 'https://appforge.io',
      partnerType: 'developer',
      experience: '3 years building Shopify apps, 2 published apps',
      monthlyRevenue: '$50,000 - $100,000',
      reason: 'Want to join partner program for better API access and co-marketing',
      status: 'pending',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

export function generateMockDashboardData(): PartnerDashboardData {
  const partners = generateMockPartners();

  return {
    totalPartners: partners.length,
    activePartners: partners.filter(p => p.status === 'active').length,
    pendingApplications: 3,
    totalRevenue: partners.reduce((sum, p) => sum + p.totalRevenue, 0),
    totalCommissions: partners.reduce((sum, p) => sum + p.paidCommission + p.pendingCommission, 0),
    pendingPayouts: partners.reduce((sum, p) => sum + p.pendingCommission, 0),
    partnersByTier: [
      { tier: 'platinum', count: partners.filter(p => p.tier === 'platinum').length },
      { tier: 'gold', count: partners.filter(p => p.tier === 'gold').length },
      { tier: 'silver', count: partners.filter(p => p.tier === 'silver').length },
      { tier: 'bronze', count: partners.filter(p => p.tier === 'bronze').length }
    ],
    partnersByType: [
      { type: 'agency', count: partners.filter(p => p.type === 'agency').length },
      { type: 'integrator', count: partners.filter(p => p.type === 'integrator').length },
      { type: 'reseller', count: partners.filter(p => p.type === 'reseller').length },
      { type: 'developer', count: partners.filter(p => p.type === 'developer').length },
      { type: 'affiliate', count: partners.filter(p => p.type === 'affiliate').length }
    ],
    recentActivity: [
      { date: new Date().toISOString(), action: 'New referral converted', partner: 'Digital Commerce Agency' },
      { date: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), action: 'Commission approved', partner: 'MENA Digital' },
      { date: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), action: 'New application received', partner: 'Growth Partners Inc' },
      { date: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), action: 'Partner upgraded to Gold', partner: 'ShopDev Studios' },
      { date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), action: 'Payout processed', partner: 'TechFlow Solutions' }
    ],
    monthlyMetrics: [
      { month: 'Aug 2023', revenue: 89000, partners: 5, commissions: 12450 },
      { month: 'Sep 2023', revenue: 102000, partners: 6, commissions: 14280 },
      { month: 'Oct 2023', revenue: 125000, partners: 6, commissions: 17500 },
      { month: 'Nov 2023', revenue: 143000, partners: 7, commissions: 20020 },
      { month: 'Dec 2023', revenue: 178000, partners: 7, commissions: 24920 },
      { month: 'Jan 2024', revenue: 195000, partners: 8, commissions: 27300 }
    ]
  };
}
