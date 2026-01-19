import React, { useState, useEffect } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  _Text,
  Badge,
  Button,
  Avatar,
  Spinner,
  EmptySearchResult,
} from "@shopify/polaris";
import { RefreshCw, Store, Calendar, ExternalLink } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { syncShopifyData } from "../../lib/shopifyApi";

interface ShopifyConnection {
  id: string;
  shop_domain: string;
  store_name: string;
  created_at: string;
  last_sync?: string;
  store_id: string;
  status: "active" | "error" | "pending";
}

export function ConnectedStores() {
  const [connections, setConnections] = useState<ShopifyConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingStore, setSyncingStore] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{
    id: string;
    success: boolean;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("shopify_connections")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setConnections(data || []);
    } catch (err) {
      setError("Failed to load connected stores");
      console.error("Error fetching connections:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncStore = async (storeId: string) => {
    try {
      setSyncingStore(storeId);

      // In a real implementation, we would pass the specific store credentials
      // to the sync function instead of using the default ones
      const result = await syncShopifyData();

      setSyncResult({
        id: storeId,
        success: result.success,
        message: result.message,
      });

      // Update the last_sync timestamp in our local state
      if (result.success) {
        setConnections((prev) =>
          prev.map((conn) =>
            conn.id === storeId
              ? { ...conn, last_sync: new Date().toISOString() }
              : conn,
          ),
        );
      }
    } catch (error) {
      console.error("Error syncing store:", error);
      setSyncResult({
        id: storeId,
        success: false,
        message: "An unexpected error occurred during sync",
      });
    } finally {
      // Clear syncing state after a delay
      setTimeout(() => {
        setSyncingStore(null);
        // And clear result message after another delay
        setTimeout(() => {
          setSyncResult(null);
        }, 3000);
      }, 500);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <Card sectioned title="Connected Shopify Stores">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Spinner />
            <p className="mt-4 text-gray-500">Loading connected stores...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sectioned title="Connected Shopify Stores">
        <div className="bg-red-50 text-red-800 p-4 rounded">
          <p className="font-medium">Error loading stores</p>
          <p className="text-sm mt-1">{error}</p>
          <Button onClick={fetchConnections} className="mt-3">
            Try Again
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card sectioned title="Connected Shopify Stores">
      {connections.length === 0 ? (
        <EmptySearchResult
          title="No stores connected"
          description="Connect your first Shopify store to get started"
          withIllustration
        />
      ) : (
        <ResourceList
          resourceName={{ singular: "store", plural: "stores" }}
          items={connections}
          renderItem={(connection) => {
            const {
              id,
              shop_domain,
              store_name,
              created_at,
              last_sync,
              status,
            } = connection;
            const isSyncing = syncingStore === id;
            const syncMessage =
              syncResult && syncResult.id === id ? syncResult : null;

            let statusBadge;
            switch (status) {
              case "active":
                statusBadge = <Badge status="success">Active</Badge>;
                break;
              case "error":
                statusBadge = <Badge status="critical">Error</Badge>;
                break;
              case "pending":
              default:
                statusBadge = <Badge status="warning">Pending</Badge>;
                break;
            }

            return (
              <ResourceItem id={id}>
                <div className="flex items-center">
                  <div className="flex-shrink-0 mr-4">
                    <Avatar
                      customer
                      size="medium"
                      name={store_name}
                      source={`https://ui-avatars.com/api/?name=${encodeURIComponent(store_name)}&background=f3f3f3&color=5c6ac4`}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between">
                      <h3 className="text-base font-medium">{store_name}</h3>
                      {statusBadge}
                    </div>
                    <div className="flex items-center mt-1">
                      <Store className="w-4 h-4 text-gray-500 mr-1" />
                      <p className="text-sm text-gray-500">
                        <a
                          href={`https://${shop_domain}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline flex items-center"
                        >
                          {shop_domain}
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </p>
                    </div>
                    <div className="flex justify-between mt-1 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>Connected: {formatDate(created_at)}</span>
                      </div>
                      <div>Last sync: {formatDate(last_sync)}</div>
                    </div>
                    {syncMessage && (
                      <div
                        className={`mt-2 text-sm p-2 rounded ${syncMessage.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
                      >
                        {syncMessage.message}
                      </div>
                    )}
                  </div>
                  <div className="ml-4">
                    <Button
                      onClick={() => handleSyncStore(id)}
                      loading={isSyncing}
                      icon={<RefreshCw className="w-4 h-4" />}
                    >
                      Sync Data
                    </Button>
                  </div>
                </div>
              </ResourceItem>
            );
          }}
        />
      )}
    </Card>
  );
}
