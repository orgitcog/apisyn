import { useState } from 'react';
import { 
  DataTable, 
  Badge, 
  Card, 
  Filters, 
  Button, 
  ButtonGroup,
  Pagination,
  EmptySearchResult
} from '@shopify/polaris';
import { Download, RefreshCw } from 'lucide-react';

interface Store {
  id: string;
  name: string;
  url: string;
  revenue: number;
  orders: number;
  status: 'active' | 'inactive' | 'pending';
  last_sync: string;
}

export function StoreMatrix({ stores }: { stores: Store[] }) {
  const [searchValue, setSearchValue] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  
  // Filter stores based on search and status
  const filteredStores = stores.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchValue.toLowerCase()) || 
                          store.url.toLowerCase().includes(searchValue.toLowerCase());
    const matchesStatus = selectedStatus === null || store.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleStatusChange = (value: string | null) => {
    setSelectedStatus(value);
  };

  const refreshData = () => {
    // In Remix, we would use a Form or fetcher to reload data
    window.location.reload();
  };

  // Format date to a readable format
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: Store['status'] }) => {
    let statusProps: { status: 'success' | 'warning' | 'critical' | 'new'; children: string } = {
      status: 'new',
      children: 'Unknown'
    };

    switch (status) {
      case 'active':
        statusProps = { status: 'success', children: 'Active' };
        break;
      case 'inactive':
        statusProps = { status: 'critical', children: 'Inactive' };
        break;
      case 'pending':
        statusProps = { status: 'warning', children: 'Pending' };
        break;
    }

    return <Badge {...statusProps} />;
  };

  // Define the rows for the DataTable
  const rows = filteredStores.map((store) => [
    store.name,
    store.url,
    `$${store.revenue.toLocaleString()}`,
    store.orders.toLocaleString(),
    <StatusBadge status={store.status} />,
    formatDate(store.last_sync),
  ]);

  return (
    <>
      <Card.Section>
        <div className="flex justify-between items-center mb-4">
          <div className="text-xl font-medium">Store Performance</div>
          <ButtonGroup>
            <Button onClick={refreshData} icon={<RefreshCw className="w-4 h-4" />}>
              Refresh
            </Button>
            <Button icon={<Download className="w-4 h-4" />}>
              Export
            </Button>
          </ButtonGroup>
        </div>
      </Card.Section>

      <Card.Section>
        <div className="mb-4">
          <Filters
            queryValue={searchValue}
            queryPlaceholder="Search stores..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                filter: (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleStatusChange(null)} 
                      pressed={selectedStatus === null}
                    >
                      All
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange('active')} 
                      pressed={selectedStatus === 'active'}
                    >
                      Active
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange('inactive')} 
                      pressed={selectedStatus === 'inactive'}
                    >
                      Inactive
                    </Button>
                    <Button 
                      onClick={() => handleStatusChange('pending')} 
                      pressed={selectedStatus === 'pending'}
                    >
                      Pending
                    </Button>
                  </div>
                ),
                shortcut: true,
              },
            ]}
            onQueryChange={handleSearchChange}
            onQueryClear={() => setSearchValue('')}
          />
        </div>

        {filteredStores.length > 0 ? (
          <DataTable
            columnContentTypes={[
              'text',
              'text',
              'numeric',
              'numeric',
              'text',
              'text',
            ]}
            headings={[
              'Store Name',
              'URL',
              'Revenue',
              'Orders',
              'Status',
              'Last Sync',
            ]}
            rows={rows}
          />
        ) : (
          <EmptySearchResult
            title="No stores found"
            description="Try changing the filters or search term"
            withIllustration
          />
        )}
      </Card.Section>

      <Card.Section>
        <div className="flex items-center justify-center">
          <Pagination
            hasPrevious
            onPrevious={() => {}}
            hasNext
            onNext={() => {}}
          />
        </div>
      </Card.Section>
    </>
  );
}