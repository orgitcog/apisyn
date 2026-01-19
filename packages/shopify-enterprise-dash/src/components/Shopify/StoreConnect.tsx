import React, { useState } from "react";
import {
  Card,
  FormLayout,
  TextField,
  Button,
  Banner,
  Text,
  Modal,
  _Layout,
} from "@shopify/polaris";
import { Store, Link as LinkIcon } from "lucide-react";
import { connectToShopify } from "../../lib/shopifyApi";
import { useAuth } from "../../context/AuthContext";

export function StoreConnect() {
  const [shopDomain, setShopDomain] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const { _user } = useAuth();

  const handleConnect = async () => {
    // Clear messages
    setErrorMessage("");
    setSuccessMessage("");

    // Validate inputs
    if (!shopDomain) {
      setErrorMessage("Please enter your Shopify store domain");
      return;
    }

    if (!accessToken) {
      setErrorMessage("Please enter your Shopify admin API access token");
      return;
    }

    // Normalize shop domain
    let normalizedDomain = shopDomain.trim().toLowerCase();

    // Remove https:// or http:// if present
    normalizedDomain = normalizedDomain.replace(/^https?:\/\//, "");

    // Remove trailing slash if present
    normalizedDomain = normalizedDomain.replace(/\/$/, "");

    // Add .myshopify.com if not present and doesn't contain a dot
    if (!normalizedDomain.includes(".")) {
      normalizedDomain = `${normalizedDomain}.myshopify.com`;
    }

    try {
      setIsConnecting(true);
      const result = await connectToShopify(normalizedDomain, accessToken);

      if (result.success) {
        setSuccessMessage(`Successfully connected to ${normalizedDomain}`);
        setShopDomain("");
        setAccessToken("");
        // Close modal on success
        setShowModal(false);
      } else {
        setErrorMessage(result.error || "Failed to connect to Shopify store");
      }
    } catch (error) {
      setErrorMessage("An unexpected error occurred. Please try again.");
      console.error("Store connection error:", error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <>
      <Card sectioned>
        <div className="flex items-center justify-between">
          <div>
            <Text variant="headingMd" as="h2">
              Connect your Shopify store
            </Text>
            <Text variant="bodyMd" as="p" color="subdued" className="mt-1">
              Connect your store to enable real-time data sync and analytics
            </Text>
          </div>
          <Button
            primary
            onClick={() => setShowModal(true)}
            icon={<Store className="w-4 h-4" />}
          >
            Connect Store
          </Button>
        </div>

        {successMessage && (
          <div className="mt-4">
            <Banner status="success" onDismiss={() => setSuccessMessage("")}>
              <p>{successMessage}</p>
            </Banner>
          </div>
        )}
      </Card>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Connect your Shopify Store"
        primaryAction={{
          content: "Connect Store",
          onAction: handleConnect,
          loading: isConnecting,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setShowModal(false),
          },
        ]}
      >
        <Modal.Section>
          {errorMessage && (
            <Banner
              status="critical"
              onDismiss={() => setErrorMessage("")}
              className="mb-4"
            >
              <p>{errorMessage}</p>
            </Banner>
          )}

          <Text as="p" variant="bodyMd" className="mb-4">
            To connect your Shopify store, you'll need your shop domain and an
            Admin API access token.
          </Text>

          <FormLayout>
            <TextField
              value={shopDomain}
              onChange={setShopDomain}
              label="Shop Domain"
              type="text"
              placeholder="your-store.myshopify.com"
              helpText="Your Shopify store domain"
              prefix={<LinkIcon className="w-4 h-4" />}
              autoComplete="off"
            />

            <TextField
              value={accessToken}
              onChange={setAccessToken}
              label="Admin API Access Token"
              type="password"
              placeholder="shpat_xxxxxxxxxxxxxxxxxxxxx"
              helpText="Your private Admin API access token from Shopify"
              autoComplete="off"
            />
          </FormLayout>

          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <Text as="h3" variant="headingSm" className="mb-2">
              How to get your access token
            </Text>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
              <li>Go to your Shopify admin</li>
              <li>Navigate to Apps &gt; App and sales channel settings</li>
              <li>Click "Develop apps for your store"</li>
              <li>Create a new app or select an existing one</li>
              <li>
                Go to API credentials and create an Admin API access token
              </li>
              <li>
                Ensure it has the necessary permissions (read_products,
                read_orders, etc.)
              </li>
              <li>Copy the access token and paste it here</li>
            </ol>
          </div>
        </Modal.Section>
      </Modal>
    </>
  );
}
