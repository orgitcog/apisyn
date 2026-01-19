import React from 'react';
import { Button, Toast } from '@shopify/polaris';
import { RefreshCw } from 'lucide-react';
import { useRevalidator } from '@remix-run/react';

export function ShopifySyncButton() {
  const [showToast, setShowToast] = React.useState(false);
  const [toastContent, setToastContent] = React.useState({
    message: '',
    error: false
  });
  
  const [isSyncing, setIsSyncing] = React.useState(false);
  const revalidator = useRevalidator();

  const handleSync = async () => {
    setIsSyncing(true);
    
    try {
      // In a real implementation, this would call a sync API endpoint
      // For now, we'll simulate a sync operation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setToastContent({
        message: 'Shopify data synced successfully',
        error: false
      });
      setShowToast(true);
      
      // Revalidate the current route to refresh data
      revalidator.revalidate();
    } catch (_error) {
      setToastContent({
        message: 'Failed to sync Shopify data. Please try again.',
        error: true
      });
      setShowToast(true);
    } finally {
      setIsSyncing(false);
    }
  };

  const toggleToast = () => setShowToast((active) => !active);

  return (
    <>
      <Button 
        onClick={handleSync} 
        disabled={isSyncing}
        icon={<RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />}
      >
        {isSyncing ? 'Syncing...' : 'Sync Shopify Data'}
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