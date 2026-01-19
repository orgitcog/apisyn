import React, { useState } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Text,
  Badge,
  Filters,
  Button,
  ButtonGroup,
  Spinner,
  EmptySearchResult,
  Avatar,
  Modal,
  Form,
  FormLayout,
  TextField,
  Select,
} from "@shopify/polaris";
import { useCustomers, useCreateCustomer } from "../../hooks/useCrmData";
import { Customer } from "../../lib/crm";
import {
  _User,
  Mail,
  Phone,
  Building,
  _Calendar,
  _DollarSign,
  Tag,
} from "lucide-react";

export function CustomerList() {
  const { data: customers, isLoading, error } = useCustomers();
  const createCustomerMutation = useCreateCustomer();

  const [searchValue, setSearchValue] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const [modalActive, setModalActive] = useState(false);
  const [newCustomer, setNewCustomer] = useState<{
    name: string;
    email: string;
    phone: string;
    company: string;
    status: string;
    source: string;
    tags: string;
  }>({
    name: "",
    email: "",
    phone: "",
    company: "",
    status: "lead",
    source: "Website",
    tags: "",
  });

  // Get all unique tags from customers
  const allTags = customers
    ? [...new Set(customers.flatMap((customer) => customer.tags || []))]
    : [];

  // Filter customers based on search, status, and tag
  const filteredCustomers = customers
    ? customers.filter((customer) => {
        // Search filter
        const matchesSearch =
          customer.name.toLowerCase().includes(searchValue.toLowerCase()) ||
          customer.email.toLowerCase().includes(searchValue.toLowerCase()) ||
          (customer.company &&
            customer.company.toLowerCase().includes(searchValue.toLowerCase()));

        // Status filter
        const matchesStatus =
          !selectedStatus || customer.status === selectedStatus;

        // Tag filter
        const matchesTag =
          !selectedTag ||
          (customer.tags && customer.tags.includes(selectedTag));

        return matchesSearch && matchesStatus && matchesTag;
      })
    : [];

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleStatusChange = (value: string | null) => {
    setSelectedStatus(value);
  };

  const handleTagChange = (value: string | null) => {
    setSelectedTag(value);
  };

  const handleModalChange = (open: boolean) => {
    setModalActive(open);
  };

  const handleCustomerFieldChange = (field: string) => (value: string) => {
    setNewCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddCustomer = async () => {
    const { name, email, phone, company, status, source, tags } = newCustomer;

    if (!name || !email) {
      // Show validation error
      return;
    }

    try {
      await createCustomerMutation.mutateAsync({
        name,
        email,
        phone: phone || undefined,
        company: company || undefined,
        status: status as "active" | "inactive" | "lead",
        source,
        tags: tags ? tags.split(",").map((tag) => tag.trim()) : undefined,
      });

      // Reset form and close modal
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        company: "",
        status: "lead",
        source: "Website",
        tags: "",
      });
      setModalActive(false);
    } catch (error) {
      console.error("Error adding customer:", error);
    }
  };

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return "-";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <Card sectioned title="Customers">
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
      <Card sectioned title="Customers">
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
            Customers
          </Text>
          <Button primary onClick={() => handleModalChange(true)}>
            Add Customer
          </Button>
        </div>
      </Card.Section>

      <Card.Section>
        <Filters
          queryValue={searchValue}
          queryPlaceholder="Search customers..."
          filters={[
            {
              key: "status",
              label: "Status",
              filter: (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleStatusChange(null)}
                    pressed={selectedStatus === null}
                  >
                    All
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("active")}
                    pressed={selectedStatus === "active"}
                  >
                    Active
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("lead")}
                    pressed={selectedStatus === "lead"}
                  >
                    Lead
                  </Button>
                  <Button
                    onClick={() => handleStatusChange("inactive")}
                    pressed={selectedStatus === "inactive"}
                  >
                    Inactive
                  </Button>
                </div>
              ),
              shortcut: true,
            },
            {
              key: "tag",
              label: "Tag",
              filter: (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleTagChange(null)}
                    pressed={selectedTag === null}
                  >
                    All Tags
                  </Button>
                  {allTags.map((tag) => (
                    <Button
                      key={tag}
                      onClick={() => handleTagChange(tag)}
                      pressed={selectedTag === tag}
                    >
                      {tag}
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
        {filteredCustomers && filteredCustomers.length > 0 ? (
          <ResourceList
            resourceName={{ singular: "customer", plural: "customers" }}
            items={filteredCustomers}
            renderItem={(customer: Customer) => {
              const {
                id,
                name,
                email,
                phone,
                company,
                status,
                tags,
                total_spent,
                total_orders,
              } = customer;

              let statusBadge;
              switch (status) {
                case "active":
                  statusBadge = <Badge status="success">Active</Badge>;
                  break;
                case "inactive":
                  statusBadge = <Badge status="critical">Inactive</Badge>;
                  break;
                case "lead":
                  statusBadge = <Badge status="attention">Lead</Badge>;
                  break;
                default:
                  statusBadge = <Badge>{status}</Badge>;
              }

              const initials = name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .toUpperCase();

              return (
                <ResourceItem
                  id={id}
                  url={`/crm/customers/${id}`}
                  accessibilityLabel={`View details for ${name}`}
                  media={
                    <Avatar
                      customer
                      size="medium"
                      name={name}
                      initials={initials}
                    />
                  }
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center">
                        <h3 className="text-base font-medium mr-2">{name}</h3>
                        {statusBadge}
                      </div>
                      {company && (
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Building className="w-4 h-4 mr-1" />
                          <span>{company}</span>
                        </div>
                      )}
                      <div className="flex items-center mt-1 text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-1" />
                        <span>{email}</span>
                      </div>
                      {phone && (
                        <div className="flex items-center mt-1 text-sm text-gray-500">
                          <Phone className="w-4 h-4 mr-1" />
                          <span>{phone}</span>
                        </div>
                      )}
                      {tags && tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <Tag className="w-3 h-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      {typeof total_orders === "number" && (
                        <div className="text-sm">
                          <span className="text-gray-500">Orders: </span>
                          <span className="font-medium">{total_orders}</span>
                        </div>
                      )}
                      {typeof total_spent === "number" && (
                        <div className="text-sm">
                          <span className="text-gray-500">Spent: </span>
                          <span className="font-medium">
                            {formatCurrency(total_spent)}
                          </span>
                        </div>
                      )}
                      <div className="mt-2">
                        <ButtonGroup>
                          <Button size="slim" url={`/crm/customers/${id}`}>
                            View
                          </Button>
                          <Button
                            size="slim"
                            url={`/crm/deals/new?customer=${id}`}
                          >
                            New Deal
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
            description="Try changing the filters or search term, or add a new customer"
            withIllustration
          />
        )}
      </Card.Section>

      <Modal
        open={modalActive}
        onClose={() => handleModalChange(false)}
        title="Add New Customer"
        primaryAction={{
          content: "Add Customer",
          onAction: handleAddCustomer,
          loading: createCustomerMutation.isPending,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => handleModalChange(false),
          },
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleAddCustomer}>
            <FormLayout>
              <TextField
                label="Name"
                value={newCustomer.name}
                onChange={handleCustomerFieldChange("name")}
                autoComplete="name"
                requiredIndicator
                error={
                  createCustomerMutation.isError
                    ? "Name is required"
                    : undefined
                }
              />

              <TextField
                label="Email"
                value={newCustomer.email}
                onChange={handleCustomerFieldChange("email")}
                type="email"
                autoComplete="email"
                requiredIndicator
                error={
                  createCustomerMutation.isError
                    ? "Valid email is required"
                    : undefined
                }
              />

              <TextField
                label="Phone"
                value={newCustomer.phone}
                onChange={handleCustomerFieldChange("phone")}
                type="tel"
                autoComplete="tel"
              />

              <TextField
                label="Company"
                value={newCustomer.company}
                onChange={handleCustomerFieldChange("company")}
                autoComplete="organization"
              />

              <Select
                label="Status"
                options={[
                  { label: "Lead", value: "lead" },
                  { label: "Active", value: "active" },
                  { label: "Inactive", value: "inactive" },
                ]}
                value={newCustomer.status}
                onChange={handleCustomerFieldChange("status")}
              />

              <Select
                label="Source"
                options={[
                  { label: "Website", value: "Website" },
                  { label: "Referral", value: "Referral" },
                  { label: "Social Media", value: "Social Media" },
                  { label: "Trade Show", value: "Trade Show" },
                  { label: "Google Ads", value: "Google Ads" },
                  { label: "Email Campaign", value: "Email Campaign" },
                  { label: "Other", value: "Other" },
                ]}
                value={newCustomer.source}
                onChange={handleCustomerFieldChange("source")}
              />

              <TextField
                label="Tags"
                value={newCustomer.tags}
                onChange={handleCustomerFieldChange("tags")}
                placeholder="retail, wholesale, premium (comma separated)"
                helpText="Enter tags separated by commas"
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Card>
  );
}
