import React, { useState } from "react";
import {
  Page,
  Card,
  DataTable,
  Button,
  ButtonGroup,
  Modal,
  Form,
  FormLayout,
  TextField,
  Select,
  Banner,
  Text,
  Badge,
} from "@shopify/polaris";
import { useNetSuiteSubsidiaries } from "../../hooks/useNetSuiteData";
import { Building2, Globe, DollarSign, RefreshCw } from "lucide-react";

export function SubsidiaryManager() {
  const {
    data: subsidiaries,
    isLoading,
    error,
    refetch,
  } = useNetSuiteSubsidiaries();
  const [modalActive, setModalActive] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<string | null>(
    null,
  );
  const [newSubsidiary, setNewSubsidiary] = useState({
    name: "",
    legalName: "",
    currency: "USD",
    country: "",
    parent: "",
  });

  const handleModalChange = (open: boolean) => {
    setModalActive(open);
    if (!open) {
      setSelectedSubsidiary(null);
      setNewSubsidiary({
        name: "",
        legalName: "",
        currency: "USD",
        country: "",
        parent: "",
      });
    }
  };

  const handleSubsidiaryChange = (field: string) => (value: string) => {
    setNewSubsidiary((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddSubsidiary = () => {
    // In a real app, this would call the NetSuite API
    console.log("Adding subsidiary:", newSubsidiary);
    setModalActive(false);
  };

  const formatCurrency = (currencyCode: string) => {
    return (
      <div className="flex items-center">
        <DollarSign className="w-4 h-4 mr-1" />
        <span>{currencyCode}</span>
      </div>
    );
  };

  const rows =
    subsidiaries?.map((subsidiary) => [
      <div key={`name-${subsidiary.id}`} className="flex items-center">
        <Building2 className="w-4 h-4 mr-2" />
        <div>
          <strong>{subsidiary.name}</strong>
          <div className="text-sm text-gray-500">{subsidiary.legalName}</div>
        </div>
      </div>,
      <div key={`location-${subsidiary.id}`} className="flex items-center">
        <Globe className="w-4 h-4 mr-2" />
        <span>{subsidiary.country}</span>
      </div>,
      formatCurrency(subsidiary.currency.name),
      subsidiary.parent ? (
        <Badge key={`parent-${subsidiary.id}`}>{subsidiary.parent.name}</Badge>
      ) : (
        <Badge key={`parent-${subsidiary.id}`} status="info">
          Parent Company
        </Badge>
      ),
      subsidiary.isElimination ? (
        <Badge key={`status-${subsidiary.id}`} status="warning">
          Elimination
        </Badge>
      ) : subsidiary.isInactive ? (
        <Badge key={`status-${subsidiary.id}`} status="critical">
          Inactive
        </Badge>
      ) : (
        <Badge key={`status-${subsidiary.id}`} status="success">
          Active
        </Badge>
      ),
      <ButtonGroup key={`actions-${subsidiary.id}`}>
        <Button onClick={() => console.log("View", subsidiary.id)}>View</Button>
        <Button onClick={() => console.log("Edit", subsidiary.id)}>Edit</Button>
      </ButtonGroup>,
    ]) || [];

  if (error) {
    return (
      <Page title="Subsidiary Management">
        <Banner status="critical" title="Error loading subsidiaries">
          <p>
            There was an error loading the subsidiary data. Please try again
            later.
          </p>
        </Banner>
      </Page>
    );
  }

  return (
    <Page
      title="Subsidiary Management"
      subtitle="Manage your NetSuite OneWorld subsidiaries"
      primaryAction={{
        content: "Add Subsidiary",
        onAction: () => handleModalChange(true),
      }}
    >
      <Card>
        <Card.Section>
          <div className="flex justify-between items-center mb-4">
            <div>
              <Text variant="headingMd" as="h2">
                Subsidiaries
              </Text>
              <Text variant="bodySm" as="p" color="subdued">
                Manage your global business entities
              </Text>
            </div>
            <ButtonGroup>
              <Button onClick={() => refetch()} icon={RefreshCw}>
                Refresh
              </Button>
              <Button>Export</Button>
            </ButtonGroup>
          </div>
        </Card.Section>

        <Card.Section>
          <DataTable
            columnContentTypes={[
              "text",
              "text",
              "text",
              "text",
              "text",
              "text",
            ]}
            headings={[
              "Subsidiary",
              "Location",
              "Currency",
              "Parent",
              "Status",
              "Actions",
            ]}
            rows={rows}
            loading={isLoading}
          />
        </Card.Section>
      </Card>

      <Modal
        open={modalActive}
        onClose={() => handleModalChange(false)}
        title={selectedSubsidiary ? "Edit Subsidiary" : "Add New Subsidiary"}
        primaryAction={{
          content: selectedSubsidiary ? "Save Changes" : "Add Subsidiary",
          onAction: handleAddSubsidiary,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => handleModalChange(false),
          },
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleAddSubsidiary}>
            <FormLayout>
              <TextField
                value={newSubsidiary.name}
                onChange={handleSubsidiaryChange("name")}
                label="Subsidiary Name"
                type="text"
                requiredIndicator
              />

              <TextField
                value={newSubsidiary.legalName}
                onChange={handleSubsidiaryChange("legalName")}
                label="Legal Name"
                type="text"
                requiredIndicator
              />

              <Select
                label="Currency"
                options={[
                  { label: "USD - US Dollar", value: "USD" },
                  { label: "EUR - Euro", value: "EUR" },
                  { label: "GBP - British Pound", value: "GBP" },
                  { label: "JPY - Japanese Yen", value: "JPY" },
                  { label: "AUD - Australian Dollar", value: "AUD" },
                ]}
                value={newSubsidiary.currency}
                onChange={handleSubsidiaryChange("currency")}
              />

              <TextField
                value={newSubsidiary.country}
                onChange={handleSubsidiaryChange("country")}
                label="Country"
                type="text"
                requiredIndicator
              />

              <Select
                label="Parent Subsidiary"
                options={[
                  { label: "None (Parent Company)", value: "" },
                  ...(subsidiaries?.map((sub) => ({
                    label: sub.name,
                    value: sub.id,
                  })) || []),
                ]}
                value={newSubsidiary.parent}
                onChange={handleSubsidiaryChange("parent")}
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
