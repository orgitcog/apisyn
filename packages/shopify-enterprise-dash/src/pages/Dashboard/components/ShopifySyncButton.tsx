import React from "react";
import { Button, Toast } from "@shopify/polaris";
import { RefreshCw } from "lucide-react";
import { useSyncShopifyData } from "../../../hooks/useShopifyData";

export function ShopifySyncButton() {
  const [showToast, setShowToast] = React.useState(false);
  const [toastContent, setToastContent] = React.useState({
    message: "",
    error: false,
  });

  const { mutate: syncData, isPending } = useSyncShopifyData();

  const handleSync = () => {
    syncData(undefined, {
      onSuccess: (data) => {
        setToastContent({
          message: data.message || "Sync completed successfully",
          error: !data.success,
        });
        setShowToast(true);
      },
      onError: (error) => {
        setToastContent({
          message:
            error instanceof Error ? error.message : "Failed to sync data",
          error: true,
        });
        setShowToast(true);
      },
    });
  };

  const toggleToast = () => setShowToast((active) => !active);

  return (
    <>
      <Button
        onClick={handleSync}
        disabled={isPending}
        icon={<RefreshCw className="w-4 h-4" />}
      >
        {isPending ? "Syncing..." : "Sync Shopify Data"}
      </Button>

      {showToast && (
        <Toast
          content={toastContent.message}
          error={toastContent.error}
          onDismiss={toggleToast}
          duration={4500}
        />
      )}
    </>
  );
}
