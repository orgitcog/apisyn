import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useState } from 'react';
import { 
  Page, 
  Card, 
  ResourceList, 
  ResourceItem,
  Badge,
  _Button,
  Modal,
  Form,
  FormLayout,
  TextField,
  Text,
  Checkbox,
  BlockStack
} from '@shopify/polaris';
import { ShieldCheck, Plus } from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  is_custom: boolean;
  priority_level: number;
}

// Mock data for roles (in a real app, this would come from Supabase)
const mockRoles: Role[] = [
  {
    id: '1',
    name: 'Admin',
    description: 'Full access to all features and settings',
    permissions: ['read', 'write', 'delete', 'manage_users', 'settings'],
    is_custom: false,
    priority_level: 100
  },
  {
    id: '2',
    name: 'Manager',
    description: 'Manage products, orders and limited settings',
    permissions: ['read', 'write', 'limited_settings'],
    is_custom: false,
    priority_level: 50
  },
  {
    id: '3',
    name: 'Editor',
    description: 'Create and manage content',
    permissions: ['read', 'write', 'no_settings'],
    is_custom: false,
    priority_level: 25
  },
  {
    id: '4',
    name: 'Analyst',
    description: 'View reports and analytics only',
    permissions: ['read', 'export', 'no_settings'],
    is_custom: false,
    priority_level: 10
  },
  {
    id: '5',
    name: 'Support',
    description: 'Handle customer inquiries and orders',
    permissions: ['read', 'limited_write', 'no_settings'],
    is_custom: false,
    priority_level: 15
  }
];

const availablePermissions = [
  { value: 'read', label: 'Read access' },
  { value: 'write', label: 'Write access' },
  { value: 'delete', label: 'Delete access' },
  { value: 'manage_users', label: 'Manage users' },
  { value: 'settings', label: 'Full settings access' },
  { value: 'limited_settings', label: 'Limited settings access' },
  { value: 'no_settings', label: 'No settings access' },
  { value: 'export', label: 'Export data' },
  { value: 'limited_write', label: 'Limited write access' },
];

export async function loader() {
  // In a real app, this would fetch roles from Supabase
  return json({ roles: mockRoles });
}

export default function Roles() {
  const { roles } = useLoaderData<typeof loader>();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [modalActive, setModalActive] = useState(false);
  const [newRole, setNewRole] = useState({ 
    name: '', 
    description: '', 
    permissions: [] as string[],
    priority_level: 50
  });

  const handleSelectionChange = (selectedItems: string[]) => {
    setSelectedItems(selectedItems);
  };

  const handleModalChange = (open: boolean) => {
    setModalActive(open);
    if (!open) {
      setNewRole({ name: '', description: '', permissions: [], priority_level: 50 });
    }
  };

  const handleRoleChange = (field: string) => (value: string) => {
    setNewRole(prev => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (permission: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleAddRole = () => {
    // In a real app, this would call Supabase to add a role
    console.log('Adding role:', newRole);
    setModalActive(false);
    setNewRole({ name: '', description: '', permissions: [], priority_level: 50 });
  };

  const resourceName = {
    singular: 'role',
    plural: 'roles',
  };

  const promotedBulkActions = [
    {
      content: 'Edit roles',
      onAction: () => console.log('Edit roles', selectedItems),
    },
  ];

  const bulkActions = [
    {
      content: 'Delete roles',
      onAction: () => console.log('Delete roles', selectedItems),
    },
  ];

  const renderItem = (item: Role) => {
    const { id, name, description, permissions, is_custom, priority_level } = item;
    const shortcutActions = [
      {
        content: 'Edit',
        onAction: () => console.log('Edit', id),
      },
    ];

    return (
      <ResourceItem
        id={id}
        accessibilityLabel={`View details for ${name}`}
        name={name}
        shortcutActions={is_custom ? shortcutActions : []}
        persistActions
      >
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-medium">{name}</h3>
              {!is_custom && <Badge>System</Badge>}
              {is_custom && <Badge status="success">Custom</Badge>}
            </div>
            <Badge>Priority: {priority_level}</Badge>
          </div>
          <Text as="p" variant="bodySm" color="subdued">{description}</Text>
          <div className="flex flex-wrap gap-1 mt-2">
            {permissions.map(permission => (
              <Badge key={permission} status="info">{permission}</Badge>
            ))}
          </div>
        </div>
      </ResourceItem>
    );
  };

  return (
    <Page
      title="Role Management"
      subtitle="Manage user roles and permissions"
      primaryAction={{
        content: 'Create role',
        icon: Plus,
        onAction: () => handleModalChange(true),
      }}
    >
      <Card>
        <ResourceList
          resourceName={resourceName}
          items={roles}
          renderItem={renderItem}
          selectedItems={selectedItems}
          onSelectionChange={handleSelectionChange}
          promotedBulkActions={promotedBulkActions}
          bulkActions={bulkActions}
        />
      </Card>

      <Modal
        open={modalActive}
        onClose={() => handleModalChange(false)}
        title="Create new role"
        primaryAction={{
          content: 'Create role',
          onAction: handleAddRole,
          disabled: !newRole.name || newRole.permissions.length === 0
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => handleModalChange(false),
          },
        ]}
      >
        <Modal.Section>
          <Form onSubmit={handleAddRole}>
            <FormLayout>
              <TextField
                value={newRole.name}
                onChange={handleRoleChange('name')}
                label="Role name"
                type="text"
                autoComplete="off"
                requiredIndicator
              />
              <TextField
                value={newRole.description}
                onChange={handleRoleChange('description')}
                label="Description"
                type="text"
                autoComplete="off"
                multiline={3}
              />
              <TextField
                value={String(newRole.priority_level)}
                onChange={handleRoleChange('priority_level')}
                label="Priority level"
                type="number"
                autoComplete="off"
                helpText="Higher numbers indicate higher priority (0-100)"
              />
              <div>
                <Text as="h3" variant="headingSm">Permissions</Text>
                <div className="mt-2 space-y-2">
                  <BlockStack gap="200">
                    {availablePermissions.map(permission => (
                      <Checkbox
                        key={permission.value}
                        label={permission.label}
                        checked={newRole.permissions.includes(permission.value)}
                        onChange={() => handlePermissionToggle(permission.value)}
                      />
                    ))}
                  </BlockStack>
                </div>
              </div>
            </FormLayout>
          </Form>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
