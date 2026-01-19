import React, { useState } from "react";
import {
  Page,
  Card,
  ResourceList,
  ResourceItem,
  Avatar,
  Text,
  Badge,
  _Button,
  Modal,
  Form,
  FormLayout,
  TextField,
} from "@shopify/polaris";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { UserPlus, Search } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  lastActive: string;
  status: "active" | "inactive" | "pending";
}

export function Users() {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [modalActive, setModalActive] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "Staff",
  });
  const { _user } = useAuth();
  const _navigate = useNavigate();

  // Mock data for users
  const users: User[] = [
    {
      id: "1",
      name: "John Smith",
      email: "john.smith@example.com",
      role: "Admin",
      lastActive: "2025-03-28T15:24:32Z",
      status: "active",
    },
    {
      id: "2",
      name: "Sarah Johnson",
      email: "sarah.johnson@example.com",
      role: "Manager",
      lastActive: "2025-03-27T09:15:43Z",
      status: "active",
    },
    {
      id: "3",
      name: "Michael Brown",
      email: "michael.brown@example.com",
      role: "Staff",
      lastActive: "2025-03-25T14:32:11Z",
      status: "inactive",
    },
    {
      id: "4",
      name: "Emily Davis",
      email: "emily.davis@example.com",
      role: "Manager",
      lastActive: "2025-03-28T11:45:20Z",
      status: "active",
    },
    {
      id: "5",
      name: "David Wilson",
      email: "david.wilson@example.com",
      role: "Staff",
      lastActive: "2025-03-26T16:22:33Z",
      status: "pending",
    },
  ];

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchValue.toLowerCase()) ||
      user.email.toLowerCase().includes(searchValue.toLowerCase()),
  );

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSelectionChange = (selectedItems: string[]) => {
    setSelectedItems(selectedItems);
  };

  const handleModalChange = (open: boolean) => {
    setModalActive(open);
  };

  const handleUserChange = (field: string) => (value: string) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddUser = () => {
    // In a real app, this would call Supabase to add a user
    console.log("Adding user:", newUser);
    setModalActive(false);
    setNewUser({ name: "", email: "", role: "Staff" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const resourceName = {
    singular: "user",
    plural: "users",
  };

  const promotedBulkActions = [
    {
      content: "Activate users",
      onAction: () => console.log("Activate users", selectedItems),
    },
    {
      content: "Deactivate users",
      onAction: () => console.log("Deactivate users", selectedItems),
    },
  ];

  const bulkActions = [
    {
      content: "Delete users",
      onAction: () => console.log("Delete users", selectedItems),
    },
  ];

  const renderItem = (item: User) => {
    const { id, name, email, role, lastActive, status } = item;
    const shortcutActions = [
      {
        content: "Edit",
        onAction: () => console.log("Edit", id),
      },
    ];

    let statusBadge;
    switch (status) {
      case "active":
        statusBadge = <Badge status="success">Active</Badge>;
        break;
      case "inactive":
        statusBadge = <Badge status="critical">Inactive</Badge>;
        break;
      case "pending":
        statusBadge = <Badge status="warning">Pending</Badge>;
        break;
    }

    const initialsFromName = name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase();

    return (
      <ResourceItem
        id={id}
        accessibilityLabel={`View details for ${name}`}
        name={name}
        shortcutActions={shortcutActions}
        persistActions
      >
        <div className="flex items-center">
          <div className="flex-shrink-0 mr-4">
            <Avatar
              customer
              size="medium"
              name={name}
              initials={initialsFromName}
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex justify-between">
              <h3 className="text-base font-medium">{name}</h3>
              {statusBadge}
            </div>
            <p className="text-sm text-gray-500">{email}</p>
            <div className="flex justify-between mt-1">
              <Text variant="bodySm" color="subdued">
                Role: {role}
              </Text>
              <Text variant="bodySm" color="subdued">
                Last active: {formatDate(lastActive)}
              </Text>
            </div>
          </div>
        </div>
      </ResourceItem>
    );
  };

  return (
    <Page
      title="User Management"
      primaryAction={{
        content: "Add user",
        icon: UserPlus,
        onAction: () => handleModalChange(true),
      }}
    >
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={filteredUsers}
          renderItem={renderItem}
          selectedItems={selectedItems}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          bulkActions={bulkActions}
          sortValue="name"
          sortOptions={[
            { label: "Name", value: "name" },
            { label: "Role", value: "role" },
            { label: "Status", value: "status" },
          ]}
          filterControl={
            <TextField
              value={searchValue}
              onChange={handleSearchChange}
              prefix={<Search className="w-4 h-4" />}
              placeholder="Search users..."
              clearButton
              onClearButtonClick={() => setSearchValue("")}
            />
          }
        />
      </Card>

      <Modal
        open={modalActive}
        onClose={() => handleModalChange(false)}
        title="Add new user"
        primaryAction={{
          content: "Add user",
          onAction: handleAddUser,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => handleModalChange(false),
          },
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleAddUser}>
            <FormLayout>
              <TextField
                value={newUser.name}
                onChange={handleUserChange("name")}
                label="Name"
                type="text"
                autoComplete="name"
                requiredIndicator
              />
              <TextField
                value={newUser.email}
                onChange={handleUserChange("email")}
                label="Email"
                type="email"
                autoComplete="email"
                requiredIndicator
              />
              <TextField
                value={newUser.role}
                onChange={handleUserChange("role")}
                label="Role"
                type="text"
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
