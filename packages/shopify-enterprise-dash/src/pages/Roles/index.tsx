import React from "react";
import {
  Page,
  Card,
  DataTable,
  Button,
  Modal,
  Form,
  FormLayout,
  TextField,
  ChoiceList,
} from "@shopify/polaris";
import { _UserCircle, Plus } from "lucide-react";

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
}

export function Roles() {
  const [modalActive, setModalActive] = React.useState(false);
  const [selectedPermissions, setSelectedPermissions] = React.useState<
    string[]
  >([]);
  const [newRole, setNewRole] = React.useState({ name: "", description: "" });

  // Mock data for roles
  const roles: Role[] = [
    {
      id: "1",
      name: "Administrator",
      description: "Full access to all features and settings",
      userCount: 3,
      permissions: ["Read", "Write", "Delete", "Manage users"],
    },
    {
      id: "2",
      name: "Store Manager",
      description: "Manage product catalog and orders",
      userCount: 8,
      permissions: ["Read", "Write", "Limited user management"],
    },
    {
      id: "3",
      name: "Content Editor",
      description: "Create and edit content only",
      userCount: 12,
      permissions: ["Read", "Write", "No user management"],
    },
    {
      id: "4",
      name: "Analyst",
      description: "View reports and analytics only",
      userCount: 5,
      permissions: ["Read", "No write access"],
    },
    {
      id: "5",
      name: "Customer Support",
      description: "Handle customer inquiries and orders",
      userCount: 15,
      permissions: ["Read", "Limited write", "No user management"],
    },
  ];

  const handleModalChange = (open: boolean) => {
    setModalActive(open);
  };

  const handleRoleChange = (field: string) => (value: string) => {
    setNewRole((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionsChange = (value: string[]) => {
    setSelectedPermissions(value);
  };

  const handleAddRole = () => {
    // In a real app, this would call Supabase to add a role
    console.log("Adding role:", {
      ...newRole,
      permissions: selectedPermissions,
    });
    setModalActive(false);
    setNewRole({ name: "", description: "" });
    setSelectedPermissions([]);
  };

  const rows = roles.map((role) => [
    <strong key={`name-${role.id}`}>{role.name}</strong>,
    role.description,
    role.userCount,
    role.permissions.join(", "),
    <Button
      key={`edit-${role.id}`}
      onClick={() => console.log("Edit role", role.id)}
    >
      Edit
    </Button>,
  ]);

  return (
    <Page
      title="Role Management"
      primaryAction={{
        content: "Add role",
        icon: Plus,
        onAction: () => handleModalChange(true),
      }}
    >
      <Card>
        <DataTable
          columnContentTypes={["text", "text", "numeric", "text", "text"]}
          headings={[
            "Role Name",
            "Description",
            "Users Assigned",
            "Permissions",
            "Actions",
          ]}
          rows={rows}
        />
      </Card>

      <Modal
        open={modalActive}
        onClose={() => handleModalChange(false)}
        title="Add new role"
        primaryAction={{
          content: "Add role",
          onAction: handleAddRole,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => handleModalChange(false),
          },
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleAddRole}>
            <FormLayout>
              <TextField
                value={newRole.name}
                onChange={handleRoleChange("name")}
                label="Role name"
                type="text"
                requiredIndicator
              />
              <TextField
                value={newRole.description}
                onChange={handleRoleChange("description")}
                label="Description"
                type="text"
                multiline={3}
              />
              <ChoiceList
                allowMultiple
                title="Permissions"
                choices={[
                  { label: "Read access", value: "read" },
                  { label: "Write access", value: "write" },
                  { label: "Delete access", value: "delete" },
                  { label: "User management", value: "manage_users" },
                  { label: "Settings access", value: "settings" },
                ]}
                selected={selectedPermissions}
                onChange={handlePermissionsChange}
              />
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
