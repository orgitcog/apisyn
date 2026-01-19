import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from 'react';
import { 
  Page, 
  Layout,
  Card,
  Button,
  _ButtonGroup,
  DataTable,
  Select,
  Text,
  Badge
} from '@shopify/polaris';
import { Download, FileText, Calendar, TrendingUp } from 'lucide-react';

interface ReportData {
  id: string;
  name: string;
  type: string;
  dateRange: string;
  status: 'completed' | 'pending' | 'failed';
  generatedAt: string;
}

const mockReports: ReportData[] = [
  {
    id: '1',
    name: 'Monthly Sales Report',
    type: 'Sales',
    dateRange: 'Nov 1 - Nov 30, 2024',
    status: 'completed',
    generatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Store Performance Analysis',
    type: 'Analytics',
    dateRange: 'Oct 1 - Oct 31, 2024',
    status: 'completed',
    generatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    name: 'User Activity Report',
    type: 'Users',
    dateRange: 'Nov 1 - Nov 30, 2024',
    status: 'pending',
    generatedAt: new Date().toISOString(),
  },
];

export async function loader() {
  return json({ reports: mockReports });
}

export default function Reports() {
  const { reports } = useLoaderData<typeof loader>();
  const [reportType, setReportType] = useState('all');
  const [dateRange, setDateRange] = useState('30d');

  const reportTypeOptions = [
    { label: 'All reports', value: 'all' },
    { label: 'Sales', value: 'sales' },
    { label: 'Analytics', value: 'analytics' },
    { label: 'Users', value: 'users' },
    { label: 'Inventory', value: 'inventory' },
  ];

  const dateRangeOptions = [
    { label: 'Last 7 days', value: '7d' },
    { label: 'Last 30 days', value: '30d' },
    { label: 'Last 90 days', value: '90d' },
    { label: 'This year', value: 'ytd' },
    { label: 'Custom range', value: 'custom' },
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: ReportData['status']) => {
    switch (status) {
      case 'completed':
        return <Badge status="success">Completed</Badge>;
      case 'pending':
        return <Badge status="warning">Pending</Badge>;
      case 'failed':
        return <Badge status="critical">Failed</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  const rows = reports.map((report) => [
    report.name,
    report.type,
    report.dateRange,
    getStatusBadge(report.status),
    formatDate(report.generatedAt),
    <Button size="slim" icon={<Download className="w-4 h-4" />}>
      Download
    </Button>,
  ]);

  return (
    <Page
      title="Reports"
      subtitle="Generate and download reports for your enterprise"
      primaryAction={{
        content: 'Generate report',
        icon: FileText,
        onAction: () => console.log('Generate report'),
      }}
    >
      <Layout>
        <Layout.Section>
          <Card>
            <Card.Section>
              <div className="flex justify-between items-center mb-4">
                <Text as="h2" variant="headingMd">Available Reports</Text>
                <div className="flex gap-4">
                  <Select
                    label="Report type"
                    labelHidden
                    options={reportTypeOptions}
                    value={reportType}
                    onChange={setReportType}
                  />
                  <Select
                    label="Date range"
                    labelHidden
                    options={dateRangeOptions}
                    value={dateRange}
                    onChange={setDateRange}
                  />
                </div>
              </div>
            </Card.Section>

            <DataTable
              columnContentTypes={['text', 'text', 'text', 'text', 'text', 'text']}
              headings={['Report Name', 'Type', 'Date Range', 'Status', 'Generated', 'Actions']}
              rows={rows}
            />
          </Card>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <Card.Section>
              <Text as="h3" variant="headingMd">Quick Reports</Text>
              <div className="mt-4 space-y-2">
                <Button fullWidth icon={<TrendingUp className="w-4 h-4" />}>
                  Sales overview
                </Button>
                <Button fullWidth icon={<FileText className="w-4 h-4" />}>
                  Store performance
                </Button>
                <Button fullWidth icon={<Calendar className="w-4 h-4" />}>
                  Monthly summary
                </Button>
              </div>
            </Card.Section>
          </Card>

          <Card>
            <Card.Section>
              <Text as="h3" variant="headingMd">Report Insights</Text>
              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Text as="span" variant="bodySm">Total Reports</Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">{reports.length}</Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text as="span" variant="bodySm">Completed</Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {reports.filter(r => r.status === 'completed').length}
                  </Text>
                </div>
                <div className="flex justify-between items-center">
                  <Text as="span" variant="bodySm">Pending</Text>
                  <Text as="span" variant="bodyMd" fontWeight="semibold">
                    {reports.filter(r => r.status === 'pending').length}
                  </Text>
                </div>
              </div>
            </Card.Section>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
