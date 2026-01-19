import React, { useState } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Button,
  Filters,
  ButtonGroup,
  EmptySearchResult,
  Spinner,
  Pagination,
} from "@shopify/polaris";
import { useNetSuiteCustomers } from "../../hooks/useNetSuiteData";
import { NetSuiteCustomer } from "../../lib/netsuite";
import { Building, User, Globe, _Search } from "lucide-react";
import { format, parseISO } from "date-fns";

export function CustomerList() {
  const [searchValue, setSearchValue] = useState("");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: customers, isLoading, error } = useNetSuiteCustomers();

  // Filter customers based on search and subsidiary
  const filteredCustomers = customers
    ? customers.filter((customer) => {
        const matchesSearch =
          customer.companyName
            .toLowerCase()
            .includes(searchValue.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          customer.entityId.toLowerCase().includes(searchValue.toLowerCase());

        const matchesSubsidiary =
          !selectedSubsidiary || customer.subsidiary.id === selectedSubsidiary;

        return matchesSearch && matchesSubsidiary;
      })
    : [];

  // Get unique subsidiaries for filter
  const subsidiaries = customers
    ? [...new Set(customers.map((customer) => customer.subsidiary))].sort(
        (a, b) => a.name.localeCompare(b.name),
      )
    : [];

  // Pagination calculations
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const currentPageCustomers = filteredCustomers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset to first page on search change
  };

  const handleSubsidiaryChange = (value: string | null) => {
    setSelectedSubsidiary(value);
    setCurrentPage(1); // Reset to first page on filter change
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(parseISO(dateString), "MMM d, yyyy");
  };

  if (isLoading) {
    return (
      <Card sectioned title="NetSuite Customers">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-500">Loading customer data...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sectioned title="NetSuite Customers">
        <div className="bg-red-50 text-red-800 p-4 rounded">
          <p className="font-medium">Error loading customers</p>
          <p className="text-sm mt-1">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Section>
        <div className="flex justify-between items-center mb-4">
          <Text variant="headingMd" as="h2">
            NetSuite OneWorld Customers
          </Text>
          <ButtonGroup>
            <Button>Export</Button>
            <Button primary>Import from NetSuite</Button>
          </ButtonGroup>
        </div>
      </Card.Section>

      <Card.Section>
        <Filters
          queryValue={searchValue}
          queryPlaceholder="Search customers..."
          filters={[
            {
              key: "subsidiary",
              label: "Subsidiary",
              filter: (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleSubsidiaryChange(null)}
                    pressed={selectedSubsidiary === null}
                  >
                    All Subsidiaries
                  </Button>
                  {subsidiaries.map((subsidiary) => (
                    <Button
                      key={subsidiary.id}
                      onClick={() => handleSubsidiaryChange(subsidiary.id)}
                      pressed={selectedSubsidiary === subsidiary.id}
                    >
                      {subsidiary.name}
                    </Button>
                  ))}
                </div>
              ),
              shortcut: true,
            },
          ]}
          onQueryChange={handleSearchChange}
          onQueryClear={() => setSearchValue("")}
        />
      </Card.Section>

      <Card.Section>
        {currentPageCustomers.length > 0 ? (
          <ResourceList
            resourceName={{ singular: "customer", plural: "customers" }}
            items={currentPageCustomers}
            renderItem={(customer: NetSuiteCustomer) => {
              const {
                id,
                companyName,
                email,
                phone,
                subsidiary,
                entityId,
                isPerson,
                firstName,
                lastName,
                dateCreated,
                lastModifiedDate,
              } = customer;

              return (
                <ResourceItem
                  id={id}
                  accessibilityLabel={`View details for ${companyName}`}
                  media={
                    isPerson ? (
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User className="w-5 h-5 text-blue-700" />
                      </div>
                    ) : (
                      <div className="bg-purple-100 p-2 rounded-full">
                        <Building className="w-5 h-5 text-purple-700" />
                      </div>
                    )
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-base font-medium mr-2">
                          {isPerson ? `${firstName} ${lastName}` : companyName}
                        </h3>
                        <Badge>ID: {entityId}</Badge>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        <div>
                          {email}
                          {phone && <span className="ml-3">{phone}</span>}
                        </div>
                        <div className="flex items-center mt-1">
                          <Globe className="w-4 h-4 mr-1" />
                          <span>{subsidiary.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Text variant="bodySm" as="p" color="subdued">
                        Created: {formatDate(dateCreated)}
                      </Text>
                      <Text variant="bodySm" as="p" color="subdued">
                        Last Modified: {formatDate(lastModifiedDate)}
                      </Text>
                      <div className="mt-2">
                        <ButtonGroup>
                          <Button url={`/erp/customers/${id}`} size="slim">
                            View Details
                          </Button>
                          <Button
                            url={`/erp/transactions?customer=${id}`}
                            size="slim"
                          >
                            View Transactions
                          </Button>
                        </ButtonGroup>
                      </div>
                    </div>
                  </div>
                </ResourceItem>
              );
            }}
          />
        ) : (
          <EmptySearchResult
            title="No customers found"
            description="Try changing the filters or search term"
            withIllustration
          />
        )}
      </Card.Section>

      {filteredCustomers.length > itemsPerPage && (
        <Card.Section>
          <div className="flex items-center justify-center">
            <Pagination
              label={`Page ${currentPage} of ${totalPages}`}
              hasPrevious={currentPage > 1}
              onPrevious={() => setCurrentPage(currentPage - 1)}
              hasNext={currentPage < totalPages}
              onNext={() => setCurrentPage(currentPage + 1)}
            />
          </div>
        </Card.Section>
      )}
    </Card>
  );
}
