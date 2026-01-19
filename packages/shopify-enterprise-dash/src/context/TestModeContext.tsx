import React, { createContext, useContext, useState } from "react";

interface Organization {
  id: string;
  name: string;
  stores: Store[];
}

interface Store {
  id: string;
  name: string;
  domain: string;
  plan: string;
  status: string;
  metrics: {
    revenue: number;
    orders: number;
    customers: number;
  };
  lastSync: string;
}

interface TestModeContextType {
  isTestMode: boolean;
  toggleTestMode: () => void;
  organizations: Organization[];
  updateOrganizations: (data: Organization[]) => void;
  testStoreData: {
    name: string;
    domain: string;
    plan: string;
  };
  updateTestStoreData: (data: any) => void;
}

const defaultOrganizations: Organization[] = [
  {
    id: "org1",
    name: "North America Division",
    stores: [
      {
        id: "store1",
        name: "NA Fashion Direct",
        domain: "na-fashion.myshopify.com",
        plan: "enterprise",
        status: "active",
        metrics: {
          revenue: 1250000,
          orders: 12500,
          customers: 8500,
        },
        lastSync: new Date().toISOString(),
      },
      {
        id: "store2",
        name: "NA Sports & Outdoor",
        domain: "na-sports.myshopify.com",
        plan: "enterprise",
        status: "active",
        metrics: {
          revenue: 980000,
          orders: 8900,
          customers: 6200,
        },
        lastSync: new Date().toISOString(),
      },
    ],
  },
  {
    id: "org2",
    name: "European Division",
    stores: [
      {
        id: "store3",
        name: "EU Fashion Collective",
        domain: "eu-fashion.myshopify.com",
        plan: "enterprise",
        status: "active",
        metrics: {
          revenue: 890000,
          orders: 7800,
          customers: 5600,
        },
        lastSync: new Date().toISOString(),
      },
      {
        id: "store4",
        name: "EU Lifestyle",
        domain: "eu-lifestyle.myshopify.com",
        plan: "enterprise",
        status: "active",
        metrics: {
          revenue: 670000,
          orders: 5900,
          customers: 4200,
        },
        lastSync: new Date().toISOString(),
      },
    ],
  },
];

const defaultTestStoreData = {
  name: "Test Store",
  domain: "test-store.myshopify.com",
  plan: "enterprise",
};

const TestModeContext = createContext<TestModeContextType | undefined>(
  undefined,
);

export const TestModeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isTestMode, setIsTestMode] = useState(
    import.meta.env?.VITE_TEST_MODE === "true" || false,
  );
  const [organizations, setOrganizations] =
    useState<Organization[]>(defaultOrganizations);
  const [testStoreData, setTestStoreData] = useState(defaultTestStoreData);

  const toggleTestMode = () => {
    setIsTestMode(!isTestMode);
  };

  const updateOrganizations = (data: Organization[]) => {
    setOrganizations(data);
  };

  const updateTestStoreData = (data: any) => {
    setTestStoreData(data);
  };

  return (
    <TestModeContext.Provider
      value={{
        isTestMode,
        toggleTestMode,
        organizations,
        updateOrganizations,
        testStoreData,
        updateTestStoreData,
      }}
    >
      {children}
    </TestModeContext.Provider>
  );
};

export const useTestMode = () => {
  const context = useContext(TestModeContext);
  if (context === undefined) {
    throw new Error("useTestMode must be used within a TestModeProvider");
  }
  return context;
};
